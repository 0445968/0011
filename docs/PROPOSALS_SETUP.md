# Proposal and accepted-scope setup

This incremental batch follows the protected leads workspace. Apply the leads batch first. No new environment variables are required.

## Install and verify

1. Apply `Bivi-Proposals-and-Scope.patch` to the repository with the previous leads batch already present. Run `git apply --check` first, then `git apply`.
2. Apply only `supabase/migrations/202610060003_inquiry_proposals.sql` in the same Supabase project. Both earlier migrations must already be applied. Existing inquiries and reviews remain intact.
3. Restart the configured application. Sign in at `/admin/login`, open an inquiry, mark it Qualified, then choose **Open proposals and accepted scope**.
4. Review the suggested catalog terms, quantities, deliverables and exclusions. Complete client inputs, revision/approval terms, schedule/dependencies, and explicit fee/currency/payment terms. Use “None” when a section does not apply. Custom inquiries may have no catalog items; write their scope explicitly.
5. Create/save a draft. Issue the saved version after review. Issuance records a staff workflow state; it does not send a proposal or email. Share the scope through your existing process.
6. After receiving client approval, enter the approver, acceptance date and a verifiable evidence reference, then confirm **Record accepted scope**. This records external approval manually, rather than authenticating the client. Keep the actual evidence in your established records.
7. Check that the exact accepted version is displayed and no further editing or version creation is available. Agreement/deposit references and project activation come in the next batch.

## Version rules

A draft can be edited. Each save uses a revision check, so an old tab cannot overwrite a newer save. Save changes before issuing. Issued content is fixed; create a new numbered draft for a changed offer. Issuing that newer version marks older issued versions Superseded. Creating a newer draft immediately prevents accepting older versions.

Acceptance is allowed only on the latest issued version of a qualified inquiry, with an approver, valid nonfuture date and evidence reference. An accepted version is fixed and prevents additional proposal versions for that inquiry. Future changes to accepted scope need a separate change workflow; this batch deliberately provides no acceptance-reversal shortcut. A declined issued version can be followed by a new draft.

Rows retain the exact saved service names, quantities, blueprint versions and scope text. Subsequent catalog edits do not change saved proposal terms. Catalog defaults remain draft suggestions. This batch uses free-text commercial terms; it does not calculate totals or initiate payments.

## Permissions and checks

Only active staff can read proposals under RLS or call the command function. Authenticated clients cannot directly insert, update or delete proposal rows. Each command verifies staff membership and serializes on the parent inquiry. Create retries use the expected latest version; saves and lifecycle actions use an expected revision. A timeout or conflict requires reloading before retrying.

Acceptance records the authenticated staff actor, date, approver and evidence with the same immutable scope. It does not register a client, execute an agreement, verify a payment, create an active project or send notifications.

Local validation covers TypeScript, production compilation with test Google Fonts responses, staff permissions, required issue fields, malformed payloads, revision conflicts, immutable issued/accepted content, version supersession and acceptance evidence/date rules. A production browser check using a local Supabase simulation also verifies unauthorized redirects, forged-token rejection, draft creation, issuance, acceptance, the locked editor and mobile width. The existing demo font download cannot be verified in this environment. Real Supabase credentials are unavailable here; confirm a live staff login and the create → issue → accept workflow in your configured environment before operational use.

Resources and Helpdesk remain outside the current roadmap. The next stage records agreement/deposit references and prepares the onboarding gate.
