import test from 'node:test';
import assert from 'node:assert/strict';
import jobs from '../sample-data/jobs.json' with { type: 'json' };
import evidence from '../sample-data/evidence.json' with { type: 'json' };
import { rankJobs, approvedClaims, explainMissingClaims, renderResumeVariant, auditDocument, evaluateGates } from '../src/index.js';

test('priority ranking is deterministic and keeps archived jobs behind active work', () => {
  const ranked = rankJobs(jobs);
  assert.equal(ranked[0].company, 'Northstar Health');
  assert.equal(ranked.at(-1).status, 'archived');
});

test('evidence selection is surface-specific', () => {
  assert.deepEqual(approvedClaims(['EV-SYN-001', 'EV-SYN-003'], evidence, 'resume').map((record) => record.id), ['EV-SYN-001']);
  assert.deepEqual(explainMissingClaims(['EV-SYN-001', 'EV-SYN-003'], evidence, 'resume'), ['EV-SYN-003']);
});

test('document rendering omits unsupported claims and audits forbidden text', () => {
  const rendered = renderResumeVariant({ candidateName: 'Example Candidate', role: 'Product Operations Analyst', claimIds: ['EV-SYN-001', 'EV-SYN-003'], evidence });
  assert.deepEqual(rendered.usedEvidenceIds, ['EV-SYN-001']);
  assert.deepEqual(rendered.omittedEvidenceIds, ['EV-SYN-003']);
  assert.equal(auditDocument(rendered.text, { forbiddenPatterns: [/actual employer/i, /private email/i] }).passed, true);
});

test('human approval gates block consequential action until every condition is met', () => {
  const blocked = evaluateGates({ jobStatus: 'active', duplicate: false, alreadySubmitted: false, packetAudited: true, claimsSupported: false, requiredFilesPresent: true, sensitiveFieldsResolved: true, preSubmitValidated: true, humanReview: false });
  assert.equal(blocked.allowed, false);
  assert.deepEqual(Object.keys(blocked.failures), ['claimsSupported', 'humanReview']);
  const allowed = evaluateGates({ jobStatus: 'active', duplicate: false, alreadySubmitted: false, packetAudited: true, claimsSupported: true, requiredFilesPresent: true, sensitiveFieldsResolved: true, preSubmitValidated: true, humanReview: true });
  assert.equal(allowed.allowed, true);
});
