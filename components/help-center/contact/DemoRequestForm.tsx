'use client';

import {
  ChangeEvent,
  FormEvent,
  useState,
} from 'react';

import Link from 'next/link';

import {
  useSearchParams,
} from 'next/navigation';

import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Monitor,
} from 'lucide-react';

import {
  getDemoBySlug,
} from '@/data/demos/registry';

interface DemoFormData {
  name: string;
  email: string;
  company: string;
  website: string;
  interest: string;
  scope: string;
  timeline: string;
  budget: string;
  demoFocus: string;
  details: string;
}

const initialFormData: DemoFormData = {
  name: '',
  email: '',
  company: '',
  website: '',
  interest: '',
  scope: '',
  timeline: '',
  budget: '',
  demoFocus: '',
  details: '',
};

export function DemoRequestForm() {
  const searchParams =
    useSearchParams();

  const sourceSlug =
    searchParams.get(
      'from'
    );

  const sourceDemo =
    sourceSlug
      ? getDemoBySlug(
          sourceSlug
        )
      : undefined;

  const [
    formData,
    setFormData,
  ] =
    useState<DemoFormData>(
      initialFormData
    );

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const handleChange = (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    /*
     * Submission endpoint will be
     * connected later.
     *
     * sourceDemo is already available here
     * when you connect the backend, so it can
     * be included with the submission.
     */

    setSubmitted(true);
  };

  /* ================================================================== */
  /* Success                                                            */
  /* ================================================================== */

  if (submitted) {
    return (
      <div
        className="
          flex
          min-h-[420px]
          flex-col
          items-center
          justify-center
          px-4
          py-12
          text-center
        "
      >
        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[#BBFF1B]
            text-black
          "
        >
          <CheckCircle2
            size={26}
            strokeWidth={2}
          />
        </div>

        <h2
          className="
            mt-6
            font-serif
            text-3xl
            font-semibold
            tracking-[-0.035em]
            text-foreground
          "
        >
          Demo request ready.
        </h2>

        <p
          className="
            mt-3
            max-w-lg
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          Your request has
          completed the
          front-end flow. Once
          the submission
          endpoint is connected,
          Bivi can
          receive it
          automatically.
        </p>

        {sourceDemo && (
          <p
            className="
              mt-3
              text-sm
              text-muted-foreground
            "
          >
            Request originated
            from{' '}
            <span
              className="
                font-semibold
                text-foreground
              "
            >
              {
                sourceDemo.productName
              }
            </span>
            .
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setSubmitted(
              false
            );

            setFormData(
              initialFormData
            );
          }}
          className="
            mt-7
            text-sm
            font-semibold
            text-primary
          "
        >
          Submit another
          request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="
        flex
        flex-col
        gap-8
      "
    >
      {/* ============================================================ */}
      {/* Source demo                                                  */}
      {/* ============================================================ */}

      {sourceDemo && (
        <div
          className={`
            overflow-hidden
            rounded-2xl
            border
            border-border
            ${sourceDemo.presentation.stage}
          `}
        >
          <div
            className="
              flex
              flex-col
              gap-5
              p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:p-6
            "
          >
            <div
              className="
                flex
                min-w-0
                items-center
                gap-4
              "
            >
              <div
                className={`
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-black/[0.06]
                  shadow-sm
                  dark:border-white/[0.07]
                  ${sourceDemo.presentation.surface}
                `}
              >
                <Monitor
                  size={19}
                />
              </div>

              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-muted-foreground
                  "
                >
                  Currently
                  viewing
                </p>

                <p
                  className="
                    mt-1
                    truncate
                    text-base
                    font-semibold
                    text-foreground
                  "
                >
                  {
                    sourceDemo.productName
                  }
                  {' — '}
                  {
                    sourceDemo.title
                  }
                </p>

                <p
                  className="
                    mt-1
                    line-clamp-1
                    text-xs
                    text-muted-foreground
                  "
                >
                  {
                    sourceDemo.shortDescription
                  }
                </p>
              </div>
            </div>

            <Link
              href={
                sourceDemo.href
              }
              className="
                group
                inline-flex
                shrink-0
                items-center
                gap-1.5
                text-sm
                font-semibold
                text-foreground
              "
            >
              View demo

              <ArrowUpRight
                size={14}
                className="
                  transition-transform
                  duration-200
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
              />
            </Link>
          </div>
        </div>
      )}

      {/* Hidden context for future submission endpoint */}
      {sourceDemo && (
        <>
          <input
            type="hidden"
            name="sourceDemoSlug"
            value={
              sourceDemo.slug
            }
          />

          <input
            type="hidden"
            name="sourceDemoName"
            value={
              sourceDemo.productName
            }
          />
        </>
      )}

      {/* ============================================================ */}
      {/* Contact details                                              */}
      {/* ============================================================ */}

      <fieldset>
        <legend
          className="
            text-lg
            font-semibold
            tracking-[-0.02em]
            text-foreground
          "
        >
          Your details
        </legend>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          Tell us who you are
          and how to follow up
          with you.
        </p>

        <div
          className="
            mt-5
            grid
            gap-5
            sm:grid-cols-2
          "
        >
          <FormField
            label="Name"
            htmlFor="name"
            required
          >
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
              placeholder="Your name"
              className={
                inputClassName
              }
            />
          </FormField>

          <FormField
            label="Work email"
            htmlFor="email"
            required
          >
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              placeholder="you@company.com"
              className={
                inputClassName
              }
            />
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ============================================================ */}
      {/* Company                                                      */}
      {/* ============================================================ */}

      <fieldset>
        <legend
          className="
            text-lg
            font-semibold
            tracking-[-0.02em]
            text-foreground
          "
        >
          Company
        </legend>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          A little context about
          your business helps us
          show work that is
          actually relevant.
        </p>

        <div
          className="
            mt-5
            grid
            gap-5
            sm:grid-cols-2
          "
        >
          <FormField
            label="Company or brand"
            htmlFor="company"
            required
          >
            <input
              id="company"
              name="company"
              type="text"
              required
              value={
                formData.company
              }
              onChange={
                handleChange
              }
              placeholder="Company name"
              className={
                inputClassName
              }
            />
          </FormField>

          <FormField
            label="Website"
            htmlFor="website"
            hint="Optional"
          >
            <input
              id="website"
              name="website"
              type="url"
              value={
                formData.website
              }
              onChange={
                handleChange
              }
              placeholder="https://..."
              className={
                inputClassName
              }
            />
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ============================================================ */}
      {/* Area of interest                                             */}
      {/* ============================================================ */}

      <fieldset>
        <legend
          className="
            text-lg
            font-semibold
            tracking-[-0.02em]
            text-foreground
          "
        >
          What are you
          interested in?
        </legend>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          Choose the area that
          best matches what you
          want to explore.
        </p>

        <div
          className="
            mt-5
          "
        >
          <FormField
            label="Primary interest"
            htmlFor="interest"
            required
          >
            <select
              id="interest"
              name="interest"
              required
              value={
                formData.interest
              }
              onChange={
                handleChange
              }
              className={
                inputClassName
              }
            >
              <option value="">
                Select an area
              </option>

              <option value="brand-strategy">
                Brand Strategy
              </option>

              <option value="visual-identity">
                Visual Identity
              </option>

              <option value="graphic-design">
                Graphic Design
              </option>

              <option value="web-design">
                Web Design
              </option>

              <option value="web-development">
                Web Development
              </option>

              <option value="brand-and-web">
                Brand + Website
              </option>

              <option value="creative-direction">
                Creative
                Direction
              </option>

              <option value="other">
                Something else
              </option>
            </select>
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ============================================================ */}
      {/* Project context                                              */}
      {/* ============================================================ */}

      <fieldset>
        <legend
          className="
            text-lg
            font-semibold
            tracking-[-0.02em]
            text-foreground
          "
        >
          Project context
        </legend>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          Give us enough context
          to make the demo useful
          rather than generic.
        </p>

        <div
          className="
            mt-5
            flex
            flex-col
            gap-5
          "
        >
          <FormField
            label="What are you considering?"
            htmlFor="scope"
            required
          >
            <textarea
              id="scope"
              name="scope"
              required
              rows={6}
              value={
                formData.scope
              }
              onChange={
                handleChange
              }
              placeholder="Describe the project, challenge, or opportunity you are exploring..."
              className={
                textareaClassName
              }
            />
          </FormField>

          <FormField
            label="What would you like to see demonstrated?"
            htmlFor="demoFocus"
            required
          >
            <textarea
              id="demoFocus"
              name="demoFocus"
              required
              rows={5}
              value={
                formData.demoFocus
              }
              onChange={
                handleChange
              }
              placeholder={
                sourceDemo
                  ? `Tell us what you'd like to see beyond ${sourceDemo.productName}, or what you would change for your own use case...`
                  : 'For example: relevant product flows, interactions, layouts, capabilities, or a different demo concept...'
              }
              className={
                textareaClassName
              }
            />
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ============================================================ */}
      {/* Timing and budget                                            */}
      {/* ============================================================ */}

      <fieldset>
        <legend
          className="
            text-lg
            font-semibold
            tracking-[-0.02em]
            text-foreground
          "
        >
          Timing and investment
        </legend>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          These details help us
          determine which
          capabilities and
          examples are most
          relevant.
        </p>

        <div
          className="
            mt-5
            grid
            gap-5
            sm:grid-cols-2
          "
        >
          <FormField
            label="Timeline"
            htmlFor="timeline"
            hint="Optional"
          >
            <select
              id="timeline"
              name="timeline"
              value={
                formData.timeline
              }
              onChange={
                handleChange
              }
              className={
                inputClassName
              }
            >
              <option value="">
                Select timeline
              </option>

              <option value="asap">
                As soon as
                possible
              </option>

              <option value="1-2-months">
                1–2 months
              </option>

              <option value="3-6-months">
                3–6 months
              </option>

              <option value="6-plus-months">
                6+ months
              </option>

              <option value="exploring">
                Just exploring
              </option>
            </select>
          </FormField>

          <FormField
            label="Estimated budget"
            htmlFor="budget"
            hint="Optional"
          >
            <select
              id="budget"
              name="budget"
              value={
                formData.budget
              }
              onChange={
                handleChange
              }
              className={
                inputClassName
              }
            >
              <option value="">
                Select range
              </option>

              <option value="under-5k">
                Under $5,000
              </option>

              <option value="5k-10k">
                $5,000–$10,000
              </option>

              <option value="10k-25k">
                $10,000–$25,000
              </option>

              <option value="25k-50k">
                $25,000–$50,000
              </option>

              <option value="50k-plus">
                $50,000+
              </option>

              <option value="not-sure">
                Not sure yet
              </option>
            </select>
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ============================================================ */}
      {/* Additional details                                          */}
      {/* ============================================================ */}

      <FormField
        label="Anything else we should know?"
        htmlFor="details"
        hint="Optional"
      >
        <textarea
          id="details"
          name="details"
          rows={4}
          value={
            formData.details
          }
          onChange={
            handleChange
          }
          placeholder="Share any additional context, references, or questions..."
          className={
            textareaClassName
          }
        />
      </FormField>

      {/* ============================================================ */}
      {/* Submit                                                       */}
      {/* ============================================================ */}

      <div
        className="
          flex
          flex-col
          gap-4
          border-t
          border-border
          pt-7
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <p
          className="
            max-w-md
            text-xs
            leading-5
            text-muted-foreground
          "
        >
          Requesting a demo
          starts a conversation.
          It does not require you
          to commit to a project.
        </p>

        <button
          type="submit"
          className="
            group
            inline-flex
            min-h-[48px]
            items-center
            justify-center
            gap-2
            rounded-[14px]
            bg-primary
            px-6
            py-3
            text-sm
            font-semibold
            text-primary-foreground
            transition-opacity
            hover:opacity-90
          "
        >
          Request demo

          <ArrowRight
            size={16}
            strokeWidth={2}
            className="
              transition-transform
              duration-200
              group-hover:translate-x-1
            "
          />
        </button>
      </div>
    </form>
  );
}

