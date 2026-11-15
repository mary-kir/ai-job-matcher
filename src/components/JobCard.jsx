import React from 'react';
import { availableActions } from '../tracking.js';

export default function JobCard({ job, status, onAction }) {
  const labels = { save: status.saved ? 'Unsave' : 'Save', apply: 'Mark Applied', reject: 'Reject', restore: 'Restore to Active' };
  return <article className="job-card" aria-labelledby={`title-${job.id}`}>
    <p className="eyebrow card-eyebrow">Fictional demo vacancy</p>
    <h3 id={`title-${job.id}`}>{job.title}</h3>
    <p className="job-meta">{job.company} · {job.location} · {job.seniority}</p>
    <div className="badges" aria-label="Job status">
      <span className={`badge ${status.applied ? 'applied' : ''}`}>{status.applied ? 'Applied' : 'Not Applied'}</span>
      {status.saved && <span className="badge saved">Saved</span>}
      {status.rejected && <span className="badge rejected">Rejected</span>}
    </div>
    <p className="description">{job.description}</p>
    <p className="detail">Languages: {job.language || 'Not specified'}</p>
    <p className="detail">Relocation & visa support: Not specified in this demo</p>
    {status.applied && <p className="permanent">✓ Applied · Cannot be undone{status.applied_at && <span> · {new Date(status.applied_at).toLocaleDateString('en-IE')}</span>}</p>}
    <div className="actions">
      {availableActions(status).map(action => <button key={action} className={action === 'apply' || action === 'restore' ? 'primary' : ''} onClick={() => onAction(job.id, action)}>{labels[action]}</button>)}
    </div>
  </article>;
}
