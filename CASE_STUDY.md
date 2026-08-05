# Case Study: Evidence-Backed Job Search Workflow

## Problem

A job search that spans discovery, fit assessment, evidence retrieval, document tailoring, validation, and status tracking needs more than a list of URLs. It needs a source of truth and explicit controls against stale postings, unsupported claims, duplicate applications, and accidental submission.

## Users and workflow

The primary user is a candidate reviewing their own opportunities. The workflow ingests a job record, normalizes it, ranks it, selects evidence, produces a document variant, audits claims, and pauses for human review before any external write.

## Requirements

- Preserve job identity, status, priority, fit, and next action.
- Keep evidence references attached to claims.
- Use synthetic or approved data in examples.
- Make document decisions explainable.
- Block external actions when required review fields are unresolved.

## Source-of-truth design

Jobs and applications are separate concepts. A job can be active or archived; an application can be prepared, reviewed, submitted, or closed. The public data model keeps those states explicit rather than inferring them from filenames.

## Data model

See [docs/data-model.md](docs/data-model.md). The synthetic fixtures contain jobs, evidence entries, and applications with stable IDs and no real-world identifiers.

## Evidence grounding

Each claim is selected by evidence ID. The document layer accepts only evidence marked approved for the requested surface. A missing or unapproved record is omitted or reported, not silently strengthened.

## Reusable skills

The public skill notes in `skills/` describe generic rules for resume, cover-letter, and CV selection. They do not contain private prompts, personal writing samples, or candidate data.

## Quality-control pipeline

The reference pipeline is deterministic: normalize records, rank with a documented score, render from synthetic evidence, audit for unsupported/private claims, then evaluate human-approval gates. Tests exercise each boundary.

## Human approval gates

The gate evaluator blocks duplicate or already-submitted applications, missing files, unsupported claims, unresolved sensitive fields, login/CAPTCHA barriers, and missing pre-submit validation. This edition has no submission adapter.

## Privacy decisions

The live system's tracker, application packets, resumes, cover letters, contacts, postings, Google IDs, logs, and prompts were excluded. Replacing those with fictional fixtures makes the architecture inspectable without publishing personal data.

## Testing and failure modes

Tests cover ranking order, evidence approval, document claim blocking, and human-gate failures. Failure modes include stale jobs, duplicate applications, unsupported claims, unresolved required fields, and automation methods not permitted by a site.

## Tradeoffs

Synthetic fixtures do not demonstrate connector authentication or document typography. That omission is intentional: the public portfolio needs to show the durable control logic without exposing account access or personal application materials.

## Verified outcomes

- Synthetic records rank deterministically.
- Unapproved evidence cannot be used for a tailored document.
- A blocked gate produces actionable reasons and prevents an allowed decision.

No time-saved, application-volume, recruiter-adoption, interview, or hiring outcome is claimed.

## Transferability

The same pattern applies to grant review, internal job queues, vendor evaluation, and other workflows where source records, evidence, generated outputs, and consequential actions need traceable human control.
