import test from 'node:test';
import assert from 'node:assert/strict';
import jobs from '../sample-data/jobs.json' with { type: 'json' };
import evidence from '../sample-data/evidence.json' with { type: 'json' };
import applications from '../sample-data/applications.json' with { type: 'json' };
import { rankJobs, approvedClaims, explainMissingClaims, renderResumeVariant, auditDocument, evaluateGates } from '../src/index.js';

test('priority ranking is deterministic and keeps archived jobs behind active work', () => {
  const ranked = rankJobs(jobs);
  assert.equal(ranked[0].company, 'Northstar Health');
  assert.equal(ranked[0].priorityScore, 112);
  assert.equal(ranked.at(-1).status, 'archived');
});

test('public fixtures are explicitly synthetic', () => {
  assert.equal(jobs.every((job) => job.synthetic === true), true);
  assert.equal(evidence.every((record) => record.synthetic === true), true);
  assert.equal(applications.every((application) => application.synthetic === true), true);
});

test('evidence selection is surface-specific', () => {
  assert.deepEqual(approvedClaims(['EV-SYN-001', 'EV-SYN-003'], evidence, 'resume').map((record) => record.id), ['EV-SYN-001']);
  assert.deepEqual(explainMissingClaims(['EV-SYN-001', 'EV-SYN-003'], evidence, 'resume'), ['EV-SYN-003']);
});

test('document rendering omits unsupported claims and audits forbidden text', () => {
  const rendered = renderResumeVariant({ candidateName: 'Example Candidate', role: 'Product Operations Analyst', claimIds: ['EV-SYN-001', 'EV-SYN-003'], evidence });
  assert.deepEqual(rendered.usedEvidenceIds, ['EV-SYN-001']);
  assert.deepEqual(rendered.omittedEvidenceIds, ['EV-SYN-003']);
  assert.equal(rendered.audit.passed, true);
  assert.equal(auditDocument(rendered.text, { forbiddenPatterns: [/actual employer/i, /private email/i] }).passed, true);
});

test('document auditing blocks private contact/path patterns and resets global regex state', () => {
  assert.equal(auditDocument('Example Candidate | analyst').passed, true);
  assert.equal(auditDocument('private@example.com').passed, false);
  assert.equal(auditDocument('C:\\Users\\synthetic\\resume.md').passed, false);
  const globalPattern = /candidate/gi;
  assert.equal(auditDocument('Example Candidate', { forbiddenPatterns: [globalPattern] }).passed, false);
  assert.equal(auditDocument('Example Candidate', { forbiddenPatterns: [globalPattern] }).passed, false);
});

test('human approval gates block consequential action until every condition is met', () => {
  const blocked = evaluateGates({ jobStatus: 'active', duplicate: false, alreadySubmitted: false, packetAudited: true, claimsSupported: false, requiredFilesPresent: true, sensitiveFieldsResolved: true, preSubmitValidated: true, humanReview: false });
  assert.equal(blocked.allowed, false);
  assert.deepEqual(Object.keys(blocked.failures), ['claimsSupported', 'humanReview']);
  const allowed = evaluateGates({ jobStatus: 'active', duplicate: false, alreadySubmitted: false, packetAudited: true, claimsSupported: true, requiredFilesPresent: true, sensitiveFieldsResolved: true, preSubmitValidated: true, humanReview: true });
  assert.equal(allowed.allowed, true);
});

test('approval gates fail closed for missing or string-valued flags', () => {
  const missing = evaluateGates({ jobStatus: 'active' });
  assert.equal(missing.allowed, false);
  assert.equal(Object.keys(missing.failures).includes('humanReview'), true);
  const stringFlag = evaluateGates({ jobStatus: 'active', duplicate: 'false', alreadySubmitted: false, packetAudited: true, claimsSupported: true, requiredFilesPresent: true, sensitiveFieldsResolved: true, preSubmitValidated: true, humanReview: true });
  assert.equal(stringFlag.allowed, false);
  assert.equal(stringFlag.failures.notDuplicate, 'duplicate flag must be explicitly false');
  assert.equal(evaluateGates(null).allowed, false);
});

test('evidence selection rejects malformed or non-synthetic records', () => {
  const malformed = [
    { id: 'EV-BAD-001', claim: 'Bad surface type', approvedSurfaces: 'resume', synthetic: true },
    { id: 'EV-BAD-002', claim: 'Non-synthetic claim', approvedSurfaces: ['resume'], synthetic: false },
  ];
  assert.deepEqual(approvedClaims(['EV-BAD-001', 'EV-BAD-002'], malformed, 'resume'), []);
  assert.deepEqual(explainMissingClaims(['EV-BAD-001', 'EV-BAD-002'], malformed, 'resume'), ['EV-BAD-001', 'EV-BAD-002']);
});
