export type BookingStep =
  | 'location'
  | 'service'
  | 'datetime'
  | 'preferences'
  | 'payment'
  | 'confirmed';

export interface SpaLocation {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  distance: string;
  hours: string;
  coordinates: {
    x: number;
    y: number;
  };
}

export interface SpaService {
  id: string;
  category: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

export interface SpaProfessional {
  id: string;
  name: string;
  title: string;
  initials: string;
  specialties: string[];
  available: boolean;
}

export interface BookingGuest {
  name: string;
  email: string;
  phone: string;
  referral: string;
  notes: string;
}

export interface PaymentState {
  method:
    | 'card'
    | 'gift-card';

  cardNumber: string;
  cardName: string;
  expiry: string;
  cvc: string;
  giftCard: string;
}