const TIER_WEIGHT = Object.freeze({ S: 30, A: 20, B: 10, C: 0 });

export function priorityScore(job) {
  const tier = TIER_WEIGHT[job.priorityTier] ?? -20;
  const fit = Number.isFinite(job.fitScore) ? job.fitScore : 0;
  const active = job.status === 'active' ? 10 : 0;
  return tier + fit + active;
}

export function rankJobs(jobs) {
  return [...jobs]
    .map((job) => ({ ...job, priorityScore: priorityScore(job) }))
    .sort((a, b) => {
      const activeFirst = Number(b.status === 'active') - Number(a.status === 'active');
      const aId = typeof a.id === 'string' ? a.id : '';
      const bId = typeof b.id === 'string' ? b.id : '';
      const idOrder = aId < bId ? -1 : aId > bId ? 1 : 0;
      return activeFirst || b.priorityScore - a.priorityScore || idOrder;
    });
}
