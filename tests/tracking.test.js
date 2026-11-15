import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { availableActions, counts, emptyStatus, selectJobs, transition } from '../src/tracking.js';
import { STORAGE_KEY, loadStatuses, normalizeStatuses, saveStatuses } from '../src/services/statusStore.js';
const jobs = JSON.parse(readFileSync(new URL('../src/data/jobs.json', import.meta.url)));

for (const [saved, applied, rejected, actions] of [
  [false, false, false, ['save', 'apply', 'reject']],
  [true, false, false, ['save', 'apply', 'reject']],
  [false, true, false, ['save']], [true, true, false, ['save']],
  [false, false, true, ['restore']],
]) {
  test(`allowed and forbidden transitions: saved=${saved}, applied=${applied}, rejected=${rejected}`, () => {
    const original = { saved, applied, rejected, applied_at: applied ? '2026-11-15T12:00:00Z' : null };
    assert.deepEqual(availableActions(original), actions);
    for (const action of ['save', 'apply', 'reject', 'restore', 'undo_applied', 'unknown']) {
      const before = structuredClone(original);
      if (!actions.includes(action)) assert.throws(() => transition(original, action));
      else {
        const next = transition(original, action, () => '2026-11-15T13:00:00Z');
        if (action === 'save') assert.deepEqual(next, { ...original, saved: !saved });
        if (action === 'apply') assert.deepEqual(next, { ...original, applied: true, applied_at: '2026-11-15T13:00:00Z' });
        if (action === 'reject') assert.deepEqual(next, { ...original, saved: false, rejected: true });
        if (action === 'restore') assert.deepEqual(next, emptyStatus());
      }
      assert.deepEqual(original, before, 'transition must not mutate input');
    }
  });
}

test('views, filters, rejection, restoration and dashboard counts', () => {
  const statuses = normalizeStatuses(jobs);
  assert.equal(jobs.length, 10);
  assert.equal(new Set(jobs.map(j => j.id)).size, 10);
  statuses['demo-01'] = transition(statuses['demo-01'], 'save');
  assert.equal(selectJobs(jobs, statuses, { view: 'Saved', application: 'Not Applied' }).length, 1);
  statuses['demo-01'] = transition(statuses['demo-01'], 'apply');
  assert.equal(selectJobs(jobs, statuses, { view: 'Saved', application: 'Not Applied' }).length, 0);
  assert.equal(selectJobs(jobs, statuses, { view: 'Saved', application: 'Applied' }).length, 1);
  assert.deepEqual(counts(statuses), { Active: 10, Saved: 1, Applied: 1, Rejected: 0 });
  statuses['demo-02'] = transition(transition(statuses['demo-02'], 'save'), 'reject');
  assert.deepEqual(counts(statuses), { Active: 9, Saved: 1, Applied: 1, Rejected: 1 });
  for (const view of ['Active', 'Saved', 'Applied']) assert.ok(!selectJobs(jobs, statuses, { view }).some(j => j.id === 'demo-02'));
  assert.equal(selectJobs(jobs, statuses, { view: 'Rejected' })[0].id, 'demo-02');
  statuses['demo-02'] = transition(statuses['demo-02'], 'restore');
  assert.deepEqual(statuses['demo-02'], emptyStatus());
  assert.equal(selectJobs(jobs, statuses, { search: ' LUMEN ' })[0].id, 'demo-01');
  assert.equal(selectJobs(jobs, statuses, { search: 'product owner', location: 'Dublin, Ireland', seniority: 'Junior' })[0].id, 'demo-02');
  assert.equal(selectJobs(jobs, statuses, { search: 'no matches' }).length, 0);
});

function memoryStore() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('storage round trip persists labels and date and whitelists data', () => {
  const storage = memoryStore();
  const statuses = normalizeStatuses(jobs);
  statuses['demo-01'] = { ...transition(transition(statuses['demo-01'], 'save'), 'apply'), cv: 'must not persist', secret: 'must not persist' };
  statuses['demo-02'] = transition(statuses['demo-02'], 'reject');
  assert.equal(saveStatuses(jobs, statuses, storage), '');
  const loaded = loadStatuses(jobs, storage);
  assert.equal(loaded.warning, '');
  assert.equal(loaded.statuses['demo-01'].saved, true);
  assert.equal(loaded.statuses['demo-01'].applied, true);
  assert.equal(loaded.statuses['demo-02'].rejected, true);
  assert.equal(loaded.statuses['demo-01'].applied_at, statuses['demo-01'].applied_at);
  assert.ok(!storage.getItem(STORAGE_KEY).includes('must not persist'));
});

test('blocked, malformed and incompatible storage are handled', () => {
  const broken = { getItem() { throw Error('blocked'); }, setItem() { throw Error('full'); } };
  assert.ok(loadStatuses(jobs, broken).warning);
  assert.ok(saveStatuses(jobs, normalizeStatuses(jobs), broken));
  for (const raw of ['not json', '{"version":2}']) {
    assert.ok(loadStatuses(jobs, { getItem: () => raw }).warning);
  }
  assert.equal(loadStatuses(jobs, memoryStore()).warning, '');
  const normalized = normalizeStatuses(jobs, { 'demo-01': { applied: true, rejected: true, saved: true }, 'demo-02': { rejected: true, saved: true } });
  assert.equal(normalized['demo-01'].rejected, false);
  assert.equal(normalized['demo-02'].saved, false);
});
