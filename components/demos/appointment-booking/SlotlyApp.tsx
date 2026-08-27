'use client';

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CreditCard,
  Gift,
  Leaf,
  MapPin,
  Sparkles,
  UserRound,
} from 'lucide-react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import {
  Cormorant_Garamond,
  DM_Sans,
} from 'next/font/google';

import { BookingCalendar } from './BookingCalendar';
import {
  getAvailabilityForDate,
  professionals,
  spaLocations,
  spaServices,
} from './data';
import { SpaMap } from './SpaMap';
import { useBookingState } from './useBookingState';

const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-verdant-display',
});

const uiFont = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-verdant-ui',
});

const steps = [
  'location',
  'service',
  'datetime',
  'preferences',
  'payment',
] as const;

function formatDate(date: Date | null) {
  if (!date) return '';

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function SlotlyApp() {
  const booking = useBookingState();

  const activeIndex = Math.max(
    0,
    steps.indexOf(
      booking.step as (typeof steps)[number]
    )
  );

  return (
    <div
      className={`
        ${displayFont.variable}
        ${uiFont.variable}
        relative
        min-h-screen
        bg-[#004910]
        bg-[url('/images/demos/appointment-booking/spa-background.jpg')]
    bg-cover
    bg-center
    bg-fixed
    text-[#173d2f]
  `}
  style={{
    fontFamily: 'var(--font-verdant-ui)',
  }}
>
      <header
        className="
          border-b
          border-[#aec4b5]
          bg-[#d9e7dc]/90
          px-5
          py-4
          backdrop-blur-xl
          sm:px-8
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-[1240px]
            items-center
            justify-between
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                grid
                h-10
                w-10
                place-items-center
                rounded-full
                bg-[#173f30]
                text-[#eaf4ed]
              "
            >
              <Leaf className="h-[18px] w-[18px]" />
            </div>

            <div>
              <div
                className="
                  text-[24px]
                  font-semibold
                  leading-none
                "
                style={{
                  fontFamily:
                    'var(--font-verdant-display)',
                }}
              >
                Sage & Stone Spa
              </div>

              <div
                className="
                  mt-1
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-[#718b7b]
                "
              >
                Spa & wellness
              </div>
            </div>
          </div>

          {booking.step !== 'confirmed' ? (
            <div
              className="
                hidden
                items-center
                gap-2
                md:flex
              "
            >
              {steps.map((step, index) => (
                <div
                  key={step}
                  className={`
                    h-1.5
                    rounded-full
                    transition-all
                    duration-300
                    ${
                      index <= activeIndex
                        ? `
                          w-8
                          bg-[#1a4c39]
                        `
                        : `
                          w-5
                          bg-[#a9bfae]
                        `
                    }
                  `}
                />
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <main
        className="
          mx-auto
          max-w-[1240px]
          px-4
          py-8
          sm:px-6
          lg:px-8
          lg:py-12
        "
      >
        <div
          className="
            overflow-hidden
            rounded-[34px]
            border
            border-[#adc3b3]
            bg-[#ffffff]
            shadow-[0_30px_80px_rgba(32,73,52,.12)]
          "
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={booking.step}
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -6,
              }}
              transition={{
                duration: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {booking.step === 'location' ? (
                <LocationStep booking={booking} />
              ) : null}

              {booking.step === 'service' ? (
                <ServiceStep booking={booking} />
              ) : null}

              {booking.step === 'datetime' ? (
                <DateTimeStep booking={booking} />
              ) : null}

              {booking.step === 'preferences' ? (
                <PreferencesStep booking={booking} />
              ) : null}

              {booking.step === 'payment' ? (
                <PaymentStep booking={booking} />
              ) : null}

              {booking.step === 'confirmed' ? (
                <ConfirmationStep booking={booking} />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function StepHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p
        className="
          text-[10px]
          font-bold
          uppercase
          tracking-[0.2em]
          text-[#6c8a79]
        "
      >
        {eyebrow}
      </p>

      <h1
        className="
          mt-3
          max-w-[720px]
          text-[42px]
          font-semibold
          leading-[0.96]
          tracking-[-0.035em]
          text-[#000000]
          sm:text-[54px]
        "
        style={{
          fontFamily:
            'var(--font-verdant-display)',
        }}
      >
        {title}
      </h1>

      <p
        className="
          mt-4
          max-w-2xl
          text-sm
          leading-6
          text-[#698174]
          sm:text-[15px]
        "
      >
        {description}
      </p>
    </div>
  );
}

function LocationStep({
  booking,
}: {
  booking: ReturnType<typeof useBookingState>;
}) {
  return (
    <div
      className="
        grid
        gap-8
        p-6
        lg:grid-cols-[0.9fr_1.1fr]
        lg:p-10
        xl:p-12
      "
    >
      <div>
        <StepHeader
          eyebrow="Step 1 · Location"
          title="Choose your spa."
          description="Select the Sage & Stone location that feels most convenient for your visit."
        />

        <div className="mt-8 space-y-3">
          {spaLocations.map((location) => {
            const active =
              booking.location.id === location.id;

            return (
              <button
                key={location.id}
                type="button"
                onClick={() =>
                  booking.chooseLocation(location)
                }
                className={`
                  flex
                  w-full
                  items-start
                  justify-between
                  rounded-[22px]
                  border
                  p-5
                  text-left
                  transition
                  ${
                    active
                      ? `
                        border-[#567d68]
                        bg-[#deebe1]
                      `
                      : `
                        border-[#c4d4c9]
                        bg-[#f6faf6]
                        hover:border-[#84a391]
                      `
                  }
                `}
              >
                <div>
                  <p
                    className="
                      font-semibold
                      text-[#1c4938]
                    "
                  >
                    {location.name}
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-[#718779]
                    "
                  >
                    {location.address}
                  </p>

                  <p
                    className="
                      mt-3
                      text-[11px]
                      font-medium
                      text-[#648171]
                    "
                  >
                    {location.hours}
                  </p>
                </div>

                <span
                  className="
                    text-xs
                    font-semibold
                    text-[#62806f]
                  "
                >
                  {location.distance}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() =>
            booking.setStep('service')
          }
          className="
            mt-6
            inline-flex
            h-12
            items-center
            gap-2
            rounded-full
            bg-[#000000]
            px-6
            text-sm
            font-semibold
            text-[#edf6f0]
            transition
            hover:bg-[#21533f]
          "
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <SpaMap
        selected={booking.location}
        onSelect={(location) => {
          booking.chooseLocation(location);
          booking.setStep('location');
        }}
      />
    </div>
  );
}

function ServiceStep({
  booking,
}: {
  booking: ReturnType<typeof useBookingState>;
}) {
  return (
    <div
      className="
        p-6
        lg:p-10
        xl:p-12
      "
    >
      <BackButton
        onClick={() =>
          booking.setStep('location')
        }
      />

      <StepHeader
        eyebrow="Step 2 · Service"
        title="Choose your treatment."
        description={`Available at ${booking.location.neighborhood}. Select the treatment that matches how you want to feel when you leave.`}
      />

      <div
        className="
          mt-9
          grid
          gap-4
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {spaServices.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() =>
              booking.chooseService(service)
            }
            className="
              group
              rounded-[26px]
              border
              border-[#bfd0c4]
              bg-[#f7faf7]
              p-6
              text-left
              transition
              hover:-translate-y-0.5
              hover:border-[#7b9c87]
              hover:bg-[#e8f1ea]
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <span
                className="
                  rounded-full
                  bg-[#dce9df]
                  px-3
                  py-1
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[#577463]
                "
              >
                {service.category}
              </span>

              <span
                className="
                  text-sm
                  font-semibold
                  text-[#204d3b]
                "
              >
                ${service.price}
              </span>
            </div>

            <h3
              className="
                mt-6
                text-[28px]
                font-semibold
                leading-none
                text-[#173f30]
              "
              style={{
                fontFamily:
                  'var(--font-verdant-display)',
              }}
            >
              {service.name}
            </h3>

            <p
              className="
                mt-3
                min-h-[72px]
                text-sm
                leading-6
                text-[#718478]
              "
            >
              {service.description}
            </p>

            <div
              className="
                mt-5
                flex
                items-center
                justify-between
                border-t
                border-[#d4e0d7]
                pt-4
                text-xs
                font-semibold
                text-[#6a8575]
              "
            >
              <span>{service.duration} min</span>

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function DateTimeStep({
  booking,
}: {
  booking: ReturnType<typeof useBookingState>;
}) {
  const slots = booking.selectedDate
    ? getAvailabilityForDate(
        booking.selectedDate
      )
    : [];

  return (
    <div
      className="
        p-6
        lg:p-10
        xl:p-12
      "
    >
      <BackButton
        onClick={() =>
          booking.setStep('service')
        }
      />

      <StepHeader
        eyebrow="Step 3 · Date & time"
        title="When would you like to come in?"
        description={`${booking.service.name} · ${booking.service.duration} minutes · ${booking.location.neighborhood}`}
      />

      <div
        className="
          mt-9
          grid
          gap-7
          lg:grid-cols-[1fr_300px]
        "
      >
        <div
          className="
            rounded-[26px]
            border
            border-[#bfd0c4]
            bg-[#f8fbf8]
            p-5
            sm:p-7
          "
        >
          <BookingCalendar
            selectedDate={
              booking.selectedDate
            }
            onSelectDate={
              booking.chooseDate
            }
          />
        </div>

        <div>
          <p
            className="
              text-sm
              font-semibold
              text-[#204b3a]
            "
          >
            {booking.selectedDate
              ? formatDate(
                  booking.selectedDate
                )
              : 'Select a day'}
          </p>

          <div
            className="
              mt-4
              grid
              grid-cols-2
              gap-2
              lg:grid-cols-1
            "
          >
            {booking.selectedDate ? (
              slots.map((time) => {
                const active =
                  booking.selectedTime === time;

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() =>
                      booking.setSelectedTime(
                        time
                      )
                    }
                    className={`
                      h-11
                      rounded-full
                      border
                      text-sm
                      font-semibold
                      transition
                      ${
                        active
                          ? `
                            border-[#173f30]
                            bg-[#173f30]
                            text-[#eef7f1]
                          `
                          : `
                            border-[#b9cdbf]
                            bg-[#f8fbf8]
                            text-[#315a49]
                            hover:bg-[#e3eee6]
                          `
                      }
                    `}
                  >
                    {time}
                  </button>
                );
              })
            ) : (
              <div
                className="
                  col-span-full
                  rounded-[22px]
                  border
                  border-dashed
                  border-[#bdd0c3]
                  p-5
                  text-sm
                  leading-6
                  text-[#748b7d]
                "
              >
                Choose an available date to see appointment times.
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={
              !booking.selectedDate ||
              !booking.selectedTime
            }
            onClick={() =>
              booking.setStep('preferences')
            }
            className="
              mt-5
              h-12
              w-full
              rounded-full
              bg-[#000000]
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#21533f]
              disabled:cursor-not-allowed
              disabled:opacity-35
            "
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function PreferencesStep({
  booking,
}: {
  booking: ReturnType<typeof useBookingState>;
}) {
  return (
    <div
      className="
        p-6
        lg:p-10
        xl:p-12
      "
    >
      <BackButton
        onClick={() =>
          booking.setStep('datetime')
        }
      />

      <StepHeader
        eyebrow="Step 4 · Preferences"
        title="Personalize your visit."
        description="Request a specific professional, tell us how you found us, and share anything that may help us prepare."
      />

      <div
        className="
          mt-9
          grid
          gap-8
          lg:grid-cols-[1.15fr_.85fr]
        "
      >
        <div>
          <div
            className="
              mb-4
              flex
              items-center
              gap-2
            "
          >
            <UserRound
              className="
                h-4
                w-4
                text-[#315a49]
              "
            />

            <h3
              className="
                text-sm
                font-semibold
                text-[#214a39]
              "
            >
              Request a spa professional
            </h3>
          </div>

          <button
            type="button"
            onClick={() =>
              booking.setProfessional(null)
            }
            className={`
              mb-3
              w-full
              rounded-[20px]
              border
              p-4
              text-left
              text-sm
              font-semibold
              transition
              ${
                booking.professional === null
                  ? `
                    border-[#567d68]
                    bg-[#deebe1]
                  `
                  : `
                    border-[#c0d1c5]
                    bg-[#f8fbf8]
                  `
              }
            `}
          >
            No preference — match me with the best available professional
          </button>

          <div
            className="
              grid
              gap-3
              sm:grid-cols-2
            "
          >
            {professionals.map((pro) => (
              <button
                key={pro.id}
                type="button"
                disabled={!pro.available}
                onClick={() =>
                  booking.setProfessional(pro)
                }
                className={`
                  rounded-[22px]
                  border
                  p-4
                  text-left
                  transition
                  ${
                    booking.professional?.id ===
                    pro.id
                      ? `
                        border-[#567d68]
                        bg-[#deebe1]
                      `
                      : `
                        border-[#c0d1c5]
                        bg-[#f8fbf8]
                        hover:border-[#86a393]
                      `
                  }
                  ${
                    !pro.available
                      ? `
                        cursor-not-allowed
                        opacity-45
                      `
                      : ''
                  }
                `}
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      grid
                      h-10
                      w-10
                      place-items-center
                      rounded-full
                      bg-[#d3e2d7]
                      text-xs
                      font-bold
                      text-[#315846]
                    "
                  >
                    {pro.initials}
                  </div>

                  <div>
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-[#204a39]
                      "
                    >
                      {pro.name}
                    </p>

                    <p
                      className="
                        text-[11px]
                        text-[#72887b]
                      "
                    >
                      {pro.title}
                    </p>
                  </div>
                </div>

                <p
                  className="
                    mt-3
                    text-[11px]
                    leading-5
                    text-[#718679]
                  "
                >
                  {pro.specialties.join(' · ')}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <SelectField
            label="How did you hear about us?"
            value={booking.guest.referral}
            onChange={(value) =>
              booking.updateGuest(
                'referral',
                value
              )
            }
          />

          <TextAreaField
            label="Anything we should know?"
            value={booking.guest.notes}
            onChange={(value) =>
              booking.updateGuest(
                'notes',
                value
              )
            }
          />

          <button
            type="button"
            onClick={() =>
              booking.setStep('payment')
            }
            className="
              h-12
              w-full
              rounded-full
              bg-[#000000]
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#21533f]
            "
          >
            Continue to payment
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentStep({
  booking,
}: {
  booking: ReturnType<typeof useBookingState>;
}) {
  const cardMode =
    booking.payment.method === 'card';

  const canSubmit = cardMode
    ? booking.guest.name.trim().length > 1 &&
      booking.guest.email.includes('@') &&
      booking.payment.cardNumber.trim().length >=
        12 &&
      booking.payment.cardName.trim().length >
        1 &&
      booking.payment.expiry.trim().length >=
        4 &&
      booking.payment.cvc.trim().length >= 3
    : booking.guest.name.trim().length > 1 &&
      booking.guest.email.includes('@') &&
      booking.payment.giftCard.trim().length >=
        4;

  return (
    <div
      className="
        p-6
        lg:p-10
        xl:p-12
      "
    >
      <BackButton
        onClick={() =>
          booking.setStep('preferences')
        }
      />

      <StepHeader
        eyebrow="Step 5 · Payment"
        title="Reserve your treatment."
        description="Enter your guest details and choose how you would like to secure your booking."
      />

      <div
        className="
          mt-9
          grid
          gap-8
          lg:grid-cols-[1fr_360px]
        "
      >
        <div className="space-y-6">
          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
            "
          >
            <InputField
              label="Full name"
              value={booking.guest.name}
              onChange={(value) =>
                booking.updateGuest(
                  'name',
                  value
                )
              }
              placeholder="Your name"
            />

            <InputField
              label="Email"
              value={booking.guest.email}
              onChange={(value) =>
                booking.updateGuest(
                  'email',
                  value
                )
              }
              placeholder="you@example.com"
            />

            <InputField
              label="Phone"
              value={booking.guest.phone}
              onChange={(value) =>
                booking.updateGuest(
                  'phone',
                  value
                )
              }
              placeholder="(555) 000-0000"
            />
          </div>

          <div>
            <p
              className="
                mb-3
                text-sm
                font-semibold
                text-[#214a39]
              "
            >
              Payment method
            </p>

            <div
              className="
                grid
                grid-cols-2
                gap-3
              "
            >
              <PaymentMethodButton
                active={cardMode}
                icon={
                  <CreditCard className="h-4 w-4" />
                }
                label="Card"
                onClick={() =>
                  booking.updatePayment(
                    'method',
                    'card'
                  )
                }
              />

              <PaymentMethodButton
                active={!cardMode}
                icon={
                  <Gift className="h-4 w-4" />
                }
                label="Gift card"
                onClick={() =>
                  booking.updatePayment(
                    'method',
                    'gift-card'
                  )
                }
              />
            </div>
          </div>

          {cardMode ? (
            <div
              className="
                grid
                gap-4
                sm:grid-cols-2
              "
            >
              <div className="sm:col-span-2">
                <InputField
                  label="Card number"
                  value={
                    booking.payment.cardNumber
                  }
                  onChange={(value) =>
                    booking.updatePayment(
                      'cardNumber',
                      value
                    )
                  }
                  placeholder="4242 4242 4242 4242"
                />
              </div>

              <div className="sm:col-span-2">
                <InputField
                  label="Name on card"
                  value={
                    booking.payment.cardName
                  }
                  onChange={(value) =>
                    booking.updatePayment(
                      'cardName',
                      value
                    )
                  }
                  placeholder="Name on card"
                />
              </div>

              <InputField
                label="Expiry"
                value={
                  booking.payment.expiry
                }
                onChange={(value) =>
                  booking.updatePayment(
                    'expiry',
                    value
                  )
                }
                placeholder="MM / YY"
              />

              <InputField
                label="CVC"
                value={booking.payment.cvc}
                onChange={(value) =>
                  booking.updatePayment(
                    'cvc',
                    value
                  )
                }
                placeholder="123"
              />
            </div>
          ) : (
            <InputField
              label="Gift card number"
              value={
                booking.payment.giftCard
              }
              onChange={(value) =>
                booking.updatePayment(
                  'giftCard',
                  value
                )
              }
              placeholder="Enter gift card code"
            />
          )}
        </div>

        <div
          className="
            rounded-[28px]
            border
            border-[#b9cdbf]
            bg-[#dfece2]
            p-6
          "
        >
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-[#658272]
            "
          >
            Booking summary
          </p>

          <h3
            className="
              mt-4
              text-[30px]
              font-semibold
              leading-none
              text-[#173f30]
            "
            style={{
              fontFamily:
                'var(--font-verdant-display)',
            }}
          >
            {booking.service.name}
          </h3>

          <div
            className="
              mt-6
              space-y-4
              text-sm
              text-[#4e6c5e]
            "
          >
            <SummaryLine
              label="Location"
              value={
                booking.location.neighborhood
              }
            />

            <SummaryLine
              label="Date"
              value={formatDate(
                booking.selectedDate
              )}
            />

            <SummaryLine
              label="Time"
              value={
                booking.selectedTime ?? ''
              }
            />

            <SummaryLine
              label="Professional"
              value={
                booking.professional?.name ??
                'Best available'
              }
            />

            <SummaryLine
              label="Duration"
              value={`${booking.service.duration} min`}
            />
          </div>

          <div
            className="
              mt-6
              border-t
              border-[#b8cdbf]
              pt-5
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <span
                className="
                  text-sm
                  font-semibold
                  text-[#315a49]
                "
              >
                Total
              </span>

              <span
                className="
                  text-[30px]
                  font-semibold
                  text-[#173f30]
                "
                style={{
                  fontFamily:
                    'var(--font-verdant-display)',
                }}
              >
                ${booking.service.price}
              </span>
            </div>

            <p
              className="
                mt-2
                text-[11px]
                leading-5
                text-[#72887a]
              "
            >
              Demo only. No real payment will be processed.
            </p>
          </div>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              booking.setStep('confirmed')
            }
            className="
              mt-6
              h-12
              w-full
              rounded-full
              bg-[#173f30]
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#21533f]
              disabled:cursor-not-allowed
              disabled:opacity-35
            "
          >
            Reserve appointment
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmationStep({
  booking,
}: {
  booking: ReturnType<typeof useBookingState>;
}) {
  return (
    <div
      className="
        flex
        min-h-[620px]
        flex-col
        items-center
        justify-center
        p-8
        text-center
      "
    >
      <motion.div
        initial={{
          scale: 0.8,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 220,
          damping: 18,
        }}
        className="
          grid
          h-16
          w-16
          place-items-center
          rounded-full
          bg-[#173f30]
          text-[#eaf4ed]
        "
      >
        <Check className="h-7 w-7" />
      </motion.div>

      <p
        className="
          mt-6
          text-[10px]
          font-bold
          uppercase
          tracking-[0.2em]
          text-[#6b8978]
        "
      >
        Appointment reserved
      </p>

      <h2
        className="
          mt-4
          max-w-2xl
          text-[48px]
          font-semibold
          leading-[0.95]
          tracking-[-0.035em]
          text-[#173f30]
          sm:text-[64px]
        "
        style={{
          fontFamily:
            'var(--font-verdant-display)',
        }}
      >
        Your moment of calm is on the calendar.
      </h2>

      <p
        className="
          mt-5
          max-w-lg
          text-sm
          leading-6
          text-[#698174]
        "
      >
        This is a simulated spa booking for the demo. No payment, email, or real appointment was created.
      </p>

      <div
        className="
          mt-8
          grid
          w-full
          max-w-2xl
          gap-3
          sm:grid-cols-3
        "
      >
        <ConfirmationCard
          icon={
            <MapPin className="h-4 w-4" />
          }
          label={
            booking.location.neighborhood
          }
        />

        <ConfirmationCard
          icon={
            <CalendarDays className="h-4 w-4" />
          }
          label={formatDate(
            booking.selectedDate
          )}
        />

        <ConfirmationCard
          icon={
            <Sparkles className="h-4 w-4" />
          }
          label={booking.service.name}
        />
      </div>

      <button
        type="button"
        onClick={booking.reset}
        className="
          mt-8
          inline-flex
          h-12
          items-center
          gap-2
          rounded-full
          bg-[#173f30]
          px-6
          text-sm
          font-semibold
          text-white
          transition
          hover:bg-[#21533f]
        "
      >
        Book another visit
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function BackButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        mb-7
        inline-flex
        items-center
        gap-2
        text-xs
        font-semibold
        text-[#648171]
        transition
        hover:text-[#173f30]
      "
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}

function InputField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        className="
          mb-2
          block
          text-xs
          font-semibold
          text-[#315a49]
        "
      >
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="
          h-12
          w-full
          rounded-full
          border
          border-[#b9cdbf]
          bg-[#f8fbf8]
          px-4
          text-sm
          text-[#173f30]
          outline-none
          transition
          placeholder:text-[#98aa9e]
          focus:border-[#5d826c]
          focus:ring-4
          focus:ring-[#5d826c]/10
        "
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        className="
          mb-2
          block
          text-xs
          font-semibold
          text-[#315a49]
        "
      >
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="
          h-12
          w-full
          rounded-full
          border
          border-[#b9cdbf]
          bg-[#f8fbf8]
          px-4
          text-sm
          text-[#173f30]
          outline-none
        "
      >
        <option value="">
          Choose one
        </option>
        <option>
          Friend or family
        </option>
        <option>
          Instagram
        </option>
        <option>
          Google
        </option>
        <option>
          Hotel or concierge
        </option>
        <option>
          Gift card
        </option>
        <option>
          Returning guest
        </option>
        <option>
          Other
        </option>
      </select>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        className="
          mb-2
          block
          text-xs
          font-semibold
          text-[#315a49]
        "
      >
        {label}
      </label>

      <textarea
        rows={5}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Allergies, sensitivities, injuries, preferences..."
        className="
          w-full
          resize-none
          rounded-[22px]
          border
          border-[#b9cdbf]
          bg-[#f8fbf8]
          px-4
          py-3
          text-sm
          text-[#173f30]
          outline-none
          placeholder:text-[#98aa9e]
          focus:border-[#5d826c]
          focus:ring-4
          focus:ring-[#5d826c]/10
        "
      />
    </div>
  );
}

function PaymentMethodButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        h-12
        items-center
        justify-center
        gap-2
        rounded-full
        border
        text-sm
        font-semibold
        transition
        ${
          active
            ? `
              border-[#173f30]
              bg-[#173f30]
              text-white
            `
            : `
              border-[#b9cdbf]
              bg-[#f8fbf8]
              text-[#315a49]
            `
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

function SummaryLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-5
      "
    >
      <span>{label}</span>

      <span
        className="
          text-right
          font-semibold
          text-[#244f3e]
        "
      >
        {value}
      </span>
    </div>
  );
}

function ConfirmationCard({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      className="
        rounded-[22px]
        border
        border-[#b9cdbf]
        bg-[#e4efe6]
        p-4
      "
    >
      <div
        className="
          mx-auto
          mb-2
          flex
          justify-center
          text-[#2f5a48]
        "
      >
        {icon}
      </div>

      <p
        className="
          text-xs
          font-semibold
          text-[#315a49]
        "
      >
        {label}
      </p>
    </div>
  );
}