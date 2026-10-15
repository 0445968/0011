# Staff sidebar implementation

Base: `bivi-approvals-qa-handoff`, commit `3aa5f3667f18af2236615cfc42edaf4ef1f941e6`.

## Foundation batch

- Shared destination registry includes ID, label, clean staff URL, icon, staff permission requirement, implementation status and group. Only existing destinations are visible. Middleware, directory highlights, desktop/mobile navigation and search use the registry. Server authorization remains in the workspace layout and source routes; registry permissions are descriptive, not security enforcement.
- Canonical record identity treats `lead` as `inquiry`, normalizes UUID case and deduplicates persisted records. Old storage keys remain compatible. Record sections and query strings remain in the last visited tab URL.
- Inquiries and Projects have Pinned, Open and Bookmarked subgroups. Open bookmarks appear once in the sidebar, and bookmarks survive closing. Pinned tabs cannot close. Capacity management cannot evict a pinned tab or the newly visited record.
- Record tab colors are restored in the interaction batch below; 44px directory and nested-record targets, persistent collapse footer, and shared record icons/labels.
- Protected editors: work plan, task ownership settings, project brief, proposal draft/new version, onboarding checklist and readiness. Internal links, tab switching/closing, workspace menu navigation and sign-out offer Stay / Discard and leave. When exactly one registered editor provides a save action, Save and stay invokes its existing revision-checked save; it does not navigate after a failed or unconfirmed save. Multiple editors must be saved individually. Reload/closing the browser uses the browser's native unsaved-changes prompt.
- A server `notFound()` result removes the record from tabs, bookmarks and recently closed records. Transient workspace errors retain saved links. Renames update via the existing server-provided record metadata. Permission revocation remains enforced by server authorization and RLS; local saved links never confer access.

## Validation

- Baseline and changed production builds pass without live Supabase credentials.
- TypeScript and targeted ESLint checks pass.
- Navigation/persistence regression tests cover route identity, implemented-route registration, unsafe stored URLs, alias deduplication, unimplemented records, corrupt storage and pinned-tab capacity.
- Existing platform verification passes. Repository-wide lint has unrelated errors in public pages and components.

## Remaining Phase 0 checks

- Signed-in desktop/mobile/light/dark visual and keyboard testing with real records and database configuration. No authenticated account or browser executable was available in this execution environment.
- App Router browser Back/Forward transitions are not intercepted by the navigation guard; this requires a separate tested history/draft-preservation design. Do not describe the current guard as universal navigation protection.
- Editors without registered dirty-state detection (for example discussion drafts and client-access inputs) still need an individual save/discard audit.
- Verify removed-record cleanup and revoked-access behavior against real RLS responses, and confirm all record subroutes register titles on direct entry.
- Confirm toolbar ordering/stickiness and loading/overflow behavior against the intended shell hierarchy before considering Phase 0 fully accepted.

## Next phases

Contacts → Clients → Proposals → My Tasks → Approvals → Calendar → Notifications → Files → Forms/Templates/Services/Settings. Contacts and client organizations need explicit person/company identity, relationship and deduplication rules with staff RLS and server pagination. Tasks need trusted staff assignment identifiers. Build the real data-backed route before changing its registry status to `existing`.

Billing, Reports and Team remain later work. This batch introduces no database migrations and is not the full roadmap. Review against the development branch before any promotion to `restore`; preserve its independent client-login fix.

## Tab interactions and refresh behavior batch

- Restored yellow project, blue inquiry/lead and red contact tab styles, including dark mode.
- Drag handles reorder all tabs, including pinned tabs. Order is persisted exactly; pinning does not move a tab. Handles support mouse, touch and keyboard (Space, arrows, Space to drop; Escape to cancel).
- Pin/bookmark controls moved into each tab's right-click / touch-long-press menu. Their indicator icons only appear when selected. The close action still requires unpinning a pinned record first.
- Sidebar records share Open, Open in new tab, Copy link, Pin/Unpin, Bookmark/Remove bookmark and Close when open. Directory entries use Open in new tab and Copy link; they are navigation destinations rather than record tabs.
- Touch long press opens contextual actions on the tab body. Touch dragging uses the separate handle to prevent gesture conflicts.
- Mobile directory navigation sits immediately below the header, before File and the other workspace menus.
- Sidebar preference is mirrored into a non-sensitive cookie so the server can render the saved width. Existing local preferences migrate automatically. The shell stays visually hidden for the initial preference-restore frame, so its default sidebar never flashes before collapsing. Width animation is enabled only after a manual toggle.
- Hover/focus prefetch plus a small delayed prefetch of up to three inactive tabs warms available route data. A workspace loading boundary and Opening status improve feedback. Authenticated dynamic record data still requires server loading; this does not keep every editor mounted or remove network latency.
- Validation: TypeScript, targeted ESLint, 15 platform checks and production build. Browser gesture/visual checks still need to be performed on the user's signed-in workspace.

