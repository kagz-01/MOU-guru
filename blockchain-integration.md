# Phase 3: Blockchain Integration & Logistics

## Overview

Phase 3 introduces the core innovation of MOU-Guru: Immutable Audit Trails. By
hashing MOU data (e.g., when transitioning to 'Active' status) and securely
logging it, we establish cryptographic proof of the agreement's state.
Additionally, we will construct a robust Parties and Contacts Directory to
handle the logistical aspects of MOUs.

## Project Type

**WEB**

## Success Criteria

1. **Immutable Audit Trails**: The system generates a SHA-256 hash representing
   the core terms of an MOU when it is finalized. The hash is stored immutably
   (e.g., via a specialized database table or external ledger if configured).
2. **Parties Directory**: Users can create, view, and associate external
   organizations and contact persons with specific MOUs.
3. **Security & Validation**: Robust backend validation prevents modification of
   finalized MOU terms without generating a new hash version.

## Tech Stack

- **Backend/API (Deno/Fresh)**: Standard Deno standard library crypto for
  SHA-256 hashing.
- **Database (PostgreSQL via deno-postgres)**: New tables for `audit_logs` and
  `parties`/`contacts`.

## File Structure

```
├── db/models/
│   ├── audit.ts      (NEW: Handles audit log DB ops)
│   └── parties.ts    (NEW: Handles party/contact DB ops)
├── routes/
│   ├── api/
│   │   ├── audit/    (NEW: API endpoints for retrieving hashes)
│   │   └── parties/  (NEW: API for party management)
│   └── mou/
│       └── [id]/
│           └── parties.tsx (NEW: UI for managing parties for an MOU)
```

## Task Breakdown

### Task 1: Immutable Audit Trails (Hashing Implementation)

- **Agent**: `@backend-specialist`
- **Skill**: `nodejs-best-practices`
- **Priority**: P1
- **INPUT**: Active MOU payload containing all finalized terms.
- **OUTPUT**: A `createAuditHash` function that generates a SHA-256 hash and
  stores it in the `audit_logs` table.
- **VERIFY**: Unit test or manual API check verifying that identical MOU
  payloads generate identical hashes, and status changes trigger a new audit
  entry.

### Task 2: Parties and Contacts Database Schema

- **Agent**: `@database-architect`
- **Skill**: `database-design`
- **Priority**: P1
- **INPUT**: Requirements for storing organization and individual contact
  details.
- **OUTPUT**: SQL definitions/migrations for `parties`, `contacts`, and
  `mou_parties` join tables.
- **VERIFY**: Successful `deno task check` and verification that tables are
  created in PostgreSQL.

### Task 3: Parties UI & API Integration

- **Agent**: `@frontend-specialist` (UI) and `@backend-specialist` (API)
- **Skill**: `frontend-design`, `api-patterns`
- **Priority**: P2
- **INPUT**: Database models for parties.
- **OUTPUT**: A `/mou/[id]/parties` UI component and backend routes allowing
  users to add/remove parties.
- **VERIFY**: Successfully adding a new party via the UI reflects in the
  database.

## Phase X: Verification

- [ ] Run linting and type checks (`deno task check` / `deno fmt`).
- [ ] Security scan across the new endpoints.
- [ ] Manual verification in the browser.
