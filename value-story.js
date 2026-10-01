const b=(en,zh)=>({en,zh});
const event=(id,type,data)=>({id,type,...data});
const scene=(id,chapter,memory,title,caption,zh,people,events=[],support=null)=>({
 id,chapter,memory,title:b(title,zh),caption:b(caption,zh),action:b('Shared context, named decisions and recorded follow-through.','共享上下文、明确决策及记录跟进。'),speaker:'Narrator',narratorEnglish:true,
 location:b(memory==='practice'?'Training room · team rehearsal':memory==='workplace'?'Working assignment':'Assignment preparation',memory==='practice'?'培训室 · 团队练习':memory==='workplace'?'工作任务':'任务准备'),people,events,support,
 boundary:['transition','rehearsal','handover'].includes(chapter)
});
const centreSource={id:'centre-plan',version:1,person:'Mrs Chen',author:'Priya',title:b('Priya’s approved shift plan','Priya 批准的班次计划'),text:b('Hui Lin: agreed comfort check. Mrs Chen prefers an unhurried approach. Priya approves any cover or care-order change.','惠琳负责约定的舒适情况问候。陈女士喜欢从容的方式。接替或照护顺序变化由 Priya 批准。')};
const homeSource={id:'home-plan',version:1,person:'Mr Wong',author:'Lin',title:b('Mr Wong’s agreed service arrangement','黄先生约定的服务安排'),text:b('Personal-care assistance and breakfast setup are agreed services. Either order is permitted; Lin confirms the arrangement with Mr Wong. No time-critical clinical requirement applies to this order.','个人照护协助及早餐准备均为约定服务。两种顺序都允许，由 Lin 与黄先生确认。本例顺序不涉及有时限的临床要求。')};
export function valueStories(){
 const centre=[
 scene('centre-overview','overview',null,'When a task needs cover',
 'Hui Lin is a new joiner. She and her peer Sam report to Priya, the registered nurse who sets the shift plan. Today, Hui Lin is helping one resident when another task needs attention. Priya is busy too. The team needs a way to keep the request and its next owner in view.',
 '惠琳是新员工，与同事 Sam 向制定班次计划的注册护士 Priya 汇报。惠琳正在帮助一位服务对象，另一项任务也需处理，Priya 同样在忙。团队需要保留请求并明确谁来接手。',['Hui Lin','Sam','Priya']),
 scene('centre-prepare','prepare',null,'Prepare for this team',
 'Before her first shift, Hui Lin asks who can change an assigned task. Amiya brings up the centre’s approved guide: report the task and the obstacle to Priya. Lin supplies programme options; Alex handles resources. Medication and care decisions stay with Priya.',
 '第一个班次前，惠琳询问谁能调整任务。Amiya 调出批准的指南：向 Priya 报告任务及障碍。Lin 提供活动选项，Alex 管理资源。药物及照护决定由 Priya 负责。',['Hui Lin','Priya','Lin'],[],{kind:'knowledge',question:b('Who can change my assigned task?','谁能调整我的任务？'),answer:b('Priya approves care and shift changes. Include the resident, task and why you need help.','Priya 批准照护及班次变化。报告服务对象、任务及求助原因。'),source:centreSource}),
 scene('centre-practice-title','practice','practice','A first attempt, then useful feedback',
 'In rehearsal, Hui Lin says: can someone help me? The feedback is specific: name the resident, the task and what is keeping you occupied. Priya needs that context to decide. Hui Lin tries again using the same support she will use during work.',
 '练习中，惠琳说：“有人能帮我吗？”反馈明确指出：说出服务对象、任务及正在忙什么，方便 Priya 决定。惠琳用工作中同样的支持方式重试。',['Hui Lin','Priya'],[
 event('p-source','source',{actor:'Priya',source:centreSource}),event('p-plan','plan',{task:'comfort',person:'Mrs Chen',actor:'Hui Lin',label:b('Agreed comfort check','约定舒适情况问候'),source:centreSource.title,sourceId:'centre-plan'})
 ],{kind:'feedback',question:b('Can someone help me?','有人能帮我吗？'),answer:b('Add the resident, task and obstacle. Then send your request to Priya.','补充服务对象、任务与障碍，再向 Priya 发送请求。')}),
 scene('centre-p-request','practice','practice','The retry retains the context',
 'Hui Lin reports that she is still helping Mr Lee and needs cover for Mrs Chen’s check. Priya is occupied. The request stays linked to the task, with Priya named as the decision owner. Hui Lin can see that a response is still pending.',
 '惠琳报告仍在帮助李先生，需要有人接替陈女士的问候。Priya 在忙。请求关联任务并明确 Priya 为决策负责人，惠琳可查看尚待回应。',['Hui Lin','Mr Lee','Priya'],[
 event('p-request','request',{task:'comfort',request:'cover',actor:'Hui Lin',approver:'Priya',reason:b('Assisting Mr Lee; cover needed for Mrs Chen’s check.','正在协助李先生；陈女士的问候需要接替。')})],{kind:'request',question:b('I’m helping Mr Lee. Please ask Priya to arrange cover for Mrs Chen’s check.','我在协助李先生，请 Priya 安排陈女士问候的接替。'),answer:b('Request saved with task and source. Priya’s decision is pending.','请求与任务及来源一并保存，等待 Priya 决定。')}),
 scene('centre-p-approve','practice','practice','Priya assigns one task',
 'Priya checks Sam’s availability and assigns him the comfort check. Hui Lin stays with Mr Lee. The change is one task, with a named colleague taking it. The team can now practise reporting the outcome and handing over what remains.',
 'Priya 核实 Sam 的时间并将问候任务交给他，惠琳继续帮助李先生。这只调整一项任务。团队接着练习报告结果与交接待办。',['Priya','Sam','Hui Lin'],[
 event('p-approve','approve',{task:'comfort',request:'cover',actor:'Priya',assignee:'Sam',decision:b('Sam covers this check; other allocations unchanged.','Sam 接替此项问候，其他分配不变。')}),event('p-accept','accept',{task:'comfort',actor:'Sam'})]),
 scene('centre-p-accept','rehearsal','practice','Rehearsal handover',
 'Hui Lin reports the request and Sam’s acceptance to Priya. The rehearsal handover shows that the check is accepted and still needs completion. The team reviews her improved request, ready to use the same pattern during work.',
 '惠琳向 Priya 汇报请求与 Sam 已接手。练习交接显示任务已接受但仍待完成。团队回顾改进后的请求，准备在工作中使用同样方式。',['Hui Lin','Priya','Sam'],[event('p-handover','handover',{actor:'Hui Lin'})]),
 scene('centre-transition','transition',null,'Later · Hui Lin’s working shift',
 'Practice ends. Hui Lin starts her working shift with Priya’s plan and the team’s workplace memory. The people, tasks and reporting route are familiar. Now we follow a real-work situation in this demonstration from the first reminder to the handover.',
 '练习结束，惠琳开始工作班次，使用 Priya 的计划及团队工作记忆。人物、任务与汇报渠道都很熟悉。接下来演示从提醒到交接的工作过程。',['Hui Lin','Sam','Priya']),
 scene('centre-w-request','workplace','workplace','One worker, two demands',
 'Hui Lin is assisting Mr Lee when her reminder for Mrs Chen’s check appears. She reports the conflict once and asks Priya for cover. The request carries the task, current owner and her explanation. It stays visible while she continues the assistance already assigned.',
 '惠琳协助李先生时，陈女士问候的提醒出现。她一次报告冲突并向 Priya 求助。请求保留任务、当前负责人及原因，在她继续原定协助时保持可见。',['Hui Lin','Mr Lee','Priya'],[
 event('w-source','source',{actor:'Priya',source:centreSource}),event('w-plan','plan',{task:'comfort',person:'Mrs Chen',actor:'Hui Lin',label:b('Agreed comfort check','约定舒适情况问候'),source:centreSource.title,sourceId:'centre-plan'}),event('w-remind','remind',{task:'comfort',actor:'Hui Lin'}),event('w-request','request',{task:'comfort',request:'cover',actor:'Hui Lin',approver:'Priya',reason:b('Hui Lin remains with Mr Lee; cover needed.','惠琳仍在协助李先生，需要接替。')})
 ],{kind:'request',question:b('I’m still helping Mr Lee. Please arrange cover for Mrs Chen’s check.','我还在帮助李先生，请安排陈女士问候的接替。'),answer:b('Priya owns the decision. Task, source and explanation are held together.','Priya 负责决定，任务、来源与说明共同保存。')}),
 scene('centre-w-decide','workplace','workplace','Priya picks up the context',
 'Priya returns from another task and asks what needs her decision. Amiya shows Hui Lin’s request with the approved plan. Sam has confirmed that he is available. Priya can decide from this context, without asking Hui Lin to explain it again.',
 'Priya 完成另一项工作后询问有哪些事项需要决定。Amiya 展示惠琳的请求及批准计划。Sam 已确认有时间，Priya 可直接依据上下文决定，无需惠琳再次解释。',['Priya','Sam','Hui Lin'],[
 event('w-available','notify',{actor:'Sam',text:b('Sam confirms capacity for the check.','Sam 确认有时间完成问候。')})
 ],{kind:'recall',question:b('What needs my decision?','什么需要我决定？'),task:'comfort',person:'Mrs Chen'}),
 scene('centre-p-draft','workplace','workplace','Decision, acceptance, updated responsibility',
 'Priya assigns the check to Sam, and Sam accepts. Hui Lin sees that her request has been answered. The task prompt now follows Sam, and Hui Lin’s earlier prompt is retired. Both assistants know what to do next.',
 'Priya 将问候交给 Sam，Sam 接受。惠琳看到请求已回应。任务提醒转给 Sam，惠琳原提醒停止，两位助理都明确下一步。',['Priya','Sam','Hui Lin'],[
 event('w-approve','approve',{task:'comfort',request:'cover',actor:'Priya',assignee:'Sam',decision:b('Sam covers the check; Hui Lin continues with Mr Lee.','Sam 接替问候；惠琳继续协助李先生。')}),event('w-accept','accept',{task:'comfort',actor:'Sam'}),event('w-remind-sam','remind',{task:'comfort',actor:'Sam'})
 ],{kind:'reminder',task:'comfort'}),
 scene('centre-p-confirm','workplace','workplace','Relevant instructions at the moment of care',
 'Before approaching Mrs Chen, Sam asks what he should know. Amiya retrieves Priya’s approved task and Mrs Chen’s preference for an unhurried check-in. Sam gets the context for this person, rather than searching a long message thread.',
 'Sam 接近陈女士前询问需要了解什么。Amiya 调出 Priya 批准的任务及陈女士喜欢从容问候的偏好。Sam 获取个人相关信息，无需查找长消息串。',['Sam','Mrs Chen'],[],{kind:'recall',question:b('What should I know before the check?','问候前我需要了解什么？'),task:'comfort',person:'Mrs Chen'}),
 scene('centre-w-record','workplace','workplace','One voice update, reviewed once',
 'Sam completes the check. Mrs Chen asks for a quieter seat. He records both in one short voice update, checks the draft and confirms it. The check is completed, and her seating request becomes a separate item for Priya, linked to the same observation.',
 'Sam 完成问候，陈女士提出安静座位需求。他用一条语音记录两件事，核对并确认。问候完成，座位请求作为另一事项交给 Priya，并关联同一观察。',['Sam','Mrs Chen','Priya'],[
 event('w-report','report',{task:'comfort',actor:'Sam',text:b('Check completed. Mrs Chen requested a quieter seat.','问候完成。陈女士希望安静座位。')}),event('w-confirm','confirm',{task:'comfort',actor:'Sam'}),event('w-seat-plan','plan',{task:'seat',person:'Mrs Chen',actor:'Sam',label:b('Quieter-seat arrangement','安排安静座位'),source:b('Confirmed observation w-report','已确认观察 w-report'),linkedNote:'w-report'}),event('w-seat-request','request',{task:'seat',request:'seating',actor:'Sam',approver:'Priya',reason:b('Resident’s preference needs shift-plan arrangement.','服务对象偏好需要调整班次安排。')})
 ],{kind:'capture',utterance:b('Mrs Chen’s check is complete. She asked for a quieter seat.','陈女士问候完成，她希望安静座位。'),note:'w-report'}),
 scene('centre-w-doctor','workplace','workplace','Programme input supports Priya’s decision',
 'Lin supplies a quieter seating option, and Alex confirms the resource. Priya reviews the care impact and assigns the arrangement to Sam. Lin keeps the programme informed. Priya makes the care decision; Sam’s new task remains open until its outcome is confirmed.',
 'Lin 提供安静座位选项，Alex 确认资源。Priya 评估照护影响并将安排交给 Sam。Lin 通知活动项目。照护决定由 Priya 作出，新任务在结果确认前保持未完成。',['Lin','Alex','Priya','Sam'],[
 event('w-option','notify',{actor:'Lin',text:b('Programme seating option available.','活动安静座位选项可用。')}),event('w-resource','notify',{actor:'Alex',text:b('Seating resource confirmed.','座位资源已确认。')}),event('w-seat-approve','approve',{task:'seat',request:'seating',actor:'Priya',assignee:'Sam',decision:b('Priya approves the seating arrangement.','Priya 批准座位安排。')}),event('w-seat-accept','accept',{task:'seat',actor:'Sam'})]),
 scene('centre-w-handover','handover','workplace','The same record carries into handover',
 'At handover, Hui Lin asks what changed and what still needs doing. Amiya reuses Sam’s confirmed observation, Priya’s decision and the outstanding seating task. Priya receives the handover. The team sees the actual work state without writing the account again.',
 '交接时惠琳询问变化及待办。Amiya 复用 Sam 已确认观察、Priya 的决定及待完成座位任务。Priya 接收交接，团队无需重写即可查看实际工作状态。',['Hui Lin','Priya','Sam'],[
 event('w-handover','handover',{actor:'Hui Lin'}),event('w-handover-accept','accept-handover',{actor:'Priya',handover:'w-handover'})
 ],{kind:'reuse',note:'w-report',task:'seat'}),
 scene('centre-end','finish','workplace','What changed for the team',
 'Hui Lin stayed with Mr Lee. Priya received the request with its context. Sam took responsibility and completed the check. His reviewed update supplied the record and handover, while Mrs Chen’s next request stayed with a named owner.',
 '惠琳继续陪同李先生，Priya 获取带上下文的请求，Sam 接手并完成问候。他核对的更新用于记录及交接，陈女士下一请求仍有明确负责人。',['Hui Lin','Sam','Priya'])
 ];
 const home=[
 scene('home-overview','overview',null,'A change must reach the next visit',
 'Hui Lin is a new joiner in home care. During a visit, Mr Wong asks for a different routine. Lin, her care partner, needs to confirm the arrangement. Another worker will come next time. The change must reach that worker after Hui Lin finishes her shift.',
 '惠琳是居家照护新员工。探访中黄先生提出不同顺序，需要照护伙伴 Lin 确认。下次由另一位员工探访，变化必须在惠琳下班后仍能传递。',['Hui Lin','Lin','Sam']),
 scene('home-prepare','prepare',null,'Prepare for Mr Wong’s home',
 'Hui Lin learns Mr Wong’s preferences, the agreed services and the help route. She asks what happens if he wants a different order. Amiya shows the approved options and identifies Lin as the person who confirms the arrangement. Alex manages provider resources.',
 '惠琳了解黄先生的偏好、约定服务与求助渠道。她询问顺序变化如何处理。Amiya 展示批准选项并明确 Lin 负责确认，Alex 管理机构资源。',['Hui Lin','Mr Wong','Lin','Alex'],[],{kind:'knowledge',question:b('What if Mr Wong wants a different order?','黄先生想换顺序怎么办？'),answer:b('This plan permits either order. Lin confirms the agreed arrangement with Mr Wong.','本计划允许两种顺序，由 Lin 与黄先生确认。'),source:homeSource}),
 scene('home-p-title','practice','practice','Practise a useful request',
 'In rehearsal, Hui Lin reports a preferred change but leaves out the service plan. The feedback asks her to link the approved tasks and say what Mr Wong wants. She tries again, giving Lin the information needed for a remote decision.',
 '练习中惠琳报告偏好变化却未关联服务计划。反馈请她关联批准任务并说明黄先生的选择。她重试，让 Lin 取得远程决定所需信息。',['Hui Lin','Lin'],[
 event('hp-source','source',{actor:'Lin',source:homeSource}),event('hp-plan','plan',{task:'routine',person:'Mr Wong',actor:'Hui Lin',label:b('Agreed visit routine','约定探访顺序'),source:homeSource.title,sourceId:'home-plan'})
 ],{kind:'feedback',question:b('Mr Wong wants a different routine.','黄先生想换顺序。'),answer:b('Link the approved services and specify the requested order.','关联批准服务并说明要求的顺序。')}),
 scene('home-p-request','practice','practice','The retry carries the right context',
 'Hui Lin asks Lin to confirm breakfast setup before personal-care assistance, within the agreed services. The request is held with the approved plan and Mr Wong’s preference. Lin can pick up the context when she responds.',
 '惠琳请 Lin 在约定服务内确认先准备早餐再提供个人照护协助。请求与批准计划及黄先生偏好共同保存，Lin 回应时可直接查看。',['Hui Lin','Lin','Mr Wong'],[
 event('hp-request','request',{task:'routine',request:'order',actor:'Hui Lin',approver:'Lin',reason:b('Mr Wong requests breakfast setup first.','黄先生希望先准备早餐。')})]),
 scene('home-p-approve','rehearsal','practice','Rehearse the decision and handover',
 'Lin checks the permitted options and confirms the practice arrangement with Mr Wong. Hui Lin accepts it and rehearses handing the change to the next worker. The decision stays linked to its source and the task.',
 'Lin 核对允许选项并与黄先生确认练习安排。惠琳接受并练习向下一位员工交接。决定关联来源及任务。',['Hui Lin','Lin'],[
 event('hp-approve','approve',{task:'routine',request:'order',actor:'Lin',assignee:'Hui Lin',decision:b('Breakfast setup first within approved service options.','在批准服务选项内先准备早餐。')}),event('hp-accept','accept',{task:'routine',actor:'Hui Lin'}),event('hp-handover','handover',{actor:'Hui Lin'}),event('hp-hand-accept','accept-handover',{actor:'Lin',handover:'hp-handover'})
 ],{kind:'recall',question:b('What was agreed for the next worker?','下一位员工需要了解什么安排？'),task:'routine',person:'Mr Wong'}),
 scene('home-transition','transition',null,'Later · Hui Lin’s working visit',
 'Now Hui Lin arrives at Mr Wong’s home for her working visit. Her preparation and practice connect to the team’s workplace support. The memory starts with the current agreed services and the people responsible for this visit.',
 '现在惠琳开始黄先生家的工作探访。准备和练习衔接到团队工作支持。工作记忆从当前约定服务及本次负责人开始。',['Hui Lin','Mr Wong']),
 scene('home-w-update','workplace','workplace','Mr Wong asks for a different order',
 'Mr Wong would like breakfast setup before personal-care assistance. Hui Lin records his request and asks Lin to confirm it within the agreed visit. Amiya connects the request to the approved options and the current task owner.',
 '黄先生希望先准备早餐再提供个人照护。惠琳记录请求并请 Lin 在约定探访内确认。Amiya 关联批准选项及当前负责人。',['Hui Lin','Mr Wong','Lin'],[
 event('hw-source','source',{actor:'Lin',source:homeSource}),event('hw-plan','plan',{task:'routine',person:'Mr Wong',actor:'Hui Lin',label:b('Agreed daily-living assistance','约定生活协助'),source:homeSource.title,sourceId:'home-plan'}),event('hw-request','request',{task:'routine',request:'order',actor:'Hui Lin',approver:'Lin',reason:b('Mr Wong prefers breakfast setup first.','黄先生希望先准备早餐。')})
 ],{kind:'request',question:b('Please confirm breakfast setup first within this visit.','请确认本次先准备早餐。'),answer:b('Lin owns the response. Approved plan and requested variation are attached.','Lin 负责回应，批准计划及变化请求已关联。')}),
 scene('home-w-confirm','workplace','workplace','The request waits with its owner',
 'Lin is coordinating another visit. Hui Lin sees that the response is pending and continues only assistance already agreed. The request stays visible without another call or message. The team’s direct-help route remains available when something cannot wait.',
 'Lin 正协调另一探访。惠琳看到回应待定，继续已获同意的协助。请求无需再次电话或消息也保持可见，不能等待的事项仍可直接求助。',['Hui Lin','Lin'],[],{kind:'recall',question:b('Has Lin decided on the requested order?','Lin 决定顺序了吗？'),task:'routine',person:'Mr Wong'}),
 scene('home-w-owner','workplace','workplace','An agreed change becomes the current arrangement',
 'Lin checks that the service allows either order and agrees breakfast setup first with Mr Wong. The dated decision reaches Hui Lin. Amiya keeps the earlier plan as its source and marks the confirmed arrangement as current for later visits.',
 'Lin 核实服务允许两种顺序并与黄先生同意早餐优先。有日期的决定传给惠琳。Amiya 保留早期计划作为来源，并将确认安排标为后续探访的当前版本。',['Lin','Hui Lin','Mr Wong'],[
 event('hw-approve','approve',{task:'routine',request:'order',actor:'Lin',assignee:'Hui Lin',decision:b('Breakfast setup before personal care, as agreed with Mr Wong.','与黄先生约定，先准备早餐再个人照护。')}),event('hw-source-update','source',{actor:'Lin',decisionRequest:'order',source:{...homeSource,version:2,text:b('Breakfast setup before personal care, as agreed with Mr Wong.','与黄先生约定，先准备早餐再个人照护。')}}),event('hw-accept','accept',{task:'routine',actor:'Hui Lin'})
 ],{kind:'recall',question:b('What is the current approved arrangement?','当前批准安排是什么？'),task:'routine',person:'Mr Wong'}),
 scene('home-w-nurse','workplace','workplace','Capture once for this visit and the next',
 'Hui Lin performs the agreed assistance, then records the outcome and Mr Wong’s preference in one short update. She checks the draft and confirms it. That reviewed observation supplies the visit record and the next worker’s briefing.',
 '惠琳完成约定协助，以一条简短更新记录结果及黄先生偏好。她核对并确认，已核对观察同时用于探访记录及下一位员工简报。',['Hui Lin','Mr Wong'],[
 event('hw-report','report',{task:'routine',actor:'Hui Lin',text:b('Agreed assistance completed. Mr Wong preferred breakfast setup first.','约定协助完成。黄先生喜欢先准备早餐。')}),event('hw-confirm','confirm',{task:'routine',actor:'Hui Lin'}),event('hw-handover','handover',{actor:'Hui Lin'}),event('hw-hand-accept','accept-handover',{actor:'Lin',handover:'hw-handover'})
 ],{kind:'capture',utterance:b('Assistance complete. Mr Wong preferred breakfast first.','协助完成，黄先生偏好早餐优先。'),note:'hw-report'}),
 scene('home-w-handover','handover','workplace','Next scheduled visit · Sam provides cover',
 'At the next visit, Sam is providing cover and Hui Lin is off duty. Sam asks what changed since the previous visit. Amiya retrieves Lin’s current arrangement, the decision date and Hui Lin’s confirmed observation. Sam can pick up the context without calling her.',
 '下一次探访由 Sam 代班，惠琳已下班。Sam 询问上次以来的变化。Amiya 调出 Lin 当前安排、决定日期及惠琳已确认观察。Sam 无需致电惠琳即可获取上下文。',['Sam','Mr Wong','Lin'],[
 event('hw-next-plan','plan',{task:'next-visit',person:'Mr Wong',actor:'Sam',label:b('Next visit · agreed assistance','下次探访 · 约定协助'),source:b('Current arrangement home-plan v2','当前安排 home-plan 第 2 版'),sourceId:'home-plan',linkedNote:'hw-report'})
 ],{kind:'recall',question:b('What changed since the previous visit?','上次探访以来发生什么变化？'),task:'next-visit',person:'Mr Wong'}),
 scene('home-p-complete','handover','workplace','The next worker receives the arrangement',
 'Sam confirms that he has read the current arrangement before beginning the agreed visit. Receipt is visible; the new care tasks are still to be done. The change has reached the person who now needs to act on it.',
 'Sam 在开始约定探访前确认已阅读当前安排。已收到信息的状态可见，新的照护任务仍待完成。变化已传给当前需要行动的人。',['Sam','Mr Wong'],[
 event('hw-receipt','receipt',{task:'next-visit',actor:'Sam',sourceId:'home-plan',version:2})
 ],{kind:'reuse',note:'hw-report',task:'next-visit'}),
 scene('home-end','finish','workplace','The update stays useful after the shift',
 'Mr Wong’s choice reached Lin, the visit record and the next worker. Hui Lin captured it once, and Sam received the current arrangement with its source. Shared memory carries the work across separate visits and people.',
 '黄先生的选择传给 Lin、探访记录及下一位员工。惠琳记录一次，Sam 获取带来源的当前安排。共享记忆跨探访及人员保留工作。',['Hui Lin','Sam','Lin'])
 ];
 const zhTitles={
 'centre-overview':'任务需要接替时','centre-prepare':'为加入团队做好准备','centre-practice-title':'首次尝试与明确反馈','centre-p-request':'重试保留完整上下文','centre-p-approve':'Priya 分配一项任务','centre-p-accept':'练习交接','centre-transition':'稍后：惠琳的工作班次','centre-w-request':'一位员工，两项需求','centre-w-decide':'Priya 获取决策上下文','centre-p-draft':'决定、接手与责任更新','centre-p-confirm':'照护时获取相关指示','centre-w-record':'一条语音，核对一次','centre-w-doctor':'活动信息支持照护决定','centre-w-handover':'同一记录用于交接','centre-end':'团队工作有何改变',
 'home-overview':'变化需要传到下次探访','home-prepare':'为黄先生家的任务做准备','home-p-title':'练习有效请求','home-p-request':'重试携带相关上下文','home-p-approve':'练习决定与交接','home-transition':'稍后：惠琳的工作探访','home-w-update':'黄先生希望改变顺序','home-w-confirm':'请求保留明确负责人','home-w-owner':'同意的变化成为当前安排','home-w-nurse':'记录一次，持续复用','home-w-handover':'下次探访：Sam 代班','home-p-complete':'下一位员工收到安排','home-end':'更新在下班后仍有用'};
 for(const [setting,frames]of Object.entries({centre,home})){
  const ticks={practice:9*60+20,workplace:14*60};
  for(const f of frames){
   f.title.zh=zhTitles[f.id];
   if(f.memory==='workplace')f.location=b(setting==='centre'?'Care centre · working shift':'Mr Wong’s home · working visit',setting==='centre'?'照护中心 · 工作班次':'黄先生家中 · 工作探访');
   if(setting==='home'&&['home-w-handover','home-p-complete'].includes(f.id))f.location=b('Next scheduled visit · the following day','下次约定探访 · 翌日');
   for(const e of f.events){const t=ticks[f.memory]++;e.at=`${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`;e.date=setting==='home'&&e.id.startsWith('hw-next')||e.id==='hw-receipt'?'Demo day 2':'Demo day 1';if(e.type==='report')e.observedAt=e.at;}
  }
 }
 return{centre,home};
}
