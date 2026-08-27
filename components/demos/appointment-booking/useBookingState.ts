'use client';

import {
  useMemo,
  useState,
} from 'react';

import {
  spaLocations,
  spaServices,
} from './data';

import type {
  BookingGuest,
  BookingStep,
  PaymentState,
  SpaLocation,
  SpaProfessional,
  SpaService,
} from './types';

const initialGuest: BookingGuest = {
  name: '',
  email: '',
  phone: '',
  referral: '',
  notes: '',
};

const initialPayment: PaymentState = {
  method: 'card',
  cardNumber: '',
  cardName: '',
  expiry: '',
  cvc: '',
  giftCard: '',
};

export function useBookingState() {
  const [
    step,
    setStep,
  ] = useState<BookingStep>(
    'location'
  );

  const [
    location,
    setLocation,
  ] = useState<SpaLocation>(
    spaLocations[0]
  );

  const [
    service,
    setService,
  ] = useState<SpaService>(
    spaServices[0]
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState<Date | null>(
    null
  );

  const [
    selectedTime,
    setSelectedTime,
  ] = useState<string | null>(
    null
  );

  const [
    professional,
    setProfessional,
  ] =
    useState<SpaProfessional | null>(
      null
    );

  const [
    guest,
    setGuest,
  ] =
    useState<BookingGuest>(
      initialGuest
    );

  const [
    payment,
    setPayment,
  ] =
    useState<PaymentState>(
      initialPayment
    );

  const timezone =
    useMemo(() => {
      try {
        return Intl.DateTimeFormat()
          .resolvedOptions()
          .timeZone;
      } catch {
        return 'America/Chicago';
      }
    }, []);

  const chooseLocation = (
    next: SpaLocation
  ) => {
    setLocation(next);

    /*
     * Changing spa location may
     * affect later availability,
     * so reset downstream choices.
     */
    setSelectedDate(null);
    setSelectedTime(null);
    setProfessional(null);
  };

  const chooseService = (
    next: SpaService
  ) => {
    setService(next);

    /*
     * Changing the treatment
     * invalidates the currently
     * selected date/time.
     */
    setSelectedDate(null);
    setSelectedTime(null);
    setProfessional(null);

    setStep('datetime');
  };

  const chooseDate = (
    date: Date
  ) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setProfessional(null);
  };

  const updateGuest = (
    field: keyof BookingGuest,
    value: string
  ) => {
    setGuest(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  const updatePayment = (
    field: keyof PaymentState,
    value:
      PaymentState[keyof PaymentState]
  ) => {
    setPayment(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  const reset = () => {
    setStep('location');

    setLocation(
      spaLocations[0]
    );

    setService(
      spaServices[0]
    );

    setSelectedDate(null);
    setSelectedTime(null);
    setProfessional(null);

    setGuest({
      ...initialGuest,
    });

    setPayment({
      ...initialPayment,
    });
  };

  return {
    step,
    setStep,

    location,
    chooseLocation,

    service,
    chooseService,

    selectedDate,
    chooseDate,

    selectedTime,
    setSelectedTime,

    professional,
    setProfessional,

    guest,
    updateGuest,

    payment,
    updatePayment,

    timezone,

    reset,
  };
}