## People directory batch

Apply the patch on `bivi-sidebar-phase0` after all tab updates. Before opening People or accepting new Get Started submissions with this feature, run the complete `supabase/migrations/202610140015_people.sql` file in the intended Supabase project's SQL editor. It requires migrations 001–014 already applied. The migration backfills existing inquiries in one transaction and enables the intake trigger atomically; no live database has been modified by preparing this patch.

- Sidebar directory is People at `/people` (internally `/admin/people`). External contacts are grouped as Leads, Clients, Partners, Collaborators and Vendors. Staff remain in the future Team directory.
- Default sort is name A–Z, ignoring case. Server pagination, company/contact search, ID lookup, relationship filters, contact ID sorting, company sorting and update-time sorting are supported.
- Each person receives a random positive integer from 1 through 999999999. A permanent private allocation ledger plus uniqueness constraints and collision retry prevent reuse and repeats. Public IDs identify contacts; they are not authorization secrets.
- Normalized email is the identity/deduplication key. New Get Started submissions automatically create or reuse a person and link the inquiry and company name. Repeated public submissions cannot overwrite staff-maintained names, phone numbers, notes or labels. Shared inboxes currently share one contact; resolving multiple people behind one shared inbox needs a future explicit identity model.
- An accepted proposal promotes the inquiry's contact from Lead to Client. Existing accepted proposals are backfilled. Other relationship labels are preserved; one person can carry multiple labels.
- Manual contact create/edit includes company name, email, phone, relationships and internal notes. Staff mutations retain stable IDs and check the current revision. Duplicate emails return a clear conflict rather than creating a second record.
- Person details show source inquiry links and actual linked projects. Company names reuse current inquiry data; the separate company/client directory remains the next phase.
- Contact phonebook popups are integrated in staff onboarding contact fields, client signatory readiness, proposal approver selection and project invitation email fields. They show contact details, support search/pagination, fill existing fields on request, link additional people to the source record and offer Open in new tab. Looking up a person grants no login or review permission. Public intake and client-facing forms cannot browse the staff phonebook.
- Staff RLS protects tables and the directory view; writes use checked RPCs and the private trigger. Allocation IDs and internal contact data are not exposed by public intake responses.
- Database tests include forced random-ID collision retry, stable identity across submissions, intake retry behavior, backfill, client promotion, unauthorized reads/writes, null/stale revisions and allocation retention after contact removal. Signed-in visual and gesture verification remains a local check.

## Business identity foundation batch

Apply `supabase/migrations/202610140016_business_identity_foundation.sql` once after migrations 001–015. This batch prepares the data and displays/searches new person IDs; it does not yet expose the expanded contact fields, Companies pages, import/export, view preferences or avatar uploads. Those are subsequent patches.

- Existing numeric person IDs, UUID relationships, URLs and saved workspace tabs remain valid. A separate immutable public ID contains seven random characters from an unambiguous uppercase alphabet. A shared permanent allocation ledger prevents cross-subject reuse for People, Companies, Projects, Staff and Client Profiles, including after deletion.
- Existing client-portal organization records are the authoritative company identities. Staff-only company profiles add address, organization metadata, status, industry/subindustry, logo reference, timestamps and revision. Company names are not automatically merged just because they look alike.
- The taxonomy contains exactly 12 industries and 120 subindustries. Database foreign keys enforce the selected parent/subindustry pairing; TypeScript uses the same seeded catalogue.
- Company assignments are backfilled only from existing authoritative inquiry-to-organization relationships. Ambiguous person assignments remain unassigned. Manual assignments/unassignments are flagged so automatic onboarding links do not undo them. Project company association is operational metadata; portal access remains governed by existing explicit access controls.
- Person company title/role and per-project role are separate fields. The company directory derives its active CEO from the explicitly assigned CEO contact. At most one active CEO can be assigned per company.
- Company addresses are inherited by reference through the People view, never copied into personal address fields. Revision-checked staff RPC support for assigning, reassigning and unassigning a person's company is prepared for the next UI patch.
- Alternate email/phone tables include Work, Personal and Other labels with primary-channel uniqueness. Existing email/phone values are backfilled as Other rather than guessing their purpose. Old editor saves keep these tables aligned and retain previous primary channels as alternates. Alternate emails are globally unique across contacts and participate in automatic intake deduplication.
- Lead source/reference/referral fields are prepared. Existing inquiry-linked people get their traceable Get Started or legacy origin; manual contacts remain manual. New Get Started contacts record their source and request reference. No source label is guessed from unrelated contact text.
- Staff-only dated/attributed note tables and private avatar/logo references are prepared. Existing plain-text notes are preserved; storage access and note-editing APIs will be added with their UI patches.
- Validation covers all migrations 001–016, forced ID collision recovery, stable legacy references, alternate-email intake matching, primary-channel compatibility, inherited addresses, CEO derivation, deliberate unassignment, stale revisions, existing-editor saves and unauthorized reads/writes.

