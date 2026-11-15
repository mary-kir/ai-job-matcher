import React, { useEffect, useState } from 'react';
import jobs from './data/jobs.json';
import { counts, selectJobs, transition } from './tracking.js';
import { browserStorage, loadStatuses, saveStatuses, STORAGE_KEY } from './services/statusStore.js';
import JobCard from './components/JobCard.jsx';

const locations = [...new Set(jobs.map(job => job.location))].sort();

export default function App() {
  const [initial] = useState(() => loadStatuses(jobs, browserStorage));
  const [statuses, setStatuses] = useState(initial.statuses);
  const [warning, setWarning] = useState(initial.warning);
  const [feedback, setFeedback] = useState('');
  const [view, setView] = useState('Active');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [seniority, setSeniority] = useState('');
  const [application, setApplication] = useState('All');

  useEffect(() => {
    // Keep multiple open tabs consistent with the latest stored state.
    function sync(event) {
      if (event.storageArea === window.localStorage && (event.key === STORAGE_KEY || event.key === null)) {
        const next = loadStatuses(jobs, browserStorage);
        setStatuses(next.statuses);
        setWarning(next.warning);
        setFeedback('Tracking updated from another browser tab.');
      }
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  function act(id, action) {
    try {
      const next = { ...statuses, [id]: transition(statuses[id], action) };
      setWarning(saveStatuses(jobs, next, browserStorage));
      setStatuses(next);
      const messages = {
        save: next[id].saved ? 'Saved for later.' : 'Removed from Saved.',
        apply: 'Marked as Applied. This cannot be undone.',
        reject: 'Rejected and removed from Saved.',
        restore: 'Restored to Active without previous labels.',
      };
      setFeedback(`${jobs.find(job => job.id === id).company}: ${messages[action]}`);
    } catch (error) { setFeedback(error.message); }
  }

  const summary = counts(statuses);
  const visible = selectJobs(jobs, statuses, { view, search, location, seniority, application });
  return <main>
    <header>
      <p className="eyebrow">Your next chapter</p>
      <h1>AI Job Matcher</h1>
      <p className="intro">Find your focus. Review product opportunities and keep your next career move organised.</p>
      <p className="demo-notice">Demo · 10 fictional vacancies. No live postings or AI matching.</p>
      <p className="detail">Tracking stays in this browser across reloads. Clearing site data resets it. No CV data or secrets are stored.</p>
    </header>
    {warning && <p className="warning" role="alert">{warning}</p>}
    <section className="dashboard" aria-label="Vacancy totals">
      {Object.entries(summary).map(([name, total]) => <div className="summary" key={name}><span>{name}</span><strong>{total}</strong></div>)}
    </section>
    <p className="detail count-note">Active includes Saved and Applied. Saved and Applied exclude rejected jobs. Counts ignore filters.</p>
    <nav className="views" aria-label="Job views">{Object.keys(summary).map(name => <button key={name} aria-pressed={view === name} onClick={() => { setView(name); setFeedback(''); }}>{name}</button>)}</nav>
    <section className="filters" aria-label="Filter vacancies">
      <label className="search">Search title or company<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="e.g. Product Owner or Clover" /></label>
      <label>Location<select aria-label="Location" value={location} onChange={e => setLocation(e.target.value)}><option value="">All locations</option>{locations.map(name => <option key={name}>{name}</option>)}</select></label>
      <label>Seniority<select aria-label="Seniority" value={seniority} onChange={e => setSeniority(e.target.value)}><option value="">All levels</option>{['Junior', 'Associate', 'Mid-level'].map(name => <option key={name}>{name}</option>)}</select></label>
      {view === 'Saved' && <label className="application-filter">Application status<select aria-label="Application status" value={application} onChange={e => setApplication(e.target.value)}>{['All', 'Applied', 'Not Applied'].map(name => <option key={name}>{name}</option>)}</select></label>}
    </section>
    <div aria-live="polite" aria-atomic="true">{feedback && <p className="feedback">{feedback}</p>}</div>
    <section aria-labelledby="results-title">
      <h2 id="results-title">{view} opportunities</h2>
      <p className="detail">{visible.length} matching {visible.length === 1 ? 'vacancy' : 'vacancies'} · Fictional demonstration data</p>
      {!visible.length && <p className="empty">No vacancies in this view match your filters. Try another view or broaden your search.</p>}
      <div className="job-list">{visible.map(job => <JobCard key={job.id} job={job} status={statuses[job.id]} onAction={act} />)}</div>
    </section>
    <footer>Built for a more focused product job search · Fictional demo</footer>
  </main>;
}
