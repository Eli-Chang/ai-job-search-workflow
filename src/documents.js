import { approvedClaims, explainMissingClaims } from './evidence.js';

export function renderResumeVariant({ candidateName, role, claimIds, evidence }) {
  const approved = approvedClaims(claimIds, evidence, 'resume');
  const missing = explainMissingClaims(claimIds, evidence, 'resume');
  return {
    text: [`${candidateName} | ${role}`, '', 'Selected evidence:', ...approved.map((record) => `- ${record.claim}`)].join('\n'),
    usedEvidenceIds: approved.map((record) => record.id),
    omittedEvidenceIds: missing,
  };
}

export function auditDocument(text, { forbiddenPatterns = [] } = {}) {
  const findings = forbiddenPatterns.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
  return { passed: findings.length === 0, findings };
}
