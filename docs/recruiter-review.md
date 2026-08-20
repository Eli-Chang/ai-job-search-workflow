# Recruiter review map

This repository is deliberately small so a reviewer can trace the workflow end to end in a few minutes.

| Question | Start here | What to look for |
| --- | --- | --- |
| How are opportunities prioritized? | `src/prioritize.js` and `tests/workflow.test.js` | deterministic score and archived-job ordering |
| How are claims controlled? | `src/evidence.js` and `sample-data/evidence.json` | synthetic provenance, approved surfaces, duplicate-ID fail-closed behavior |
| How are documents protected? | `src/documents.js` | private contact/path patterns and unsupported claim omission |
| Where does human approval happen? | `src/gates.js` | immutable review record and explicit pre-submit gates |
| What is intentionally absent? | `PRIVACY.md`, `SECURITY.md`, `docs/limitations.md` | no live connectors, personal records, credentials, or submission controls |

Run `npm test` to verify the contracts offline.
