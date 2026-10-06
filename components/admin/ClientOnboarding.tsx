'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import {
  checklistBodySchema,
  coreChecklistIds,
  outstandingItems,
  type ChecklistBody,
} from '@/lib/onboarding/checklist-schema';

import type {
  ChecklistEvent,
  ChecklistRecord,
} from '@/lib/onboarding/checklist-data';

type ClientOnboardingProps = {
  id: string;
  record: ChecklistRecord | null;
  history: ChecklistEvent[];
  gateReady: boolean;
  gateRevision: number | null;
};

const contactFields = [
  ['contactName', 'Primary contact', 200],
  ['contactEmail', 'Contact email', 254],
  ['approver', 'Authorized approver', 200],
] as const;

export function ClientOnboarding({
  id,
  record,
  history,
  gateReady,
  gateRevision,
}: ClientOnboardingProps) {
  const router = useRouter();

  const [body, setBody] = useState<
    ChecklistBody | undefined
  >(record?.body);

  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');

  const done = record?.state === 'complete';

  const current =
    done &&
    gateReady &&
    record.completed_readiness_revision ===
      gateRevision;

  const dirty =
    Boolean(record && body) &&
    JSON.stringify(body) !==
      JSON.stringify(record?.body);

  const outstanding = body
    ? outstandingItems(body)
    : [];

  const waivedCount =
    body?.items.filter(
      (checklistItem) =>
        checklistItem.status === 'waived'
    ).length ?? 0;

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const validation = useMemo(() => {
    if (!body) {
      return {
        valid: false,
        messages: [] as string[],
      };
    }

    const messages: string[] = [];

    if (!body.contactName.trim()) {
      messages.push(
        'Enter the primary contact.'
      );
    }

    if (!body.contactEmail.trim()) {
      messages.push(
        'Enter the contact email.'
      );
    }

    if (!body.approver.trim()) {
      messages.push(
        'Enter the authorized approver.'
      );
    }

    body.items.forEach(
      (checklistItem, index) => {
        if (!checklistItem.title.trim()) {
          messages.push(
            `Checklist item ${
              index + 1
            } needs a title.`
          );
        }

        if (
          checklistItem.status ===
            'complete' &&
          !checklistItem.notes.trim()
        ) {
          messages.push(
            `Checklist item ${
              index + 1
            } is marked Complete and needs evidence or review notes.`
          );
        }

        if (
          checklistItem.status ===
            'waived' &&
          !checklistItem.notes.trim()
        ) {
          messages.push(
            `Checklist item ${
              index + 1
            } is marked Waived and needs a reason.`
          );
        }
      }
    );

    if (
      body.kickoffDate &&
      body.kickoffDate > today &&
      body.kickoffStatus === 'held'
    ) {
      messages.push(
        'A kickoff marked Held cannot have a future date.'
      );
    }

    if (
      body.kickoffStatus ===
        'scheduled' &&
      !body.kickoffDate
    ) {
      messages.push(
        'Add a kickoff date when the kickoff is Scheduled.'
      );
    }

    if (
      body.kickoffStatus === 'held'
    ) {
      if (!body.kickoffDate) {
        messages.push(
          'Add the kickoff date before marking it Held.'
        );
      }

      if (!body.kickoffNotes.trim()) {
        messages.push(
          'Add kickoff outcomes and follow-up notes before marking it Held.'
        );
      }
    }

    const schemaResult =
      checklistBodySchema.safeParse(body);

    if (!schemaResult.success) {
      for (const issue of
        schemaResult.error.issues) {
        if (
          issue.message &&
          !messages.includes(issue.message)
        ) {
          messages.push(issue.message);
        }
      }
    }

    return {
      valid: schemaResult.success,
      messages,
    };
  }, [body, today]);

  const canComplete =
    Boolean(body) &&
    !dirty &&
    gateReady &&
    outstanding.length === 0 &&
    body?.kickoffStatus === 'held' &&
    Boolean(body?.contactName.trim()) &&
    Boolean(body?.contactEmail.trim()) &&
    Boolean(body?.approver.trim()) &&
    validation.valid &&
    !busy &&
    !blocked;

  async function command(
    action:
      | 'start'
      | 'save'
      | 'complete'
      | 'reopen'
  ) {
    if (action === 'save') {
      const result =
        checklistBodySchema.safeParse(
          body
        );

      if (!result.success) {
        setMessage(
          validation.messages[0] ||
            'Check the onboarding fields before saving.'
        );
        return;
      }
    }

    if (
      action === 'complete' &&
      !canComplete
    ) {
      setMessage(
        validation.messages[0] ||
          'Complete all required checklist and kickoff requirements before completing onboarding.'
      );
      return;
    }

    if (
      ['complete', 'reopen'].includes(
        action
      )
    ) {
      const confirmed =
        window.confirm(
          action === 'complete'
            ? 'Complete onboarding using the saved checklist and kickoff record?'
            : 'Reopen onboarding for review and corrections?'
        );

      if (!confirmed) {
        return;
      }
    }

    setBusy(true);
    setMessage('');

    try {
      const response = await fetch(
        `/api/admin/leads/${id}/onboarding`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            action,
            expectedRevision:
              record?.revision ?? 0,
            ...(action === 'save'
              ? { body }
              : action === 'reopen'
                ? { reason }
                : {}),
          }),
          signal:
            AbortSignal.timeout(20000),
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        router.replace(
          '/admin/login'
        );
        router.refresh();
        return;
      }

      if (response.status === 409) {
        setBlocked(true);
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Could not save onboarding.'
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
        [
          'TimeoutError',
          'TypeError',
        ].includes(error.name)
      ) {
        setBlocked(true);
      }
    } finally {
      setBusy(false);
    }
  }

  function field<
    K extends keyof ChecklistBody,
  >(
    key: K,
    value: ChecklistBody[K]
  ) {
    setBody((previous) =>
      previous
        ? {
            ...previous,
            [key]: value,
          }
        : previous
    );
  }

  function item(
    index: number,
    changes: Partial<
      ChecklistBody['items'][number]
    >
  ) {
    if (!body) return;

    field(
      'items',
      body.items.map(
        (
          checklistItem,
          itemIndex
        ) =>
          itemIndex === index
            ? {
                ...checklistItem,
                ...changes,
              }
            : checklistItem
      )
    );
  }

  const control =
    'h-11 w-full rounded-xl border border-border bg-muted/20 px-3 text-sm font-mono shadow-inner outline-none transition focus:border-foreground/30';

  return (
    <div className="mt-8 space-y-8">
      {/* ================================================= */}
      {/* STATUS / START / REOPEN */}
      {/* ================================================= */}

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-semibold">
              {!record
                ? 'Start onboarding'
                : current
                  ? 'Onboarding complete'
                  : done
                    ? 'Completion needs review'
                    : 'Onboarding in progress'}
            </h2>

            <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
              {!gateReady
                ? 'The agreement/deposit gate is on hold or the inquiry is no longer qualified. Existing preparation can be saved; starting or completing onboarding is blocked.'
                : done &&
                    !current
                  ? 'The readiness gate changed after completion. Reopen, review and complete onboarding again.'
                  : 'Track client inputs, contacts and kickoff preparation against the accepted scope.'}
            </p>
          </div>

          {record && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
              {current
                ? 'Complete'
                : done
                  ? 'Review required'
                  : 'In progress'}
            </span>
          )}
        </div>

        {!record && (
          <Button
            type="button"
            className="mt-5"
            disabled={
              busy ||
              blocked ||
              !gateReady
            }
            onClick={() =>
              command('start')
            }
          >
            Start onboarding checklist
          </Button>
        )}

        {body && (
          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-full bg-muted px-3 py-1 text-xs">
              {outstanding.length}{' '}
              required{' '}
              {outstanding.length === 1
                ? 'item'
                : 'items'}{' '}
              outstanding
            </span>

            <span className="rounded-full bg-muted px-3 py-1 text-xs">
              {waivedCount} waived
            </span>
          </div>
        )}

        {done && (
          <fieldset
            disabled={
              busy || blocked
            }
            className="mt-6 max-w-2xl rounded-2xl border border-border bg-muted/50 p-5 shadow-sm"
          >
            <legend className="sr-only">
              Reopen onboarding
            </legend>

            <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
              <label
                htmlFor="reopen-onboarding"
                className="mb-2 block text-sm font-medium"
              >
                Reason to reopen
              </label>

              <Textarea
                id="reopen-onboarding"
                value={reason}
                maxLength={2000}
                className="bg-muted/20 font-mono shadow-inner"
                onChange={(event) =>
                  setReason(
                    event.target.value
                  )
                }
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              disabled={!reason.trim()}
              onClick={() =>
                command('reopen')
              }
            >
              Reopen onboarding
            </Button>
          </fieldset>
        )}
      </section>

      {/* ================================================= */}
      {/* EDITABLE WORKSPACE */}
      {/* ================================================= */}

      {body && (
        <fieldset
          disabled={
            busy ||
            blocked ||
            done
          }
          className="space-y-8"
        >
          <legend className="sr-only">
            Client onboarding records
          </legend>

          {/* ============================================= */}
          {/* CONTACTS */}
          {/* ============================================= */}

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-semibold">
              Client contacts
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Record the primary contact
              and the person authorized to
              approve project decisions.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-muted/50 p-5 shadow-sm sm:p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                {contactFields.map(
                  ([key, label, max]) => {
                    const empty =
                      !body[
                        key
                      ].trim();

                    return (
                      <div
                        key={key}
                        className="rounded-xl border border-border bg-background p-4 shadow-sm"
                      >
                        <label
                          htmlFor={key}
                          className="mb-2 block text-sm font-medium"
                        >
                          {label}{' '}
                          <span
                            aria-hidden="true"
                            className="text-destructive"
                          >
                            *
                          </span>
                        </label>

                        <Input
                          id={key}
                          type={
                            key ===
                            'contactEmail'
                              ? 'email'
                              : 'text'
                          }
                          maxLength={
                            max
                          }
                          value={
                            body[
                              key
                            ]
                          }
                          aria-invalid={
                            empty
                          }
                          className="bg-muted/20 font-mono shadow-inner"
                          onChange={(
                            event
                          ) =>
                            field(
                              key,
                              event
                                .target
                                .value
                            )
                          }
                        />

                        {empty && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Required.
                          </p>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </section>

          {/* ============================================= */}
          {/* CHECKLIST */}
          {/* ============================================= */}

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-semibold">
              Client input checklist
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Received means the item has
              arrived but still needs staff
              verification. Mark Complete
              after review, or Waived with
              an explicit reason. Never
              store passwords or tokens in
              these notes.
            </p>

            <div className="mt-6 space-y-4 rounded-2xl border border-border bg-muted/50 p-5 shadow-sm sm:p-6">
              {body.items.map(
                (
                  checklistItem,
                  index
                ) => {
                  const core = (
                    coreChecklistIds as readonly string[]
                  ).includes(
                    checklistItem.id
                  );

                  const notesRequired =
                    checklistItem.status ===
                      'complete' ||
                    checklistItem.status ===
                      'waived';

                  const missingNotes =
                    notesRequired &&
                    !checklistItem.notes.trim();

                  return (
                    <div
                      key={
                        checklistItem.id
                      }
                      className="rounded-xl border border-border bg-background p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Item{' '}
                            {index +
                              1}
                          </p>

                          {core && (
                            <span className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                              Core
                            </span>
                          )}
                        </div>

                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium capitalize">
                          {
                            checklistItem.status
                          }
                        </span>
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor={`item-title-${index}`}
                          className="mb-2 block text-sm font-medium"
                        >
                          Checklist
                          item
                        </label>

                        <Input
                          id={`item-title-${index}`}
                          maxLength={
                            300
                          }
                          value={
                            checklistItem.title
                          }
                          readOnly={
                            core
                          }
                          className="bg-muted/20 font-mono shadow-inner"
                          onChange={(
                            event
                          ) =>
                            item(
                              index,
                              {
                                title:
                                  event
                                    .target
                                    .value,
                              }
                            )
                          }
                        />
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor={`item-owner-${index}`}
                            className="mb-2 block text-sm font-medium"
                          >
                            Owner
                          </label>

                          <select
                            id={`item-owner-${index}`}
                            className={
                              control
                            }
                            value={
                              checklistItem.owner
                            }
                            onChange={(
                              event
                            ) =>
                              item(
                                index,
                                {
                                  owner:
                                    event
                                      .target
                                      .value as
                                      | 'client'
                                      | 'bivi',
                                }
                              )
                            }
                          >
                            <option value="client">
                              Client
                            </option>

                            <option value="bivi">
                              Bivi
                            </option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor={`item-status-${index}`}
                            className="mb-2 block text-sm font-medium"
                          >
                            Status
                          </label>

                          <select
                            id={`item-status-${index}`}
                            className={
                              control
                            }
                            value={
                              checklistItem.status
                            }
                            onChange={(
                              event
                            ) =>
                              item(
                                index,
                                {
                                  status:
                                    event
                                      .target
                                      .value as typeof checklistItem.status,
                                }
                              )
                            }
                          >
                            <option value="pending">
                              Pending
                            </option>

                            <option value="received">
                              Received
                            </option>

                            <option value="complete">
                              Complete
                            </option>

                            <option value="waived">
                              Waived
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor={`item-notes-${index}`}
                          className="mb-2 block text-sm font-medium"
                        >
                          {checklistItem.status ===
                          'waived'
                            ? 'Waiver reason'
                            : 'Evidence reference or review notes'}

                          {notesRequired && (
                            <span className="text-destructive">
                              {' '}
                              *
                            </span>
                          )}
                        </label>

                        <Textarea
                          id={`item-notes-${index}`}
                          rows={3}
                          maxLength={
                            2000
                          }
                          value={
                            checklistItem.notes
                          }
                          aria-invalid={
                            missingNotes
                          }
                          className="bg-muted/20 font-mono shadow-inner"
                          onChange={(
                            event
                          ) =>
                            item(
                              index,
                              {
                                notes:
                                  event
                                    .target
                                    .value,
                              }
                            )
                          }
                        />

                        {missingNotes && (
                          <p className="mt-2 text-xs text-destructive">
                            {checklistItem.status ===
                            'waived'
                              ? 'A waiver reason is required.'
                              : 'Evidence or review notes are required when this item is Complete.'}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={
                              checklistItem.required
                            }
                            disabled={
                              core ||
                              done ||
                              busy ||
                              blocked
                            }
                            onChange={(
                              event
                            ) =>
                              item(
                                index,
                                {
                                  required:
                                    event
                                      .target
                                      .checked,
                                }
                              )
                            }
                          />

                          Required for
                          completion
                        </label>

                        {!core && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              field(
                                'items',
                                body.items.filter(
                                  (
                                    _,
                                    itemIndex
                                  ) =>
                                    itemIndex !==
                                    index
                                )
                              )
                            }
                          >
                            Remove item{' '}
                            {index + 1}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                }
              )}

              <Button
                type="button"
                variant="outline"
                disabled={
                  body.items.length >= 30
                }
                onClick={() =>
                  field('items', [
                    ...body.items,
                    {
                      id: crypto.randomUUID(),
                      title:
                        'Additional client input',
                      owner:
                        'client',
                      required:
                        true,
                      status:
                        'pending',
                      notes: '',
                    },
                  ])
                }
              >
                Add checklist item
              </Button>
            </div>
          </section>

          {/* ============================================= */}
          {/* KICKOFF */}
          {/* ============================================= */}

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-semibold">
              Kickoff preparation
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Record scheduling details,
              then capture outcomes and
              follow-up notes after the
              kickoff has actually taken
              place.
            </p>

            <div className="mt-6 space-y-5 rounded-2xl border border-border bg-muted/50 p-5 shadow-sm sm:p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
                  <label
                    htmlFor="kickoff-status"
                    className="mb-2 block text-sm font-medium"
                  >
                    Kickoff status
                  </label>

                  <select
                    id="kickoff-status"
                    className={control}
                    value={
                      body.kickoffStatus
                    }
                    onChange={(
                      event
                    ) =>
                      field(
                        'kickoffStatus',
                        event.target
                          .value as ChecklistBody['kickoffStatus']
                      )
                    }
                  >
                    <option value="pending">
                      Pending
                    </option>

                    <option value="scheduled">
                      Scheduled
                    </option>

                    <option value="held">
                      Held
                    </option>
                  </select>
                </div>

                <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
                  <label
                    htmlFor="kickoff-date"
                    className="mb-2 block text-sm font-medium"
                  >
                    Kickoff date
                  </label>

                  <Input
                    id="kickoff-date"
                    type="date"
                    max={
                      body.kickoffStatus ===
                      'held'
                        ? today
                        : undefined
                    }
                    value={
                      body.kickoffDate ??
                      ''
                    }
                    className="bg-muted/20 font-mono shadow-inner"
                    onChange={(
                      event
                    ) =>
                      field(
                        'kickoffDate',
                        event.target
                          .value ||
                          null
                      )
                    }
                  />

                  {body.kickoffStatus ===
                    'held' &&
                    body.kickoffDate &&
                    body.kickoffDate >
                      today && (
                      <p className="mt-2 text-xs text-destructive">
                        A held
                        kickoff
                        cannot use
                        a future
                        date.
                      </p>
                    )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
                <label
                  htmlFor="kickoff-details"
                  className="mb-2 block text-sm font-medium"
                >
                  Time, timezone,
                  location and agenda
                </label>

                <Textarea
                  id="kickoff-details"
                  maxLength={2000}
                  rows={4}
                  value={
                    body.kickoffDetails
                  }
                  className="bg-muted/20 font-mono shadow-inner"
                  onChange={(
                    event
                  ) =>
                    field(
                      'kickoffDetails',
                      event.target
                        .value
                    )
                  }
                />
              </div>

              <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
                <label
                  htmlFor="kickoff-notes"
                  className="mb-2 block text-sm font-medium"
                >
                  Kickoff outcomes
                  and follow-up
                  notes

                  {body.kickoffStatus ===
                    'held' && (
                    <span className="text-destructive">
                      {' '}
                      *
                    </span>
                  )}
                </label>

                <Textarea
                  id="kickoff-notes"
                  maxLength={4000}
                  rows={4}
                  value={
                    body.kickoffNotes
                  }
                  aria-invalid={
                    body.kickoffStatus ===
                      'held' &&
                    !body.kickoffNotes.trim()
                  }
                  className="bg-muted/20 font-mono shadow-inner"
                  onChange={(
                    event
                  ) =>
                    field(
                      'kickoffNotes',
                      event.target
                        .value
                    )
                  }
                />

                {body.kickoffStatus ===
                  'held' &&
                  !body.kickoffNotes.trim() && (
                    <p className="mt-2 text-xs text-destructive">
                      Outcomes
                      and
                      follow-up
                      notes are
                      required
                      for a held
                      kickoff.
                    </p>
                  )}
              </div>

              <p className="text-xs text-muted-foreground">
                Scheduling records
                details only.
                Invitations and
                messages are handled
                through your existing
                process.
              </p>
            </div>
          </section>

          {/* ============================================= */}
          {/* ACTIONS */}
          {/* ============================================= */}

          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() =>
                  command('save')
                }
              >
                {busy
                  ? 'Saving…'
                  : 'Save onboarding'}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={!canComplete}
                className={
                  !canComplete
                    ? 'cursor-not-allowed opacity-50'
                    : undefined
                }
                onClick={() =>
                  command(
                    'complete'
                  )
                }
              >
                Complete onboarding
              </Button>
            </div>

            {dirty && (
              <p className="mt-3 text-sm text-muted-foreground">
                Save changes before
                completing
                onboarding.
              </p>
            )}

            {!gateReady && (
              <p className="mt-3 text-sm text-muted-foreground">
                The agreement/deposit
                gate must be Ready
                before onboarding can
                be completed.
              </p>
            )}

            {outstanding.length >
              0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                {
                  outstanding.length
                }{' '}
                required{' '}
                {outstanding.length ===
                1
                  ? 'checklist item remains'
                  : 'checklist items remain'}{' '}
                incomplete.
              </p>
            )}

            {body.kickoffStatus !==
              'held' && (
              <p className="mt-3 text-sm text-muted-foreground">
                The kickoff must be
                marked Held before
                onboarding can be
                completed.
              </p>
            )}
          </section>
        </fieldset>
      )}

      {/* ================================================= */}
      {/* VALIDATION / ERRORS */}
      {/* ================================================= */}

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
          Reload onboarding
        </Button>
      )}

      {/* ================================================= */}
      {/* HISTORY */}
      {/* ================================================= */}

      <section>
        <div>
          <h2 className="font-heading text-2xl font-semibold">
            Onboarding history
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Latest 50 events.
            Completed onboarding is
            preparation for the
            project workspace.
          </p>
        </div>

        {!history.length ? (
          <div className="mt-5 rounded-xl border border-dashed border-border p-4">
            <p className="text-sm text-muted-foreground">
              No onboarding events
              yet.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {history.map(
              (historyEvent) => (
                <details
                  key={
                    historyEvent.id
                  }
                  className="group overflow-hidden rounded-xl border border-border bg-card"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 [&::-webkit-details-marker]:hidden">
                    <div>
                      <p className="text-sm font-semibold">
                        {
                          {
                            start:
                              'Started',
                            save:
                              'Records saved',
                            complete:
                              'Completed',
                            reopen:
                              'Reopened',
                          }[
                            historyEvent
                              .action
                          ]
                        }
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Scope
                        version{' '}
                        {
                          historyEvent
                            .snapshot
                            .proposalVersion
                        }{' '}
                        ·{' '}
                        {new Intl.DateTimeFormat(
                          'en-US',
                          {
                            dateStyle:
                              'medium',
                            timeStyle:
                              'short',
                            timeZone:
                              'UTC',
                          }
                        ).format(
                          new Date(
                            historyEvent.created_at
                          )
                        )}{' '}
                        UTC
                      </p>
                    </div>

                    <span
                      aria-hidden="true"
                      className="text-sm text-muted-foreground transition-transform group-open:rotate-180"
                    >
                      ↓
                    </span>
                  </summary>

                  <div className="border-t border-border p-4 text-sm">
                    {historyEvent.reason && (
                      <div className="mb-4 rounded-xl bg-muted/30 p-3">
                        <p className="text-xs font-semibold">
                          Reason
                        </p>

                        <p className="mt-1 whitespace-pre-wrap break-words">
                          {
                            historyEvent.reason
                          }
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">
                          Contact
                        </p>

                        <p className="mt-1">
                          {historyEvent
                            .snapshot
                            .body
                            .contactName ||
                            'Not recorded'}{' '}
                          ·{' '}
                          {
                            historyEvent
                              .snapshot
                              .body
                              .contactEmail
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">
                          Approver
                        </p>

                        <p className="mt-1">
                          {historyEvent
                            .snapshot
                            .body
                            .approver ||
                            'Not recorded'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">
                          Checklist
                        </p>

                        <div className="mt-2 space-y-3">
                          {historyEvent.snapshot.body.items.map(
                            (
                              checklistItem
                            ) => (
                              <div
                                key={
                                  checklistItem.id
                                }
                                className="rounded-lg bg-muted/30 p-3"
                              >
                                <p className="font-medium">
                                  {
                                    checklistItem.title
                                  }
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  {
                                    checklistItem.status
                                  }{' '}
                                  ·{' '}
                                  {
                                    checklistItem.owner
                                  }{' '}
                                  ·{' '}
                                  {checklistItem.required
                                    ? 'Required'
                                    : 'Optional'}
                                </p>

                                <p className="mt-2 whitespace-pre-wrap">
                                  {checklistItem.notes ||
                                    'No notes'}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">
                          Kickoff
                        </p>

                        <p className="mt-1">
                          {
                            historyEvent
                              .snapshot
                              .body
                              .kickoffStatus
                          }{' '}
                          ·{' '}
                          {historyEvent
                            .snapshot
                            .body
                            .kickoffDate ||
                            'No date'}
                        </p>

                        {historyEvent
                          .snapshot
                          .body
                          .kickoffDetails && (
                          <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                            {
                              historyEvent
                                .snapshot
                                .body
                                .kickoffDetails
                            }
                          </p>
                        )}

                        {historyEvent
                          .snapshot
                          .body
                          .kickoffNotes && (
                          <p className="mt-2 whitespace-pre-wrap">
                            {
                              historyEvent
                                .snapshot
                                .body
                                .kickoffNotes
                            }
                          </p>
                        )}
                      </div>

                      <p className="break-all font-mono text-[10px] text-muted-foreground">
                        Staff:{' '}
                        {historyEvent.actor ||
                          'Account removed'}
                      </p>
                    </div>
                  </div>
                </details>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}