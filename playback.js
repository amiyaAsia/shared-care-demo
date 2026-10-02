/** A presentation timeline: story decisions remain authored, not visitor actions. */
export const JOURNEYS = {
  centre: {
    support: ['centre-overview','centre-w-request','centre-p-draft','centre-w-record','centre-w-doctor','centre-w-handover'],
    prepare: ['centre-prepare','centre-practice-title','centre-p-request','centre-p-approve','centre-p-accept']
  },
  home: {
    support: ['home-overview','home-w-update','home-w-owner','home-w-nurse','home-followup-draft','home-followup-confirm'],
    prepare: ['home-prepare','home-p-title','home-p-request','home-p-approve']
  }
};
export function journeyIndexes(frames, setting, route = 'support') {
  if (route === 'full') return frames.map((_, index) => index);
  const ids = JOURNEYS[setting]?.[route];
  if (!ids) throw new Error('Unknown journey');
  return ids.map(id => {
    const index = frames.findIndex(frame => frame.id === id);
    if (index < 0) throw new Error(`Missing journey scene ${id}`);
    return index;
  });
}
const shortCaptions = {
  'centre-overview': ['A changed monitoring instruction reaches Priya. The assistants are already helping other residents. Who needs to do what next?', '新的监测指示传给 Priya，助理们正在协助其他服务对象。接下来谁负责什么？'],
  'centre-w-request': ['Hui Lin needs cover while helping Mr Lee. Her request waits with Priya; the nurse’s monitoring stays separately assigned.', '惠琳协助李先生时需要接替。请求等待 Priya 决定，护士监测保持独立分配。'],
  'centre-p-draft': ['Priya arranges cover. Sam accepts the comfort check, and its reminder follows him. Nursing monitoring stays with Priya.', 'Priya 安排接替，Sam 接受舒适问候，提醒随之转给他。护理监测仍由 Priya 负责。'],
  'centre-w-record': ['Sam checks Mrs Chen, reviews his spoken update and confirms it. Her quieter-seat request stays open.', 'Sam 问候陈女士，核对并确认语音更新。她的安静座位请求仍待处理。'],
  'centre-w-doctor': ['Priya confirms her own nursing record. Both checks are complete; the seating request still needs follow-through.', 'Priya 确认自己的护理记录。两项问候与监测均完成，座位请求仍需跟进。'],
  'centre-w-handover': ['Handover reuses the confirmed updates and names the remaining owner. The team can see what happened and what still needs doing.', '交接复用已确认更新并明确待办负责人。团队可见已做事项及仍需完成的工作。'],
  'home-overview': ['A preference changes during Sara’s visit. Amanda and the next worker need the same current account.', 'Sara 探访中出现偏好变化，Amanda 与下一位员工需要同一份当前信息。'],
  'home-w-update': ['Sara reports Mr Wong’s choice with the agreed plan. Amanda’s response is pending; the current worker keeps that context.', 'Sara 关联约定计划报告黄先生的选择，等待 Amanda 回应，当前员工保留上下文。'],
  'home-w-owner': ['Amanda confirms the arrangement and assigns Wei a separate preference follow-up for the next visit.', 'Amanda 确认安排，并将下次探访的独立偏好跟进交给 Wei。'],
  'home-w-nurse': ['Sara reviews and confirms one short update. The same observation supplies the visit record and next worker’s briefing.', 'Sara 核对并确认一条简短更新，同一观察用于探访记录及下一位员工简报。'],
  'home-followup-draft': ['At the next visit, Wei asks Mr Wong what suits him today. His spoken update remains a draft until checked.', '下次探访时，Wei 询问黄先生今天的偏好。语音更新在核对前保持草稿。'],
  'home-followup-confirm': ['Wei confirms the result. Its reminder clears and Amanda receives the reviewed update with its author.', 'Wei 确认结果，提醒停止。Amanda 收到带作者的核对更新。'],
  'centre-prepare': ['Hui Lin checks the current instruction and her role. Nursing monitoring stays with Priya; assistants report observations.', '惠琳核对当前指示与自身职责。护理监测由 Priya 负责，助理报告观察。'],
  'centre-practice-title': ['“Can someone help me?” misses the context. Simulated teammates ask for the resident, task and obstacle.', '“有人能帮我吗？”缺少上下文。模拟同事要求补充服务对象、任务与障碍。'],
  'centre-p-request': ['Hui Lin retries with the person, task and why she needs cover. The human decision is still pending.', '惠琳重试，说明服务对象、任务及接替原因。人类决定仍待定。'],
  'centre-p-approve': ['Priya checks Sam’s availability before assigning cover. The practice shows the decision and who accepts it.', 'Priya 核实 Sam 有时间后安排接替。练习展示决定及接手人。'],
  'centre-p-accept': ['The team reviews the improved request. Acceptance is visible; the simulated care task is still unfinished.', '团队回顾改进后的请求。已接手的状态可见，模拟照护任务仍待完成。'],
  'home-prepare': ['Sara checks the person’s preferences, agreed services and the route to Amanda. Wei helps her prepare.', 'Sara 核对偏好、约定服务及向 Amanda 求助的渠道，Wei 协助准备。'],
  'home-p-title': ['Sara’s first request misses the service plan. Feedback asks her to include the agreed tasks and Mr Wong’s choice.', 'Sara 首次请求缺少服务计划。反馈请她补充约定任务及黄先生的选择。'],
  'home-p-request': ['The retry links the request to the agreed services. Amanda can pick up that context when she responds.', '重试将请求关联约定服务，Amanda 回应时可直接查看上下文。'],
  'home-p-approve': ['The team rehearses the decision and handover. This is practice; it does not complete any workplace task.', '团队练习决定与交接。这是练习，不完成任何实际工作任务。']
};
export function presentationFrame(frame, route = 'support') {
  if (route === 'full' || !shortCaptions[frame.id]) return frame;
  const [en, zh] = shortCaptions[frame.id];
  return { ...frame, caption: {en, zh}, action: {en:'',zh:''} };
}
export function readingDuration(frame, language = 'en') {
  const caption = frame.caption[language];
  const action = frame.action[language];
  const factor = language === 'zh' ? 180 : 55;
  return Math.max(7500, (caption.length + action.length) * factor, frame.boundary ? 12000 : 0);
}
export class GuidedPlayer {
  constructor(frames, index = 0, language = 'en') {
    this.frames = frames; this.index = index; this.language = language;
    this.elapsed = 0; this.playing = false;
  }
  play() { if (this.index < this.frames.length - 1) this.playing = true; }
  pause() { this.playing = false; }
  select(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.frames.length) return false;
    this.index = index; this.elapsed = 0; this.pause(); return true;
  }
  tick(milliseconds) {
    if (!this.playing || !Number.isFinite(milliseconds) || milliseconds < 0 || milliseconds > 1000) return false;
    this.elapsed += milliseconds;
    if (this.elapsed < readingDuration(this.frames[this.index], this.language)) return false;
    this.elapsed = 0; this.index++;
    if (this.index >= this.frames.length - 1) this.pause();
    return true;
  }
}