## Companies workspace and empty tab-bar menu batch

Run `supabase/migrations/202610140017_company_workspace.sql` once after 001–016. This patch enables Companies in the live navigation registry and builds the company directory/detail screens. No database or production branch has been changed by preparing the patch.

- Companies directory: server pagination; search by name, legal name or short ID; status, industry, subindustry, country and city filters; name/ID/industry/modified sorting. Personal saved views are local to the signed-in staff account and applied explicitly.
- Company detail: editable name, legal name, website, organization type, status, industry, subindustry, founded year, employee count and structured address. Created/modified timestamps and traceable source are visible. CEO comes from an active assigned contact with the CEO company role.
- People and projects can be assigned, reassigned or unassigned from company pages. Person assignments set company title and role separately from project roles; clearing a company clears its company-specific title/role. Address inheritance appears on the People detail page. Client access permissions and historical scope/body records remain governed by the existing workflows.
- Company edits and assignments use staff-authorized, revision-checked RPCs. External company-name changes increment the profile revision, and dirty editors retain their baseline revision rather than silently accepting fresh revision props. Assignment changes have a staff-only audit trail.
- Internal company notes are dated and attributed to the signed-in author. Notes are append-only in this batch. Note drafts and person assignment drafts register unsaved-state protection.
- Companies use the normal workspace tabs, breadcrumbs, pins and bookmarks. Company tabs have a teal accent with the existing white active-tab background. All existing tab colors and drag behavior are retained.
- Right-click or touch-long-press the empty flexible area of the tab strip for Open workspace / Window management menus. The plus and overflow dropdowns use the same action definitions, including built directories, bookmarked records, record switching, reopening tabs, pin/bookmark actions and close operations. Individual tabs retain their own context menus.
- Country options are generated from the local public-domain IANA `iso3166.tab` dataset. The extra company fields, import/export and avatar uploads remain separate later work.
- Validation: production build, TypeScript, targeted lint and 23 platform tests; added full-migration company CRUD, null/stale revisions, source/notes, assignment audit, client-access isolation, company record persistence and shared menu/pinned-tab checks. Signed-in visual and touch testing remains a user-workspace check.


### Expanded People editor (migration 018)
- Alternate work/personal/other emails and phones, one primary per channel, company title/role, contact status, preserved automatic lead sources, manual/referral reference, and independent linked-project roles.
- Created/modified timestamps and staff-authored dated notes; existing internal notes remain editable.
- Atomic profile save preserves IDs/company assignment, rejects stale revisions and invalid project links, and enforces email uniqueness. Apply migration 018 after 017.
- Verified platform database integration, typecheck, changed-file lint, and production build. Signed-in visual checks remain: change primary contact, remove alternate details, change a project role, add a note, and reload.
- CSV import/export, saved People views, avatar controls, and structured referrer pickers remain for subsequent patches.


### Directory transfers and People views (migration 019)
- Staff-only CSV export for People/Companies; import mapping and server-side preview, field validation, existing/in-file duplicate detection, and explicit create-only import.
- Maximum 100 import records / 500 KB CSV per batch; export maximum 10,000 records or channel entries. Formula-like spreadsheet cells are escaped.
- Imported records receive new IDs and import source. Existing records, company/project assignments, CEO roles, source history and portal access are not overwritten. Company name on a People import is informational; authoritative assignments use company controls.
- Database imports are transactional, serialized across imports, and duplicate-safe on retries. Unexpected failures roll back the batch.
- People status/source filters and created/modified sorting; Save view / Use saved view stores preferences per staff account on the current device.
- Validation: build, TypeScript, changed-file lint and 25 tests including CSV quoting, limits, duplicate retries, import sources, atomic rollback, generated identities and non-staff denial. Signed-in import/preview/export and saved-view UI checks remain.
- Avatars and structured referrer pickers remain for subsequent patches.


