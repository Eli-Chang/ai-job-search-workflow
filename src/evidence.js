export function evidenceMap(records) {
  return new Map(records.map((record) => [record.id, record]));
}

export function approvedClaims(ids, records, surface) {
  const map = evidenceMap(records);
  return ids.map((id) => map.get(id)).filter((record) => record?.approvedSurfaces?.includes(surface));
}

export function explainMissingClaims(ids, records, surface) {
  const map = evidenceMap(records);
  return ids.filter((id) => !map.get(id)?.approvedSurfaces?.includes(surface));
}
