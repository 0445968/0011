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
