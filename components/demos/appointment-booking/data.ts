import type {
  SpaLocation,
  SpaProfessional,
  SpaService,
} from './types';

export const spaLocations: SpaLocation[] = [
  {
    id: 'river-oaks',
    name: 'Sage & Stone Spa — River Oaks',
    neighborhood: 'River Oaks',
    address: '2040 Westheimer Rd, Houston, TX',
    distance: '3.2 mi',
    hours: '9:00 AM – 8:00 PM',
    coordinates: {
      x: 31,
      y: 38,
    },
  },
  {
    id: 'heights',
    name: 'Sage & Stone Spa — The Heights',
    neighborhood: 'The Heights',
    address: '1011 Heights Blvd, Houston, TX',
    distance: '5.8 mi',
    hours: '9:00 AM – 7:00 PM',
    coordinates: {
      x: 56,
      y: 23,
    },
  },
  {
    id: 'montrose',
    name: 'Sage & Stone Spa — Montrose',
    neighborhood: 'Montrose',
    address: '1724 West Alabama St, Houston, TX',
    distance: '4.1 mi',
    hours: '10:00 AM – 8:00 PM',
    coordinates: {
      x: 47,
      y: 53,
    },
  },
];

export const spaServices: SpaService[] = [
  {
    id: 'restore-massage',
    category: 'Massage',
    name: 'Restore Massage',
    description:
      'A personalized full-body massage designed to release tension and restore balance.',
    duration: 60,
    price: 145,
  },
  {
    id: 'deep-release',
    category: 'Massage',
    name: 'Deep Release',
    description:
      'Focused pressure and therapeutic techniques for persistent tension and recovery.',
    duration: 75,
    price: 185,
  },
  {
    id: 'signature-facial',
    category: 'Facial',
    name: 'Sage & Stone Signature Facial',
    description:
      'A restorative facial with cleansing, exfoliation, massage, hydration, and glow support.',
    duration: 60,
    price: 165,
  },
  {
    id: 'renewal-facial',
    category: 'Facial',
    name: 'Botanical Renewal Facial',
    description:
      'A calming treatment centered on barrier support, hydration, and botanical actives.',
    duration: 75,
    price: 195,
  },
  {
    id: 'body-renewal',
    category: 'Body',
    name: 'Mineral Body Renewal',
    description:
      'Full-body exfoliation followed by a mineral-rich wrap and nourishing hydration.',
    duration: 90,
    price: 225,
  },
  {
    id: 'scalp-ritual',
    category: 'Ritual',
    name: 'Scalp & Stillness Ritual',
    description:
      'A quiet reset with scalp massage, aromatherapy, warm towels, and guided relaxation.',
    duration: 45,
    price: 115,
  },
];

export const professionals: SpaProfessional[] = [
  {
    id: 'maya',
    name: 'Maya Chen',
    title: 'Senior Massage Therapist',
    initials: 'MC',
    specialties: [
      'Deep tissue',
      'Recovery',
      'Aromatherapy',
    ],
    available: true,
  },
  {
    id: 'elena',
    name: 'Elena Brooks',
    title: 'Lead Esthetician',
    initials: 'EB',
    specialties: [
      'Facials',
      'Sensitive skin',
      'Hydration',
    ],
    available: true,
  },
  {
    id: 'noah',
    name: 'Noah Reed',
    title: 'Wellness Therapist',
    initials: 'NR',
    specialties: [
      'Relaxation',
      'Scalp ritual',
      'Bodywork',
    ],
    available: true,
  },
  {
    id: 'sophia',
    name: 'Sophia Patel',
    title: 'Esthetician',
    initials: 'SP',
    specialties: [
      'Glow treatments',
      'Botanicals',
      'Facials',
    ],
    available: false,
  },
];

export const timeSlots = [
  '9:00 AM',
  '9:30 AM',
  '10:30 AM',
  '11:00 AM',
  '12:30 PM',
  '1:30 PM',
  '2:00 PM',
  '3:30 PM',
  '4:30 PM',
  '5:30 PM',
];

export function getAvailabilityForDate(
  date: Date
) {
  const weekday =
    date.getDay();

  if (weekday === 0) {
    return [];
  }

  const seed =
    date.getFullYear() * 10000 +
    (date.getMonth() + 1) * 100 +
    date.getDate();

  return timeSlots.filter(
    (_, index) => {
      const value =
        (seed + index * 13) % 6;

      return (
        value !== 0 &&
        value !== 4
      );
    }
  );
}