### Profile images (migration 020)
- Private avatars for People, each client's own profile and each staff member's own account; company logos. PNG/JPEG/WebP source images are resized to 512 pixels and converted to PNG in the browser, stripping original metadata.
- Avatar initials/logo fallbacks in directories, phonebook and account headers. Staff account menu exposes own image editing and short staff ID; client profile shows its short ID. Staff administration remains for Team.
- Upload reservation quota (20/hour/account), private bucket, bounded PNG validation with chunk checksums, storage metadata verification, immutable image objects, explicit authorization and expected-image conflict handling. Clients cannot edit other subjects; staff can edit external People/companies and own staff image.
- Replacing/removing an image revokes reads of the former path. Old and abandoned objects remain private; automated storage cleanup is future maintenance work.
- Image changes refresh the page to load updated revisions; unsaved People/company/client profile edits are guarded. Client account image is separate from an external People contact image.
- Apply migration 020 after 019. Signed-in UI checks: upload/replace/remove for each subject, reload, verify initials fallback and ensure private images are unavailable from another client account.
- Validation covers PNG corruption/dimension bounds, storage guards under broad policies, stale changes, removal, own-client and own-staff permissions, generated client identity and quotas.


### People company and referral controls (migration 021)
- Searchable company assignment/reassignment/unassignment inside the existing People editor; title and company role save with the person and use the existing assignment audit. Company address remains inherited.
- Link referring people/companies using the phonebook and company picker; open linked records, clear selections, and retain free-text referral details. A manual/referral source becomes Referral when a referrer is selected; automatic sources and their references stay unchanged.
- IDs, images, channel details and old editor compatibility are preserved. Profile/channel/relationship writes share a transaction; stale revisions, self-referrals and missing linked records are rejected without partial saves.
- Apply migration 021 after 020. UI checks remain: choose both referrers, save/reload, follow links; change company and confirm address; unassign and confirm address disappears; confirm unsaved-edit prompts.
- Validation: production build, TypeScript, changed-file lint, 27 tests including preserved import origin and ID, inherited address, company/referral clearing, self-reference rejection, FK rollback and stale saves.


### Clients directory and primary contacts (migration 022)
- Clients is a data-backed sidebar and workspace-menu destination at /clients. Qualification: an existing company has an assigned project or a linked accepted inquiry. Work status is derived from real project states; company profile status remains separate.
- Server-paginated search by company/name/primary contact/ID; work status, industry and portal-access filters; name/ID/activity/active-project sorting. Client opens the shared company record with ?view=client, retaining one company tab/ID.
- Company pages include client counts, an explicit primary contact, accepted inquiry/proposal links and source client-access links. Accounts count active memberships and separately count actual active portal access; assigning a company or primary contact grants no login/review permission.
- Primary contacts must be active assigned people. The staff RPC checks company revision and membership; moving/deactivating/deleting the person clears the selection and updates company revision. The CEO and project roles remain independent.
- Accepted inquiries without an authoritative company link remain available in Inquiries until linked by the existing onboarding/access workflow. Company names alone do not establish identity.
- Apply migration 022 after 021. Validation: production build, TypeScript, changed-file lint and 27 tests, extended for directory qualification, actual project-state counts, preserved portal access after reassignment, stale primary edits, active/company validation, automatic clearing and non-staff denial. Signed-in visual checks remain.
- Next planned sales-layer batch: global Proposals directory reusing existing per-inquiry proposal records. Phase 0 browser-history and signed-in interaction checks remain open.


### Proposals directory and version links (migration 023)
- Global Proposals is enabled in the sidebar, search and shared workspace menus at /proposals. It uses the existing inquiry_proposals records and staff RLS.
- Latest version per inquiry by default; All saved versions includes history. Search by title/company/contact/email/company ID; proposal/inquiry status filters; created/updated/issued/accepted/company/title/status sorting and server pagination. No new approval state or expired status is introduced.
- Each version opens /leads/[id]/proposals?version=N#proposal-version-N, opens/focuses that saved scope and retains the inquiry's workspace identity. The current draft and mutation targets remain unchanged. Missing/invalid versions show an inline message instead of removing a valid inquiry tab.
- Direct entry to proposal subroutes registers the inquiry title/status; each saved scope includes a stable version link. Existing unsaved-edit navigation guards apply to the links.
- Read-only directory/index migration 023 follows 022. Existing issue/acceptance/decline/revision gates are unchanged.
- Validation: production build, TypeScript, changed-file lint, 30 platform tests covering all real statuses, latest/history selection, source company identity, exact version URLs, saved tab persistence and staff-only access. Signed-in focus/scroll/keyboard and mobile checks remain.
- Next planned batch: audit task ownership and implement My Tasks using trusted staff identifiers.


