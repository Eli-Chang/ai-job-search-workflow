import { approvedClaims, explainMissingClaims } from './evidence.js';

const DEFAULT_FORBIDDEN_PATTERNS = Object.freeze([
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/,
  /(?:[A-Z]:\\\\|\/Users\/|\/home\/)/i,
  /\b(?:sk-|ghp_|github_pat_|bearer\s+|authorization\s*[:=])/i,
]);

export function renderResumeVariant({ candidateName, role, claimIds, evidence }) {
  const approved = approvedClaims(claimIds, evidence, 'resume');
  const missing = explainMissingClaims(claimIds, evidence, 'resume');
  const text = [`${candidateName} | ${role}`, '', 'Selected evidence:', ...approved.map((record) => `- ${record.claim}`)].join('\n');
  return {
    text,
    usedEvidenceIds: approved.map((record) => record.id),
    omittedEvidenceIds: missing,
    audit: auditDocument(text),
  };
}

export function auditDocument(text, { forbiddenPatterns = DEFAULT_FORBIDDEN_PATTERNS } = {}) {
  const findings = forbiddenPatterns.filter((pattern) => {
    pattern.lastIndex = 0;
    const matched = pattern.test(text);
    pattern.lastIndex = 0;
    return matched;
  }).map((pattern) => pattern.source);
  return { passed: findings.length === 0, findings };
}
