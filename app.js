import { STORIES, LABELS, ROLES, SOURCES, roleFor } from './story.js';
import { GuidedPlayer, readingDuration } from './playback.js';
import { emptySession, loadSession, saveSession, resetSession, replay } from './memory.js';
import { renderScene } from './scene.js';
const $ = id => document.getElementById(id);
let storage;
try { storage = window.localStorage; } catch { storage = null; }
const lengths = Object.fromEntries(Object.entries(STORIES).map(([key, frames]) => [key, frames.length]));
let session = storage ? loadSession(storage, lengths) : emptySession();
let playing = false, timer = null, reading = false, generation=0, viewpoint='team', choice=null;
let player=new GuidedPlayer(STORIES[session.setting],session.positions[session.setting],session.language);
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
  $('play').textContent = words('Play story', '播放故事');
  document.body.dataset.playing = 'false';
}
function duration(frame) { return readingDuration(frame,session.language); }
function syncPlayer(){player=new GuidedPlayer(STORIES[session.setting],session.positions[session.setting],session.language);}
function schedule() {
  clearTimeout(timer);
  const token=++generation;
  if (!playing) { stop(); return; }
  const last=session.positions[session.setting]===lengths[session.setting]-1;
  if(reading && session.language==='en'){
    narration.src=`assets/narration/${current().id}.m4a`;
    let completed=false;
    const finish=()=>{if(completed||token!==generation||!playing)return;completed=true;clearTimeout(timer);timer=setTimeout(last?stop:advance,1200);};
    const fallback=()=>{if(token!==generation||!playing)return;audioFailed=true;renderVoice();clearTimeout(timer);timer=setTimeout(last?stop:advance,duration(current()));};
    narration.onended=finish;narration.onerror=fallback;
    narration.play().catch(fallback);
    // Do not strand the presentation if a browser fails to emit ended/error.
    timer=setTimeout(()=>{if(token===generation&&playing){narration.pause();fallback();}},120000);
  } else if (reading && window.speechSynthesis) {
    const speech = new SpeechSynthesisUtterance(local(current().caption)); speech.lang = session.language === 'zh' ? 'zh-CN' : 'en-GB';
    const fallback=()=>{if(playing&&token===generation){clearTimeout(timer);timer=setTimeout(last?stop:advance,duration(current()));}};
    speech.onend = () => { if (playing && token===generation){clearTimeout(timer);timer = setTimeout(last?stop:advance, 1000);} };
    speech.onerror = fallback;
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(speech);
    timer=setTimeout(fallback,120000);
  } else {
    if(last){timer=setTimeout(stop,duration(current()));return;}
    player.play();
    const tick=()=>{if(token!==generation||!playing)return;if(player.tick(250)){advance();return;}timer=setTimeout(tick,250);};
    timer=setTimeout(tick,250);
  }
}
function advance() {
  if (!playing) return;
  session.positions[session.setting]++;
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
  const badge = frame.memory === 'practice' ? words('Practice · simulated shared memory', '练习 · 模拟共享记忆') : frame.memory === 'workplace' ? words('Workplace support · fictional demonstration', '工作支持 · 虚构演示') : words('Stage transition / orientation', '阶段转换／任务准备');
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
    card.append(node('h4', `${task.person} · ${local(task.label)}`), node('span', external?words('Awaiting external clinical response','等待外部临床回应'):words(...statusLabels[task.status]), 'task-state'),
      node('p', `${words('Responsible', '负责人')}: ${task.owner} · ${local(roleFor(task.owner,session.setting))}`), node('p', `${words('Source', '来源')}: ${local(task.source)}`, 'source-line'));
    const request = Object.values(memory.requests).find(r => r.task === task.id);
    if (request && viewpoint!=='Grace') card.append(node('p', `${external?words('Follow-up owner','跟进负责人'):words('Decision', '决定')}: ${request.approver} · ${request.status === 'pending' ? words('pending', '待处理') : request.status==='declined'?words('declined','未批准'):words('approved', '已批准')}`), node('p', local(request.decision || request.reason), 'source-line'));
    const contact=memory.contacts[task.id];
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
    $('memoryBody').append(node('p',words('Narrative viewpoint: Grace sees only the permitted household request. This is not an authenticated access-control demonstration.','故事视角：Grace 仅查看获准的生活用品请求。这不是经过身份验证的权限演示。'),'source-line'));return;
  }
  for(const handover of memory.handovers)$('memoryBody').append(node('p', `${words('Coordination handover','协调交接')}: ${handover.acceptedBy || words('awaiting acceptance','等待接手')} · ${handover.outstanding.length} ${words('outstanding items','项未完成事项')}`,'source-line'));
  const eventList = node('ol', '', 'event-list');
  const typeNames={plan:['Planned','计划'],accept:['Accepted','接手'],confirm:['Confirmed','确认'],handover:['Handover prepared','准备交接'],'accept-handover':['Coordination handover accepted','接手协调交接'],report:['Observation drafted','观察草稿']};
  for (const event of memory.events.slice(-3)) eventList.append(node('li', `${event.actor} · ${event.at} · ${local(event.text || event.decision || event.reason) || words(...(typeNames[event.type]||['Status update','状态更新']))}`));
  $('memoryBody').append(node('h4', words('Recent source history', '近期来源记录')), eventList);
}
function renderChapters() {
  $('chapters').replaceChildren();
  const chapters = [...new Set(STORIES[session.setting].map(f => f.chapter))];
  for (const chapter of chapters) {
    const button = node('button', local(LABELS[chapter])); button.dataset.chapter = chapter;
    if (current().chapter === chapter) button.setAttribute('aria-current', 'step');
    button.onclick = () => { stop(); choice=null;viewpoint='team';session.positions[session.setting] = STORIES[session.setting].findIndex(f => f.chapter === chapter);syncPlayer();render(); document.querySelector(`[data-chapter="${chapter}"]`).focus(); };
    $('chapters').append(button);
  }
}
function render() {
  const frame = current();
  document.documentElement.lang = session.language === 'zh' ? 'zh-CN' : 'en';
  document.body.dataset.setting = session.setting; document.body.dataset.frame = frame.id; document.body.dataset.stage = frame.memory || frame.chapter; document.body.dataset.playing = String(playing);
  $('language').textContent = words('中文', 'English'); $('sources').textContent = words('Sources & scope', '来源与范围');
  $('tagline').textContent = words('Shared memory · reachable human judgement', '共享记忆 · 可获得的人类判断');
  $('headline').textContent = words('One team. Support that continues.', '一个团队，持续获得支持。');
  $('introText').textContent = words('Prepare for the assignment, practise with the team, then stay supported during care.', '为任务做好准备，与团队一起练习，并在照护过程中持续获得支持。');
  $('disclaimer').textContent = words('Scripted concept demo · fictional people and records · no live AI or clinical service', '预设概念演示 · 虚构人物与记录 · 无实时 AI 或临床服务');
  for (const setting of ['centre','home']) { $(`${setting}Tab`).textContent = local(LABELS[setting]); $(`${setting}Tab`).setAttribute('aria-pressed', String(session.setting === setting)); }
  renderChapters();
  $('location').textContent = local(frame.location); $('sceneTitle').textContent = local(frame.title);
  $('speaker').textContent = frame.speaker==='Narrator'?local(ROLES.Narrator):frame.speaker === 'Hui Lin' && session.language === 'zh' ? '惠琳' : `${frame.speaker} · ${local(roleFor(frame.speaker,session.setting))}`;
  $('caption').textContent = local(frame.caption); $('physicalAction').textContent = local(frame.action);
  renderScene($('scene'), frame, session.setting, session.language);
  $('briefing').hidden = !frame.briefing; $('briefing').textContent = local(frame.briefing);
  $('transitionCard').hidden = !frame.boundary;
  const handover=['rehearsal','handover'].includes(frame.chapter);
  $('transitionTitle').textContent = handover?local(LABELS[frame.chapter]):words('Practice and workplace support use separate records.', '练习与工作支持使用独立记录。');
  $('transitionText').textContent = handover?words('The team checks outstanding items and their owners. Coordination acceptance does not transfer clinical authority.','团队核对未完成事项及负责人。接手协调不代表转移临床权限。'):words('The demonstration now changes context. Workplace records are separate; practice completions never carry over.', '演示现在切换场景。工作记录独立保存，练习完成情况不会转入。');
  $('practiceChoice').hidden=true;
  $('choicePrompt').textContent=words('Practice decision: what do you need next? Both actions keep the human decision pending.','练习决定：接下来需要什么？以下操作均不会自动批准请求。');
  $('inspectPending').textContent=words('Inspect pending work','查看待办事项');$('contactHuman').textContent=words('Contact the responsible person','联系负责人');
  $('choiceFeedback').textContent=choice==='inspect'?words('The request is retained, with a named decision owner. It is still unapproved.','请求已保留，并有明确决策负责人。尚未获批。'):choice==='contact'?words('Direct team contact is requested. A live service would connect you through its established human-help route; this demo stages that request.','已请求直接联系团队。实际服务将通过既定人类求助渠道连接；本演示为预设请求。'):'';
  $('viewControls').replaceChildren();
  if(session.setting==='home'&&frame.memory==='workplace')for(const view of ['team','Grace']){const button=node('button',view==='team'?words('Care-team view','照护团队视角'):words('Grace’s permitted view','Grace 获准视角'));button.dataset.view=view;button.setAttribute('aria-pressed',String(viewpoint===view));button.onclick=()=>{stop();viewpoint=view;render();document.querySelector(`[data-view="${view}"]`).focus();};$('viewControls').append(button);}
  $('memoryTitle').textContent = words('Shared memory', '共享记忆'); renderMemory(frame);
  $('position').textContent = `${session.positions[session.setting] + 1} / ${lengths[session.setting]}`;
  $('progress').value = (session.positions[session.setting] + 1) / lengths[session.setting] * 100;
  $('previous').disabled = session.positions[session.setting] === 0; $('next').disabled = session.positions[session.setting] === lengths[session.setting] - 1;
  $('previous').textContent = words('← Back', '← 返回');
  $('next').textContent = words('Next scene →', '下一幕 →');
  $('play').disabled = false;
  $('play').textContent = playing ? words('Pause', '暂停') : words('Play guided demonstration', '播放引导演示');
  renderVoice();
  $('restart').textContent = words('Restart this setting', '重新开始本场景');
  $('resetAll').textContent=words('Reset demo','重置演示');
  $('playbackHint').textContent = words('The guided demonstration advances automatically, including clearly labelled practice, workplace and handover scenes. Enable narration to hear an Australian woman’s voice. All decisions and records shown are staged.', '引导演示自动播放，包括清晰标注的练习、工作与交接场景。开启旁白可收听配音。所有决定和记录均为预设。');
  $('mapTitle').textContent = words('The same support pattern, separate memories', '相同支持方式，独立保存记忆');
  $('mapContent').replaceChildren();
  for (const [title, text] of [
    [words('Prepare for the person', '为服务对象做好准备'), words('Relevant experience, local roles and person-specific knowledge determine what to practise.', '根据经验、本地职责与对服务对象的了解决定练习内容。')],
    [words('Practise with the team', '与团队一起练习'), words('Rehearse reporting, decisions and handover with simulated memory. Hands-on assessment remains separate.', '借助模拟记忆练习报告、决定与交接。实操评估仍需另行进行。')],
    [words('Stay supported at work', '工作中持续支持'), words('New and established workers share relevant changes, pending decisions and reviewed updates.', '新员工与现有员工共享相关变化、待定事项及已核对更新。')]
  ]) { const card = node('div', '', 'map-card'); card.append(node('h3', title), node('p', text)); $('mapContent').append(card); }
  $('footerText').textContent = words('Authored demonstration for discovery. Required practical assessment and professional decisions remain with people.', '用于探索需求的预设演示。必要实操评估与专业决定仍由人负责。');
  persist();
}
function renderVoice(){
  $('read').textContent=reading?words('Narration: on','旁白：开'):words('Narration: off','旁白：关');
  $('read').setAttribute('aria-pressed',String(reading));$('read').disabled=session.language==='zh'&&!window.speechSynthesis;
  $('voiceStatus').textContent=audioFailed?words('Audio unavailable; captioned playback continues.','音频不可用；字幕演示继续。'):session.language==='en'?words('Recorded synthetic Australian woman’s voice · Karen · measured pace','预录合成澳大利亚女性语音 · Karen · 舒缓语速'):words('Chinese narration uses your browser voice.','中文旁白使用浏览器语音。');
}
$('next').onclick = () => { stop(); choice=null;viewpoint='team';if (!$('next').disabled) { session.positions[session.setting]++;syncPlayer(); render(); } };
$('previous').onclick = () => { stop();choice=null;viewpoint='team';if (!$('previous').disabled) { session.positions[session.setting]--;syncPlayer(); render(); } };
$('restart').onclick = () => { stop();choice=null;viewpoint='team';session.positions[session.setting] = 0;syncPlayer();playing=true; render();schedule(); };
$('resetAll').onclick=()=>{stop();if(storage)resetSession(storage);session=emptySession();viewpoint='team';choice=null;syncPlayer();render();};
$('inspectPending').onclick=()=>{stop();choice='inspect';render();$('inspectPending').focus();};
$('contactHuman').onclick=()=>{stop();choice='contact';render();$('contactHuman').focus();};
$('play').onclick = () => { if (playing) { stop(); return; } playing = true; render(); schedule(); };
$('read').onclick = () => { const wasPlaying=playing;stop();reading = !reading;audioFailed=false;playing=wasPlaying;render();if(playing)schedule(); };
$('language').onclick = () => { stop(); session.language = session.language === 'en' ? 'zh' : 'en';if(session.language==='zh'&&!window.speechSynthesis)reading=false;syncPlayer();render(); };
for (const setting of ['centre','home']) $(`${setting}Tab`).onclick = () => { stop();viewpoint='team';choice=null;session.setting = setting;syncPlayer();render(); };
$('sources').onclick = () => {
  stop(); $('sourceTitle').textContent = words('Evidence and scope', '证据与范围'); $('closeSources').textContent = words('Close', '关闭');
  $('sourceBody').replaceChildren(node('p', words('The demo illustrates a proposed service. Responses, people, authorisations and records are staged. It has no backend, live AI, microphone input, real account or clinical approval. Browser progress and task state work locally.', '演示说明拟议服务。回应、人物、授权及记录均为预设。没有后端、实时 AI、麦克风输入、真实账号或临床批准。浏览器进度与任务状态在本地运行。')));
  $('sourceBody').append(node('p',words('English audio is prerecorded synthetic speech using Karen, an Australian woman’s system voice, at a measured pace. Chinese read-aloud uses browser synthesis. Sound starts only when enabled.','英语音频为预录合成语音，使用澳大利亚女性系统声音 Karen，语速舒缓。中文朗读使用浏览器合成语音。声音仅在开启后播放。')));
  for (const source of SOURCES) {
    const item = node('div', '', 'source-item'); const link = node('a', source.title); link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; item.append(link, node('p', local(source.note))); $('sourceBody').append(item);
  }
  $('sourceBody').append(node('p', words('Displayed roles are fictional local arrangements. “Community care assistant” here means a worker providing authorised daily-living assistance; assistant in nursing is the Australian example. No organisation or researcher endorses this demo.', '所显示角色是虚构的本地安排。“社区照护助理”指提供获准日常生活协助的工作人员，澳大利亚例子为助理护理人员。没有机构或研究者为本演示背书。')));
  $('sourceDialog').showModal();
};
$('closeSources').onclick = () => $('sourceDialog').close();
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
render();
// Silent autoplay obeys browser audio policy. Reduced-motion users choose Play.
if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.hidden&&session.positions[session.setting]<lengths[session.setting]-1){playing=true;render();schedule();}
