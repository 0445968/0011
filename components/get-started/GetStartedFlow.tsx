'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { serviceCatalog, getServiceBlueprint } from '@/data/serviceCatalog';
import { resolveSelection, resolveSelections } from '@/lib/services/resolveSelection';
import { budgetLabels, emptyInquiry, inquirySchema, timelineLabels, type InquiryFields } from '@/lib/intake/schema';
import { DRAFT_KEY, parseDraft, serializeDraft } from '@/lib/intake/draft';

const steps = ['Your services', 'Project details', 'Review'];
const buttonClass = 'min-h-[48px] rounded-[18px] font-mono w-full px-1 sm:w-auto sm:px-6';
const selectClass = 'h-12 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: ReactNode }) {
  return <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-medium">{label}</label>
    {children}
    {error && <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>;
}

export function GetStartedFlow({
  initialSelections,
  initialEmail,
}: {
  initialSelections: string;
  initialEmail: string;
}) {
  const router = useRouter();
  const [fields, setFields] = useState<InquiryFields>(emptyInquiry);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [requestId, setRequestId] = useState('');
  const [ready, setReady] = useState(false);
  const [saveDraft, setSaveDraft] = useState(true);
  const [draftStatus, setDraftStatus] = useState('');
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const initialized = useRef(false);
  const inFlight = useRef(false);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const errorBox = useRef<HTMLDivElement>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    let saved: ReturnType<typeof parseDraft> = null;
    try {
      saved = parseDraft(localStorage.getItem(DRAFT_KEY));
      if (!saved) localStorage.removeItem(DRAFT_KEY);
    } catch { setDraftStatus('Saving is unavailable in this browser.'); }
    const base: InquiryFields =
  saved?.fields ?? {
    ...emptyInquiry,
    services: [],
  };

if (initialEmail) {
  base.email = initialEmail;
}
    const selections = resolveSelections(initialSelections).slice(0, 30);
    const services = [...base.services];
const pending = [
  ...(saved?.pendingIds ?? []),
];

for (const selection of selections) {
  if (selection.kind === 'service') {
    if (
      !services.some(
        (item) =>
          item.serviceId ===
          selection.serviceId
      )
    ) {
      services.push({
        serviceId:
          selection.serviceId,
        quantity: 1,
        details: '',
      });
    }
  } else if (
    selection.inputId.length <= 80 &&
    !pending.includes(
      selection.inputId
    )
  ) {
    pending.push(
      selection.inputId
    );
  }
}

setFields({
  ...base,
  services,
});

setPendingIds(
  pending.slice(0, 30)
);

// A new URL selection changes the draft;
// an unchanged saved draft retains its retry key.
setRequestId(
  selections.length
    ? crypto.randomUUID()
    : saved?.requestId ??
        crypto.randomUUID()
);

setReady(true);

if (
  initialSelections ||
  initialEmail
) {
  router.replace(
    '/get-started',
    {
      scroll: false,
    }
  );
}
}, [
  initialSelections,
  initialEmail,
  router,
]);

  useEffect(() => {
    if (!ready || receipt) return;
    if (!saveDraft) {
      try { localStorage.removeItem(DRAFT_KEY); setDraftStatus('Draft saving is off.'); }
      catch { setDraftStatus('Could not remove the saved draft. Clear this site’s browser data to remove it.'); }
      return;
    }
    setDraftStatus('Saving draft…');
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, serializeDraft(fields, requestId, pendingIds));
        setDraftStatus('Draft saved on this browser for 7 days.');
      } catch { setDraftStatus('This browser could not save your draft. Keep this page open.'); }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [fields, pendingIds, requestId, ready, saveDraft, receipt]);

  useEffect(() => { if (message) errorBox.current?.focus(); }, [message]);
  useEffect(() => { if (receipt) successHeading.current?.focus(); }, [receipt]);

  function edited() {
    setRequestId(crypto.randomUUID());
    setMessage('');
    setErrors({});
  }
  function update<K extends keyof InquiryFields>(key: K, value: InquiryFields[K]) {
    edited();
    setFields((current) => ({ ...current, [key]: value }));
  }
  function addServices(ids: string[]) {
    edited();
    setFields((current) => ({ ...current, services: [
      ...current.services,
      ...ids.filter((id) => getServiceBlueprint(id) && !current.services.some((item) => item.serviceId === id))
        .map((serviceId) => ({ serviceId, quantity: 1, details: '' })),
    ] }));
  }
  function resolvePending(id: string, selected: string[]) {
    addServices(selected);
    setPendingIds((current) => current.filter((item) => item !== id));
  }
  function keepCustom(id: string) {
    const resolution = resolveSelection(id);
    const label = 'label' in resolution ? resolution.label : `Other request (${id})`;
    const next = [fields.customRequest, label].filter(Boolean).join('\n');
    if (next.length > 2000) { setMessage('Please shorten your custom request before adding another item.'); return; }
    update('customRequest', next);
    setPendingIds((current) => current.filter((item) => item !== id));
  }
  function go(next: number) {
    setStep(next);
    setMessage('');
    setErrors({});
    window.setTimeout(() => { stepHeading.current?.focus(); stepHeading.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 0);
  }
  function validate(target: number) {
    if (target === 0 && pendingIds.length) {
      setMessage('Please review the selections brought over from the homepage.'); return false;
    }
    const parsed = inquirySchema.safeParse({ ...fields, consent: target < 2 ? true : fields.consent, requestId, companyWebsite });
    if (parsed.success) return true;
    const relevant = parsed.error.issues.filter((issue) => {
      const field = String(issue.path[0]);
      return target === 0 ? ['services', 'customRequest'].includes(field)
        : target === 1 ? field !== 'consent' : true;
    });
    if (!relevant.length) return true;
    const fieldErrors: Record<string, string> = {};
    relevant.forEach((issue) => { fieldErrors[String(issue.path[0])] ??= issue.message; });
    setErrors(fieldErrors);
    setMessage(relevant[0].message);
    return false;
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || inFlight.current) return;
    if (!validate(step)) return;
    if (step < 2) { go(step + 1); return; }
    inFlight.current = true;
    setBusy(true);
    setMessage('');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, requestId, companyWebsite }), signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || typeof data.reference !== 'string') {
        throw new Error(data.error || 'Your request could not be saved. Please try again.');
      }
      setReceipt(data.reference);
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* Saved state never controls server success. */ }
    } catch (error) {
      setMessage(error instanceof Error && error.name !== 'AbortError'
        ? error.message : 'We could not confirm your submission. Try again; a retry will not create a duplicate request.');
    } finally {
      window.clearTimeout(timer);
      inFlight.current = false;
      setBusy(false);
    }
  }

  if (receipt) return <section className="container-page py-32 sm:py-40">
    <div className="mx-auto max-w-2xl rounded-[28px] border border-border bg-card p-7 sm:p-12">
      <CheckCircle2 className="mb-6 h-12 w-12 text-primary" aria-hidden="true" />
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Request received</p>
      <h1 ref={successHeading} tabIndex={-1} className="mt-4 font-heading text-3xl font-semibold outline-none sm:text-4xl">Your next chapter starts here.</h1>
      <p className="mt-5 leading-relaxed text-muted-foreground">Your inquiry has been saved. Bivi will review your goals and contact you at <strong className="text-foreground">{fields.email}</strong> to discuss scope and next steps.</p>
      <p className="mt-4 text-sm text-muted-foreground">Your project is not booked yet. Pricing and dates will be agreed in your proposal.</p>
      <p className="mt-7 break-all font-mono text-xs">Reference: {receipt}</p>
      <Button asChild className={`${buttonClass} mt-8`}><Link href="/">Back to Bivi <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
    </div>
  </section>;

  return <section className="container-page pb-24 pt-32 sm:pt-40">
    <header className="max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Start a project</p>
      <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Let’s make your next move count.</h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Tell us what you have in mind. We’ll help shape the scope, clarify the next steps, and put together a proposal.</p>
    </header>

    <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
      <div className="min-w-0 rounded-[28px] border border-border bg-card p-5 sm:p-8">
        <ol aria-label="Project inquiry steps" className="mb-8 grid grid-cols-3 gap-2 border-b border-border pb-6">
          {steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={`text-xs sm:text-sm ${step === index ? 'text-foreground' : 'text-muted-foreground'}`}>
            <span className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full font-mono ${step >= index ? 'bg-foreground text-background' : 'bg-muted'}`}>{step > index ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}</span>{label}
          </li>)}
        </ol>
        <h2 ref={stepHeading} tabIndex={-1} className="scroll-mt-28 font-heading text-2xl font-semibold outline-none">{steps[step]}</h2>
        {!ready ? <p role="status" className="py-12 text-muted-foreground">Preparing your project…</p> : <form onSubmit={submit} noValidate className="mt-6">
          <fieldset disabled={busy} className="min-w-0 space-y-6">
            <legend className="sr-only">{steps[step]}</legend>
            {step === 0 && <>
              <p className="text-sm leading-relaxed text-muted-foreground">Choose what you need. You can combine services or describe a custom project below. All projects are quoted individually.</p>
              {pendingIds.map((id) => {
                const resolution = resolveSelection(id);
                return <div key={id} className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                  <p className="font-medium">{'label' in resolution ? resolution.label : 'A previous selection needs clarification'}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{'question' in resolution ? resolution.question : `Tell us what you meant by “${id}”, or remove it.`}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {resolution.kind === 'clarification' && resolution.candidateServiceIds.map((serviceId) => <Button key={serviceId} type="button" variant="outline" className="h-auto whitespace-normal rounded-xl py-2 text-xs" onClick={() => resolvePending(id, [serviceId])}>{getServiceBlueprint(serviceId)?.name}</Button>)}
                    {id === 'web-design' && <Button type="button" variant="outline" className="rounded-xl text-xs" onClick={() => resolvePending(id, ['website-design', 'website-development'])}>Design and development</Button>}
                    <Button type="button" variant="outline" className="rounded-xl text-xs" onClick={() => keepCustom(id)}>Keep as a custom request</Button>
                    <Button type="button" variant="ghost" className="rounded-xl text-xs" onClick={() => { edited(); setPendingIds((items) => items.filter((item) => item !== id)); }}>Remove</Button>
                  </div>
                </div>;
              })}
              <div className="grid gap-3 sm:grid-cols-2" aria-label="Available services">
                {serviceCatalog.map((service) => {
                  const selected = fields.services.some((item) => item.serviceId === service.id);
                  return <button key={service.id} type="button" aria-pressed={selected} onClick={() => selected ? update('services', fields.services.filter((item) => item.serviceId !== service.id)) : addServices([service.id])}
                    className={`flex items-start justify-between gap-3 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/40'}`}>
                    <span><span className="block text-sm font-semibold">{service.name}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{service.description}</span></span>
                    {selected ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> : <Plus className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
                  </button>;
                })}
              </div>
              {fields.services.map((selection) => {
                const service = getServiceBlueprint(selection.serviceId)!;
                return <div key={selection.serviceId} className="rounded-2xl bg-muted/40 p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-medium">{service.name}</h3><button type="button" aria-label={`Remove ${service.name}`} onClick={() => update('services', fields.services.filter((item) => item.serviceId !== service.id))} className="rounded-lg p-2 hover:bg-muted focus-visible:ring-2"><X className="h-4 w-4" /></button></div>
                  <div className="grid gap-4 sm:grid-cols-[110px_1fr]">
                    <Field label="Quantity" id={`quantity-${service.id}`}><Input id={`quantity-${service.id}`} type="number" min={1} max={100} step={1} value={selection.quantity || ''} onChange={(e) => update('services', fields.services.map((item) => item.serviceId === service.id ? { ...item, quantity: Number(e.target.value) } : item))} className="h-12 rounded-xl" /><p className="text-xs text-muted-foreground">{service.unit}</p></Field>
                    <Field label="Details (optional)" id={`details-${service.id}`}><Textarea id={`details-${service.id}`} maxLength={2000} rows={3} placeholder={`Tell us about ${service.configurationFields.join(', ').toLowerCase()}.`} value={selection.details} onChange={(e) => update('services', fields.services.map((item) => item.serviceId === service.id ? { ...item, details: e.target.value } : item))} className="rounded-xl" /></Field>
                  </div>
                </div>;
              })}
              {errors.services && <p className="text-sm text-red-600">{errors.services}</p>}
              <Field id="customRequest" label="Something else, or not sure where to start?" error={errors.customRequest}><Textarea id="customRequest" rows={4} maxLength={2000} value={fields.customRequest} onChange={(e) => update('customRequest', e.target.value)} placeholder="Describe the help you need. You don’t need to know the name of the service." aria-invalid={Boolean(errors.customRequest)} aria-describedby={errors.customRequest ? 'customRequest-error' : undefined} className="rounded-xl" /></Field>
            </>}
            {step === 1 && <>
              <p className="text-sm text-muted-foreground">A few details to help us understand your business and the work ahead. No files or payment are needed yet.</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="name" label="Your name" error={errors.name}><Input id="name" autoComplete="name" maxLength={120} value={fields.name} onChange={(e) => update('name', e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} required className="h-12 rounded-xl" /></Field>
                <Field id="email" label="Email address" error={errors.email}><Input id="email" type="email" autoComplete="email" maxLength={254} value={fields.email} onChange={(e) => update('email', e.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} required className="h-12 rounded-xl" /></Field>
                <Field id="company" label="Company (optional)" error={errors.company}><Input id="company" autoComplete="organization" maxLength={160} value={fields.company} onChange={(e) => update('company', e.target.value)} className="h-12 rounded-xl" /></Field>
                <Field id="website" label="Website (optional)" error={errors.website}><Input id="website" type="url" autoComplete="url" placeholder="https://" maxLength={500} value={fields.website} onChange={(e) => update('website', e.target.value)} aria-invalid={Boolean(errors.website)} aria-describedby={errors.website ? 'website-error' : undefined} className="h-12 rounded-xl" /></Field>
              </div>
              <Field id="goals" label="What would you like this project to achieve?" error={errors.goals}><Textarea id="goals" rows={5} maxLength={4000} value={fields.goals} onChange={(e) => update('goals', e.target.value)} placeholder="Tell us about your business, what you want to change, and what a successful project would look like." aria-invalid={Boolean(errors.goals)} aria-describedby={errors.goals ? 'goals-error' : undefined} required className="rounded-xl" /></Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="budget" label="Estimated budget (USD)"><select id="budget" className={selectClass} value={fields.budget} onChange={(e) => update('budget', e.target.value as InquiryFields['budget'])}>{Object.entries(budgetLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
                <Field id="timeline" label="When would you like to start?"><select id="timeline" className={selectClass} value={fields.timeline} onChange={(e) => update('timeline', e.target.value as InquiryFields['timeline'])}>{Object.entries(timelineLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
              </div>
            </>}
            {step === 2 && <>
              <p className="text-sm text-muted-foreground">Check your request before sending. This is an inquiry, with no payment or booking commitment.</p>
              <div className="rounded-2xl bg-muted/40 p-5">
                <div className="flex items-center justify-between"><h3 className="font-medium">Services</h3><button type="button" className="text-sm underline underline-offset-4" onClick={() => go(0)}>Edit services</button></div>
                {fields.services.length > 0 && <ul className="mt-3 space-y-3">{fields.services.map((item) => <li key={item.serviceId} className="text-sm"><strong>{getServiceBlueprint(item.serviceId)?.name}</strong> × {item.quantity}{item.details && <p className="mt-1 whitespace-pre-wrap break-words text-muted-foreground">{item.details}</p>}</li>)}</ul>}
                {fields.customRequest && <p className="mt-4 whitespace-pre-wrap break-words text-sm"><strong>Custom request</strong><br />{fields.customRequest}</p>}
              </div>
              <div className="rounded-2xl bg-muted/40 p-5">
                <div className="flex items-center justify-between"><h3 className="font-medium">Your project</h3><button type="button" className="text-sm underline underline-offset-4" onClick={() => go(1)}>Edit details</button></div>
                <dl className="mt-4 space-y-3 text-sm">
                  {[['Contact', `${fields.name} · ${fields.email}`], ['Company', fields.company || 'Not provided'], ['Website', fields.website || 'Not provided'], ['Goals', fields.goals], ['Budget', budgetLabels[fields.budget]], ['Preferred start', timelineLabels[fields.timeline]]].map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words">{value}</dd></div>)}
                </dl>
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed"><input type="checkbox" checked={fields.consent} onChange={(e) => update('consent', e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-primary" aria-invalid={Boolean(errors.consent)} /><span>Bivi may contact me about this project. I’ve read the <Link href="/privacy" target="_blank" className="underline underline-offset-4">privacy policy</Link>.</span></label>
              <div aria-hidden="true" className="hidden"><label htmlFor="companyWebsite">Leave this field empty</label><input id="companyWebsite" name="companyWebsite" tabIndex={-1} autoComplete="off" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} /></div>
            </>}
            {message && <div ref={errorBox} role="alert" tabIndex={-1} className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm outline-none"><p>{message}</p>{step === 2 && <p className="mt-2">You can also email <a className="underline" href="mailto:hello@bivi.pro">hello@bivi.pro</a>.</p>}</div>}
            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
              {step > 0 ? <Button type="button" variant="outline" className={buttonClass} onClick={() => go(step - 1)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button> : <span />}
              <Button type="submit" className={buttonClass}>{busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</> : <>{step === 2 ? 'Send project request' : 'Continue'}<ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
            </div>
          </fieldset>
          <div className="mt-6 border-t border-border pt-5 text-xs text-muted-foreground">
            <label className="flex items-center gap-2"><input type="checkbox" checked={saveDraft} disabled={busy} onChange={(e) => setSaveDraft(e.target.checked)} className="h-4 w-4 accent-primary" />Save my progress on this device</label>
            <p role="status" className="mt-2">{draftStatus}</p>
          </div>
        </form>}
      </div>
      <aside className="rounded-[28px] bg-muted/50 p-6 lg:sticky lg:top-28">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">What happens next</p>
        <ol className="mt-6 space-y-6 text-sm">
          <li><strong className="block font-heading">01 / We review your request</strong><p className="mt-2 leading-relaxed text-muted-foreground">We look at your goals, services, and timing.</p></li>
          <li><strong className="block font-heading">02 / We shape the project</strong><p className="mt-2 leading-relaxed text-muted-foreground">Together, we confirm scope, deliverables, pricing, and dates.</p></li>
          <li><strong className="block font-heading">03 / We get ready to begin</strong><p className="mt-2 leading-relaxed text-muted-foreground">After approval, we guide you through the materials and information we need.</p></li>
        </ol>
        <p className="mt-8 border-t border-border pt-5 text-sm">Prefer to talk first? <Link href="/contact" className="font-medium underline underline-offset-4">Get in touch</Link>.</p>
      </aside>
    </div>
  </section>;
}
