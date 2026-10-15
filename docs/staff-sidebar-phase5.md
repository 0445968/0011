# Staff workspace: Phase 5 scope and release checks

Audit baseline: `bivi-sidebar-phase0` at `6e3e570` (October 15, 2026).

Phases 0–4 have implementation patches. This does not certify browser accessibility, live Storage, account-cookie behavior, or a complete live inquiry-to-handoff journey. The remaining release checks below must have evidence before promotion.

## Proposed business tools

The existing system follows intake → qualification → accepted proposal → agreement/deposit readiness → onboarding → project activation → delivery/review → QA → handoff/closeout. Business tools should reference those records and their existing gates.

| Tool | Available source today | First useful scope | Requires a later decision |
|---|---|---|---|
| Billing | `inquiry_readiness` and its history record deposit amount, currency, received/waived status, references and dates; proposal fees are prose | Staff-only invoice and recorded-payment ledger linked to company, inquiry and optional project; explicit deposits and outstanding balances | Invoice issuer/numbering, supported currencies, tax/discount/rounding rules, who may issue/void/record payments, external accounting ownership |
| Reports | Inquiry decisions, proposal versions/statuses, activated projects, task JSON/control assignments, approval and closeout records | Read-only pipeline, project-state, actionable-work and staff-assignment counts with source links | Reporting timezone and cohort defaults, agreed conversion definition; time/cost tracking before efficiency or profitability claims |
| Team | Active staff membership, stable staff public IDs, task assignment controls/history, guarded staff-assignment lookup | Read-only active-staff directory and current assigned-work counts; open the authoritative project to reassign work | Who administers staff, invitation/recovery policy, whether distinct roles are needed, working hours/availability before capacity calculations |

These are proposed scopes, not implemented destinations. Billing, Reports, and Team stay out of live navigation until backed by working authenticated pages.

### Billing: recommended ledger design

1. Use company identity from the existing Companies workspace; retain inquiry/project IDs as references. Snapshot issued invoice identity and lines so later company/catalog edits cannot rewrite issued documents.
2. Store amounts exactly, with an explicit currency and its configured decimal precision. Never parse proposal `fees` prose or a draft catalog price into an authoritative balance. Never aggregate mixed currencies into one total.
3. Keep a draft editable with revision checks. Issuing freezes a version. Issued corrections use an explicit auditable correction/void path; deleting an issued invoice is not the correction workflow. Define allowed corrections before implementing issuance.
4. Record payments as separate audited entries with an idempotency key/reference, date, amount, currency, actor and invoice allocation. Derive outstanding amounts from issued lines and valid allocations, rather than a freely editable “paid” checkbox. Define reversals, refunds and overpayments before exposing those actions.
5. Existing deposit evidence remains the authoritative readiness gate. A ledger may link that evidence but must not automatically duplicate it as a new payment. Do not silently release onboarding readiness when an invoice is marked paid. Any later bridge needs an explicit transaction and audit strategy.
6. Start with staff-entered records only after the permissions and accounting rules above are agreed. Hosted checkout, card handling, automatic charges, recurring collection, payment webhooks, emails and client billing access are separate integrations. Do not imply that a recorded payment has been verified by a provider.

Acceptance: a permitted operator can create a draft, issue an immutable snapshot, record a partial payment once, see the remaining amount, and trace corrections to history. Stale writes, duplicate submissions, client/anonymous requests and unauthorized staff must fail without changing readiness or existing accepted scope.

### Reports: implementable before a financial integration

- Pipeline: count inquiry records once by current qualification status, with links to the filtered inquiry directory.
- Proposal outcomes: distinguish proposal-version counts from inquiry-level outcomes. Default inquiry-level summaries to the latest version; never count several versions as several converted clients. Show accepted-scope count separately from issued/draft counts.
- Conversion: do not publish an unlabeled percentage. A proposed first definition is accepted inquiries divided by inquiries with an issued or accepted proposal in a clearly labeled cohort; finalize the cohort/date rule before exposing it. A denominator of zero displays “Not available.”
- Delivery: count activated projects by actual state and lifecycle phase. Define completed work from recorded completion/closeout facts. A last-update timestamp does not measure time spent.
- Workload: unfinished Bivi-owned tasks from project task JSON joined by task ID to `project_task_controls.assigned_staff_id`; separate unassigned work and inactive assignments. Do not treat free-text owner labels as staff identity. Exclude completed projects by default and show the filter.
- Actionable work: reuse the Approvals queue's source/category/status rules. A queue entry is an action item, not necessarily a distinct project or a failed delivery.
- Dates: label each metric's date field and timezone, use explicit half-open timestamp windows where appropriate, and retain date-only deadlines as dates. Show unknown/missing values separately.
- Run aggregates on the server under verified staff authorization and scoped database access. Paginate drilldowns; do not load a capped directory page and present its row count as the global total. No financial revenue/profit estimates or CSV export in the first version.

Acceptance: fixture totals reconcile to source records, versioned proposals do not inflate inquiry counts, zero/missing cases are defined, date-boundary behavior is tested, and client/inactive/anonymous users cannot retrieve aggregates.

### Team: directory before administration

- Current membership is active/inactive, not a multi-role organization model. Existing authenticated users cannot directly select or mutate `inquiry_staff`. Keep that restriction.
- Reuse the guarded staff-assignment lookup for active identity labels or add a similarly guarded, paginated directory RPC. Return only needed public ID/label and aggregate assignment data; never return tokens or broad `auth.users` records.
- Show counts of assigned unfinished Bivi tasks and overdue/blocked work, with stable project/task links. Counts describe workload volume; without estimates, availability or leave data they do not establish capacity or utilization.
- Reassign through the existing revision-checked assignment endpoint. Staff deactivation already clears assignments and appends task history; directory work must preserve this behavior.
- Account invitations, activation/deactivation and role grants require an explicit organization-administrator capability first. Do not allow any currently active staff member to grant themselves a new administration role. Keep service credentials on the server.

