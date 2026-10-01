/** Fictional demo state. Clinical decisions and cross-user service are staged. */
export const STORAGE_KEY = 'amiya.shared-care.demo.v1';
export const SETTINGS = ['centre', 'home'];
export const STAGES = ['practice', 'workplace'];
const actorRoles = { 'Hui Lin': 'assistant', Sam: 'assistant', Priya: 'nurse', Lin: 'coordinator', Alex: 'manager', Grace: 'supporter',Sara:'assistant',Wei:'assistant',Amanda:'nurse' };
export function newMemory(setting, stage) {
  return { setting, stage, tasks: {}, requests: {}, contacts: {}, notes: [], events: [], revisions: [], handovers: [], sources:{},reminders:{},receipts:[] };
}
export function emptySession() {
  return { version: 1, setting: 'centre', language: 'en', positions: { centre: 0, home: 0 } };
}
/** Return a new state or reject an invalid transition; caller never mutates it. */
export function applyEvent(memory, event) {
  if (!event || typeof event.id !== 'string') throw new Error('Event ID required');
  if (memory.events.some(e => e.id === event.id)) return memory;
  const next = structuredClone(memory);
  const task = next.tasks[event.task];
  switch (event.type) {
    case 'source': {
      const s=event.source, previous=next.sources[s?.id]?.at(-1);
      if(!s||!s.id||!s.person||s.author!==event.actor||!['nurse','coordinator'].includes(actorRoles[event.actor]))throw Error('Authorised source required');
      if(next.setting==='centre'&&actorRoles[event.actor]!=='nurse')throw Error('Centre instructions require nurse');
      if(previous){const request=next.requests[event.decisionRequest],requestTask=next.tasks[request?.task];if(s.version!==previous.version+1||!request||request.status!=='approved'||request.applied||request.approver!==event.actor||requestTask?.person!==s.person||requestTask.sourceId!==s.id||JSON.stringify(s.text)!==JSON.stringify(request.decision))throw Error('Approved source revision required');request.applied=true;}
      else if(s.version!==1)throw Error('Initial source version required');
      (next.sources[s.id]??=[]).push({...structuredClone(s),at:event.at,date:event.date});break;
    }
    case 'plan':
      if (task) throw new Error('Task already planned');
      if (!actorRoles[event.actor] || (event.clinical && actorRoles[event.actor] !== 'nurse')) throw new Error('Appropriate initial owner required');
      if(event.sourceId&&next.sources[event.sourceId]?.at(-1)?.person!==event.person)throw Error('Matching approved source required');
      if(event.linkedNote&&!next.notes.some(n=>n.id===event.linkedNote&&n.status==='confirmed'&&n.person===event.person))throw Error('Matching confirmed note required');
      next.tasks[event.task] = { id: event.task, person: event.person, label: event.label, owner: event.actor,
        status: 'planned', source: event.source,sourceId:event.sourceId,linkedNote:event.linkedNote, clinical: Boolean(event.clinical), note: null };
      break;
    case 'request':
      if (!task || !['planned','accepted','assigned'].includes(task.status)) throw new Error('Open task required');
      if (task.owner !== event.actor || !event.request || next.requests[event.request]) throw new Error('Unique responsible request required');
      if (!['nurse','coordinator','manager'].includes(actorRoles[event.approver]) || (task.clinical && actorRoles[event.approver] !== 'nurse')) throw new Error('Appropriate decision owner required');
      if(next.setting==='centre'&&!task.clinical&&(actorRoles[event.approver]!=='nurse'||event.approver===event.actor))throw Error('Centre care change requires separate RN');
      if (Object.values(next.requests).some(r => r.task === event.task && r.status === 'pending')) throw new Error('Request already pending');
      next.requests[event.request] = { task: event.task, sender: event.actor, approver: event.approver, status: 'pending', reason: event.reason };
      task.status = 'awaiting-decision';
      break;
    case 'approve': {
      const request = next.requests[event.request];
      if (!task || !request || request.task !== event.task || request.status !== 'pending' || request.approver !== event.actor) throw new Error('Authorised pending decision required');
      if (!['nurse', 'coordinator', 'manager'].includes(actorRoles[event.actor])) throw new Error('Approver role required');
      if (task.clinical && actorRoles[event.actor] !== 'nurse') throw new Error('Clinical decision requires nurse');
      if (!actorRoles[event.assignee] || (task.clinical && actorRoles[event.assignee] !== 'nurse')) throw new Error('Appropriate assignee required');
      if(next.setting==='centre'&&!['assistant','nurse'].includes(actorRoles[event.assignee]))throw Error('Centre care assignee required');
      request.status = 'approved';
      request.decision = event.decision;
      task.owner = event.assignee;
      task.status = 'assigned';
      delete next.reminders[event.task];
      break;
    }
    case 'decline': {
      const request = next.requests[event.request];
      if (!task || !request || request.task !== event.task || request.status !== 'pending' || request.approver !== event.actor) throw new Error('Authorised pending decision required');
      request.status = 'declined'; request.decision = event.decision; task.status = 'blocked';
      break;
    }
    case 'accept':
      if (!task || task.owner !== event.actor || task.status !== 'assigned') throw new Error('Assigned owner required');
      task.status = 'accepted';
      break;
    case 'report':
      if (!task || task.owner !== event.actor || !['accepted', 'planned'].includes(task.status)) throw new Error('Responsible worker required');
      next.notes.push({ id: event.id, task: event.task, person: task.person, author: event.actor, text: event.text, observedAt: event.observedAt, status: 'draft' });
      task.note = event.id;
      task.status = 'confirmation-needed';
      break;
    case 'confirm': {
      const note = next.notes.find(n => n.id === task?.note);
      if (!task || !note || task.owner !== event.actor || task.status !== 'confirmation-needed') throw new Error('Draft confirmation required');
      note.status = 'confirmed';
      task.status = 'completed';
      delete next.reminders[event.task];
      break;
    }
    case 'correct': {
      const note = next.notes.find(n => n.id === event.note);
      if (!note || note.author !== event.actor) throw new Error('Original author correction required');
      next.revisions.push({ note: note.id, previous: note.text, replacement: event.text, author: event.actor, at: event.at });
      note.text = event.text;
      note.status = 'draft';
      next.tasks[note.task].status = 'confirmation-needed';
      break;
    }
    case 'contact':
      if(event.externalCoordination){
        if(next.setting!=='home'||task?.clinical||actorRoles[event.actor]!=='coordinator'||task.owner!==event.actor)throw new Error('Care-partner coordination required');
      }else if (!task?.clinical || actorRoles[event.actor] !== 'nurse' || task.owner !== event.actor) throw new Error('Nurse-owned clinical contact required');
      if (!['awaiting-reply','reply-received'].includes(event.status)) throw new Error('Explicit contact state required');
      if (event.status === 'reply-received' && !next.contacts[event.task]) throw new Error('Existing contact required');
      next.contacts[event.task] = { actor:event.actor, status:event.status, text:event.text, at:event.at };
      break;
    case 'handover':
      if (!actorRoles[event.actor]) throw new Error('Handover author required');
      next.handovers.push({ id:event.id, author:event.actor, outstanding:Object.values(next.tasks).filter(t=>t.status!=='completed').map(t=>t.id), acceptedBy:null });
      break;
    case 'accept-handover': {
      const handover=next.handovers.find(h=>h.id===event.handover);
      if (!handover || handover.acceptedBy || !['coordinator','nurse'].includes(actorRoles[event.actor])) throw new Error('Pending coordination handover required');
      handover.acceptedBy=event.actor;
      break;
    }
    case 'notify':
      break;
    case 'remind':
      if(!task||task.owner!==event.actor||!['planned','accepted'].includes(task.status))throw Error('Current task owner reminder required');
      next.reminders[event.task]={owner:event.actor,at:event.at};break;
    case 'receipt': {
      const source=next.sources[event.sourceId]?.at(-1);
      if(!task||task.owner!==event.actor||!source||source.version!==event.version||source.person!==task.person)throw Error('Current source receipt required');
      next.receipts.push({actor:event.actor,task:event.task,sourceId:source.id,version:source.version});break;
    }
    default: throw new Error('Unknown event');
  }
  next.events.push(structuredClone(event));
  return next;
}
export function saveSession(storage, session) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(session)); return true; } catch { return false; }
}
export function loadSession(storage, lengths) {
  try {
    const data = JSON.parse(storage.getItem(STORAGE_KEY));
    if (!data || data.version !== 1 || !SETTINGS.includes(data.setting) || !['en', 'zh'].includes(data.language)) return emptySession();
    for (const setting of SETTINGS) {
      if (!Number.isInteger(data.positions?.[setting]) || data.positions[setting] < 0 || data.positions[setting] >= lengths[setting]) return emptySession();
    }
    return { version: 1, setting: data.setting, language: data.language, positions: { ...data.positions } };
  } catch { return emptySession(); }
}
export function resetSession(storage) {
  try { storage.removeItem(STORAGE_KEY); return true; } catch { return false; }
}
/** Saved positions replay authored events, never trusting stored resident records. */
export function replay(frames, position, setting) {
  const memories = { practice: newMemory(setting, 'practice'), workplace: newMemory(setting, 'workplace') };
  for (const frame of frames.slice(0, position + 1)) {
    if (frame.memory && frame.events) for (const event of frame.events) memories[frame.memory] = applyEvent(memories[frame.memory], event);
  }
  return memories;
}
export function recall(memory,person,taskId){
 const task=memory.tasks[taskId];if(!task||task.person!==person)return null;
 const source=memory.sources[task.sourceId]?.at(-1)||null;
 return{task:structuredClone(task),source:source?structuredClone(source):null,requests:Object.values(memory.requests).filter(r=>r.task===taskId).map(r=>structuredClone(r)),notes:memory.notes.filter(n=>n.person===person&&n.status==='confirmed'&&(n.task===taskId||n.id===task.linkedNote)).map(n=>structuredClone(n))};
}
