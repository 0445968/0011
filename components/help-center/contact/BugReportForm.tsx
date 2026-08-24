'use client';

import {
  ChangeEvent,
  FormEvent,
  useState,
} from 'react';

import {
  ArrowRight,
  CheckCircle2,
  Upload,
} from 'lucide-react';

interface BugFormData {
  name: string;
  email: string;
  location: string;
  url: string;
  issue: string;
  expected: string;
  device: string;
  browser: string;
  details: string;
}

const initialFormData: BugFormData = {
  name: '',
  email: '',
  location: '',
  url: '',
  issue: '',
  expected: '',
  device: '',
  browser: '',
  details: '',
};

export function BugReportForm() {
  const [
    formData,
    setFormData,
  ] = useState<BugFormData>(
    initialFormData
  );

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    fileName,
    setFileName,
  ] = useState('');

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

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    setFileName(
      file?.name ?? ''
    );
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    /*
     * Backend submission will be added
     * later. For now this confirms the
     * complete front-end flow works.
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
          Bug report ready.
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
          The form flow is working.
          Once the submission endpoint
          is connected, this request
          can be delivered to Design
          Blade automatically.
        </p>

        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFormData(
              initialFormData
            );
            setFileName('');
          }}
          className="
            mt-7
            text-sm
            font-semibold
            text-primary
          "
        >
          Submit another report
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
      {/* Contact information                                          */}
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
          Tell us how to reach you if
          we need more information.
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
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              placeholder="you@example.com"
              className={inputClassName}
            />
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ------------------------------------------------------------ */}
      {/* Issue location                                               */}
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
          Where did the issue happen?
        </legend>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          This helps us identify the
          right part of the site or
          product to investigate.
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
            label="Area"
            htmlFor="location"
            required
          >
            <select
              id="location"
              name="location"
              required
              value={
                formData.location
              }
              onChange={
                handleChange
              }
              className={inputClassName}
            >
              <option value="">
                Select an area
              </option>

              <option value="website">
                Bivi website
              </option>

              <option value="studio-lab">
                Studio Lab
              </option>

              <option value="tool">
                Free tool
              </option>

              <option value="assessment">
                Assessment
              </option>

              <option value="resource">
                Resource or guide
              </option>

              <option value="help-center">
                Help Center
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </FormField>

          <FormField
            label="Page URL"
            htmlFor="url"
            hint="Optional"
          >
            <input
              id="url"
              name="url"
              type="url"
              value={
                formData.url
              }
              onChange={
                handleChange
              }
              placeholder="https://..."
              className={inputClassName}
            />
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ------------------------------------------------------------ */}
      {/* Problem description                                          */}
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
          What happened?
        </legend>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          Describe the issue clearly
          enough that we can try to
          reproduce it.
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
            label="Describe the problem"
            htmlFor="issue"
            required
          >
            <textarea
              id="issue"
              name="issue"
              required
              rows={6}
              value={
                formData.issue
              }
              onChange={
                handleChange
              }
              placeholder="Tell us what you were doing and what went wrong..."
              className={textareaClassName}
            />
          </FormField>

          <FormField
            label="What did you expect to happen?"
            htmlFor="expected"
            required
          >
            <textarea
              id="expected"
              name="expected"
              required
              rows={4}
              value={
                formData.expected
              }
              onChange={
                handleChange
              }
              placeholder="Describe the expected behavior..."
              className={textareaClassName}
            />
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ------------------------------------------------------------ */}
      {/* Environment                                                  */}
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
          Your setup
        </legend>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          Device and browser details
          can help us reproduce
          technical issues faster.
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
            label="Device"
            htmlFor="device"
          >
            <select
              id="device"
              name="device"
              value={
                formData.device
              }
              onChange={
                handleChange
              }
              className={inputClassName}
            >
              <option value="">
                Select device
              </option>

              <option value="desktop">
                Desktop
              </option>

              <option value="laptop">
                Laptop
              </option>

              <option value="tablet">
                Tablet
              </option>

              <option value="iphone">
                iPhone
              </option>

              <option value="android">
                Android phone
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </FormField>

          <FormField
            label="Browser"
            htmlFor="browser"
          >
            <select
              id="browser"
              name="browser"
              value={
                formData.browser
              }
              onChange={
                handleChange
              }
              className={inputClassName}
            >
              <option value="">
                Select browser
              </option>

              <option value="chrome">
                Chrome
              </option>

              <option value="safari">
                Safari
              </option>

              <option value="firefox">
                Firefox
              </option>

              <option value="edge">
                Microsoft Edge
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ------------------------------------------------------------ */}
      {/* Attachment                                                   */}
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
          Screenshot or attachment
        </legend>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          A screenshot can make visual
          or interface problems much
          easier to understand.
        </p>

        <label
          htmlFor="bug-attachment"
          className="
            group
            mt-5
            flex
            cursor-pointer
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            border-dashed
            border-border
            bg-secondary/20
            px-6
            py-9
            text-center
            transition-colors
            duration-200
            hover:border-primary/50
            hover:bg-primary/[0.03]
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-primary/10
              text-primary
            "
          >
            <Upload
              size={19}
              strokeWidth={2}
            />
          </div>

          <span
            className="
              mt-4
              text-sm
              font-semibold
              text-foreground
            "
          >
            {fileName
              ? fileName
              : 'Choose a file'}
          </span>

          <span
            className="
              mt-1
              text-xs
              leading-5
              text-muted-foreground
            "
          >
            Screenshot, image, or
            supporting file
          </span>

          <input
            id="bug-attachment"
            type="file"
            accept="
              image/png,
              image/jpeg,
              image/webp,
              application/pdf
            "
            onChange={
              handleFileChange
            }
            className="sr-only"
          />
        </label>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ------------------------------------------------------------ */}
      {/* Additional information                                       */}
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
          placeholder="Add any other context that may be useful..."
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
        <p
          className="
            max-w-md
            text-xs
            leading-5
            text-muted-foreground
          "
        >
          Fields marked as required
          help us investigate the issue
          without immediately needing
          more information.
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
          Submit bug report

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
/* Field styles                                                              */
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