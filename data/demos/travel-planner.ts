// Centralized mock data + image URLs for the Roamly travel-planner demo.
// Swap any URL below to replace imagery site-wide.

export const roamlyImages = {
  hero: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8c?auto=format&fit=crop&w=1600&q=80',
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  tileFood: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
  tileCulture: 'https://images.unsplash.com/photo-1559494619-75bd60064934?auto=format&fit=crop&w=800&q=80',
  tileShopping: 'https://images.unsplash.com/photo-1567168544813-4b3a6f7d2c31?auto=format&fit=crop&w=800&q=80',
  tileNightlife: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  tileSight: 'https://images.unsplash.com/photo-1559429145-2df109b7c2c1?auto=format&fit=crop&w=800&q=80',
  avatarA: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  avatarB: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  avatarC: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
};

export type ActivityType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'landmark'
  | 'museum'
  | 'walk'
  | 'viewpoint'
  | 'shopping'
  | 'transport'
  | 'nightlife'
  | 'rest';

export interface Activity {
  id: string;
  dayId: string;
  time: string;
  endTime?: string;
  type: ActivityType;
  title: string;
  location: string;
  description: string;
  cost: number;
  favorite: boolean;
  travelTimeToNext?: string;
}

export interface Day {
  id: string;
  index: number;
  date: string;
  label: string;
}

export interface Traveler {
  id: string;
  name: string;
  initials: string;
  avatar: string;
}

export type PlaceCategory =
  | 'Food'
  | 'Culture'
  | 'Shopping'
  | 'Nightlife'
  | 'Sightseeing';

export interface SavedPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  note: string;
  image: string;
  rating: number;
  priceLevel: 1 | 2 | 3;
  favorite: boolean;
  x: number;
  y: number;
}

export interface Accommodation {
  name: string;
  image: string;
  address: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  nightlyCost: number;
  status: 'confirmed' | 'pending';
}

export interface RoamlyTrip {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  heroImage: string;
  travelers: Traveler[];
  accommodation: Accommodation;
  budgetTotal: number;
  currency: string;
  days: Day[];
  activities: Activity[];
  places: SavedPlace[];
}

