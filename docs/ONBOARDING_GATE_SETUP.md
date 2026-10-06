# Agreement, deposit and onboarding gate

This incremental batch requires the catalog/intake, leads workspace and proposals/accepted-scope batches. Apply `Bivi-Proposals-and-Scope.patch` first if it is not yet present. No new environment variables are required.

## Setup

1. In the repository with all earlier batches applied, run `git apply --check Bivi-Onboarding-Gate.patch`, then `git apply Bivi-Onboarding-Gate.patch`.
2. Apply only `supabase/migrations/202610060004_onboarding_readiness.sql` to the same Supabase project. Migrations 001–003 must already be applied. Earlier migrations should not be rerun.
3. Restart the application. Sign in as active staff, open an inquiry's proposals, and follow **Agreement, deposit and onboarding gate**. The page requires an accepted proposal version before recording evidence.
4. Record the signed agreement's document/reference location, client signatory and signed date. These are staff records of an agreement completed through your existing process.
5. Record the deposit amount, three-letter currency code, receipt/transaction reference and received date. The amount must be positive and use up to two decimal places. This amount is evidence of an actual receipt; the application does not compare it with free-text proposal terms, calculate a deposit, or connect to a payment provider. Staff must verify the amount against the agreed terms.
6. If the agreed commercial terms authorize proceeding without a deposit, explicitly select Waived and record the reason. There is no default waiver.
7. Save records, then confirm **Release for onboarding**. The server checks active staff, accepted scope, qualified inquiry, signed agreement and received deposit or explicit waiver. It uses saved records only. Unsaved edits must be saved first.

Readiness becomes Ready for onboarding. This batch records the prerequisite gate; the client checklist, kickoff preparation and project activation follow in the next batch. It does not create a client account, send email, sign a document or charge a payment.

## Corrections and holds

Ready records cannot be edited. Enter a reason and choose **Place on hold** before making corrections. The readiness state returns to Pending / on hold. Update and save evidence, then release again when the prerequisites have been verified.

Every save, release and hold creates an atomic history event containing the exact evidence snapshot, accepted proposal version, staff actor and timestamp. Hold reasons are retained. Failed or stale commands create no history. The page shows the latest 50 events; older history remains in the database. A changed or uncertain request requires reloading before retrying.

Readiness is a separate staff workflow state. It does not change inquiry qualification or accepted scope. If the inquiry is later declined, staff should also put readiness on hold. Future onboarding/project APIs must recheck readiness and inquiry state at their own transition, rather than treating this page's earlier release as permanent authorization.

## Permissions and validation

Proposal-version linkage is chosen by the database from the accepted scope, rather than a client-supplied version. Anonymous users and authenticated nonstaff cannot read readiness or history. Authenticated clients cannot directly write either table. The staff RPC checks authorization, locks the parent inquiry, compares the revision and records the change and history together.

Signed/received statuses require their supporting references and dates. Dates must exist and cannot be in the future. Pending records may be saved without complete evidence. Waived requires an explicit nonblank reason. Currency is a three-letter uppercase code; it is not validated against an external currency list.

Local verification covers TypeScript, production build with test Google Fonts responses, SQL permissions, dates/amounts/evidence, incomplete-gate denial, revision conflicts, release/hold/correction flows and audit snapshots. A production browser check uses a local Supabase simulation. Real Supabase credentials are unavailable here: verify a live staff login and save → release → hold flow in your configured environment before operational use.

Resources and Helpdesk remain outside the current scope.
