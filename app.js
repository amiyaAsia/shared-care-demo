import { STORIES, LABELS, ROLES, SOURCES, roleFor } from './story.js';
import { GuidedPlayer, readingDuration, journeyIndexes, presentationFrame } from './playback.js';
import { emptySession, loadSession, saveSession, resetSession, replay,recall } from './memory.js';
import { renderScene } from './scene.js';
const $ = id => document.getElementById(id);
let storage;
try { storage = window.localStorage; } catch { storage = null; }
const lengths = Object.fromEntries(Object.entries(STORIES).map(([key, frames]) => [key, frames.length]));
const saved = storage ? loadSession(storage, lengths) : emptySession();
// Every opening/reload starts the presentation at the centre introduction.
// Retain language preference, but never resume a previous viewer's scene.
let session = { ...emptySession(), language: saved.language };
let playing = false, timer = null, reading = false, generation=0, viewpoint='team', choice=null;
let route='support';
const routePositions=()=>journeyIndexes(STORIES[session.setting],session.setting,route);
const routeOffset=()=>routePositions().indexOf(session.positions[session.setting]);
const shownFrame=()=>presentationFrame(current(),route);
let player;
const narration=new Audio();narration.preload='none';let audioFailed=false;
narration.id='guidedNarration';narration.hidden=true;document.body.append(narration);
const words = (en, zh) => session.language === 'zh' ? zh : en;
const local = value => typeof value === 'string' ? value : value?.[session.language] || '';
const current = () => STORIES[session.setting][session.positions[session.setting]];
function node(tag, text, className = '') { const n = document.createElement(tag); n.textContent = text; n.className = className; return n; }
function persist() {
  const ok = storage && saveSession(storage, session);
  $('storageNotice').hidden = Boolean(ok);
  $('storageNotice').textContent = words('Local saving is unavailable. The demo still works, but reload will restart it.', '无法本地保存。演示仍可使用，但重新加载会从头开始。');
}
function stop() {
  generation++;
  playing = false; clearTimeout(timer); timer = null;
  player.pause();narration.pause();narration.onended=null;narration.onerror=null;
  window.speechSynthesis?.cancel();
   $('play').textContent = words('Play', '播放');
  document.body.dataset.playing = 'false';
}
function duration(frame) { return readingDuration(presentationFrame(frame,route),session.language); }
function syncPlayer(){player=new GuidedPlayer(routePositions().map(i=>presentationFrame(STORIES[session.setting][i],route)),routeOffset(),session.language);}
function selectRoute(nextRoute) {
  stop();route=nextRoute;choice=null;viewpoint='team';audioFailed=false;
  if (!(route==='full'&&session.language==='en')&&!window.speechSynthesis) reading=false;
  session.positions[session.setting]=routePositions()[0];
  $('sceneDetails').open=false;$('recordDetails').open=false;
  syncPlayer();render();
  $('sceneTitle').focus({preventScroll:true});$('sceneTitle').scrollIntoView({block:'center',behavior:'instant'});
}
function schedule() {
  clearTimeout(timer);
  const token=++generation;
  if (!playing) { stop(); return; }
  const last=routeOffset()===routePositions().length-1;
  if(reading && session.language==='en' && route==='full'){
    narration.src=`assets/narration/${current().id}.m4a`;
    let completed=false;
    const finish=()=>{if(completed||token!==generation||!playing)return;completed=true;clearTimeout(timer);timer=setTimeout(last?stop:advance,1200);};
    const fallback=()=>{if(token!==generation||!playing)return;audioFailed=true;renderVoice();clearTimeout(timer);timer=setTimeout(last?stop:advance,duration(current()));};
    narration.onended=finish;narration.onerror=fallback;
    narration.play().catch(fallback);
    // Do not strand the presentation if a browser fails to emit ended/error.
    timer=setTimeout(()=>{if(token===generation&&playing){narration.pause();fallback();}},120000);
  } else if (reading && window.speechSynthesis) {
    const speech = new SpeechSynthesisUtterance(local(shownFrame().caption)); speech.lang = session.language === 'zh' ? 'zh-CN' : 'en-GB';
    const fallback=()=>{if(playing&&token===generation){window.speechSynthesis.cancel();reading=false;audioFailed=true;renderVoice();clearTimeout(timer);timer=setTimeout(last?stop:advance,duration(current()));}};
    speech.onend = () => { if (playing && token===generation){clearTimeout(timer);timer = setTimeout(last?stop:advance, 1000);} };
    speech.onerror = fallback;
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(speech);
    timer=setTimeout(fallback,Math.max(15000,duration(current())+5000));
  } else {
    if(last){timer=setTimeout(stop,duration(current()));return;}
    player.play();
    const tick=()=>{if(token!==generation||!playing)return;if(player.tick(250)){advance();return;}timer=setTimeout(tick,250);};
    timer=setTimeout(tick,250);
  }
}
function advance() {
  if (!playing) return;
  session.positions[session.setting]=routePositions()[routeOffset()+1];
  syncPlayer();
  render();
  schedule();
}
const statusLabels = {
  planned: ['Planned', '已计划'], blocked:['Blocked · decision declined','受阻 · 请求未获批准'], 'awaiting-decision': ['Awaiting human decision', '等待人类决定'],
  assigned: ['Assigned · not yet accepted', '已分配 · 尚未接受'], accepted: ['Accepted · not completed', '已接受 · 未完成'],
  'confirmation-needed': ['Draft · confirmation needed', '草稿 · 待确认'], completed: ['Completed · record confirmed', '已完成 · 记录已确认']
};
function renderMemory(frame) {
  $('memoryBody').replaceChildren();
  const badge = frame.memory === 'practice' ? words('Practice · simulated shared memory', '练习 · 模拟共享记忆') : frame.memory === 'workplace' ? words('Workplace support · shared memory', '工作支持 · 共享记忆') : words('Stage transition / orientation', '阶段转换／任务准备');
  $('stageBadge').textContent = badge; $('stageBadge').className = `stage-badge ${frame.memory || ''}`;
  $('memoryScope').textContent = frame.memory ? badge : words('No care task changes in this scene', '本场景不改变照护任务');
  if (!frame.memory) {
    $('memoryBody').append(node('p', words('Practice and workplace facts are held separately. Enter a chapter to inspect its relevant work.', '练习与工作内容分别保存。进入章节即可查看相关事项。'), 'empty-memory'));
    return;
  }
  const memory = replay(STORIES[session.setting], session.positions[session.setting], session.setting)[frame.memory];
  document.body.dataset.taskCount = Object.keys(memory.tasks).length;
  for (const task of Object.values(memory.tasks)) {
    if(viewpoint==='Grace' && (task.owner!=='Grace' || task.id!=='supplies'))continue;
    const card = node('div', '', `task-card${task.status !== 'completed' ? ' pending' : ''}`); card.dataset.task = task.id; card.dataset.status = task.status;
    const external=Boolean(memory.contacts[task.id]&&session.setting==='home');
    card.append(node('h4', `${task.person} · ${local(task.label)}`), node('span', task.clinical&&memory.reminders[task.id]?words('Outstanding · RN reminder active','待完成 · 注册护士提醒中'):external?words('Awaiting external clinical response','等待外部临床回应'):words(...statusLabels[task.status]), 'task-state'),
      node('p', `${words('Responsible', '负责人')}: ${task.owner} · ${local(roleFor(task.owner,session.setting))}`), node('p', `${words('Source', '来源')}: ${local(task.source)}`, 'source-line'));
    const request = Object.values(memory.requests).find(r => r.task === task.id);
    if (request && viewpoint!=='Grace') card.append(node('p', `${external?words('Follow-up owner','跟进负责人'):words('Decision', '决定')}: ${request.approver} · ${request.status === 'pending' ? words('pending', '待处理') : request.status==='declined'?words('declined','未批准'):words('approved', '已批准')}`), node('p', local(request.decision || request.reason), 'source-line'));
    const contact=memory.contacts[task.id];
    if(task.clinical)card.append(node('p',words('Registered nurse performs this task. Assistants report observations. If prescribed timing cannot be met, seek a human decision; no automatic extension.','由注册护士执行，助理报告观察。无法满足规定时间时需人类决定，不自动延后。'),'source-line'));
    if(contact && viewpoint!=='Grace')card.append(node('p',local(contact.text)),node('p',contact.status==='awaiting-reply'?words('Doctor reply not yet received.','尚未收到医生回复。'):words('Doctor response received for nurse review.','医生回应已收到，交由护士核对。'),'source-line'));
    const note = memory.notes.find(n => n.id === task.note);
    if (note) {
      const record = node('div', '', 'record');
      record.append(node('p', local(note.text)), node('p', `${note.author} · ${note.observedAt} · ${note.status === 'draft' ? words('draft', '草稿') : words('confirmed', '已确认')}`, 'source-line'));
      card.append(record);
    }
    $('memoryBody').append(card);
  }
  if(viewpoint==='Grace'){
    $('memoryBody').append(node('p',words('Grace sees the household follow-up agreed with Mr Wong.','Grace 查看与黄先生约定的生活用品跟进。'),'source-line'));return;
  }
  for(const handover of memory.handovers)$('memoryBody').append(node('p', `${words('Coordination handover','协调交接')}: ${handover.acceptedBy || words('awaiting acceptance','等待接手')} · ${handover.outstanding.length} ${words('outstanding items','项未完成事项')}`,'source-line'));
  const eventList = node('ol', '', 'event-list');
  const typeNames={plan:['Planned','计划'],accept:['Accepted','接手'],confirm:['Confirmed','确认'],handover:['Handover prepared','准备交接'],'accept-handover':['Coordination handover accepted','接手协调交接'],report:['Observation drafted','观察草稿']};
  for (const event of memory.events.slice(-3)) eventList.append(node('li', `${event.actor} · ${event.at} · ${local(event.text || event.decision || event.reason) || words(...(typeNames[event.type]||['Status update','状态更新']))}`));
  $('memoryBody').append(node('h4', words('Recent source history', '近期来源记录')), eventList);
}
function renderChapters() {
  $('chapters').replaceChildren();
   const chapters = [...new Set(routePositions().map(i => STORIES[session.setting][i].chapter))];
  for (const chapter of chapters) {
    const button = node('button', local(LABELS[chapter])); button.dataset.chapter = chapter;
    if (current().chapter === chapter) button.setAttribute('aria-current', 'step');
    button.onclick = () => { stop(); choice=null;viewpoint='team';session.positions[session.setting] = routePositions().find(i=>STORIES[session.setting][i].chapter===chapter);syncPlayer();render(); document.querySelector(`[data-chapter="${chapter}"]`).focus(); };
    $('chapters').append(button);
  }
}
function renderSupport(frame){
 const panel=$('supportMoment');panel.replaceChildren();panel.hidden=!frame.support;
 if(!frame.support)return;
 const s=frame.support,memory=frame.memory?replay(STORIES[session.setting],session.positions[session.setting],session.setting)[frame.memory]:null;
  panel.append(node('p',words('Amiya at this moment','此刻的 Amiya 支持'),'eyebrow'));
  if(s.waitingFor){const waiting=node('div','', 'waiting-context');waiting.append(node('strong',`${s.waitingFor} · ${words('currently occupied','当前在忙')}`),node('p',words('Request, explanation and task stay together while the human decision is pending.','人类决定待定时，请求、说明及任务共同保留。')));panel.append(waiting);}
 if(s.question)panel.append(node('p',local(s.question),'support-question'));
  if(s.answer)panel.append(node('p',local(s.answer),'support-answer'));
  if(s.relatedTask&&memory?.tasks[s.relatedTask]){const task=memory.tasks[s.relatedTask];panel.append(node('p',`${local(task.label)} · ${task.owner} · ${words('remains separately assigned','保持独立分配')}`,'team-update'));}
  if(s.extraNote){const note=memory?.notes.find(n=>n.id===s.extraNote&&n.status==='confirmed');if(note)panel.append(node('p',`${local(note.text)} · ${note.author} · ${note.id}`,'record-reuse'));}
 let source=s.source;
 if(s.kind==='recall'){
  const result=recall(memory,s.person,s.task);
  if(result){panel.append(node('p',`${result.task.person} · ${local(result.task.label)} · ${result.task.owner}`));
   for(const r of result.requests)panel.append(node('p',`${r.approver} · ${r.status==='pending'?words('response pending','等待回应'):local(r.decision)}`));
   for(const n of result.notes)panel.append(node('p',`${local(n.text)} (${n.id} · ${n.author} · ${n.observedAt})`,'record-reuse'));
   source=result.source;
  }
 }
 if(s.kind==='reminder'){
  const reminder=memory.reminders[s.task];panel.append(node('p',reminder?`${words('Task prompt','任务提醒')} → ${reminder.owner}`:words('No active prompt','无活动提醒')));
  panel.append(node('p',`${words('Current responsible person','当前负责人')}: ${memory.tasks[s.task].owner}`));
 }
 if(s.kind==='capture'||s.kind==='reuse'){
  if(s.utterance)panel.append(node('p',`“${local(s.utterance)}”`,'support-question'));
  const note=memory.notes.find(n=>n.id===s.note);
  if(note?.status==='confirmed')panel.append(node('p',`${local(note.text)} · ${note.id} · ${note.author} · ${note.observedAt}`, 'record-reuse'),node('p',words('Confirmed record reused in this view','本视图复用已确认记录')));
  else if(note)panel.append(node('p',words('Record awaits confirmation','记录等待确认')));
  if(s.task&&memory.tasks[s.task])panel.append(node('p',`${local(memory.tasks[s.task].label)} · ${memory.tasks[s.task].owner}`));
 }
  if(source){const details=document.createElement('details');details.className='source-detail';details.append(node('summary',`${words('Approved source','批准来源')}: ${local(source.title)} · v${source.version}`),node('p',local(source.text)),node('p',`${source.author} · ${source.date||words('assignment briefing','任务简报')} · ${source.at||''}`));panel.append(details);}
  if(s.flow&&s.kind==='capture'){
    const note=memory.notes.find(n=>n.id===s.note),flow=node('div','','capture-flow');
    for(const [heading,text] of [
      [words('1 · Spoken update','1 · 语音更新'),local(s.utterance)],
      [words('2 · Matched context','2 · 关联上下文'),note?`${note.person} · ${note.task} · ${note.author}`:''],
      [words('3 · Review the draft','3 · 核对草稿'),note?local(note.text):''],
      [words('4 · Record and handover','4 · 记录与交接'),note?.status==='confirmed'?`${note.id} · ${words('same reviewed record','同一已核对记录')}`:words('Waiting for the author’s confirmation','等待作者确认')]
    ]){const step=node('div','','capture-step');step.append(node('strong',heading),node('p',text));flow.append(step);}panel.prepend(flow);
  }
  if(s.flow&&s.kind==='feedback')panel.append(node('p',words('First attempt → specific feedback → complete retry in the next scene','首次尝试 → 明确反馈 → 下一幕完整重试'),'practice-flow'));
  for(const text of s.notifications||[])panel.append(node('p',local(text),'team-update'));
}
function render() {
   const frame = current();
  document.documentElement.lang = session.language === 'zh' ? 'zh-CN' : 'en';
  document.body.dataset.setting = session.setting; document.body.dataset.frame = frame.id; document.body.dataset.stage = frame.memory || frame.chapter; document.body.dataset.playing = String(playing);
  $('language').textContent = words('中文', 'English'); $('sources').textContent = words('Sources & scope', '来源与范围');
  document.body.dataset.route=route;
  $('tagline').textContent = words('Preparation and care delivery', '任务准备与照护执行');
  $('headline').textContent = words('Help your team carry out changing care.', '支持团队落实变化中的照护。');
  $('introText').textContent = words('Prepare for assignments. Support follow-through through the systems your team already uses.', '为任务做好准备，通过团队现有系统支持持续跟进。');
  $('supportRoute').textContent=words('Support care delivery · 6 scenes','支持照护执行 · 6 幕');
  $('prepareRoute').textContent=words('Prepare your team','为团队做好准备');
  $('supportRoute').setAttribute('aria-pressed',String(route==='support'));$('prepareRoute').setAttribute('aria-pressed',String(route==='prepare'));
  $('fullJourney').textContent=words('Full walkthrough · all scenes','完整演示 · 所有场景');
  $('fullJourney').setAttribute('aria-pressed',String(route==='full'));
  $('routeScope').textContent=route==='prepare'?words('Optional preparation module · simulated team practice; hands-on readiness remains human-reviewed.','可单独选择的准备模块 · 模拟团队练习，实操准备仍由人类评估。'):words('Proposed connections to existing care records · this demo has no working system integration.','拟通过现有照护记录衔接 · 本演示没有实际系统连接。');
  $('sceneDetailsLabel').textContent=words('Inspect scene details and original narration','查看场景细节与原始旁白');
  $('recordDetailsLabel').textContent=words('Inspect task owners and records','查看任务负责人及记录');
  $('disclaimer').textContent = words('Scripted concept demo · fictional people and records · no live AI or clinical service', '预设概念演示 · 虚构人物与记录 · 无实时 AI 或临床服务');
  for (const setting of ['centre','home']) { $(`${setting}Tab`).textContent = local(LABELS[setting]); $(`${setting}Tab`).setAttribute('aria-pressed', String(session.setting === setting)); }
  renderChapters();
  $('location').textContent = local(frame.location); $('sceneTitle').textContent = local(frame.title);
  $('speaker').textContent = (frame.narratorEnglish&&session.language==='en')||frame.speaker==='Narrator'?local(ROLES.Narrator):frame.speaker === 'Hui Lin' && session.language === 'zh' ? '惠琳' : `${frame.speaker} · ${local(roleFor(frame.speaker,session.setting))}`;
  $('caption').textContent = local(shownFrame().caption); $('fullCaption').textContent=local(frame.caption);$('physicalAction').textContent = local(frame.action);
  renderScene($('scene'), frame, session.setting, session.language,frame.memory?replay(STORIES[session.setting],session.positions[session.setting],session.setting)[frame.memory]:null);
  $('individualPractice').hidden = session.setting !== 'centre';
  $('individualPracticeLink').textContent = words('See individual care practice ↗', '查看一对一照护练习 ↗');
  $('individualPracticeHint').textContent = words('Centre-based · new tab · pauses this story', '中心照护 · 新标签页 · 暂停本故事');
  $('briefing').hidden = !frame.briefing; $('briefing').textContent = local(frame.briefing);
  renderSupport(frame);
  $('transitionCard').hidden = !frame.boundary;
  const handover=['rehearsal','handover'].includes(frame.chapter);
  $('transitionTitle').textContent = handover?local(LABELS[frame.chapter]):words('Practice and workplace support use separate records.', '练习与工作支持使用独立记录。');
  $('transitionText').textContent = handover?words('The team checks outstanding items and their owners.','团队核对未完成事项及负责人。'):session.setting==='centre'?words('Hui Lin moves from rehearsal into her working assignment.','惠琳从练习进入工作任务。'):words('Sara moves from rehearsal into her working visit.','Sara 从练习进入工作探访。');
  $('practiceChoice').hidden=true;
  $('choicePrompt').textContent=words('Practice decision: what do you need next? Both actions keep the human decision pending.','练习决定：接下来需要什么？以下操作均不会自动批准请求。');
  $('inspectPending').textContent=words('Inspect pending work','查看待办事项');$('contactHuman').textContent=words('Contact the responsible person','联系负责人');
  $('choiceFeedback').textContent=choice==='inspect'?words('The request is retained, with a named decision owner. It is still unapproved.','请求已保留，并有明确决策负责人。尚未获批。'):choice==='contact'?words('Direct team contact is requested. A live service would connect you through its established human-help route; this demo stages that request.','已请求直接联系团队。实际服务将通过既定人类求助渠道连接；本演示为预设请求。'):'';
  $('viewControls').replaceChildren();
  // This focused scenario uses provider-team views only; no family-data branch.
  $('memoryTitle').textContent = words('Shared memory', '共享记忆'); renderMemory(frame);
  $('position').textContent = `${routeOffset()+1} / ${routePositions().length}`;
  $('progress').value = (routeOffset()+1) / routePositions().length * 100;
  $('previous').disabled = routeOffset()===0; $('next').disabled = routeOffset()===routePositions().length-1;
  $('previous').textContent = words('← Back', '← 返回');
  $('next').textContent = words('Next scene →', '下一幕 →');
  $('play').disabled = false;
  $('play').textContent = playing ? words('Pause', '暂停') : words('Play', '播放');
  renderVoice();
  $('restart').textContent = words('Restart this route', '重新开始本路线');
  $('resetAll').textContent=words('Reset demo','重置演示');
  $('playbackHint').textContent = words('Choose a module or use Next. Inspect details only when needed.','选择模块或使用下一幕，需要时再查看细节。');
  $('mapTitle').textContent = words('More about this demonstration', '关于本演示');
  $('mapContent').replaceChildren();
  for (const [title, text] of [
    [words('Prepare for the person', '为服务对象做好准备'), words('Relevant experience, local roles and person-specific knowledge determine what to practise.', '根据经验、本地职责与对服务对象的了解决定练习内容。')],
    [words('Practise with the team', '与团队一起练习'), words('Rehearse reporting, decisions and handover with simulated memory. Hands-on assessment remains separate.', '借助模拟记忆练习报告、决定与交接。实操评估仍需另行进行。')],
    [words('Stay supported at work', '工作中持续支持'), words('New and established workers share relevant changes, pending decisions and reviewed updates.', '新员工与现有员工共享相关变化、待定事项及已核对更新。')]
  ]) { const card = node('div', '', 'map-card'); card.append(node('h3', title), node('p', text)); $('mapContent').append(card); }
  $('footerText').textContent = words('Amiya Shared Care · prepare, practise and stay supported.','Amiya Shared Care · 准备、练习、持续支持。');
  persist();
}
function renderVoice(){
  $('read').textContent=reading?words('Narration: on','旁白：开'):words('Narration: off','旁白：关');
  $('read').setAttribute('aria-pressed',String(reading));$('read').disabled=!(route==='full'&&session.language==='en')&&!window.speechSynthesis;
  $('voiceStatus').textContent=audioFailed?words('Audio unavailable; captions continue.','音频不可用；字幕继续。'):route==='full'&&session.language==='en'?words('Synthetic voice · prerecorded Isla','合成语音 · 预录 Isla'):words('Synthetic voice · browser speech','合成语音 · 浏览器朗读');
}
$('individualPracticeLink').onclick = () => { stop(); persist(); };
$('individualPracticeLink').onauxclick = event => { if (event.button === 1) { stop(); persist(); } };
$('supportRoute').onclick=()=>selectRoute('support');$('prepareRoute').onclick=()=>selectRoute('prepare');$('fullJourney').onclick=()=>selectRoute('full');
$('next').onclick = () => { stop(); choice=null;viewpoint='team';if (!$('next').disabled) { session.positions[session.setting]=routePositions()[routeOffset()+1];syncPlayer(); render(); } };
$('previous').onclick = () => { stop();choice=null;viewpoint='team';if (!$('previous').disabled) { session.positions[session.setting]=routePositions()[routeOffset()-1];syncPlayer(); render(); } };
$('restart').onclick = () => { selectRoute(route);playing=true; render();schedule(); };
$('resetAll').onclick=()=>{stop();if(storage)resetSession(storage);session=emptySession();route='support';viewpoint='team';choice=null;syncPlayer();render();};
$('inspectPending').onclick=()=>{stop();choice='inspect';render();$('inspectPending').focus();};
$('contactHuman').onclick=()=>{stop();choice='contact';render();$('contactHuman').focus();};
$('play').onclick = () => { if (playing) { stop(); return; } playing = true; render(); schedule(); };
$('read').onclick = () => { const wasPlaying=playing;stop();reading = !reading;audioFailed=false;playing=wasPlaying;render();if(playing)schedule(); };
$('language').onclick = () => { stop();audioFailed=false; session.language = session.language === 'en' ? 'zh' : 'en';if(session.language==='zh'&&!window.speechSynthesis)reading=false;syncPlayer();render(); };
for (const setting of ['centre','home']) $(`${setting}Tab`).onclick = () => { session.setting = setting;selectRoute(route); };
$('sources').onclick = () => {
  stop(); $('sourceTitle').textContent = words('Evidence and scope', '证据与范围'); $('closeSources').textContent = words('Close', '关闭');
  $('sourceBody').replaceChildren(node('p', words('The demo illustrates a proposed service. Responses, people, authorisations and records are staged. It has no backend, live AI, microphone input, real account or clinical approval. Browser progress and task state work locally.', '演示说明拟议服务。回应、人物、授权及记录均为预设。没有后端、实时 AI、麦克风输入、真实账号或临床批准。浏览器进度与任务状态在本地运行。')));
  $('sourceBody').append(node('p',words('English narration is prerecorded using Azure Speech’s Australian woman’s neural voice, Isla. It tells the authored story shown in the English captions, with sentence pauses. Chinese read-aloud uses browser synthesis. Sound starts only when enabled.','英语旁白使用 Azure Speech 澳大利亚女性神经网络声音 Isla 预先录制，以句间停顿讲述英文字幕中的预设故事。中文朗读使用浏览器合成语音。声音仅在开启后播放。')));
  $('sourceBody').append(node('p',words('Home-care role model: Sara and Wei provide assigned daily-living assistance. Amanda is this fictional provider’s registered-nurse-qualified care partner: she coordinates care management and nursing input within her qualification. The Support at Home guide (pages 1–3) establishes care-partner duties and provider-specific clinical oversight; it does not require every care partner to be a nurse.','居家角色安排：Sara 与 Wei 提供获分配的生活协助。Amanda 是本虚构机构具备注册护士资格的照护伙伴，协调照护管理及资格范围内的护理意见。《Support at Home》指南第 1–3 页规定照护伙伴职责及机构临床监督，并非要求每位照护伙伴都是护士。')));
  const guide=node('a',words('Read the care-partner guidance','阅读照护伙伴指南'));guide.href='https://www.health.gov.au/sites/default/files/2025-07/guidance-for-support-at-home-care-partners.pdf';guide.target='_blank';guide.rel='noopener noreferrer';$('sourceBody').append(guide);
  for (const source of SOURCES) {
    const item = node('div', '', 'source-item'); const link = node('a', source.title); link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; item.append(link, node('p', local(source.note))); $('sourceBody').append(item);
  }
  $('sourceBody').append(node('p', words('Displayed roles are fictional local arrangements. “Community care assistant” here means a worker providing authorised daily-living assistance; assistant in nursing is the Australian example. No organisation or researcher endorses this demo.', '所显示角色是虚构的本地安排。“社区照护助理”指提供获准日常生活协助的工作人员，澳大利亚例子为助理护理人员。没有机构或研究者为本演示背书。')));
  $('sourceDialog').showModal();
};
$('closeSources').onclick = () => $('sourceDialog').close();
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
$('audioControls').append($('read'));
$('audioControls').append($('voiceStatus'));
syncPlayer();render();
// Silent autoplay obeys browser audio policy. Reduced-motion users choose Play.
if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.hidden&&routeOffset()<routePositions().length-1){playing=true;render();schedule();}
