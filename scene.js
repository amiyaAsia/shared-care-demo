import { roleFor } from './story.js';
function el(tag, className, text) {
  const node = document.createElement(tag); node.className = className;
  if (text) node.textContent = text;
  return node;
}
export function renderScene(container, frame, setting, language) {
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
    person.append(avatar, el('div', 'person-name', name === 'Hui Lin' && language === 'zh' ? '惠琳' : name), el('div', 'person-role', roleFor(name,setting)?.[language] || name));
    people.append(person);
  }
  container.append(people);
  if (frame.cue) {
    const wave = el('div', 'voice-wave'); wave.setAttribute('aria-label', language === 'zh' ? '预设语音更新' : 'Staged voice update');
    for (let i = 0; i < 5; i++) wave.append(el('i', ''));
    container.append(wave);
  }
}
