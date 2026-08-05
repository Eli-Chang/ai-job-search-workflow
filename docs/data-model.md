# Data Model

- `Job`: stable ID, company, title, status, priority tier, fit score, and synthetic compensation.
- `Evidence`: stable ID, claim text, and approved output surfaces.
- `Application`: stable ID, linked job ID, status, and synthetic-data marker.
- `Document`: rendered text plus used and omitted evidence IDs.
- `GateResult`: allowed boolean plus actionable failure reasons.
