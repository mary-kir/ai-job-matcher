// Pure business rules; independent of React, storage and a future backend.
export const emptyStatus = () => ({ saved: false, applied: false, rejected: false, applied_at: null });
export const availableActions = (status) => status.rejected ? ['restore'] : status.applied ? ['save'] : ['save', 'apply', 'reject'];

export function transition(status, action, now = () => new Date().toISOString()) {
  if (!availableActions(status).includes(action)) throw new Error(`Action ${action} is not allowed for this vacancy.`);
  switch (action) {
    case 'save': return { ...status, saved: !status.saved };
    case 'apply': return { ...status, applied: true, applied_at: now() };
    case 'reject': return { ...status, saved: false, rejected: true };
    case 'restore': return emptyStatus();
    default: throw new Error('Unknown action');
  }
}

export function counts(statuses) {
  return Object.values(statuses).reduce((totals, status) => {
    if (status.rejected) totals.Rejected++;
    else {
      totals.Active++;
      if (status.saved) totals.Saved++;
      if (status.applied) totals.Applied++;
    }
    return totals;
  }, { Active: 0, Saved: 0, Applied: 0, Rejected: 0 });
}

export function selectJobs(jobs, statuses, { view = 'Active', search = '', location = '', seniority = '', application = 'All' } = {}) {
  const query = search.trim().toLowerCase();
  return jobs.filter(job => {
    const status = statuses[job.id];
    if (view === 'Rejected' ? !status.rejected : status.rejected || (view !== 'Active' && !status[view.toLowerCase()])) return false;
    return (!query || `${job.title} ${job.company}`.toLowerCase().includes(query))
      && (!location || job.location === location)
      && (!seniority || job.seniority === seniority)
      && (view !== 'Saved' || application === 'All' || status.applied === (application === 'Applied'));
  });
}
