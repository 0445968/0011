'use client';

import {
  ChangeEvent,
  FormEvent,
  useState,
} from 'react';

import {
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface AppointmentFormData {
  name: string;
  email: string;
  company: string;
  role: string;
  website: string;
  service: string;
  project: string;
  challenge: string;
  outcome: string;
  startDate: string;
  launchDate: string;
  budget: string;
  preferredDays: string;
  preferredTime: string;
  timezone: string;
  contactMethod: string;
  details: string;
}

const initialFormData: AppointmentFormData = {
  name: '',
  email: '',
  company: '',
  role: '',
  website: '',
  service: '',
  project: '',
  challenge: '',
  outcome: '',
  startDate: '',
  launchDate: '',
  budget: '',
  preferredDays: '',
  preferredTime: '',
  timezone: '',
  contactMethod: '',
  details: '',
};

export function AppointmentRequestForm() {
  const [
    formData,
    setFormData,
  ] = useState<AppointmentFormData>(
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
     * Submission endpoint / scheduling
     * integration will be connected later.
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
          Appointment request ready.
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
          scheduling or submission
          endpoint is connected,
          Design Blade can receive it
          automatically.
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
          Request another appointment
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
          Tell us who you are and how
          we should follow up.
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

          <FormField
            label="Company or brand"
            htmlFor="company"
          >
            <input
              id="company"
              name="company"
              type="text"
              value={
                formData.company
              }
              onChange={
                handleChange
              }
              placeholder="Company name"
              className={inputClassName}
            />
          </FormField>

          <FormField
            label="Your role"
            htmlFor="role"
            hint="Optional"
          >
            <input
              id="role"
              name="role"
              type="text"
              value={
                formData.role
              }
              onChange={
                handleChange
              }
              placeholder="Founder, marketing lead..."
              className={inputClassName}
            />
          </FormField>
        </div>

        <div
          className="
            mt-5
          "
        >
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
              className={inputClassName}
            />
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ------------------------------------------------------------ */}
      {/* Service                                                      */}
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
          What do you need?
        </legend>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          Choose the service area that
          best matches the conversation
          you want to have.
        </p>

        <div
          className="
            mt-5
          "
        >
          <FormField
            label="Primary service"
            htmlFor="service"
            required
          >
            <select
              id="service"
              name="service"
              required
              value={
                formData.service
              }
              onChange={
                handleChange
              }
              className={inputClassName}
            >
              <option value="">
                Select a service
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

              <option value="logo-design">
                Logo Design
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

              <option value="consultation">
                Consultation
              </option>

              <option value="existing-project">
                Existing engagement
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
      {/* Project                                                      */}
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
          Tell us about the project
        </legend>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          A little preparation now makes
          the appointment much more useful.
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
            label="Project overview"
            htmlFor="project"
            required
          >
            <textarea
              id="project"
              name="project"
              required
              rows={6}
              value={
                formData.project
              }
              onChange={
                handleChange
              }
              placeholder="Tell us what you are working on and what you may need help with..."
              className={textareaClassName}
            />
          </FormField>

          <FormField
            label="What is the biggest challenge right now?"
            htmlFor="challenge"
            required
          >
            <textarea
              id="challenge"
              name="challenge"
              required
              rows={5}
              value={
                formData.challenge
              }
              onChange={
                handleChange
              }
              placeholder="What is getting in the way, changing, or creating uncertainty?"
              className={textareaClassName}
            />
          </FormField>

          <FormField
            label="What would a successful outcome look like?"
            htmlFor="outcome"
            required
          >
            <textarea
              id="outcome"
              name="outcome"
              required
              rows={5}
              value={
                formData.outcome
              }
              onChange={
                handleChange
              }
              placeholder="Describe the result you want to achieve..."
              className={textareaClassName}
            />
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ------------------------------------------------------------ */}
      {/* Timing and budget                                            */}
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
          Estimates are fine. These
          details simply help us understand
          the constraints around the work.
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
            label="Preferred start"
            htmlFor="startDate"
            hint="Optional"
          >
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={
                formData.startDate
              }
              onChange={
                handleChange
              }
              className={inputClassName}
            />
          </FormField>

          <FormField
            label="Target launch"
            htmlFor="launchDate"
            hint="Optional"
          >
            <input
              id="launchDate"
              name="launchDate"
              type="date"
              value={
                formData.launchDate
              }
              onChange={
                handleChange
              }
              className={inputClassName}
            />
          </FormField>
        </div>

        <div
          className="
            mt-5
          "
        >
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
              className={inputClassName}
            >
              <option value="">
                Select a range
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

      {/* ------------------------------------------------------------ */}
      {/* Appointment preferences                                      */}
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
          Appointment preferences
        </legend>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          For now, share your preferred
          availability. This can later be
          replaced with a live scheduling
          integration.
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
            label="Preferred days"
            htmlFor="preferredDays"
            required
          >
            <select
              id="preferredDays"
              name="preferredDays"
              required
              value={
                formData.preferredDays
              }
              onChange={
                handleChange
              }
              className={inputClassName}
            >
              <option value="">
                Select preference
              </option>

              <option value="monday">
                Monday
              </option>

              <option value="tuesday">
                Tuesday
              </option>

              <option value="wednesday">
                Wednesday
              </option>

              <option value="thursday">
                Thursday
              </option>

              <option value="friday">
                Friday
              </option>

              <option value="flexible">
                Flexible
              </option>
            </select>
          </FormField>

          <FormField
            label="Preferred time"
            htmlFor="preferredTime"
            required
          >
            <select
              id="preferredTime"
              name="preferredTime"
              required
              value={
                formData.preferredTime
              }
              onChange={
                handleChange
              }
              className={inputClassName}
            >
              <option value="">
                Select time
              </option>

              <option value="morning">
                Morning
              </option>

              <option value="midday">
                Midday
              </option>

              <option value="afternoon">
                Afternoon
              </option>

              <option value="evening">
                Evening
              </option>

              <option value="flexible">
                Flexible
              </option>
            </select>
          </FormField>
        </div>

        <div
          className="
            mt-5
            grid
            gap-5
            sm:grid-cols-2
          "
        >
          <FormField
            label="Time zone"
            htmlFor="timezone"
            required
          >
            <select
              id="timezone"
              name="timezone"
              required
              value={
                formData.timezone
              }
              onChange={
                handleChange
              }
              className={inputClassName}
            >
              <option value="">
                Select time zone
              </option>

              <option value="ET">
                Eastern Time
              </option>

              <option value="CT">
                Central Time
              </option>

              <option value="MT">
                Mountain Time
              </option>

              <option value="PT">
                Pacific Time
              </option>

              <option value="GMT">
                GMT
              </option>

              <option value="CET">
                Central European Time
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </FormField>

          <FormField
            label="Preferred contact method"
            htmlFor="contactMethod"
            hint="Optional"
          >
            <select
              id="contactMethod"
              name="contactMethod"
              value={
                formData.contactMethod
              }
              onChange={
                handleChange
              }
              className={inputClassName}
            >
              <option value="">
                Select method
              </option>

              <option value="video">
                Video call
              </option>

              <option value="phone">
                Phone
              </option>

              <option value="email-first">
                Email first
              </option>

              <option value="flexible">
                No preference
              </option>
            </select>
          </FormField>
        </div>
      </fieldset>

      <div className="h-px bg-border" />

      {/* ------------------------------------------------------------ */}
      {/* Additional context                                           */}
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
          placeholder="Add anything else that would help us prepare for the conversation..."
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
          This requests a conversation;
          it does not confirm a meeting
          time until Design Blade follows
          up or a scheduling integration
          is connected.
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
          Request appointment

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