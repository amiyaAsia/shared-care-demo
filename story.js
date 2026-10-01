import { NARRATION } from './narration-script.js';
const b = (en, zh) => ({ en, zh });
export const LABELS = {
  centre: b('Care centre', '照护中心'), home: b('Care at home', '居家照护'),
  overview: b('The connected service', '相互衔接的服务'), prepare: b('Prepare for this assignment', '为本次任务做准备'),
  practice: b('Practise together', '团队练习'), rehearsal: b('Rehearsal handover', '练习交接'),
  transition: b('From practice to work', '从练习走向工作'), workplace: b('Supported work', '工作中的支持'),
  handover: b('Workplace handover', '实际工作交接'), finish: b('One team, continued support', '团队协作，持续支持')
};
const frame = (id, chapter, memory, location, title, speaker, caption, action, people, events = [], extra = {}) =>
  ({ id, chapter, memory, location: b(...location), title: b(...title), speaker, caption: b(...caption), action: b(...action), people, events, ...extra });
const ev = (id, type, rest) => ({ id, type, at: id.startsWith('hw-') ? '11:10' : id.startsWith('w-') ? '14:15' : type==='report' ? '09:24' : '09:25', ...rest });
const common = setting => [
  frame(`${setting}-overview`, 'overview', null, ['Amiya Shared Care · service overview', 'Amiya Shared Care · 服务概览'],
    ['Prepare. Practise. Stay supported.', '做好准备，团队练习，持续获得支持。'], 'Narrator',
    ['Follow Hui Lin from assignment preparation into a shared working team. AI holds context; people make decisions.', '跟随惠琳，从任务准备进入团队协作。AI 保存上下文，由人作出决定。'],
    ['Two settings. Separate practice and workplace memories.', '两种照护场景。练习记忆与工作记忆分开保存。'], ['Hui Lin', 'Priya', 'Lin', 'Alex']),
  frame(`${setting}-prepare`, 'prepare', null, ['Before the assignment · orientation', '上岗前 · 熟悉任务'],
    ['Experienced in care. New to this assignment.', '有照护经验，初次接触本次任务。'], 'Hui Lin',
    ['I know daily-living assistance. I need this person’s preferences, today’s changes and our team’s help routes.', '我有日常生活协助经验。我需要了解服务对象的偏好、今天的变化，以及团队的求助渠道。'],
    ['Experience, language and familiarity are considered separately. Overseas recruitment does not imply inexperience.', '分别了解经验、语言需求和对服务对象的熟悉程度。海外招聘并不代表缺乏经验。'], ['Hui Lin', 'Priya', 'Lin'], [],
    { briefing: setting === 'centre' ? b('Mrs Chen prefers an unhurried check-in. Mr Lee’s dressing assistance needs Hui Lin’s attention. Priya handles clinical decisions; Lin coordinates activities; Alex arranges resources.', '陈女士喜欢从容的问候。惠琳需要专心协助李先生穿衣。Priya 负责临床决定，Lin 协调活动，Alex 安排资源。') : b('Mr Wong prefers to hear who is coming before the visit. Hui Lin delivers agreed daily-living assistance. Lin coordinates visits; Priya provides remote nursing input; family access is limited to agreed updates.', '黄先生希望提前知道谁来探访。惠琳提供约定的生活协助。Lin 协调探访，Priya 远程提供护理意见；家属只接收获准分享的信息。') })
];
export const STORIES = {
  centre: [
    ...common('centre'),
    frame('centre-practice-title', 'practice', 'practice', ['Training room · 09:20 simulated shift', '培训室 · 模拟班次 09:20'],
      ['Practise a change with the team', '练习应对任务变化'], 'Narrator',
      ['These are training tasks. Practise asking for help without losing track of the work.', '以下是练习任务。练习在求助时持续掌握任务状态。'],
      ['Hui Lin assists Mr Lee. Mrs Chen’s agreed comfort check is still due.', '惠琳协助李先生。陈女士约定的舒适情况问候仍待完成。'], ['Hui Lin', 'Mr Lee', 'Priya'],
      [ev('p-plan', 'plan', { task: 'comfort', person: 'Mrs Chen', actor: 'Hui Lin', label: b('Agreed comfort / preference check', '约定的舒适情况及偏好问候'), source: b('Fictional practice plan · approved nonclinical task', '虚构练习计划 · 获准的非临床任务') })]),
    frame('centre-p-request', 'practice', 'practice', ['Training room · interrupted task', '培训室 · 任务受阻'],
      ['Speak once. Keep the request visible.', '说一次，让请求持续可见。'], 'Hui Lin',
      ['I’m still assisting Mr Lee. Please ask Priya to arrange cover for Mrs Chen’s agreed check.', '我还在协助李先生。请联系 Priya，为陈女士约定的问候安排接替。'],
      ['Priya is occupied. The request is held for her; no change is approved yet.', 'Priya 正在忙。系统保留请求，等待她处理；目前尚未批准变化。'], ['Hui Lin', 'Mr Lee', 'Priya'],
      [ev('p-request', 'request', { task: 'comfort', request: 'cover', actor: 'Hui Lin', approver: 'Priya', reason: b('Hui Lin remains occupied with agreed dressing assistance.', '惠琳仍在提供约定的穿衣协助。') })], { cue: 'buffer' }),
    frame('centre-p-approve', 'practice', 'practice', ['Training room · nurse decision', '培训室 · 护士决定'],
      ['Priya decides on one task', 'Priya 决定调整一项任务'], 'Priya',
      ['Sam has capacity and is authorised for this comfort check. Sam, please take this task. Mrs Chen’s other care allocation stays the same.', 'Sam 有时间，也具备完成此项问候的授权。请 Sam 接替这项任务。陈女士的其他照护安排不变。'],
      ['The nurse approves the task-level change. Completion is still outstanding.', '护士批准任务级别调整。任务仍未完成。'], ['Priya', 'Sam', 'Hui Lin'],
      [ev('p-approve', 'approve', { task: 'comfort', request: 'cover', actor: 'Priya', assignee: 'Sam', decision: b('One nonclinical task reassigned after role and capacity check.', '核实职责与时间后，重新分配一项非临床任务。') })]),
    frame('centre-p-accept', 'practice', 'practice', ['Training room · colleague response', '培训室 · 同事回应'],
      ['A named person accepts', '明确由谁接手'], 'Sam',
      ['I’ve accepted the check. I’ll speak with Mrs Chen and report what happens.', '我接手这项问候。我会与陈女士交谈，并记录实际情况。'],
      ['Acceptance identifies the owner. It is not a completion report.', '接受任务明确责任人，并不代表任务已完成。'], ['Sam', 'Mrs Chen'],
      [ev('p-accept', 'accept', { task: 'comfort', actor: 'Sam' })]),
    frame('centre-p-draft', 'practice', 'practice', ['Training room · voice capture', '培训室 · 语音记录'],
      ['Capture the moment. Check the draft.', '及时记录，核对草稿。'], 'Sam',
      ['I checked in with Mrs Chen. She asked for a quieter seat. Please record that observation.', '我已向陈女士问候。她希望换到安静一些的座位。请记录这一观察。'],
      ['A draft links the task, resident, author and observation. Sam checks it before confirmation.', '草稿关联任务、服务对象、记录者与观察。Sam 确认前先核对。'], ['Sam', 'Mrs Chen'],
      [ev('p-report', 'report', { task: 'comfort', actor: 'Sam', text: b('Mrs Chen requested a quieter seat.', '陈女士希望换到安静一些的座位。'), observedAt: '09:24' })], { cue: 'voice' }),
    frame('centre-p-confirm', 'practice', 'practice', ['Training room · reviewed record', '培训室 · 已核对记录'],
      ['Confirmation closes this task', '确认后完成此项任务'], 'Sam',
      ['The resident, task and observation are correct. Confirm the record.', '服务对象、任务和观察内容都正确。确认记录。'],
      ['The practice record is confirmed. Priya can see who did what.', '练习记录已确认。Priya 可以查看谁完成了什么。'], ['Sam', 'Priya'],
      [ev('p-confirm', 'confirm', { task: 'comfort', actor: 'Sam' })]),
    frame('centre-p-handover', 'rehearsal', 'practice', ['Training room · rehearsal handover', '培训室 · 练习交接'],
      ['Practise passing on unfinished work', '练习交接未完成工作'], 'Hui Lin',
      ['The comfort check is confirmed. The quieter-seat arrangement still needs Lin’s response. Keep that request visible for the next person.', '舒适情况问候已确认。安静座位的安排仍需 Lin 回应。请为下一位同事保留这一请求。'],
      ['Practice reviewed. Discuss supervised next steps. No independent-care clearance is granted.', '练习已回顾。与负责人讨论受监督的下一步。这不授予独立照护许可。'], ['Hui Lin', 'Lin', 'Priya'],
      [ev('p-seat-plan', 'plan', { task: 'seat', person: 'Mrs Chen', actor: 'Sam', label: b('Quieter-seat arrangement', '安排安静座位'), source: b('Practice observation · resident preference', '练习观察 · 服务对象偏好') }),
        ev('p-seat-request', 'request', { task: 'seat', request: 'seat-help', actor: 'Sam', approver: 'Lin', reason: b('Programme coordinator input required.', '需要活动协调员处理。') }), ev('p-handover', 'handover', { actor: 'Hui Lin' }), ev('p-handover-accept','accept-handover',{actor:'Lin',handover:'p-handover'})]),
    frame('centre-transition', 'transition', null, ['Later · a working shift at the centre', '稍后 · 中心的实际工作班次'],
      ['Now see support after deployment', '现在查看上岗后的支持'], 'Narrator',
      ['We leave the training room. Hui Lin joins the working team. A separate fictional workplace memory begins here.', '离开培训室，惠琳加入工作团队。这里启用独立的虚构工作记忆。'],
      ['Training observations and completions do not become resident records. Select Continue to enter the workplace story.', '练习观察和完成记录不会进入服务对象档案。选择“继续”进入工作故事。'], ['Hui Lin', 'Sam', 'Alex'], [], { boundary: true }),
    frame('centre-w-request', 'workplace', 'workplace', ['Centre lounge · later working shift', '中心休息区 · 上岗后的班次'],
      ['A resident’s choice changes the next task', '服务对象的选择改变下一项安排'], 'Hui Lin',
      ['Mrs Chen would prefer the quiet activity later. Please ask Lin about the available session. I’m continuing her agreed assistance.', '陈女士希望稍后参加安静的活动。请向 Lin 确认可用场次。我继续提供她约定的协助。'],
      ['Her choice is recorded. Lin owns the programme decision; AI holds the context.', '记录她的选择。Lin 负责活动安排决定，AI 保存上下文。'], ['Hui Lin', 'Mrs Chen', 'Lin'],
      [ev('w-plan', 'plan', { task: 'activity', person: 'Mrs Chen', actor: 'Hui Lin', label: b('Agreed activity arrangement', '约定的活动安排'), source: b('Fictional workplace plan + current resident preference', '虚构工作计划及服务对象当前偏好') }),
        ev('w-request', 'request', { task: 'activity', request: 'activity-time', actor: 'Hui Lin', approver: 'Lin', reason: b('Resident prefers a later quiet session.', '服务对象希望参加稍后的安静场次。') })], { cue: 'buffer' }),
    frame('centre-w-decide', 'workplace', 'workplace', ['Centre office / lounge · programme response', '中心办公室／休息区 · 活动安排回应'],
      ['Programme and resource decisions stay with people', '活动及资源决定仍由人负责'], 'Lin',
      ['The later session is available. Alex has confirmed the seating resource. Sam can arrange it; Hui Lin’s other responsibilities are unchanged.', '稍后的场次可用。Alex 已确认座位资源。Sam 可以安排，惠琳的其他职责不变。'],
      ['Lin approves the arrangement. The manager’s resource confirmation is traceable.', 'Lin 批准安排。经理对资源的确认有记录可查。'], ['Lin', 'Alex', 'Sam'],
      [ev('w-resource', 'notify', { actor: 'Alex', text: b('Seating resource confirmed for the later session.', '稍后场次的座位资源已确认。') }),
        ev('w-approve', 'approve', { task: 'activity', request: 'activity-time', actor: 'Lin', assignee: 'Sam', decision: b('Later session agreed; no clinical instruction changed.', '同意稍后场次；临床指示没有变化。') }), ev('w-accept', 'accept', { task: 'activity', actor: 'Sam' })]),
    frame('centre-w-record', 'workplace', 'workplace', ['Centre lounge · completed arrangement', '中心休息区 · 安排已完成'],
      ['Existing staff use the same support', '现有团队同样使用支持'], 'Sam',
      ['The agreed arrangement is completed. Mrs Chen chose the later session. I’ve checked the draft and confirmed it.', '约定安排已完成。陈女士选择了稍后的场次。我已核对并确认草稿。'],
      ['One reviewed update supports the shared memory. A separate nursing question is still open.', '一条已核对更新进入共享记忆。另一项护理问题仍待处理。'], ['Sam', 'Mrs Chen', 'Priya'],
      [ev('w-report', 'report', { task: 'activity', actor: 'Sam', text: b('Later session arranged with Mrs Chen’s agreement.', '经陈女士同意，稍后场次已安排。'), observedAt: '14:10' }), ev('w-confirm', 'confirm', { task: 'activity', actor: 'Sam' }),
        ev('w-question-plan', 'plan', { task: 'review', person: 'Mrs Chen', actor: 'Priya', clinical: true, label: b('Reported change · nurse review', '已报告变化 · 护士评估'), source: b('Hui Lin’s fictional observation · received by Priya', '惠琳的虚构观察 · Priya 已收到') }),
        ev('w-question', 'request', { task: 'review', request: 'review', actor: 'Priya', approver: 'Priya', reason: b('Registered-nurse review remains outstanding after Hui Lin’s report.', '惠琳报告后，注册护士评估仍待完成。') })]),
    frame('centre-w-doctor', 'workplace', 'workplace', ['Centre · external doctor contact', '中心 · 联系外部医生'],
      ['Nurse-led contact with an external doctor', '由护士联系外部医生'], 'Priya',
      ['I’ve received the report and am contacting the external doctor through our service route. The reply is still awaited.', '我已收到报告，正通过服务渠道联系外部医生。目前仍在等待回复。'],
      ['No doctor is based here. A contact request does not become a doctor’s instruction.', '医生不常驻这里。联系请求并不代表医生指示。'], ['Priya', 'Hui Lin'],
      [ev('w-contact', 'contact', { task:'review', actor: 'Priya', status:'awaiting-reply', text: b('External doctor contacted · reply awaited.', '已联系外部医生 · 等待回复。') })]),
    frame('centre-w-handover', 'handover', 'workplace', ['Centre · end-of-shift handover', '中心 · 班次结束交接'],
      ['Keep unresolved care visible across shifts', '跨班次保留未解决事项'], 'Hui Lin',
      ['Show the confirmed arrangement and the nursing request still awaiting a decision. Who owns the follow-up?', '显示已确认的安排，以及仍等待决定的护理请求。由谁跟进？'],
      ['Priya remains the response owner until an explicit handover is agreed. No completion report is not proof of missed care.', '在明确同意交接前，Priya 仍负责回应。没有完成记录不等于已漏做照护。'], ['Hui Lin', 'Priya', 'Sam'],
      [ev('w-handover', 'handover', { actor: 'Hui Lin' }), ev('w-handover-accept','accept-handover',{actor:'Lin',handover:'w-handover'})]),
    frame('centre-end', 'finish', 'workplace', ['Centre story · review', '中心故事 · 回顾'],
      ['Shared memory with reachable human judgement', '共享记忆与可获得的人类判断'], 'Narrator',
      ['Preparation and practice lead into support for the whole team. The next test is whether it reduces unresolved work and total effort in a real provider’s workflow.', '准备与练习衔接到全团队支持。下一步需验证它能否在真实机构中减少未解决事项及总体工作量。'],
      ['This demo uses staged responses and fictional local browser state. It is not a deployed care service.', '本演示使用预设回应与浏览器本地虚构数据，并非已部署的照护服务。'], ['Hui Lin', 'Sam', 'Priya', 'Lin'])
  ],
  home: [
    ...common('home'),
    frame('home-p-title', 'practice', 'practice', ['Training room · simulated home-visit round', '培训室 · 模拟居家探访路线'],
      ['Practise a distributed team response', '练习分布式团队回应'], 'Narrator',
      ['Hui Lin is the relief worker for Mr Wong. Lin coordinates visits; Priya provides remote nursing input through a defined route.', '惠琳临时代班探访黄先生。Lin 协调探访，Priya 通过明确渠道远程提供护理意见。'],
      ['The simulated access delay affects the visit round, not Mr Wong’s medical instructions.', '模拟的入户延迟影响探访安排，不改变黄先生的医疗指示。'], ['Hui Lin', 'Lin', 'Priya'],
      [ev('hp-plan', 'plan', { task: 'visit', person: 'Mr Wong', actor: 'Hui Lin', label: b('Agreed visit arrival', '约定探访到达安排'), source: b('Fictional practice visit plan', '虚构练习探访计划') })]),
    frame('home-p-request', 'practice', 'practice', ['Rehearsal · outside the home', '练习 · 住宅外'],
      ['Report the delay without repeating the story', '报告延迟，避免反复解释'], 'Hui Lin',
      ['Access is delayed. Please ask Lin to confirm the arrival arrangement and notify Grace through the agreed route.', '暂时无法入户。请 Lin 确认到达安排，并通过约定渠道通知 Grace。'],
      ['The coordinator’s response is pending. Grace has permission for logistics updates only.', '等待协调员回应。Grace 仅获准接收探访安排信息。'], ['Hui Lin', 'Lin', 'Grace'],
      [ev('hp-request', 'request', { task: 'visit', request: 'arrival', actor: 'Hui Lin', approver: 'Lin', reason: b('Access delay affects agreed arrival.', '入户延迟影响约定到达时间。') })], { cue: 'buffer' }),
    frame('home-p-approve', 'practice', 'practice', ['Rehearsal · provider coordination', '练习 · 机构协调'],
      ['The coordinator decides the visit adjustment', '协调员决定探访调整'], 'Lin',
      ['The later arrival is agreed with Mr Wong. Hui Lin keeps this visit. Grace receives the permitted logistics update.', '黄先生同意稍后到达。惠琳继续负责本次探访。Grace 接收获准的安排更新。'],
      ['This is a visit-time adjustment. No doctor’s prescription is altered.', '这是探访时间调整，并未更改医生处方。'], ['Lin', 'Hui Lin', 'Mr Wong'],
      [ev('hp-approve', 'approve', { task: 'visit', request: 'arrival', actor: 'Lin', assignee: 'Hui Lin', decision: b('Later arrival agreed; same worker and service scope.', '同意稍后到达；工作人员及服务范围不变。') }), ev('hp-notify', 'notify', { actor: 'Lin', text: b('Grace receives agreed logistics update only.', 'Grace 仅接收约定的安排更新。') })]),
    frame('home-p-complete', 'practice', 'practice', ['Rehearsal · arrival confirmation', '练习 · 到达确认'],
      ['Acknowledge, then confirm what happened', '先确认接手，再确认实际情况'], 'Hui Lin',
      ['I accepted the arrangement and have now arrived as agreed. The arrival record is correct; confirm it.', '我已接受安排，并按约定到达。到达记录正确，予以确认。'],
      ['Arrival is confirmed. It does not mark all care tasks complete.', '到达已确认，并不代表所有照护任务完成。'], ['Hui Lin', 'Mr Wong'],
      [ev('hp-accept', 'accept', { task: 'visit', actor: 'Hui Lin' }), ev('hp-report', 'report', { task: 'visit', actor: 'Hui Lin', text: b('Arrived at the agreed time.', '已按约定时间到达。'), observedAt: '10:00' }), ev('hp-confirm', 'confirm', { task: 'visit', actor: 'Hui Lin' })]),
    frame('home-p-handover', 'rehearsal', 'practice', ['Training room · rehearsal handover', '培训室 · 练习交接'],
      ['Rehearse continuity across separate visits', '练习不同探访间的衔接'], 'Hui Lin',
      ['The next worker needs the agreed access information, not private family details. Review what belongs in the handover.', '下一位工作人员需要约定的入户信息，而非家属隐私。请核对交接内容。'],
      ['Practice reviewed with the team. Supervised workplace steps remain a human decision.', '已与团队回顾练习。受监督的实际工作安排仍由人决定。'], ['Hui Lin', 'Lin', 'Priya'],
      [ev('hp-handover', 'handover', { actor: 'Hui Lin' }), ev('hp-handover-accept','accept-handover',{actor:'Lin',handover:'hp-handover'})]),
    frame('home-transition', 'transition', null, ['Later · an actual home-visit round', '稍后 · 实际居家探访路线'],
      ['Now see support after deployment', '现在查看上岗后的支持'], 'Narrator',
      ['We leave rehearsal. Hui Lin begins a later working visit with a separate fictional workplace memory.', '离开练习，惠琳开始稍后的工作探访，使用独立的虚构工作记忆。'],
      ['Practice facts never become client records. Select Continue to enter the workplace story.', '练习内容不会进入服务对象档案。选择“继续”进入工作故事。'], ['Hui Lin', 'Mr Wong'], [], { boundary: true }),
    frame('home-w-update', 'workplace', 'workplace', ['Mr Wong’s home · working visit', '黄先生家中 · 工作探访'],
      ['Capture agreed assistance as it happens', '及时记录约定协助'], 'Hui Lin',
      ['The agreed assistance is complete. Mr Wong also asked for more household supplies. Review this short record.', '约定协助已完成。黄先生还提出需要补充生活用品。请核对这条简短记录。'],
      ['Care and household follow-up are separate work items. No clinical advice is generated.', '照护与生活用品跟进属于不同事项。系统不生成临床建议。'], ['Hui Lin', 'Mr Wong'],
      [ev('hw-plan', 'plan', { task: 'assistance', person: 'Mr Wong', actor: 'Hui Lin', label: b('Agreed daily-living assistance', '约定的日常生活协助'), source: b('Fictional authorised workplace service plan', '虚构且已授权的工作服务计划') }), ev('hw-report', 'report', { task: 'assistance', actor: 'Hui Lin', text: b('Agreed assistance completed. Mr Wong requested supplies.', '约定协助已完成。黄先生提出补充用品。'), observedAt: '11:05' })], { cue: 'voice' }),
    frame('home-w-confirm', 'workplace', 'workplace', ['Mr Wong’s home · reviewed update', '黄先生家中 · 核对更新'],
      ['Confirm the record; preserve the open request', '确认记录，保留待处理请求'], 'Hui Lin',
      ['The record is correct. Confirm it and ask Lin to arrange the permitted supply follow-up with Grace.', '记录正确。请确认，并联系 Lin 安排 Grace 获准参与的用品跟进。'],
      ['Completed assistance does not complete the supply follow-up.', '生活协助完成不代表用品跟进完成。'], ['Hui Lin', 'Lin', 'Grace'],
      [ev('hw-confirm', 'confirm', { task: 'assistance', actor: 'Hui Lin' }), ev('hw-supply-plan', 'plan', { task: 'supplies', person: 'Mr Wong', actor: 'Hui Lin', label: b('Household supply follow-up', '生活用品跟进'), source: b('Mr Wong’s agreed request', '黄先生同意的请求') }), ev('hw-supply-request', 'request', { task: 'supplies', request: 'supplies', actor: 'Hui Lin', approver: 'Lin', reason: b('Authorised family supporter may assist.', '获准的家属支持者可协助。') })]),
    frame('home-w-owner', 'workplace', 'workplace', ['Provider / home · asynchronous response', '机构／住宅 · 异步回应'],
      ['Family involvement follows the person’s permission', '家属参与遵循服务对象许可'], 'Lin',
      ['Grace has agreed to handle the supplies. She receives that request only. It remains open until the outcome is confirmed.', 'Grace 同意处理用品。她只接收这项请求。在实际结果确认前，事项保持待完成。'],
      ['Grace accepts the task. The next care worker does not need private family or financial information.', 'Grace 接受任务。下一位工作人员无需获取家属隐私或财务信息。'], ['Lin', 'Grace', 'Hui Lin'],
      [ev('hw-supply-approve', 'approve', { task: 'supplies', request: 'supplies', actor: 'Lin', assignee: 'Grace', decision: b('Permitted household follow-up assigned to Grace.', '获准的生活用品跟进交由 Grace。') }), ev('hw-supply-accept', 'accept', { task: 'supplies', actor: 'Grace' })]),
    frame('home-w-nurse', 'workplace', 'workplace', ['Home / remote nurse · review request', '住宅／远程护士 · 评估请求'],
      ['A nursing question has a human response owner', '护理问题有明确的人类回应负责人'], 'Priya',
      ['I’ve received Hui Lin’s report. I’m contacting the external doctor through our service route; the reply is awaited.', '我已收到惠琳的报告。正通过服务渠道联系外部医生，目前等待回复。'],
      ['No doctor visits this home in the story. A reported change is not a diagnosis or a received prescription.', '故事中没有医生到家探访。报告变化不等于诊断或已收到处方。'], ['Priya', 'Hui Lin', 'Mr Wong'],
      [ev('hw-review-plan', 'plan', { task: 'review', person: 'Mr Wong', actor: 'Priya', clinical: true, label: b('Reported change · nurse review', '已报告变化 · 护士评估'), source: b('Hui Lin’s fictional report · Priya has received it', '惠琳的虚构报告 · Priya 已收到') }), ev('hw-review-request', 'request', { task: 'review', request: 'nurse-review', actor: 'Priya', approver: 'Priya', reason: b('Nursing follow-up remains with Priya.', 'Priya 继续负责护理跟进。') }), ev('hw-contact', 'contact', { task:'review', actor: 'Priya', status:'awaiting-reply', text: b('External doctor contacted · response awaited.', '已联系外部医生 · 等待回应。') })]),
    frame('home-w-handover', 'handover', 'workplace', ['Provider team · end-of-visit handover', '机构团队 · 探访结束交接'],
      ['End the visit without erasing unfinished work', '结束探访，保留未完成事项'], 'Hui Lin',
      ['Assistance is confirmed. Grace owns the supplies. Priya owns the nursing response. Please keep both outstanding items visible.', '生活协助已确认。Grace 负责用品，Priya 负责护理回应。请保留这两项未完成事项。'],
      ['The next visit gets relevant updates. Leaving the home does not close pending work.', '下一次探访可获得相关更新。离开住宅不代表待办事项已完成。'], ['Hui Lin', 'Lin', 'Priya', 'Grace'],
      [ev('hw-handover', 'handover', { actor: 'Hui Lin' }), ev('hw-handover-accept','accept-handover',{actor:'Lin',handover:'hw-handover'})]),
    frame('home-end', 'finish', 'workplace', ['Home-care story · review', '居家照护故事 · 回顾'],
      ['Shared memory across places and shifts', '跨地点、跨班次的共享记忆'], 'Narrator',
      ['The team can pick up relevant context without everyone joining a live call. Human response capacity and approved access still matter.', '团队无需全部加入实时通话，也能获取相关上下文。人类回应能力与授权访问仍十分重要。'],
      ['This is a scripted concept demonstration with fictional local data, not a connected production care system.', '这是使用虚构本地数据的预设概念演示，并非互联的实际照护系统。'], ['Hui Lin', 'Lin', 'Priya', 'Grace'])
  ]
};
// Author-owned narrative refinements: direct chapter entries retain stage boundaries.
for (const frames of Object.values(STORIES)) {
  const ticks={practice:9*60+20,workplace:14*60};
  for (const f of frames) {
    for(const event of f.events){const minute=ticks[f.memory]++;const hour=Math.floor(minute/60);event.at=`${String(hour).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;if(event.type==='report')event.observedAt=event.at;}
    if (['rehearsal','handover'].includes(f.chapter)) f.boundary=true;
    if (f.events.some(e=>['approve','confirm','accept'].includes(e.type))) f.manual=true;
    f.viewpoint=f.speaker==='Grace'?'Grace':'team';
  }
  const workplace=frames.find(f=>f.chapter==='workplace'); workplace.boundary=true; workplace.manual=true;
  const review=frames.find(f=>f.id==='centre-w-record');
  if(review){review.caption=b('The activity arrangement is confirmed. Hui Lin also reports a new concern to Priya through the service route. Priya receives it for nursing review.', '活动安排已确认。惠琳还通过服务渠道向 Priya 报告新的疑问。Priya 收到后负责护理评估。');}
  const centreHand=frames.find(f=>f.id==='centre-w-handover');
  if(centreHand)centreHand.action=b('Lin accepts coordination follow-through. Priya retains clinical responsibility while the doctor reply is awaited.', 'Lin 接手协调跟进。在等待医生回复期间，Priya 保留临床责任。');
  const homeHand=frames.find(f=>f.id==='home-w-handover');
  if(homeHand)homeHand.action=b('Lin accepts coordination follow-through. Grace and Priya keep their named responsibilities. Leaving does not close pending work.', 'Lin 接手协调跟进。Grace 和 Priya 保留各自职责。离开并不关闭待办事项。');
  const transition=frames.find(f=>f.chapter==='transition');
  transition.action=b('Training facts do not become care records. The guided story now moves into the workplace demonstration.', '练习内容不会进入照护档案。引导故事现在进入工作演示。');
}
// Home service has one care partner, without a separate on-site nursing/CPC role.
for(const f of STORIES.home){
  f.speaker=f.speaker==='Priya'?'Lin':f.speaker;
  f.people=[...new Set(f.people.map(p=>p==='Priya'?'Lin':p))];
  for(const prop of ['caption','action','briefing'])if(f[prop]){
    f[prop].en=f[prop].en.replaceAll('Priya','Lin').replaceAll('nursing response','clinical follow-up coordination').replaceAll('nursing input','access to external clinical input').replaceAll('nursing question','clinical follow-up question');
    f[prop].zh=f[prop].zh.replaceAll('Priya','Lin').replaceAll('护理回应','临床跟进协调').replaceAll('护理意见','外部临床意见');
  }
  for(const e of f.events){
    if(e.actor==='Priya')e.actor='Lin';if(e.approver==='Priya')e.approver='Lin';
    if(e.task==='review'){
      e.clinical=false;
      if(e.type==='plan'){e.label=b('External clinical input · follow-up','外部临床意见 · 跟进');e.source=b('Hui Lin’s report · received by care partner Lin','惠琳的报告 · 照护伙伴 Lin 已收到');}
      if(e.type==='request')e.reason=b('Care partner coordinates external clinical input; no clinical decision made.','照护伙伴协调外部临床意见，并未作出临床决定。');
      if(e.type==='contact'){e.externalCoordination=true;e.text=b('External clinician contacted · response awaited.','已联系外部临床专业人员 · 等待回应。');}
    }
  }
}
const homeFrame=id=>STORIES.home.find(f=>f.id===id);
homeFrame('home-p-title').caption=b('Hui Lin is the relief worker for Mr Wong. Lin is the care partner/manager; Alex is the care provider manager. Clinical input comes from an external qualified professional.','惠琳代班探访黄先生。Lin 是照护伙伴／经理；Alex 是照护服务机构经理。临床意见来自外部合格专业人员。');
homeFrame('home-prepare').briefing=b('Mr Wong prefers to hear who is coming before the visit. Hui Lin delivers agreed daily-living assistance. Lin coordinates care and follow-up; Alex handles provider resources. Grace sees agreed logistics only.','黄先生希望提前知道谁来探访。惠琳提供约定的生活协助。Lin 协调照护及跟进，Alex 负责机构资源。Grace 仅查看约定的安排信息。');
homeFrame('home-w-nurse').title=b('External clinical input has a follow-up owner','外部临床意见有明确跟进负责人');
homeFrame('home-w-nurse').caption=b('I received Hui Lin’s report and contacted the external clinician through our service route. I am coordinating the follow-up; I am not making a clinical assessment. The response is awaited.','我已收到惠琳的报告，并通过服务渠道联系外部临床专业人员。我负责协调跟进，不作临床评估。目前等待回应。');
homeFrame('home-w-nurse').action=b('No clinician visits the home in this scene. Lin coordinates access to qualified advice; a contact request is not a received instruction.','本场景没有临床专业人员到家探访。Lin 协调获取合格专业意见；联系请求不等于已收到指示。');
homeFrame('home-w-handover').caption=b('Assistance is confirmed. Grace owns the supplies. Lin owns follow-up with the external clinician. Keep both outstanding items visible.','生活协助已确认。Grace 负责用品，Lin 负责外部临床专业人员的跟进。保留这两项待办事项。');
homeFrame('home-w-handover').action=b('Lin accepts coordination follow-through. Alex can arrange provider resources. Leaving the home does not close pending work.','Lin 接手协调跟进。Alex 可以安排机构资源。离开住宅并不关闭待办事项。');
homeFrame('home-w-owner').people.push('Alex');
homeFrame('home-w-owner').action=b('Grace accepts the permitted supply follow-up. Alex is available for provider-resource questions. No private clinical information is shared with Grace.','Grace 接受获准的用品跟进。Alex 可处理机构资源问题。不会向 Grace 分享临床隐私信息。');
export function roleFor(name,setting){
  if(setting==='home'&&name==='Lin')return b('Care partner / manager','照护伙伴／经理');
  if(setting==='home'&&name==='Alex')return b('Care provider manager','照护服务机构经理');
  return ROLES[name];
}
for(const frames of Object.values(STORIES))for(const f of frames){f.caption.en=NARRATION[f.id];f.narratorEnglish=true;}
export function requiresManualAdvance(frame) { return Boolean(frame.boundary || frame.manual); }
export const ROLES = {
  'Hui Lin': b('Community care assistant', '社区照护助理'), Sam: b('Community care assistant', '社区照护助理'),
  Priya: b('Registered nurse', '注册护士'), Lin: b('Care programme coordinator', '照护活动协调员'),
  Alex: b('Centre / service manager', '中心／服务经理'), Grace: b('Chosen family supporter', '获准的家属支持者'),
  'Mrs Chen': b('Person receiving care', '服务对象'), 'Mr Lee': b('Person receiving care', '服务对象'), 'Mr Wong': b('Person receiving care', '服务对象'), Narrator: b('Narrator', '旁白')
};
export const SOURCES = [
  { title: 'Sharing the Care · Solano-Kamaiko et al., 2026', url: 'https://doi.org/10.1145/3772318.3791116', note: b('17 caregiver interviews using hypothetical videos. Design requirements, not deployed effectiveness.', '17 位照护者观看假设视频后接受访谈。支持设计需求，不证明部署效果。') },
  { title: 'Co-designed care information system · Bail et al., 2023', url: 'https://doi.org/10.1111/jnu.12840', note: b('One Australian home. Role-specific effects differed; total diary documentation did not significantly decline. No established harm-reduction effect.', '澳大利亚一所机构的研究。各角色效果不同，总体记录时间无显著下降，未证明伤害减少。') },
  { title: 'Australian Support at Home · care management', url: 'https://www.health.gov.au/our-work/support-at-home/delivering-services-for-support-at-home/care-management-for-support-at-home', note: b('Provider responsibilities. The local roles depicted here are fictional, not universal scope rules.', '机构职责。本演示角色安排为虚构，并非通用执业范围规定。') },
  { title: 'BONX care-team communication', url: 'https://bonx.co/work/solution/care/', note: b('Existing voice coordination alternative; advertised functions are not independently tested here.', '现有语音协作方案；此处未独立测试其宣传功能。') }
];