export const seedTrip: RoamlyTrip = {
  destination: 'Lisbon',
  country: 'Portugal',
  startDate: '2026-10-06',
  endDate: '2026-10-10',
  heroImage: roamlyImages.hero,
  currency: 'EUR',
  budgetTotal: 2400,
  travelers: [
    { id: 't1', name: 'Maya Chen', initials: 'MC', avatar: roamlyImages.avatarA },
    { id: 't2', name: 'Tom Hall', initials: 'TH', avatar: roamlyImages.avatarB },
    { id: 't3', name: 'Lena Ortiz', initials: 'LO', avatar: roamlyImages.avatarC },
  ],
  accommodation: {
    name: 'Casa do Marquês',
    image: roamlyImages.hotel,
    address: 'Rua das Flores 12, Baixa, Lisbon',
    checkIn: 'Oct 6',
    checkOut: 'Oct 10',
    nights: 4,
    nightlyCost: 165,
    status: 'confirmed',
  },
  days: [
    { id: 'd1', index: 1, date: '2026-10-06', label: 'Tue, Oct 6' },
    { id: 'd2', index: 2, date: '2026-10-07', label: 'Wed, Oct 7' },
    { id: 'd3', index: 3, date: '2026-10-08', label: 'Thu, Oct 8' },
    { id: 'd4', index: 4, date: '2026-10-09', label: 'Fri, Oct 9' },
    { id: 'd5', index: 5, date: '2026-10-10', label: 'Sat, Oct 10' },
  ],
  activities: [
    // Day 1
    {
      id: 'a1', dayId: 'd1', time: '09:00', endTime: '10:00', type: 'breakfast',
      title: 'Pastéis at Manteigaria',
      location: 'Praça Luís de Camões, Chiado',
      description: 'Warm pastéis de nata and bica espresso at one of the city’s best pastry counters.',
      cost: 12, favorite: true, travelTimeToNext: '8 min walk',
    },
    {
      id: 'a2', dayId: 'd1', time: '10:30', endTime: '12:30', type: 'landmark',
      title: 'Elevador de Santa Justa',
      location: 'Rua de Santa Justa, Baixa',
      description: 'Neo-gothic elevator with a rooftop terrace offering sweeping views over the Baixa rooftops.',
      cost: 6, favorite: false, travelTimeToNext: '5 min walk',
    },
    {
      id: 'a3', dayId: 'd1', time: '13:00', endTime: '14:30', type: 'lunch',
      title: 'Lunch at Time Out Market',
      location: 'Av. 24 de Julho, Cais do Sodré',
      description: 'Curated food hall with stops from Lisbon’s top chefs — grab a table by the river windows.',
      cost: 38, favorite: false, travelTimeToNext: '15 min tram',
    },
    {
      id: 'a4', dayId: 'd1', time: '15:30', endTime: '17:00', type: 'walk',
      title: 'Alfama wandering',
      location: 'Alfama',
      description: 'Lose yourself in the narrow lanes of Lisbon’s oldest district. Tile-spotting and fado doorways.',
      cost: 0, favorite: true, travelTimeToNext: '10 min walk',
    },
    {
      id: 'a5', dayId: 'd1', time: '19:30', endTime: '21:30', type: 'dinner',
      title: 'Dinner at Taberna da Rua das Flores',
      location: 'Rua das Flores 103, Chiado',
      description: 'Small-plates Portuguese tavern — reserve ahead, the salted cod is worth it.',
      cost: 72, favorite: false,
    },
    // Day 2
    {
      id: 'a6', dayId: 'd2', time: '08:30', endTime: '09:30', type: 'breakfast',
      title: 'Coffee at Hello, Kristof',
      location: 'Rua das Salgadeiras 42, Bairro Alto',
      description: 'Specialty espresso and almond croissants in a tiny, plant-filled café.',
      cost: 9, favorite: false, travelTimeToNext: '12 min tram',
    },
    {
      id: 'a7', dayId: 'd2', time: '10:00', endTime: '12:30', type: 'museum',
      title: 'MAAT — Museum of Art, Architecture & Technology',
      location: 'Av. Brasília, Belém',
      description: 'Riverside contemporary art museum with a sweeping tile-clad roof you can walk on.',
      cost: 12, favorite: true, travelTimeToNext: '6 min walk',
    },
    {
      id: 'a8', dayId: 'd2', time: '13:00', endTime: '14:15', type: 'lunch',
      title: 'Lunch at Cervejaria Ramiro',
      location: 'Av. Almirante Reis 1H',
      description: 'Legendary seafood — tiger prawns, crab, and garlic clams. Bring an appetite.',
      cost: 55, favorite: false, travelTimeToNext: '20 min tram',
    },
    {
      id: 'a9', dayId: 'd2', time: '16:00', endTime: '18:00', type: 'viewpoint',
      title: 'Miradouro da Senhora do Monte',
      location: 'Graça',
      description: 'The highest viewpoint in the city — golden-hour views over the castle and the Tagus.',
      cost: 0, favorite: true, travelTimeToNext: '15 min walk',
    },
    {
      id: 'a10', dayId: 'd2', time: '20:30', endTime: '23:00', type: 'nightlife',
      title: 'Fado at Mesa de Frades',
      location: 'Rua das Flores 115, Chiado',
      description: 'Intimate fado vadio in a candlelit room. Book the early set.',
      cost: 45, favorite: false,
    },
    // Day 3
    {
      id: 'a11', dayId: 'd3', time: '09:00', endTime: '10:00', type: 'breakfast',
      title: 'Breakfast at The Mill',
      location: 'Rua do Rosário 129, Príncipe Real',
      description: 'Flat whites and sourdough toast in a bright, wood-paneled café.',
      cost: 11, favorite: false, travelTimeToNext: '10 min walk',
    },
    {
      id: 'a12', dayId: 'd3', time: '10:30', endTime: '13:00', type: 'museum',
      title: 'Gulbenkian Museum',
      location: 'Av. de Berna 45',
      description: 'World-class private collection — Lalique jewelry, Islamic art, and a sculpture-filled garden.',
      cost: 10, favorite: false, travelTimeToNext: '15 min metro',
    },
    {
      id: 'a13', dayId: 'd3', time: '13:30', endTime: '15:00', type: 'lunch',
      title: 'Lunch at A Cevicheria',
      location: 'Rua do Século 95, Príncipe Real',
      description: 'Peruvian-Portuguese ceviche under a giant octopus lamp. Tasting menu recommended.',
      cost: 48, favorite: true, travelTimeToNext: '20 min tram',
    },
    {
      id: 'a14', dayId: 'd3', time: '15:30', endTime: '17:30', type: 'shopping',
      title: 'LX Factory boutiques',
      location: 'Rua Rodrigues de Faria 103, Alcântara',
      description: 'Repurposed industrial complex with bookstores, concept shops, and design studios.',
      cost: 30, favorite: false, travelTimeToNext: '15 min tram',
    },
    {
      id: 'a15', dayId: 'd3', time: '20:00', endTime: '22:00', type: 'dinner',
      title: 'Dinner at 100 Maneiras',
      location: 'Rua do Teixo 35, Bairro Alto',
      description: 'Chef Ljubomir Stanisic’s theatrical 18-course tasting menu.',
      cost: 95, favorite: false,
    },
    // Day 4
    {
      id: 'a16', dayId: 'd4', time: '08:00', endTime: '09:00', type: 'breakfast',
      title: 'Pastries at Confeitaria Nacional',
      location: 'Praça da Figueira 18B',
      description: 'Lisbon’s oldest pastry shop (1829) — order the brioche and a galão.',
      cost: 8, favorite: false, travelTimeToNext: '5 min walk',
    },
    {
      id: 'a17', dayId: 'd4', time: '09:30', endTime: '12:30', type: 'transport',
      title: 'Train to Sintra',
      location: 'Rossio Station',
      description: '40-minute train to Sintra. Explore Pena Palace and the Moorish Castle.',
      cost: 18, favorite: true, travelTimeToNext: '10 min bus',
    },
    {
      id: 'a18', dayId: 'd4', time: '13:00', endTime: '14:30', type: 'lunch',
      title: 'Lunch at Tascantiga',
      location: 'Sintra Vila',
      description: 'Petiscos on a cobblestone terrace — cheese, ham, and clams in garlic butter.',
      cost: 34, favorite: false, travelTimeToNext: '15 min train',
    },
    {
      id: 'a19', dayId: 'd4', time: '17:00', endTime: '18:00', type: 'viewpoint',
      title: 'Sunset at Cabo da Roca',
      location: 'Cabo da Roca',
      description: 'The westernmost point in mainland Europe — cliff-edge sunset over the Atlantic.',
      cost: 0, favorite: true, travelTimeToNext: '45 min return train',
    },
    {
      id: 'a20', dayId: 'd4', time: '21:00', endTime: '22:30', type: 'dinner',
      title: 'Dinner at Cantinho das Gáveas',
      location: 'Príncipe Real',
      description: 'Neighborhood tasca — grilled sea bream and vinho verde on a lively square.',
      cost: 42, favorite: false,
    },
    // Day 5
    {
      id: 'a21', dayId: 'd5', time: '09:30', endTime: '10:30', type: 'breakfast',
      title: 'Brunch at Dear Breakfast',
      location: 'Rua das Parreiras 63, Estrela',
      description: 'Shakshuka, pancakes, and excellent coffee before checkout.',
      cost: 18, favorite: false, travelTimeToNext: '12 min tram',
    },
    {
      id: 'a22', dayId: 'd5', time: '11:00', endTime: '13:00', type: 'walk',
      title: 'Jardim da Estrela stroll',
      location: 'Estrela',
      description: 'Iron-and-glass greenhouse, peacocks, and a peaceful morning in one of Lisbon’s best parks.',
      cost: 0, favorite: true, travelTimeToNext: '20 min tram',
    },
    {
      id: 'a23', dayId: 'd5', time: '13:30', endTime: '15:00', type: 'lunch',
      title: 'Farewell lunch at Sea Me',
      location: 'Rua do Loreto 83, Bairro Alto',
      description: 'Portuguese-Japanese fusion — sushi rolls with bacalhau and grilled tiger prawns.',
      cost: 52, favorite: false, travelTimeToNext: '15 min taxi',
    },
    {
      id: 'a24', dayId: 'd5', time: '16:00', endTime: '17:00', type: 'shopping',
      title: 'Souvenirs at Conserveira de Lisboa',
      location: 'Rua dos Bacalhoeiros 70',
      description: 'Tinned fish institution since 1930 — pick up heritage sardines and mackerel.',
      cost: 25, favorite: false,
    },
  ],
  places: [
    {
      id: 'p1', name: 'Manteigaria', category: 'Food', address: 'Praça Luís de Camões, Chiado',
      note: 'Best pastéis de nata in the city, baked on the spot.',
      image: roamlyImages.tileFood, rating: 4.8, priceLevel: 1, favorite: true, x: 52, y: 40,
    },
    {
      id: 'p2', name: 'Time Out Market', category: 'Food', address: 'Av. 24 de Julho, Cais do Sodré',
      note: 'Curated food hall with the city’s top chefs.',
      image: roamlyImages.tileFood, rating: 4.5, priceLevel: 2, favorite: false, x: 58, y: 62,
    },
    {
      id: 'p3', name: 'Taberna da Rua das Flores', category: 'Food', address: 'Rua das Flores 103',
      note: 'Small-plates tavern — book ahead.',
      image: roamlyImages.tileFood, rating: 4.7, priceLevel: 3, favorite: false, x: 49, y: 45,
    },
    {
      id: 'p4', name: 'MAAT', category: 'Culture', address: 'Av. Brasília, Belém',
      note: 'Riverside contemporary art & architecture.',
      image: roamlyImages.tileCulture, rating: 4.6, priceLevel: 2, favorite: true, x: 22, y: 75,
    },
    {
      id: 'p5', name: 'Gulbenkian Museum', category: 'Culture', address: 'Av. de Berna 45',
      note: 'World-class private art collection and gardens.',
      image: roamlyImages.tileCulture, rating: 4.9, priceLevel: 2, favorite: false, x: 68, y: 33,
    },
    {
      id: 'p6', name: 'Museu do Azulejo', category: 'Culture', address: 'R. Meireles 18',
      note: 'National tile museum in a 16th-century convent.',
      image: roamlyImages.tileCulture, rating: 4.4, priceLevel: 1, favorite: false, x: 75, y: 70,
    },
    {
      id: 'p7', name: 'LX Factory', category: 'Shopping', address: 'Rua Rodrigues de Faria 103',
      note: 'Repurposed industrial complex with concept shops.',
      image: roamlyImages.tileShopping, rating: 4.3, priceLevel: 2, favorite: false, x: 32, y: 68,
    },
    {
      id: 'p8', name: 'A Vida Portuguesa', category: 'Shopping', address: 'Rua Garrett 9, Chiado',
      note: 'Heritage Portuguese design goods and soaps.',
      image: roamlyImages.tileShopping, rating: 4.6, priceLevel: 3, favorite: true, x: 50, y: 42,
    },
    {
      id: 'p9', name: 'Conserveira de Lisboa', category: 'Shopping', address: 'Rua dos Bacalhoeiros 70',
      note: 'Tinned-fish institution since 1930.',
      image: roamlyImages.tileShopping, rating: 4.5, priceLevel: 1, favorite: false, x: 56, y: 52,
    },
    {
      id: 'p10', name: 'Mesa de Frades', category: 'Nightlife', address: 'Rua das Flores 115',
      note: 'Intimate candlelit fado vadio.',
      image: roamlyImages.tileNightlife, rating: 4.8, priceLevel: 3, favorite: false, x: 48, y: 44,
    },
    {
      id: 'p11', name: 'Pavilhão Chinês', category: 'Nightlife', address: 'Rua Dom Pedro V 89',
      note: 'Kitsch bar with floor-to-ceiling antiques.',
      image: roamlyImages.tileNightlife, rating: 4.4, priceLevel: 2, favorite: false, x: 46, y: 38,
    },
    {
      id: 'p12', name: 'Elevador de Santa Justa', category: 'Sightseeing', address: 'Rua de Santa Justa',
      note: 'Neo-gothic elevator with rooftop terrace.',
      image: roamlyImages.tileSight, rating: 4.2, priceLevel: 1, favorite: false, x: 54, y: 50,
    },
    {
      id: 'p13', name: 'Miradouro da Senhora do Monte', category: 'Sightseeing', address: 'Graça',
      note: 'Highest viewpoint in the city.',
      image: roamlyImages.tileSight, rating: 4.9, priceLevel: 1, favorite: true, x: 64, y: 28,
    },
    {
      id: 'p14', name: 'Castelo de São Jorge', category: 'Sightseeing', address: 'R. de Santa Cruz',
      note: 'Moorish castle with ramparts and peacocks.',
      image: roamlyImages.tileSight, rating: 4.5, priceLevel: 2, favorite: false, x: 62, y: 35,
    },
  ],
};
