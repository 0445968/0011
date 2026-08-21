'use client';

import {
  ChangeEvent,
  FormEvent,
  useState,
} from 'react';

import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';

interface FeatureFormData {
  name: string;
  email: string;
  area: string;
  title: string;
  description: string;
  problem: string;
  audience: string;
  priority: string;
  details: string;
}

const initialFormData: FeatureFormData = {
  name: '',
  email: '',
  area: '',
  title: '',
  description: '',
  problem: '',
  audience: '',
  priority: '',
  details: '',
};

export function FeatureRequestForm() {
  const [
    formData,
    setFormData,
  ] = useState<FeatureFormData>(
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
     */

    setSubmitted(true);
  };

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
          Feature request ready.
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
          Your request has completed
          the front-end flow. Once the
          submission endpoint is
          connected, it can be delivered
          to Design Blade automatically.
        </p>

        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
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
          Submit another idea
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        flex
        flex-col
        gap-8
      "
    >
      {/* ------------------------------------------------------------ */}
      {/* Contact details                                              */}
      {/* ------------------------------------------------------------ */}

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
          Tell us who is suggesting the
          idea in case we need more
          context.
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
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              className={inputClassName}
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="email"
            required
          >
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={inputClassName}
            />
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ------------------------------------------------------------ */}
      {/* Request location                                             */}
      {/* ------------------------------------------------------------ */}

      <fieldset>
        <legend
          className="
            text-lg
            font-semibold
            tracking-[-0.02em]
            text-foreground
          "
        >
          Where would you like to see it?
        </legend>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          Choose the part of Design Blade
          that your idea relates to.
        </p>

        <div
          className="
            mt-5
          "
        >
          <FormField
            label="Area"
            htmlFor="area"
            required
          >
            <select
              id="area"
              name="area"
              required
              value={formData.area}
              onChange={handleChange}
              className={inputClassName}
            >
              <option value="">
                Select an area
              </option>

              <option value="website">
                Design Blade website
              </option>

              <option value="help-center">
                Help Center
              </option>

              <option value="resource-library">
                Resource Library
              </option>

              <option value="studio-lab">
                Studio Lab
              </option>

              <option value="assessment">
                Brand assessment
              </option>

              <option value="tool">
                Free tool
              </option>

              <option value="other">
                Something else
              </option>
            </select>
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ------------------------------------------------------------ */}
      {/* Idea                                                         */}
      {/* ------------------------------------------------------------ */}

      <fieldset>
        <legend
          className="
            text-lg
            font-semibold
            tracking-[-0.02em]
            text-foreground
          "
        >
          Tell us about the idea
        </legend>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          Describe what you would like
          added or improved.
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
            label="Feature title"
            htmlFor="title"
            required
          >
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Give your idea a short name"
              className={inputClassName}
            />
          </FormField>

          <FormField
            label="What would you like us to add?"
            htmlFor="description"
            required
          >
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              value={
                formData.description
              }
              onChange={
                handleChange
              }
              placeholder="Describe the feature or improvement you have in mind..."
              className={textareaClassName}
            />
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ------------------------------------------------------------ */}
      {/* Problem                                                      */}
      {/* ------------------------------------------------------------ */}

      <fieldset>
        <legend
          className="
            text-lg
            font-semibold
            tracking-[-0.02em]
            text-foreground
          "
        >
          Why would this be useful?
        </legend>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          Ideas are easier to evaluate
          when we understand the problem
          behind them.
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
            label="What problem would this solve?"
            htmlFor="problem"
            required
          >
            <textarea
              id="problem"
              name="problem"
              required
              rows={5}
              value={
                formData.problem
              }
              onChange={
                handleChange
              }
              placeholder="Explain the problem, limitation, or friction this would address..."
              className={textareaClassName}
            />
          </FormField>

          <FormField
            label="Who would this help?"
            htmlFor="audience"
            hint="Optional"
          >
            <input
              id="audience"
              name="audience"
              type="text"
              value={
                formData.audience
              }
              onChange={
                handleChange
              }
              placeholder="For example: small businesses, designers, founders..."
              className={inputClassName}
            />
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ------------------------------------------------------------ */}
      {/* Priority                                                     */}
      {/* ------------------------------------------------------------ */}

      <FormField
        label="How useful would this be to you?"
        htmlFor="priority"
        hint="Optional"
      >
        <select
          id="priority"
          name="priority"
          value={
            formData.priority
          }
          onChange={
            handleChange
          }
          className={inputClassName}
        >
          <option value="">
            Select one
          </option>

          <option value="nice-to-have">
            Nice to have
          </option>

          <option value="useful">
            Useful
          </option>

          <option value="very-useful">
            Very useful
          </option>

          <option value="essential">
            It would solve a major need
          </option>
        </select>
      </FormField>

      <div className="h-px bg-border" />

      {/* ------------------------------------------------------------ */}
      {/* Extra context                                                */}
      {/* ------------------------------------------------------------ */}

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
          placeholder="Share examples, references, or any additional context..."
          className={textareaClassName}
        />
      </FormField>

      {/* ------------------------------------------------------------ */}
      {/* Submit                                                       */}
      {/* ------------------------------------------------------------ */}

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
        <div
          className="
            flex
            max-w-md
            items-start
            gap-2.5
          "
        >
          <Lightbulb
            size={15}
            strokeWidth={2}
            className="
              mt-0.5
              shrink-0
              text-primary
            "
          />

          <p
            className="
              text-xs
              leading-5
              text-muted-foreground
            "
          >
            Feature requests help shape
            future improvements, but
            submitting an idea does not
            guarantee that it will be
            implemented.
          </p>
        </div>

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
          Submit feature request

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

/* -------------------------------------------------------------------------- */
/* Shared local field                                                        */
/* -------------------------------------------------------------------------- */

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
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
          htmlFor={htmlFor}
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

/* -------------------------------------------------------------------------- */
/* Styles                                                                    */
/* -------------------------------------------------------------------------- */

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