const BOOLEAN_REQUIREMENTS = Object.freeze([
  ['duplicate', false, 'notDuplicate', 'duplicate flag must be explicitly false'],
  ['alreadySubmitted', false, 'notAlreadySubmitted', 'already-submitted flag must be explicitly false'],
  ['packetAudited', true, 'packetAudited', 'document packet must be explicitly audited'],
  ['claimsSupported', true, 'claimsSupported', 'claims must be explicitly supported by approved evidence'],
  ['requiredFilesPresent', true, 'requiredFilesPresent', 'required files must be explicitly present'],
  ['sensitiveFieldsResolved', true, 'sensitiveFieldsResolved', 'sensitive fields must be explicitly resolved'],
  ['preSubmitValidated', true, 'preSubmitValidated', 'pre-submit validation must be explicitly complete'],
  ['humanReview', true, 'humanReview', 'human approval must be explicit'],
]);
const REVIEW_RECORD_BRAND = Symbol('trusted-review-record');

export const GATES = Object.freeze(['reviewRecord', 'jobIsActive', ...BOOLEAN_REQUIREMENTS.map(([, , gate]) => gate)]);

export function createReviewRecord(fields = {}) {
  const record = { ...fields };
  Object.defineProperty(record, REVIEW_RECORD_BRAND, { value: true, enumerable: false });
  return Object.freeze(record);
}

export function evaluateGates(context = {}) {
  const safeContext = context && typeof context === 'object' ? context : {};
  const reviewRecord = safeContext.reviewRecord;
  const failures = [];
  if (!reviewRecord || reviewRecord[REVIEW_RECORD_BRAND] !== true) failures.push(['reviewRecord', 'gates require a trusted, immutable review record']);
  const values = reviewRecord && reviewRecord[REVIEW_RECORD_BRAND] === true ? reviewRecord : {};
  if (values.jobStatus !== 'active') failures.push(['jobIsActive', 'job is not active']);
  for (const [field, expected, gate, message] of BOOLEAN_REQUIREMENTS) {
    if (typeof values[field] !== 'boolean' || values[field] !== expected) failures.push([gate, message]);
  }
  return { allowed: failures.length === 0, failures: Object.fromEntries(failures) };
}
