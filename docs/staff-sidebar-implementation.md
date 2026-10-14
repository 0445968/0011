# Staff sidebar implementation

Base: `bivi-approvals-qa-handoff`, commit `3aa5f3667f18af2236615cfc42edaf4ef1f941e6`.

## Foundation batch

- Shared destination registry includes ID, label, clean staff URL, icon, staff permission requirement, implementation status and group. Only existing destinations are visible. Middleware, directory highlights, desktop/mobile navigation and search use the registry. Server authorization remains in the workspace layout and source routes; registry permissions are descriptive, not security enforcement.
- Canonical record identity treats `lead` as `inquiry`, normalizes UUID case and deduplicates persisted records. Old storage keys remain compatible. Record sections and query strings remain in the last visited tab URL.
- Inquiries and Projects have Pinned, Open and Bookmarked subgroups. Open bookmarks appear once in the sidebar, and bookmarks survive closing. Pinned tabs cannot close. Capacity management cannot evict a pinned tab or the newly visited record.
- Neutral record tabs, 44px directory and nested-record targets, persistent collapse footer, and shared record icons/labels.
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