/* ================================================================== */
/* Shared local field                                                 */
/* ================================================================== */

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children:
    React.ReactNode;
}

function FormField({
  label,
  htmlFor,
  hint,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div>
      <div
        className="
          mb-2
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <label
          htmlFor={
            htmlFor
          }
          className="
            text-sm
            font-semibold
            text-foreground
          "
        >
          {label}

          {required && (
            <span
              className="
                ml-1
                text-primary
              "
            >
              *
            </span>
          )}
        </label>

        {hint && (
          <span
            className="
              text-[11px]
              font-medium
              text-muted-foreground
            "
          >
            {hint}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

/* ================================================================== */
/* Styles                                                             */
/* ================================================================== */

const inputClassName = `
  h-12
  w-full
  rounded-xl
  border
  border-border
  bg-background
  px-4
  text-sm
  text-foreground
  outline-none
  transition
  duration-200
  placeholder:text-muted-foreground/60
  focus:border-primary
  focus:ring-4
  focus:ring-primary/10
`;

const textareaClassName = `
  w-full
  resize-y
  rounded-xl
  border
  border-border
  bg-background
  px-4
  py-3
  text-sm
  leading-6
  text-foreground
  outline-none
  transition
  duration-200
  placeholder:text-muted-foreground/60
  focus:border-primary
  focus:ring-4
  focus:ring-primary/10
`;