### My Tasks and verified task assignment (migration 024)
- My Tasks at /tasks is a real, server-paginated queue whose database view requires active staff authorization and assigned_staff_id = auth.uid(). Search, task/project status, blocked/dependency state, lifecycle phase, due-date/timezone filters and sorting are supported.
- Task data, status and dates remain in the authoritative project body; assignment is a nullable verified staff reference on the existing task control row. Existing owner/project labels are preserved and never auto-matched to accounts. New assignments must be made explicitly in Lifecycle → Task ownership.
- The staff picker searches active account email/short ID with pagination; it provides no staff administration. Assignment RPCs honor task-control revisions, project locks, staff authorization and Bivi/client responsibility, with history snapshots. Moving responsibility to Client clears staff assignment; deactivation/deletion clears assignments safely.
- Links open the exact work-plan or lifecycle row, expand it and select its pagination page within the same project tab. Dirty editor guards remain active. Missing tasks retain the project and show the current plan. Signed-in focus, scrolling, keyboard and responsive checks remain.
- Migration 024 also fixes the existing manage_inquiry_project task-list save ambiguity: ON CONFLICT now names project_task_controls_pkey rather than a task_id identifier that collides with a PL/pgSQL variable. Existing body validation, revision checks, dependency checks, lifecycle logic, closeout gates and audit behavior are retained.
- Due dates are calendar dates; the chosen IANA timezone controls today/overdue comparisons. America/Chicago is the default, and timezone is explicit in the queue UI/URL. Staff preference storage remains later work.
- Apply migration 024 after 023. Validation: production build, TypeScript, changed-file lint and 33 tests including source-task save/removal, cross-staff/client isolation, stale/null revisions, client ownership, inactive staff, safe deep links and midnight/daylight-saving date boundaries.
- Next planned batch: Approvals queue reusing current project/brief/delivery review gates.


### Approvals queue and source review links (migration 025)
- Approvals at /approvals is enabled in the sidebar, workspace search and shared menus. The staff-only, security-invoker view aggregates current briefs, deliverable reviews, change requests, requested progress-update feedback, required QA/handoff checks, final release, client receipt and support closeout. Completed projects are excluded; active and on-hold projects remain visible.
- Search, type, waiting party, project state and attention filters use server pagination and stable sorting. Changes requested, failed QA and missing reviewers receive the highest attention level; no artificial deadlines are assigned. Optional issued reviews remain visible and labeled separately.
- Only active client reviewers count. Unanswered progress-update feedback remains open until all eligible reviewers respond; changes-requested feedback takes priority over approval responses. Revoking a reviewer removes their feedback from the current queue calculation. A missing reviewer becomes a staff access-management action rather than a client wait.
- Briefs and deliverables use their latest version; progress updates use the latest non-withdrawn publication and appear only when that publication requests review. Pending QA is stage-gated, failed required QA appears immediately, and required handoff checks appear after release or in Handoff. Release and closeout reuse the existing database readiness gates. The view has no decision controls or second approval state machine.
- Links focus the exact source version/check/action inside the canonical project tab. Saved brief/publication details expand automatically. Focused progress updates outside the normal recent-version window are fetched explicitly through existing source RLS; missing items show an inline notice and retain the project. Latest deliverable selection uses version numbers even when timestamps tie.
- Delivery, change, QA, handoff, publication and client-access drafts now register the existing unsaved-navigation guard. Saving one form keeps protection for unrelated drafts. Publishing, issuing, inviting, releasing and closing remain explicit source actions. Browser Back/Forward protection is still an open Phase 0 item.
- Apply migration 025 after 024. Validation: production build, TypeScript, changed-file lint and 36 platform tests, including all source kinds, current versions, active reviewer changes, source lifecycle gates, completion exclusion, staff/client/anonymous isolation, read-only privileges and safe exact source URLs. Signed-in focus, keyboard, mobile and multi-form navigation checks remain.
- Next planned batch: Calendar agenda using authoritative project dates, followed by Notifications.

## Notifications patch — October 15, 2026

Based on `bivi-sidebar-phase0` at `08115f364111edd362fade55733d75d039eff15b` (Add staff approvals queue). Apply this patch to the local checkout; it does not change the deployed database or push a branch.

### Apply

