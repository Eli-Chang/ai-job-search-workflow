function isValidSyntheticEvidence(record) {
  return Boolean(record)
    && record.synthetic === true
    && typeof record.id === 'string'
    && typeof record.claim === 'string'
    && Array.isArray(record.approvedSurfaces)
    && record.approvedSurfaces.every((surface) => typeof surface === 'string');
}

export function evidenceMap(records = []) {
  const safeRecords = Array.isArray(records) ? records.filter(isValidSyntheticEvidence) : [];
  return new Map(safeRecords.map((record) => [record.id, record]));
}

export function approvedClaims(ids, records, surface) {
  const map = evidenceMap(records);
  return ids.map((id) => map.get(id)).filter((record) => record?.approvedSurfaces?.includes(surface));
}

export function explainMissingClaims(ids, records, surface) {
  const map = evidenceMap(records);
  return (Array.isArray(ids) ? ids : []).filter((id) => !map.get(id)?.approvedSurfaces?.includes(surface));
}