Acceptance: only active staff can view the directory; client/anonymous requests fail; task counts match authoritative assignments; stale reassignments fail; deactivation preserves its existing cleanup/history behavior.

Recommended implementation order after the release checks: read-only Reports → read-only Team → Billing once its workflow decisions are resolved. Build one tool per patch and activate its navigation only when functional.

## Release evidence matrix

Use realistic disposable sample records in a non-production Supabase project. Keep identities and access grants separate: active staff A, active staff B, inactive staff, assigned client reviewer, assigned client viewer, unrelated client and signed-out browser.

| Journey/check | Evidence required | Current evidence |
|---|---|---|
| Qualification → proposal → agreement/deposit → onboarding → activation | One realistic sample completes the gates; skipped/stale steps fail; accepted scope snapshots remain unchanged | Isolated database regression coverage exists; live browser journey pending |
| Delivery → client review → QA → release → receipt → handoff → closeout | Staff and client use their own accounts; wrong-role actions fail; required gates cannot be skipped; histories record actions | Database approvals/access tests exist; live browser journey pending |
| People/company/client relationships | Search, dedupe conflicts, assignments, linked-record titles, source links, filters and pagination reconcile | Database/navigation tests exist; browser checks pending |
| File access | Private/shared/withdrawn states, preview limits, expired signed URL, download audit, client and unrelated-client isolation | Database/access tests exist; real Storage and URL-expiry checks pending |
| Revision conflicts | Two sessions edit the same source; stale save returns conflict and keeps the draft for review | Database tests exist; two-browser exercise pending |
| Notifications/calendar | Assignment/due/approval changes appear once and disappear when resolved; read state and account preferences persist; exact source links work across pagination | Database/link tests exist; live account checks pending |
| Templates/forms/services | Template owner/history/privacy, form attachment source, canonical service snapshot and explicit draft saving | Database/helper tests exist; browser checks pending |
| Personal workspace | Light/dark, compact/comfortable, collapsed/expanded, hidden tab bar, record order, pin/unpin/bookmark/reopen, reload and second account | Build/navigation coverage exists; browser persistence checks pending |
| Unsaved edits | Stay, discard and save behave correctly for record/tab/directory navigation; a failed save leaves the draft | Manual multi-editor/browser checks pending |
| Surface/auth isolation | Staff directories redirect signed-out users; APIs deny anonymous/foreign-origin probes; public/client hosts hide staff APIs | Expanded `verify:launch` automated probes; live preview deployment check pending |
| Accessibility/responsiveness | Keyboard-only operation, visible focus, labels, announced errors, hover-only expander also usable by focus/touch, 44px navigation targets, mobile/overflow/zoom | Manual browser and assistive-technology checks pending |
| Performance | Directory query timings with realistic volume; explain plans/index review, bounded responses, large project/task sets | Pagination exists; realistic-load profiling pending |

Do not check off a live/browser row based only on a production build or mocked verifier tests. The automated launch probes intentionally omit cookies and send only empty invalid write bodies; they do not create accounts, invoices, inquiries, files or messages.

## Automated launch checks

`npm run verify:launch -- https://YOUR_PUBLIC_HOST` checks configured public/client/staff origins. `INQUIRY_APP_URL`, `NEXT_PUBLIC_BIVI_APP_URL` and `NEXT_PUBLIC_BIVI_STAFF_URL` must point to the same deployed environment. A single preview URL without separately configured surface hosts is insufficient to validate all three surfaces.

The checker now covers every implemented staff directory, People/Companies/Notifications reads, newer staff mutations, public/client hiding of staff APIs, login form/noindex metadata and error-only/no-store responses. Regression tests exercise success, wrong-host redirects, missing authorization, leaked fields, cacheable errors and network failures. It preserves the existing client-login redirect expectations.

Run against a preview containing these patches before promotion. Do not interpret failures against an older production deployment as evidence that this branch's routes are broken. `verify:deployment` remains the older single-origin/internal-route checker; use `verify:launch` for the separated-domain topology.

## Compare and promote through review

Observed October 15: `restore` is `33d701f`; development is `6e3e570`; common ancestor is `3aa5f36`. `restore` has its production merge commit beyond the common ancestor. The client-login verification correction `e527d15` is in the shared history, and development has no baseline diff in `app/client/login/page.tsx`, `lib/portal/auth.ts`, `lib/site/origins.ts` or `scripts/verify-launch.mjs`. This patch extends that last script while retaining the existing expected client redirect paths.

Other client-related differences exist in profile-image endpoints, portal layouts/profile data, and middleware. Review these alongside the staff changes; the login comparison is not blanket approval of all client behavior.

Before merging, fetch again and recompute the comparison; these hashes are audit evidence, not permanently current branch heads. On a separate review branch based on the latest `restore`, merge the latest development branch, resolve conflicts while preserving production-only changes, run the checks and preview journeys, and open a PR targeting `restore`. Review the resulting diff and deployment configuration. Do not reset `restore` to development, force-push production, or merge/deploy merely because this patch was applied.

No production merge or deployment is included in this patch. Required configuration, migrations and storage policies must be verified in the target environment; record outcomes for each pending matrix row before approving release.
