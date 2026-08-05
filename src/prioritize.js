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
      return activeFirst || b.priorityScore - a.priorityScore || a.id.localeCompare(b.id);
    });
}
