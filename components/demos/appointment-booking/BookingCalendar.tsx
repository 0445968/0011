'use client';

import {
  useMemo,
  useState,
} from 'react';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  getAvailabilityForDate,
} from './data';

interface BookingCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (
    date: Date
  ) => void;
}

const weekdayLabels = [
  'S',
  'M',
  'T',
  'W',
  'T',
  'F',
  'S',
];

function sameDay(
  a: Date | null,
  b: Date
) {
  if (!a) {
    return false;
  }

  return (
    a.getFullYear() ===
      b.getFullYear() &&
    a.getMonth() ===
      b.getMonth() &&
    a.getDate() ===
      b.getDate()
  );
}

function startOfToday() {
  const now = new Date();

  now.setHours(
    0,
    0,
    0,
    0
  );

  return now;
}

export function BookingCalendar({
  selectedDate,
  onSelectDate,
}: BookingCalendarProps) {
  const today =
    startOfToday();

  const initialMonth =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

  const [
    visibleMonth,
    setVisibleMonth,
  ] =
    useState<Date>(
      initialMonth
    );

  const monthLabel =
    visibleMonth.toLocaleDateString(
      'en-US',
      {
        month: 'long',
        year: 'numeric',
      }
    );

  const days =
    useMemo(() => {
      const year =
        visibleMonth.getFullYear();

      const month =
        visibleMonth.getMonth();

      const firstDay =
        new Date(
          year,
          month,
          1
        ).getDay();

      const totalDays =
        new Date(
          year,
          month + 1,
          0
        ).getDate();

      const cells:
        Array<Date | null> =
          [];

      for (
        let i = 0;
        i < firstDay;
        i += 1
      ) {
        cells.push(null);
      }

      for (
        let day = 1;
        day <= totalDays;
        day += 1
      ) {
        cells.push(
          new Date(
            year,
            month,
            day
          )
        );
      }

      while (
        cells.length %
          7 !==
        0
      ) {
        cells.push(null);
      }

      return cells;
    }, [
      visibleMonth,
    ]);

  const previousMonth =
    () => {
      const previous =
        new Date(
          visibleMonth.getFullYear(),
          visibleMonth.getMonth() -
            1,
          1
        );

      if (
        previous <
        initialMonth
      ) {
        return;
      }

      setVisibleMonth(
        previous
      );
    };

  const nextMonth =
    () => {
      setVisibleMonth(
        new Date(
          visibleMonth.getFullYear(),
          visibleMonth.getMonth() +
            1,
          1
        )
      );
    };

  return (
    <div>
      <div
        className="
          mb-6
          flex
          items-center
          justify-between
        "
      >
        <div>
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#789081]
            "
          >
            Select a date
          </p>

          <h3
            className="
              mt-1
              text-[17px]
              font-semibold
              text-[#173f30]
            "
          >
            {monthLabel}
          </h3>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <CalendarButton
            label="Previous month"
            onClick={
              previousMonth
            }
            disabled={
              visibleMonth.getFullYear() ===
                initialMonth.getFullYear() &&
              visibleMonth.getMonth() ===
                initialMonth.getMonth()
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </CalendarButton>

          <CalendarButton
            label="Next month"
            onClick={
              nextMonth
            }
          >
            <ChevronRight className="h-4 w-4" />
          </CalendarButton>
        </div>
      </div>

      <div
        className="
          grid
          grid-cols-7
          gap-y-1
        "
      >
        {weekdayLabels.map(
          (
            label,
            index
          ) => (
            <div
              key={`${label}-${index}`}
              className="
                pb-3
                text-center
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-[#81968a]
              "
            >
              {label}
            </div>
          )
        )}

        {days.map(
          (
            date,
            index
          ) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="aspect-square"
                />
              );
            }

            const availability =
              getAvailabilityForDate(
                date
              );

            const disabled =
              date < today ||
              availability.length ===
                0;

            const active =
              sameDay(
                selectedDate,
                date
              );

            const isToday =
              sameDay(
                today,
                date
              );

            return (
              <div
                key={
                  date.toISOString()
                }
                className="
                  grid
                  aspect-square
                  place-items-center
                  p-0.5
                "
              >
                <button
                  type="button"
                  disabled={
                    disabled
                  }
                  onClick={() =>
                    onSelectDate(
                      date
                    )
                  }
                  aria-label={
                    date.toLocaleDateString(
                      'en-US',
                      {
                        weekday:
                          'long',
                        month:
                          'long',
                        day:
                          'numeric',
                      }
                    )
                  }
                  className={`
                    relative
                    grid
                    h-10
                    w-10
                    place-items-center
                    rounded-full
                    text-sm
                    font-semibold
                    transition-all
                    duration-200

                    ${
                      active
                        ? `
                          bg-[#173f30]
                          text-[#eef7f1]
                          shadow-[0_8px_24px_rgba(23,63,48,.20)]
                        `
                        : `
                          text-[#315a49]
                          hover:bg-[#e1ede4]
                          hover:text-[#173f30]
                        `
                    }

                    ${
                      disabled
                        ? `
                          cursor-not-allowed
                          text-[#b6c5bb]
                          hover:bg-transparent
                          hover:text-[#b6c5bb]
                        `
                        : ''
                    }
                  `}
                >
                  {date.getDate()}

                  {isToday &&
                  !active ? (
                    <span
                      className="
                        absolute
                        bottom-1
                        h-1
                        w-1
                        rounded-full
                        bg-[#5e866f]
                      "
                    />
                  ) : null}
                </button>
              </div>
            );
          }
        )}
      </div>

      <div
        className="
          mt-6
          flex
          flex-wrap
          items-center
          gap-x-5
          gap-y-2
          border-t
          border-[#d7e2da]
          pt-4
          text-[10px]
          font-semibold
          text-[#789081]
        "
      >
        <Legend
          className="bg-[#173f30]"
          label="Selected"
        />

        <Legend
          className="bg-[#dfece2]"
          label="Available"
        />

        <Legend
          className="bg-[#c9d4cc]"
          label="Unavailable"
        />
      </div>
    </div>
  );
}

function CalendarButton({
  label,
  children,
  onClick,
  disabled,
}: {
  label: string;
  children:
    React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="
        grid
        h-9
        w-9
        place-items-center
        rounded-full
        border
        border-[#bdd0c4]
        bg-[#f8fbf8]
        text-[#295a48]
        transition
        hover:border-[#8fac99]
        hover:bg-[#e8f3ec]
        disabled:cursor-not-allowed
        disabled:opacity-30
      "
    >
      {children}
    </button>
  );
}

function Legend({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
      "
    >
      <span
        className={`
          h-2
          w-2
          rounded-full
          ${className}
        `}
      />

      {label}
    </div>
  );
}