1. Download `bivi-notifications.patch` and run, from your `bivi-git` directory:

   ```sh
   git apply --check "$HOME/Downloads/bivi-notifications.patch" && git apply "$HOME/Downloads/bivi-notifications.patch"
   ```

   The check must pass before anything is applied. If it fails, keep your existing files and share the error so the patch can be adapted to your local changes. Do not reset or discard local work. No branch switch is required.

2. Open `supabase/migrations/202610150026_staff_notifications.sql` and run its complete contents in the intended Supabase project's SQL editor. This requires migrations through `202610140025_approvals_queue.sql`. Migration 026 creates two per-user tables, two read-only views plus a source view, and three invoker-rights RPCs. It makes no changes to task, project, or approval state. On macOS you can copy it with:

   ```sh
   pbcopy < supabase/migrations/202610150026_staff_notifications.sql
   ```

3. Run `npm run build`. In your local staff workspace, check the bell beside search, View all, Preferences, Mark read/unread, and Mark all read. Assign a task to your staff account to exercise task notifications. Test a due date within seven days and an approval waiting on staff. Open a project and confirm its record stays hidden in the sidebar until Projects is explicitly expanded.

### Behavior

- The bell is in the top bar on desktop and mobile, with a blue unread dot. Notifications remain searchable but have no sidebar entry, including the collapsed/mobile navigation.
- Workspace appears before Clients & Sales in all sidebar layouts. Overview is always visible. Group headings have lighter text. Record types start collapsed; opening a tab never expands one. Expander arrows appear on hover or keyboard focus and remain visible on touch devices.
- Notifications are an actionable inbox based on `staff_my_tasks` and `staff_approvals`: assigned unfinished tasks, deadlines within seven days/overdue, and approvals waiting on staff. Approval alerts are workspace-wide for authorized staff, while task alerts use verified assignment to the current account.
- Existing actionable work is included on first use. Resolved, removed, reassigned, or completed-source items leave the inbox. This version is not a historical event stream, email service, or push delivery service. A task's assignment alert keeps its stable identity when revisited or reassigned back to the same account.
- Deadline keys distinguish upcoming, today, and overdue and include the due date. Approval keys include source identity, version, status, and reviewer eligibility. Repeated fetches and unrelated project saves do not generate duplicate unread items.
- Read state and category/timezone preferences are account-scoped in Supabase under RLS. Disabling a category hides its items and unread count without clearing prior read state. Mark all read covers every enabled category, including items beyond the current page.
- The full inbox has category/unread filters and server pagination (25 rows). Visible tabs refresh every 60 seconds and on returning to the tab; opening the bell refreshes its count. Reads/settings refresh open inboxes immediately.
- Resolved read markers older than 90 days are pruned during read mutations; currently actionable markers are retained. Timezone defaults to America/Chicago and can be changed to a valid IANA name.
- Source links reuse existing task/approval deep-link helpers; all workflow changes remain in their authoritative editors. All API reads require verified staff access, mutations require same-origin requests, and all responses are uncached.

### Validation

- `npm run typecheck`: passed.
- Production `npm run build`: passed (178 pages generated; existing Tailwind/help-page warnings remain).
- All 37 platform tests: passed, including the migration/RLS tests for staff isolation, deduplication, preferences, pagination, read-all, invalid timezone, resolved work, and unauthorized access.
- Browser visual/interaction verification remains pending: the available browser download returned a truncated archive. No preview-only route or authorization bypass is included in this patch.

Calendar is still marked unbuilt in this GitHub baseline. If it was added locally in the previous chat, retain that work; this patch does not implement Calendar.

## Calendar agenda — October 15, 2026

Based on `bivi-sidebar-phase0` at `6ff72ad` (the full notifications implementation). This patch adds the real `/calendar` staff destination and leaves the top-bar notifications placement intact.

### Apply locally

1. Download `bivi-calendar.patch` into Downloads. From the local `bivi-git` directory, run:

   ```sh
   git apply --check "$HOME/Downloads/bivi-calendar.patch" && git apply "$HOME/Downloads/bivi-calendar.patch"
   ```

   A failed check leaves files untouched. Share the error to adapt the patch to local edits; do not discard existing work.

2. Run the complete `supabase/migrations/202610150027_staff_calendar.sql` in the intended project's Supabase SQL editor, after migrations through 026. On macOS, copy it using:

   ```sh
   pbcopy < supabase/migrations/202610150027_staff_calendar.sql
   ```

3. Run `npm run build`, then open Calendar in the local staff workspace. Verify next/previous month, date range, search, type/status/project/scope filters, and source links. Include a milestone beyond the first six to check pagination and focus. The patch itself does not run a migration, modify source records, or publish a deployment.

