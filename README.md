    >>MOU Guru<<

(Memorandum of Understanding) management system: a small SaaS app that helps
organizations create, collaborate on, store, track and finalize MOUs between
multiple parties. It handles parties, signatories, versions, attachments,
milestones, reminders/notifications and reporting all backed by PostgreSQL with
authentication and a responsive UI using Tailwind.

MOU Guru helps organizations centralize and automate the lifecycle of
memorandums of understanding from drafting, attaching evidence, scheduling
milestone reminders, to signatory tracking and exporting reports so teams can
reduce administrative friction and avoid missed deadlines.

Your organization can use MOU Guru to manage all MOUs in one place: create MOUs,
attach documents, add parties and signatories, track milestone status and
deadlines, set reminders that are timezone-aware, and generate downloadable
reports. It’s built for teams that need a clear audit trail and predictable
notifications so agreements don't fall through the cracks.

Key features: entral MOU records: create/update MOUs with metadata and status.
Party & signatory management: list involved organizations and people, track
sign-off. Attachments + versioning: upload supporting documents; attachment
records include computed versions (transaction-safe). Milestones & reminders:
schedule milestones and timezone-aware reminders (TIMESTAMPTZ) that can trigger
notifications or emails. Reporting: generate exportable MOU reports (saved
locally in reports for development). Audit logging: actions are recorded for
traceability. Authentication & access: JWT-based auth and middleware to protect
routes. Responsive UI: Tailwind + Fresh-based server-side rendering for a fast,
usable admin/dashboard experience. Local dev-friendly: migration SQL and a small
Deno migration runner exist to bootstrap a local Postgres quickly.

Technical stack & architecture:

Runtime & frontend: Deno + Fresh (server-side TSX routes and components).
Styling: Tailwind CSS for responsive UI. Database: PostgreSQL (deno-postgres
pool). A migration SQL file is included at 001_initial.sql. Backend: thin route
handlers in Fresh; models are SQL helpers in db/models/*. Auth: JWT token
handling in auth.ts and route middleware under _middleware.ts. File storage
(dev): local filesystem under static/uploads (can be swapped to S3/remote
storage later). Background tasks: in-process cron/reminder utilities (migrate to
worker or scheduled job for production later).

Demo flow (concise step-by-step you can demo)

Login as an admin (show JWT-protected routes). Create a new MOU record: fill
metadata, set effective/expiry dates, assign department. Add parties and
signatories: show how multiple parties and their contacts are added. Upload
attachments: show a versioned upload for the same filename (illustrate
versioning behavior). Create milestones and set reminder dates: demonstrate a
TIMESTAMPTZ reminder. Wait or trigger the reminders processor (for demo, trigger
manually) and show the notification/logging. Generate a report: hit the report
endpoint and open the saved file in reports. Show audit logs or history for the
MOU to prove traceability.
