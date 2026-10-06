'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import {
  proposalBodySchema,
  proposalStatusLabels,
  type ProposalBody,
} from '@/lib/proposals/schema';

import type { ProposalRecord } from '@/lib/proposals/data';

const fields = [
  ['summary', 'Project summary', 4000],
  ['deliverables', 'Deliverables and scope', 6000],
  ['exclusions', 'Exclusions', 4000],
  ['clientInputs', 'Required client inputs', 4000],
  ['revisions', 'Included revisions and approval terms', 2000],
  ['schedule', 'Schedule and dependencies', 2000],
  ['fees', 'Fees, currency and payment terms', 4000],
] as const;

const naFields = new Set<keyof ProposalBody>([
  'exclusions',
  'clientInputs',
  'revisions',
]);

type ProposalWorkspaceProps = {
  id: string;
  qualified: boolean;
  seed: ProposalBody;
  proposals: ProposalRecord[];
};

export function ProposalWorkspace({
  id,
  qualified,
  seed,
  proposals,
}: ProposalWorkspaceProps) {
  const router = useRouter();

  const latest = proposals[0];

  const draftProposals = proposals.filter(
    (proposal) => proposal.status === 'draft'
  );

  const completedProposals = proposals.filter(
    (proposal) => proposal.status !== 'draft'
  );

  const latestDraft = draftProposals[0];

  const latestIssued = proposals.find(
    (proposal) => proposal.status === 'issued'
  );

  const accepted = proposals.some(
    (proposal) => proposal.status === 'accepted'
  );

  const [body, setBody] = useState<ProposalBody>(
    latestDraft?.body ?? latest?.body ?? seed
  );

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [blocked, setBlocked] = useState(false);

  const [approver, setApprover] = useState('');
  const [acceptedOn, setAcceptedOn] = useState('');
  const [evidence, setEvidence] = useState('');

  const draft = latest?.status === 'draft';

  const dirty =
    Boolean(draft && latest) &&
    JSON.stringify(body) !==
      JSON.stringify(latest?.body);

  const proposalValid = useMemo(() => {
    return proposalBodySchema.safeParse(body).success;
  }, [body]);

  const requiredScopeComplete = useMemo(() => {
    return fields.every(([key]) => {
      const value = body[key];

      return (
        typeof value === 'string' &&
        value.trim().length > 0
      );
    });
  }, [body]);

  const canIssue =
    Boolean(draft) &&
    qualified &&
    !dirty &&
    proposalValid &&
    requiredScopeComplete &&
    !busy &&
    !blocked;

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const acceptanceComplete =
    approver.trim().length > 0 &&
    acceptedOn.trim().length > 0 &&
    evidence.trim().length > 0;

  const acceptanceDateValid =
    acceptedOn.length > 0 &&
    acceptedOn <= today;

  const newerDraftExists =
    Boolean(latestIssued) &&
    draftProposals.some(
      (proposal) =>
        proposal.version >
        (latestIssued?.version ?? 0)
    );

  const canAccept =
    qualified &&
    Boolean(latestIssued) &&
    !newerDraftExists &&
    acceptanceComplete &&
    acceptanceDateValid &&
    !busy &&
    !blocked;

  function isNA(key: keyof ProposalBody) {
    const value = body[key];

    return (
      typeof value === 'string' &&
      value.trim().toUpperCase() === 'N/A'
    );
  }

  function toggleNA(
    key:
      | 'exclusions'
      | 'clientInputs'
      | 'revisions',
    checked: boolean
  ) {
    setBody((current) => ({
      ...current,
      [key]: checked
        ? 'N/A'
        : current[key]
              .trim()
              .toUpperCase() === 'N/A'
          ? ''
          : current[key],
    }));
  }

  async function command(
    action:
      | 'create'
      | 'save'
      | 'issue'
      | 'accept'
      | 'decline',
    target?: ProposalRecord
  ) {
    if (
      (action === 'create' ||
        action === 'save') &&
      !proposalBodySchema.safeParse(body).success
    ) {
      setMessage(
        'Check the title, service names and quantities, and field length limits.'
      );
      return;
    }

    if (action === 'issue') {
      if (!requiredScopeComplete) {
        setMessage(
          'Complete every required proposal field before issuing. Use the N/A option where available when a section does not apply.'
        );
        return;
      }

      if (!proposalValid) {
        setMessage(
          'Check the proposal title, service names, quantities and field limits before issuing.'
        );
        return;
      }

      if (dirty) {
        setMessage(
          'Save your changes before issuing this version.'
        );
        return;
      }
    }

    if (action === 'accept') {
      if (newerDraftExists) {
        setMessage(
          'This issued version cannot be accepted because a newer draft exists. Issue or resolve the newer version first.'
        );
        return;
      }

      if (!acceptanceComplete) {
        setMessage(
          'Complete the client approver, acceptance date and evidence reference before recording acceptance.'
        );
        return;
      }

      if (!acceptanceDateValid) {
        setMessage(
          'Acceptance date cannot be in the future.'
        );
        return;
      }
    }

    const prompts = {
      issue:
        'Issue this saved version? Its scope will become fixed. This records issuance only; it does not send a message.',
      accept:
        'Record this client acceptance against this exact version? The accepted scope will become fixed and no additional proposal versions can be created.',
      decline:
        'Record this issued proposal as declined? You can create a new proposal version afterward.',
    };

    if (
      action in prompts &&
      !window.confirm(
        prompts[action as keyof typeof prompts]
      )
    ) {
      return;
    }

    const commandTarget =
      target ??
      (action === 'accept' ||
      action === 'decline'
        ? latestIssued
        : latest);

    if (
      action !== 'create' &&
      !commandTarget
    ) {
      setMessage(
        'The proposal version could not be identified. Reload and try again.'
      );
      return;
    }

    setBusy(true);
    setMessage('');

    const payload =
      action === 'create'
        ? {
            action,
            expectedVersion:
              latest?.version ?? 0,
            body,
          }
        : action === 'save'
          ? {
              action,
              version:
                commandTarget!.version,
              expectedRevision:
                commandTarget!.revision,
              body,
            }
          : action === 'accept'
            ? {
                action,
                version:
                  commandTarget!.version,
                expectedRevision:
                  commandTarget!.revision,
                approver,
                acceptedOn,
                evidence,
              }
            : {
                action,
                version:
                  commandTarget!.version,
                expectedRevision:
                  commandTarget!.revision,
              };

    try {
      const response = await fetch(
        `/api/admin/leads/${id}/proposals`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify(payload),
          signal:
            AbortSignal.timeout(20000),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace('/admin/login');
        router.refresh();
        return;
      }

      if (response.status === 409) {
        setBlocked(true);
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            'The proposal could not be saved.'
        );
      }

      window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error &&
          error.name !== 'TimeoutError'
          ? error.message
          : 'The result could not be confirmed. Reload before retrying.'
      );

      if (
        error instanceof Error &&
        (error.name ===
          'TimeoutError' ||
          error.name === 'TypeError')
      ) {
        setBlocked(true);
      }
    } finally {
      setBusy(false);
    }
  }

  function renderVersion(
    proposal: ProposalRecord
  ) {
    return (
      <details
        key={proposal.version}
        className="group overflow-hidden rounded-xl border border-border bg-card"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              Version {proposal.version}
            </p>

            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {proposal.body.title}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">
              {
                proposalStatusLabels[
                  proposal.status
                ]
              }
            </span>

            <span
              aria-hidden="true"
              className="text-sm text-muted-foreground transition-transform group-open:rotate-180"
            >
              ↓
            </span>
          </div>
        </summary>

        <div className="border-t border-border px-4 py-4">
          {proposal.status ===
            'accepted' && (
            <div className="mb-5 rounded-xl border border-border bg-muted/30 p-4 text-sm">
              <p className="font-semibold">
                Accepted scope — fixed version
              </p>

              <p className="mt-2 text-muted-foreground">
                Approved by{' '}
                {proposal.accepted_by} on{' '}
                {proposal.accepted_on?.slice(
                  0,
                  10
                )}
              </p>

              <p className="mt-2 whitespace-pre-wrap break-words text-muted-foreground">
                Evidence:{' '}
                {
                  proposal.acceptance_evidence
                }
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                Recorded by:{' '}
                {proposal.recorded_by ||
                  'Account removed'}
                . Agreement/deposit and
                project activation are
                pending.
              </p>
            </div>
          )}

          {proposal.body.items.length >
            0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Services
              </p>

              <ul className="mt-3 space-y-2 text-sm">
                {proposal.body.items.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="flex flex-wrap items-baseline justify-between gap-2"
                    >
                      <span>
                        {item.name}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        × {item.quantity}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          <dl className="mt-5 space-y-4">
            {fields.map(
              ([key, label]) => (
                <div key={key}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </dt>

                  <dd className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {proposal.body[key] ||
                      'Not specified'}
                  </dd>
                </div>
              )
            )}
          </dl>
        </div>
      </details>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {!accepted && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-xl font-semibold">
            {draft
              ? `Edit draft version ${latest.version}`
              : latest
                ? 'Prepare the next version'
                : 'Prepare first proposal'}
          </h2>

          <p className="mt-3 text-sm text-muted-foreground">
            Catalog terms are draft starting
            points. Review every term before
            issuing.
          </p>

          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
            <p className="text-sm font-medium">
              All proposal fields are required
              before a version can be issued.
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Use the N/A option where
              available when a section does
              not apply. Save all changes
              before issuing.
            </p>
          </div>

          <fieldset
            disabled={
              busy ||
              blocked ||
              (!draft && !qualified)
            }
            className="mt-6 space-y-7 rounded-2xl border border-border bg-muted/50 p-5 shadow-sm sm:p-6"
          >
            <legend className="sr-only">
              Proposal scope
            </legend>

            <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
              <label
                htmlFor="proposal-title"
                className="mb-2 block text-sm font-medium"
              >
                Proposal title{' '}
                <span
                  aria-hidden="true"
                  className="text-destructive"
                >
                  *
                </span>
              </label>

              <Input
                id="proposal-title"
                maxLength={200}
                value={body.title}
                className="border-border bg-muted/20 font-mono shadow-inner"
                onChange={(event) =>
                  setBody({
                    ...body,
                    title:
                      event.target.value,
                  })
                }
              />
            </div>

            <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
              <h3 className="text-sm font-semibold">
                Service quantities
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Labels and quantities are
                saved with this version.
                Custom work can be described
                in the scope.
              </p>

              {body.items.map(
                (item, index) => (
                  <div
                    key={index}
                    className="mt-3 flex flex-wrap items-center gap-3"
                  >
                    <label className="min-w-[160px] flex-1">
                      <span className="sr-only">
                        Service {index + 1}{' '}
                        name
                      </span>

                      <Input
                        aria-label={`Service ${
                          index + 1
                        } name`}
                        maxLength={200}
                        value={item.name}
                        className="bg-muted/20 font-mono shadow-inner"
                        onChange={(
                          event
                        ) =>
                          setBody({
                            ...body,
                            items:
                              body.items.map(
                                (
                                  currentItem,
                                  itemIndex
                                ) =>
                                  itemIndex ===
                                  index
                                    ? {
                                        ...currentItem,
                                        name:
                                          event
                                            .target
                                            .value,
                                      }
                                    : currentItem
                              ),
                          })
                        }
                      />
                    </label>

                    <label className="w-24">
                      <span className="sr-only">
                        Service {index + 1}{' '}
                        quantity
                      </span>

                      <Input
                        aria-label={`Service ${
                          index + 1
                        } quantity`}
                        type="number"
                        min={1}
                        max={1000}
                        step={1}
                        value={
                          item.quantity
                        }
                        className="bg-muted/20 font-mono shadow-inner"
                        onChange={(
                          event
                        ) =>
                          setBody({
                            ...body,
                            items:
                              body.items.map(
                                (
                                  currentItem,
                                  itemIndex
                                ) =>
                                  itemIndex ===
                                  index
                                    ? {
                                        ...currentItem,
                                        quantity:
                                          Number(
                                            event
                                              .target
                                              .value
                                          ),
                                      }
                                    : currentItem
                              ),
                          })
                        }
                      />
                    </label>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setBody({
                          ...body,
                          items:
                            body.items.filter(
                              (
                                _,
                                itemIndex
                              ) =>
                                itemIndex !==
                                index
                            ),
                        })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                )
              )}

              <Button
                type="button"
                variant="outline"
                className="mt-3"
                disabled={
                  body.items.length >= 20
                }
                onClick={() =>
                  setBody({
                    ...body,
                    items: [
                      ...body.items,
                      {
                        serviceId:
                          'custom',
                        name:
                          'Custom service',
                        quantity: 1,
                        blueprintVersion:
                          null,
                      },
                    ],
                  })
                }
              >
                Add custom service
              </Button>
            </div>

            {fields.map(
              ([key, label, max]) => {
                const complete =
                  body[key].trim()
                    .length > 0;

                const supportsNA =
                  naFields.has(key);

                const checkedNA =
                  supportsNA &&
                  isNA(key);

                return (
                  <div
                    key={key}
                    className="rounded-xl border border-border bg-background p-4 shadow-sm"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                      <label
                        htmlFor={`proposal-${key}`}
                        className="flex items-center gap-1 text-sm font-medium"
                      >
                        {label}

                        <span
                          aria-hidden="true"
                          className="text-destructive"
                        >
                          *
                        </span>
                      </label>

                      {supportsNA && (
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={
                              checkedNA
                            }
                            onChange={(
                              event
                            ) =>
                              toggleNA(
                                key as
                                  | 'exclusions'
                                  | 'clientInputs'
                                  | 'revisions',
                                event
                                  .target
                                  .checked
                              )
                            }
                            className="h-4 w-4 rounded border-border accent-foreground"
                          />

                          N/A
                        </label>
                      )}
                    </div>

                    <Textarea
                      id={`proposal-${key}`}
                      rows={
                        key ===
                        'deliverables'
                          ? 7
                          : 4
                      }
                      maxLength={max}
                      value={body[key]}
                      disabled={
                        checkedNA
                      }
                      aria-invalid={
                        !complete
                      }
                      className="border-border bg-muted/20 font-mono shadow-inner disabled:cursor-not-allowed disabled:opacity-60"
                      onChange={(
                        event
                      ) =>
                        setBody({
                          ...body,
                          [key]:
                            event.target
                              .value,
                        })
                      }
                    />

                    <div className="mt-2 flex items-center justify-between gap-4">
                      <p className="text-xs text-muted-foreground">
                        {!complete
                          ? supportsNA
                            ? 'Required. Complete this field or select N/A.'
                            : 'Required.'
                          : checkedNA
                            ? 'Marked as not applicable.'
                            : 'Required field complete.'}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {
                          body[key]
                            .length
                        }{' '}
                        /{' '}
                        {max.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              }
            )}

            <div className="border-t border-border pt-6">
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() =>
                    command(
                      draft
                        ? 'save'
                        : 'create'
                    )
                  }
                >
                  {busy
                    ? 'Saving…'
                    : draft
                      ? 'Save draft'
                      : 'Create draft version'}
                </Button>

                {draft && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      !canIssue
                    }
                    className={
                      !canIssue
                        ? 'cursor-not-allowed opacity-50'
                        : undefined
                    }
                    onClick={() =>
                      command('issue')
                    }
                  >
                    Issue saved version
                  </Button>
                )}
              </div>

              {draft &&
                !requiredScopeComplete && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Complete every required
                    field before issuing.
                    Select N/A where
                    available when a section
                    does not apply.
                  </p>
                )}

              {draft &&
                requiredScopeComplete &&
                !proposalValid && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Check the proposal
                    title, services,
                    quantities and field
                    limits before issuing.
                  </p>
                )}

              {dirty && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Save your changes before
                  issuing.
                </p>
              )}

              {!qualified && (
                <p className="mt-3 text-sm">
                  Qualify this inquiry
                  before creating or
                  issuing a proposal.
                </p>
              )}
            </div>
          </fieldset>
        </section>
      )}

      {!accepted && latestIssued && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-semibold">
                Record client response to
                version{' '}
                {latestIssued.version}
              </h2>

              <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
                Record a response already
                received from the client.
                This is a staff record of
                external acceptance or
                decline. Agreement and
                deposit checks follow in
                the next phase.
              </p>
            </div>

            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
              {
                proposalStatusLabels[
                  latestIssued.status
                ]
              }
            </span>
          </div>

          {newerDraftExists && (
            <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium">
                A newer draft version exists.
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Version{' '}
                {latestIssued.version} is
                still issued, but it can no
                longer be accepted because
                a newer draft has been
                started. Issue or resolve
                the newer version first.
              </p>
            </div>
          )}

          {!newerDraftExists && (
            <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium">
                Acceptance requires all
                three details below.
              </p>
            </div>
          )}

          <fieldset
            disabled={busy || blocked}
            className="mt-5 space-y-5 rounded-2xl border border-border bg-muted/50 p-5 shadow-sm"
          >
            <legend className="sr-only">
              Acceptance details
            </legend>

            <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
              <label
                htmlFor="acceptance-approver"
                className="mb-2 block text-sm font-medium"
              >
                Client approver{' '}
                <span
                  aria-hidden="true"
                  className="text-destructive"
                >
                  *
                </span>
              </label>

              <Input
                id="acceptance-approver"
                maxLength={200}
                value={approver}
                className="bg-muted/20 font-mono shadow-inner"
                disabled={
                  newerDraftExists
                }
                onChange={(event) =>
                  setApprover(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
              <label
                htmlFor="acceptance-date"
                className="mb-2 block text-sm font-medium"
              >
                Acceptance date{' '}
                <span
                  aria-hidden="true"
                  className="text-destructive"
                >
                  *
                </span>
              </label>

              <Input
                id="acceptance-date"
                type="date"
                max={today}
                value={acceptedOn}
                className="bg-muted/20 font-mono shadow-inner"
                disabled={
                  newerDraftExists
                }
                onChange={(event) =>
                  setAcceptedOn(
                    event.target.value
                  )
                }
              />

              {acceptedOn &&
                !acceptanceDateValid && (
                  <p className="mt-2 text-xs text-destructive">
                    Acceptance date cannot
                    be in the future.
                  </p>
                )}
            </div>

            <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
              <label
                htmlFor="acceptance-evidence"
                className="mb-2 block text-sm font-medium"
              >
                Evidence reference{' '}
                <span
                  aria-hidden="true"
                  className="text-destructive"
                >
                  *
                </span>
              </label>

              <Textarea
                id="acceptance-evidence"
                rows={3}
                maxLength={2000}
                placeholder="Approval email reference, document location, or other verifiable record"
                value={evidence}
                className="bg-muted/20 font-mono shadow-inner"
                disabled={
                  newerDraftExists
                }
                onChange={(event) =>
                  setEvidence(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="border-t border-border pt-5">
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  disabled={!canAccept}
                  className={
                    !canAccept
                      ? 'cursor-not-allowed opacity-50'
                      : undefined
                  }
                  onClick={() =>
                    command(
                      'accept',
                      latestIssued
                    )
                  }
                >
                  Record accepted scope
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    busy || blocked
                  }
                  onClick={() =>
                    command(
                      'decline',
                      latestIssued
                    )
                  }
                >
                  Record declined
                </Button>
              </div>

              {!newerDraftExists &&
                !acceptanceComplete && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Complete the client
                    approver, acceptance
                    date and evidence
                    reference to record
                    acceptance.
                  </p>
                )}
            </div>
          </fieldset>
        </section>
      )}

      {message && (
        <p
          role="status"
          className="rounded-xl border border-border bg-muted/30 p-4 text-sm"
        >
          {message}
        </p>
      )}

      {blocked && (
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            window.location.reload()
          }
        >
          Reload proposals
        </Button>
      )}

      <section>
        <div>
          <h2 className="font-heading text-2xl font-semibold">
            Saved proposal versions
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Draft versions remain on the
            left. Issued and completed
            versions are kept on the right.
            Open a version to review its
            full saved scope.
          </p>
        </div>

        {!proposals.length ? (
          <p className="mt-5 text-sm text-muted-foreground">
            No proposal versions yet.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Drafts
                </h3>

                <span className="text-xs text-muted-foreground">
                  {draftProposals.length}
                </span>
              </div>

              <div className="space-y-3">
                {draftProposals.length >
                0 ? (
                  draftProposals.map(
                    (proposal) =>
                      renderVersion(
                        proposal
                      )
                  )
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-4">
                    <p className="text-sm text-muted-foreground">
                      No draft versions.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Issued &amp; completed
                </h3>

                <span className="text-xs text-muted-foreground">
                  {
                    completedProposals.length
                  }
                </span>
              </div>

              <div className="space-y-3">
                {completedProposals.length >
                0 ? (
                  completedProposals.map(
                    (proposal) =>
                      renderVersion(
                        proposal
                      )
                  )
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-4">
                    <p className="text-sm text-muted-foreground">
                      No issued or completed
                      versions yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}