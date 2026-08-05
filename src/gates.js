export const GATES = Object.freeze([
  'jobIsActive', 'notDuplicate', 'notAlreadySubmitted', 'packetAudited',
  'claimsSupported', 'requiredFilesPresent', 'sensitiveFieldsResolved', 'preSubmitValidated', 'humanReview',
]);

export function evaluateGates(context) {
  const failures = [];
  if (context.jobStatus !== 'active') failures.push(['jobIsActive', 'job is not active']);
  if (context.duplicate) failures.push(['notDuplicate', 'duplicate application detected']);
  if (context.alreadySubmitted) failures.push(['notAlreadySubmitted', 'application was already submitted']);
  if (!context.packetAudited) failures.push(['packetAudited', 'document packet has not passed audit']);
  if (!context.claimsSupported) failures.push(['claimsSupported', 'one or more claims lack approved evidence']);
  if (!context.requiredFilesPresent) failures.push(['requiredFilesPresent', 'required file is missing']);
  if (!context.sensitiveFieldsResolved) failures.push(['sensitiveFieldsResolved', 'sensitive field needs human review']);
  if (!context.preSubmitValidated) failures.push(['preSubmitValidated', 'pre-submit validation is missing']);
  if (!context.humanReview) failures.push(['humanReview', 'human approval is required']);
  return { allowed: failures.length === 0, failures: Object.fromEntries(failures) };
}
