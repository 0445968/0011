# Bivi Projects R2: safe work-plan drafts

Baseline: D1a–D1c plus Projects Refinement R1, on `bivi-dashboard-overhaul`.

- Staff work plans autosave to a **private Supabase row per staff account and project**, approximately 1.2 seconds after editing pauses. Auto-save is a draft, not a published project update.
- **Save draft** forces a draft write. **Save all** validates and commits the entire work plan with the existing optimistic `expectedRevision`; it does not reload the browser page. **Discard changes** resets the local edits and removes the saved draft after confirmation.
- Returning to the work plan shows a recoverable draft prompt. It never overwrites the current project or the local user's typing automatically. A stale base revision raises a conflict; it cannot be published over someone else's newer project update.
- When the draft store is unavailable, the editor shows a warning and retains the existing unsaved-navigation/beforeunload guard; it does **not** claim that an auto-save succeeded.
- A successful Save all removes the draft; if cleanup fails, publishing is still confirmed and the UI shows the cleanup error. Any unconfirmed project save keeps its work in memory and its draft in storage.
- Project lifecycle transitions retain the existing reload behavior; R2 targets ordinary work-plan editing and draft persistence.
- SQL migration `202610160031_project_workplan_drafts.sql` must be run in Supabase *before* browser testing this patch. There is no service-role bypass. Database RLS isolates drafts by authenticated staff user, and server endpoints use the existing Bivi staff session and same-origin protection for mutations.
- The draft schema accepts an empty title while typing, but normal published saves still use strict project validation. No client-facing draft access is provided.

## Review before release

1. Open a project as staff, edit several tasks, pause for autosave, refresh and restore the draft. Confirm another staff account cannot see it.
2. Use **Save draft** and navigate away; return, restore, and **Save all**. Confirm the existing project revision increments and no browser reload is needed.
3. Open the same project in two browsers, save a newer project revision in one, then attempt to save stale edits in the other. Confirm a conflict warning and recoverable private draft, never a silent overwrite.
4. Simulate lost connectivity, a 409 response, or an unavailable draft table; check visible errors and navigation warnings.
5. Edit while draft auto-save is in flight; ensure the newest data is persisted. Check a completed project remains read-only.
6. Test the unsaved-change dialog, tab switches, local navigation, refresh, deletion, retry, light/dark and narrow layouts.

This is a functional draft foundation, not milestone-driven autosave, task subtasks, or an activity/audit overhaul. The rest of the roadmap remains pending. Do not merge into `restore` without signed-in and two-session acceptance testing.
