import { roleFor } from './story.js';
import { phoneView } from './phone-view.js';
function el(tag, className, text) {
  const node = document.createElement(tag); node.className = className;
  if (text) node.textContent = text;
  return node;
}
export function renderScene(container, frame, setting, language, memory=null) {
  container.replaceChildren();
  container.className = `scene ${setting} ${frame.memory || 'orientation'}`;
  container.append(el('div', 'scene-title', frame.location[language]), el('div', 'room-window'), el('div', 'room-plant'));
  const people = el('div', 'scene-people');
  for (const name of frame.people) {
    const kind = ['Priya','Amanda'].includes(name) ? 'nurse' : name === 'Lin' ? 'coordinator' : name === 'Alex' ? 'manager' : name === 'Grace' ? 'supporter' : name.startsWith('Mr') ? 'recipient' : 'assistant';
    const remote = setting === 'home' && ['Amanda','Alex'].includes(name);
    const person = el('div', `person ${kind}${remote ? ' remote' : ''}`);
    const avatar = el('div', 'avatar'); avatar.setAttribute('aria-hidden', 'true');
    for (const part of ['hair', 'head', 'arm left', 'arm right', 'torso', 'leg left', 'leg right']) avatar.append(el('div', part));
    if(['Hui Lin','Sara','Sam','Wei','Priya','Amanda'].includes(name)){
      const headset=el('div','open-ear-headset');headset.append(el('span','headset-band'),el('span','headset-pad'),el('span','headset-mic'));avatar.append(headset);
      person.dataset.headset='open-ear';
    }
    person.append(avatar, el('div', 'person-name', name === 'Hui Lin' && language === 'zh' ? '惠琳' : name), el('div', 'person-role', roleFor(name,setting)?.[language] || name));
    people.append(person);
  }
  container.append(people);
  if (frame.cue||['capture','request','recall','feedback'].includes(frame.support?.kind)) {
    const wave = el('div', 'voice-wave'); wave.setAttribute('aria-label', language === 'zh' ? '预设语音更新' : 'Staged voice update');
    for (let i = 0; i < 5; i++) wave.append(el('i', ''));
    container.append(wave);
  }
  if(frame.support?.kind==='capture'){
    const input=el('div','scene-voice-input');
    input.append(el('strong','',language==='zh'?'通过耳机说出更新':'Speak through the headset'),el('p','',frame.support.utterance?.[language]||''));
    container.append(input);
    container.classList.add('voice-capture-scene');
  }
  if(setting==='home'&&frame.support?.kind==='request'){
    const route=el('div','remote-support-route',language==='zh'?'Sara → 共享请求 → Amanda（远程）':'Sara → shared request → Amanda (remote)');
    container.append(route);
  }
  const view=phoneView(frame,memory,setting);
  if(view){
    container.classList.add('with-phone');
    const phone=el('aside','scene-phone');phone.setAttribute('aria-label',language==='zh'?'配对手机界面示意':'Paired phone interface illustration');phone.dataset.phase=view.phase;
    phone.append(el('div','phone-speaker'),el('p','phone-context',language==='zh'?'配对手机 · 跟随演示':'Paired phone · follows the story'),el('strong','phone-owner',view.owner),el('p','phone-mode',view.mode==='practice'?(language==='zh'?'练习记忆':'Practice memory'):view.mode==='workplace'?(language==='zh'?'工作记忆':'Workplace memory'):(language==='zh'?'任务准备':'Assignment preparation')));
    phone.append(el('h3','phone-heading',view.title[language==='zh'?1:0]));
    const states={pending:['Awaiting human decision','等待人类决定'],decided:['Decision recorded','决定已记录'],practice:['Practice feedback','练习反馈'],reminder:['Reminder active','提醒中'],'no-reminder':['No active reminder','无活动提醒'],draft:['Draft · check required','草稿 · 待核对'],confirmed:['Confirmed','已确认'],context:['Current context','当前上下文'],unavailable:['Record unavailable','记录不可用']};
    phone.append(el('p','phone-state',states[view.phase][language==='zh'?1:0]));
    const text=typeof view.text==='string'?view.text:view.text?.[language];if(text)phone.append(el('p','phone-text',text));
    if(view.target)phone.append(el('p','phone-target',`${language==='zh'?'回应负责人':'Response owner'}: ${view.target}`));
    if(view.source)phone.append(el('p','phone-reference',view.source));
    if(view.recordId)phone.append(el('p','phone-reference',`${language==='zh'?'记录':'Record'}: ${view.recordId}`));
    if(view.reviewedBy)phone.append(el('p','phone-reference',`${language==='zh'?'复核':'Reviewed'}: ${view.reviewedBy}`));
    if(view.related){const r=view.related;phone.append(el('p','phone-related',`${r.label[language]} · ${r.owner}`),el('p','phone-reference',r.reminder?(language==='zh'?'待完成 · 提醒中':'Outstanding · reminder active'):r.status),el('p','phone-reference',r.source||''));}
    if(view.extraRecord)phone.append(el('p','phone-related',`${language==='zh'?'已确认护理记录':'Confirmed nursing record'} · ${view.extraRecord.author}`),el('p','phone-reference',view.extraRecord.id));
    phone.append(el('p','phone-handsfree',language==='zh'?'通过耳机说话和收听':'Speak and listen through the headset'));
    container.append(phone);
    for(const person of container.querySelectorAll('.person')){
      if(person.querySelector('.person-name')?.textContent===(view.owner==='Hui Lin'&&language==='zh'?'惠琳':view.owner)&&['capture','request','recall'].includes(frame.support.kind))person.classList.add('voice-active');
    }
  }
}
