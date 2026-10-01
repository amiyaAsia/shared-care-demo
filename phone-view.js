/** Presentation-only projection of the same replayed memory used by the story. */
export function phoneView(frame, memory, setting) {
  const support=frame.support;
  if(!support)return null;
  const worker=setting==='home'?'Sara':'Hui Lin';
  const task=memory?.tasks[support.task];
  const note=memory?.notes.find(n=>n.id===support.note);
  const request=Object.values(memory?.requests||{}).find(r=>r.task===support.task)
    ||(support.kind==='request'?Object.values(memory?.requests||{}).at(-1):null);
  const source=task?.sourceId?memory.sources[task.sourceId]?.at(-1):support.source;
  const title={knowledge:['Approved guidance','批准指南'],feedback:['Practice feedback','练习反馈'],request:['Team request','团队请求'],recall:['Shared memory','共享记忆'],reminder:['Task reminder','任务提醒'],capture:['Voice note','语音笔记'],reuse:['Reviewed record','已核对记录']}[support.kind]||['Shared memory','共享记忆'];
  const view={title,owner:worker,mode:frame.memory||'prepare',phase:'context',text:support.answer||support.question,source:source?`${source.id} · v${source.version}`:null};
  if(support.kind==='request'&&request){view.owner=request.sender;view.phase=request.status==='pending'?'pending':'decided';view.text=request.reason;view.target=request.approver;}
  if(support.kind==='feedback'){view.phase='practice';view.text=support.answer;}
  if(support.kind==='reminder'&&task){view.owner=task.owner;view.phase=memory.reminders[task.id]?'reminder':'no-reminder';view.text=task.label;}
  if(support.kind==='capture'||support.kind==='reuse'){
    if(note){view.owner=note.author;view.phase=note.status==='confirmed'?'confirmed':'draft';view.text=note.text;view.recordId=note.id;if(note.status==='confirmed')view.reviewedBy=note.reviewedBy;}
    else {view.phase='unavailable';view.text=null;}
  }
  if(support.kind==='recall'){
    view.owner=request?.status==='pending'?request.approver:task?.owner||worker;
    view.phase=request?.status==='pending'?'pending':'context';
    view.target=request?.approver;
    view.text=source?.text||task?.label||support.answer;
    const relevant=memory?.notes.find(n=>n.id===task?.linkedNote&&n.status==='confirmed');
    if(relevant)view.recordId=relevant.id;
  }
  return view;
}