### Behavior and scope

- The initial version is a server-rendered agenda of saved project task and milestone due dates. A month selector provides previous/next/this-month navigation. Date range filters can span up to 366 days apart; invalid/reversed ranges show a notice and fall back to the selected month.
- All workspace dates is the default. My assigned tasks uses the verified staff assignment ID, not owner text, and excludes milestones. Outstanding items from active/on-hold projects are the default; completed items/projects are available through filters.
- Source data comes from a read-only `security_invoker` view over the existing project JSON and task-control tables. Existing source RLS remains authoritative. Clients, inactive staff, and anonymous users cannot read the staff agenda. No new write permissions or parallel task/milestone tables are introduced.
- Every row has a stable type/project/source identity. Date grouping and server pagination use stable ordering, at 25 results per page. A date with many items can continue onto another page.
- Initial month/today/overdue labels use the saved notification timezone unless a URL timezone is chosen. The calendar selection does not overwrite the saved preference. Due dates remain calendar dates; they have no invented meeting time and do not move across days when displayed in another timezone.
- Undated tasks/milestones remain in their projects. The agenda does not introduce meeting creation, external-calendar sync, or timed-event storage.
- Task links reuse existing task selection. Milestone links now select the correct milestone page, focus the source row, and retain project tab identity. Removed milestones show a friendly notice and the current plan. Existing authoritative save/revision checks and unsaved-change navigation guards remain in place.

### Verification

- All 40 platform tests pass, including calendar source projection, staff/client/inactive/anonymous access, read-only permissions, assignments, source updates/removal, month boundaries, leap dates, invalid ranges, timezone midnight behavior, and encoded task/milestone links.
- Production build passes. Browser visual and live-project checks remain pending local application of migration 027.

## Shared Files directory — October 15, 2026

Based on `bivi-sidebar-phase0` at `de497fa` (Calendar agenda). Adds the real `/files` destination under Workspace.

### Apply locally

1. Download `bivi-shared-files.patch` into Downloads and run from `bivi-git`:

   ```sh
   git apply --check "$HOME/Downloads/bivi-shared-files.patch" && git apply "$HOME/Downloads/bivi-shared-files.patch"
   ```

   A failed check leaves local files unchanged. Share the error instead of discarding local work.

2. Run the complete `supabase/migrations/202610150028_staff_files.sql` in the intended project's Supabase SQL editor after migrations through 027. On macOS:

   ```sh
   pbcopy < supabase/migrations/202610150028_staff_files.sql
   ```

   Apply this migration before using Files or staff downloads: staff download authorization now writes its access record through the new RPC, including from existing project file pages. Client downloads retain their previous authorization path.

3. Run `npm run build`. In the local staff workspace, test Files, search, uploader/type/sharing/state/date filters, project/company/uploader scope links, a raster-image preview, a small TXT preview, and a PDF/ZIP download. Open the source project's File history to verify preview/download authorization entries. Also test a withdrawn file, which should have only its project link available.

### Functionality

- Staff can discover files across all projects using real source metadata. Ready files are the default; pending verification and withdrawn records are available via state filters, with no preview/download controls for those states.
- Search covers filename, project/company names and public IDs, and uploader labels. Filters include type, sharing, uploader (me/staff/client/former or a selected account), and inclusive UTC upload dates. Each result provides exact project/company/uploader scope links. Server pagination is 25 rows, with stable ordering by upload date, filename, size, or project.
- Company relationships use the current company assigned to the source project. Uploader labels use staff public IDs or client profile names/public IDs. The staff-only label helper avoids granting direct reads of staff account tables; it exposes no authentication email or credentials and returns no data to clients/inactive staff.
- Image previews support PNG/JPG/WebP. TXT previews support files up to 256 KiB, displayed as escaped React text. PDFs, ZIPs, and larger TXT files use downloads. HTML, SVG, and arbitrary MIME types cannot request inline preview URLs.
- Both preview and download routes use the existing verified staff access, same-origin checks, file/project binding, ready-state checks, and private Storage authorization. URLs expire after 60 seconds and are created only on demand; the directory view contains no object path or signed URL. API responses remain uncached.
- Staff preview/download authorizations are logged in `project_file_history` with actor and the current revision. These entries record URL authorization, not proof that a browser completed the byte transfer. An audit failure withholds the URL. File state, sharing, and revision remain unchanged by access logging.
- A signed URL already issued retains the existing short validity window. Refresh preview requests a new authorization and rechecks the current source state.
- Upload, finalize, share/private, and withdrawal actions remain in the project's existing file exchange, with its existing quotas, storage restrictions, revisions, and audit trail. Global file discovery introduces no second mutation workflow.

