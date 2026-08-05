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

export const GATES = Object.freeze(['jobIsActive', ...BOOLEAN_REQUIREMENTS.map(([, , gate]) => gate)]);

export function evaluateGates(context = {}) {
  const failures = [];
  if (context.jobStatus !== 'active') failures.push(['jobIsActive', 'job is not active']);
  for (const [field, expected, gate, message] of BOOLEAN_REQUIREMENTS) {
    if (typeof context[field] !== 'boolean' || context[field] !== expected) failures.push([gate, message]);
  }
  return { allowed: failures.length === 0, failures: Object.fromEntries(failures) };
}