### Database and verification

Migration 028 adds a security-invoker directory view, a staff-checked uploader-label helper, a staff-checked access-log RPC, and directory indexes. It preserves the private bucket, source RLS, client isolation, and existing file limits. No live migration, push, or deployment was performed while preparing the patch.

Production build and targeted ESLint pass. All 43 platform tests pass, including private/shared access isolation, staff/client/inactive/anonymous access, preview allowlists, date boundaries, source-bound signing, authorization logging, and audit-failure behavior. Browser visual and live-Storage verification remain for local testing after migration 028.

## Forms directory and record attachment — October 15, 2026

Based on `bivi-sidebar-phase0` at `9210ddd` (Shared Files). Adds the real `/forms` destination under Resources.

### Apply locally

1. Download `bivi-forms.patch` into Downloads and run from `bivi-git`:

   ```sh
   git apply --check "$HOME/Downloads/bivi-forms.patch" && git apply "$HOME/Downloads/bivi-forms.patch"
   ```

   A failed check leaves files unchanged; share the error to adapt the patch rather than discarding local work.

2. Run the complete `supabase/migrations/202610150029_staff_forms.sql` in the intended project's Supabase SQL editor after migrations through 028. On macOS:

   ```sh
   pbcopy < supabase/migrations/202610150029_staff_forms.sql
   ```

3. Run `npm run build`. In the local staff workspace, open Forms and test search, type/status/owner/response filters, pagination, and the source links. Choose Attach a form, find an editable onboarding record, choose Questionnaire or Information request, enter a title and questions, and save in the existing onboarding editor. Confirm the new form appears in Forms and the client portal, and that submitted responses retain the existing staff acceptance flow. Verify unsaved new-form edits prompt before leaving.

### Audit findings and scope

- The public Get Started flow persists project inquiry submissions through `/api/inquiries`. Those records appear as submitted intakes; inquiry qualification remains a separate source-record status.
- Personalized onboarding already persists questionnaires, information requests, and assessment requirements, including responses, revisions, owner, due date, service/phase association, staff review, and history. These are the reusable working form sources for this phase.
- Help contact forms with simulated client-side submission behavior are excluded from the working catalog. This patch does not make them production submission endpoints.
- Project briefs remain in the existing drafting/review workflow and Approvals queue. They are not duplicated as general client questionnaires.
- This is a source-backed directory and attachment path. A standalone multi-field builder, schema editing, standalone form URLs, and a versioned form-template library remain separate work.

### Functionality

- The catalog links to actual inquiry submissions, questionnaires, information requests, and existing assessments. The public intake opens in a new tab on the configured public origin.
- Staff can search by form title, contact, company, project name/public ID, then filter by type, source status, owner, required/optional, response presence, or one inquiry. Queries paginate on the server at 25 rows with stable sorting.
- The directory exposes status metadata, not copied answer bodies, intake payloads, prompts, staff notes, or a second review state. Open a record to read its actual response and take existing review actions.
- Attach a form lists editable onboarding records using server-side search and pagination. Choosing one only opens its existing editor with the selected type; it does not create or send anything on GET. Saving uses the existing same-origin, staff-authorized onboarding item endpoint and mutation function, with existing completion locks, validation, audit history, and communication behavior.
- New custom requirements can now explicitly be Questionnaire or Information request. Other existing requirement types remain editable through their existing controls. The new form defaults to client ownership, required, and discovery phase; staff can edit its source requirement afterward.
- Unsaved new-form title, prompt, and type changes register with the existing workspace navigation guard. Saving another requirement no longer clears an unsaved new-form draft. Successful creation clears only the new-form draft and refreshes the source.
- Source links select and focus the exact requirement. Removed requirements show a notice with the current onboarding list. Completed onboarding remains visible in the directory and must be reopened through its existing workflow before attachment/editing.

### Database and verification

Migration 029 adds two read-only `security_invoker` views and a directory index. It adds no form/answer tables, assignment state, or mutation privileges. Source RLS remains authoritative; client, inactive-staff, and anonymous access to the global staff directory is excluded.

Typecheck, targeted ESLint, and production build pass. All 45 platform tests pass, including source projection, client submission, revision conflicts, staff acceptance/history, completion locks, unauthorized visibility, and encoded source/attachment links. Browser visual and live-project checks remain for local testing after migration 029. No live migration, push, deployment, or external message was performed while preparing this patch.
