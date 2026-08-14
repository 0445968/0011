// Centralized mock data for the Echo music-player demo.
// All artwork uses inline SVG data-URIs so the demo is fully self-contained.
// Replace `artwork` values with real image URLs to swap imagery site-wide.

export interface Track {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string;
  albumName: string;
  duration: number; // seconds
  genre: string;
  year: number;
  liked: boolean;
  trackNumber: number;
  // Fictional placeholder lyrics — original demo content, not real song lyrics.
  lyrics?: { time: number; text: string }[];
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  year: number;
  genre: string;
  trackIds: string[];
  accent: string; // hex color used for theming
  artwork: string;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  monthlyListeners: number;
  bio: string;
  accent: string;
  artwork: string;
  albumIds: string[];
  topTrackIds: string[];
  relatedArtistIds: string[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  trackIds: string[];
  accent: string;
  artwork: string;
  curated: boolean; // true = "Made for You" style
}

export const user = {
  name: 'Alex Morgan',
  initials: 'AM',
};

// --- SVG artwork generator ---
// Produces unique gradient-based album covers as data URIs.
function makeArtwork(seed: string, c1: string, c2: string, c3: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <radialGradient id="g" cx="40%" cy="35%" r="75%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="55%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c3}"/>
    </radialGradient>
    <linearGradient id="overlay" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${c3}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <circle cx="280" cy="120" r="90" fill="${c1}" opacity="0.15"/>
  <circle cx="120" cy="300" r="70" fill="${c3}" opacity="0.12"/>
  <rect width="400" height="400" fill="url(#overlay)"/>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// --- Tracks ---
// 36 tracks across 7 albums and 6 artists.
export const seedTracks: Track[] = [
  // Album: Midnight Atlas — by Solene
  { id: 'tr1', title: 'Northern Lights', artistId: 'ar1', artistName: 'Solene', albumId: 'al1', albumName: 'Midnight Atlas', duration: 214, genre: 'Electronic', year: 2025, liked: true, trackNumber: 1,
    lyrics: [
      { time: 0, text: 'In the quiet of the north' },
      { time: 8, text: 'Where the sky unfolds' },
      { time: 16, text: 'Colors dance in silent waves' },
      { time: 24, text: 'A story yet untold' },
      { time: 32, text: 'And we run, we run into the light' },
      { time: 40, text: 'Chasing every hue' },
    ],
  },
  { id: 'tr2', title: 'Paper Cities', artistId: 'ar1', artistName: 'Solene', albumId: 'al1', albumName: 'Midnight Atlas', duration: 187, genre: 'Electronic', year: 2025, liked: false, trackNumber: 2 },
  { id: 'tr3', title: 'Glass Horizon', artistId: 'ar1', artistName: 'Solene', albumId: 'al1', albumName: 'Midnight Atlas', duration: 232, genre: 'Electronic', year: 2025, liked: true, trackNumber: 3,
    lyrics: [
      { time: 0, text: 'Through the glass I see tomorrow' },
      { time: 10, text: 'Stretching far beyond the edge' },
      { time: 20, text: 'Every moment borrowed, every promise kept' },
    ],
  },
  { id: 'tr4', title: 'Tidal', artistId: 'ar1', artistName: 'Solene', albumId: 'al1', albumName: 'Midnight Atlas', duration: 198, genre: 'Electronic', year: 2025, liked: false, trackNumber: 4 },
  { id: 'tr5', title: 'Midnight Atlas', artistId: 'ar1', artistName: 'Solene', albumId: 'al1', albumName: 'Midnight Atlas', duration: 256, genre: 'Electronic', year: 2025, liked: true, trackNumber: 5,
    lyrics: [
      { time: 0, text: 'We mapped the dark with glowing hands' },
      { time: 12, text: 'Every star a turning page' },
      { time: 24, text: 'The atlas of our midnight stands' },
      { time: 36, text: 'Beyond the edge of age' },
    ],
  },
  { id: 'tr6', title: 'Afterglow', artistId: 'ar1', artistName: 'Solene', albumId: 'al1', albumName: 'Midnight Atlas', duration: 175, genre: 'Electronic', year: 2025, liked: false, trackNumber: 6 },

  // Album: Velvet Hours — by The Marlow
  { id: 'tr7', title: 'Velvet Hours', artistId: 'ar2', artistName: 'The Marlow', albumId: 'al2', albumName: 'Velvet Hours', duration: 223, genre: 'Indie', year: 2024, liked: true, trackNumber: 1,
    lyrics: [
      { time: 0, text: 'In the velvet hours we stay' },
      { time: 10, text: 'Time is just a rumor here' },
      { time: 20, text: 'Shadows stretched across the floor' },
      { time: 30, text: 'Everything we love is near' },
    ],
  },
  { id: 'tr8', title: 'Rooftop Confessions', artistId: 'ar2', artistName: 'The Marlow', albumId: 'al2', albumName: 'Velvet Hours', duration: 201, genre: 'Indie', year: 2024, liked: false, trackNumber: 2 },
  { id: 'tr9', title: 'Slow Burn', artistId: 'ar2', artistName: 'The Marlow', albumId: 'al2', albumName: 'Velvet Hours', duration: 245, genre: 'Indie', year: 2024, liked: true, trackNumber: 3 },
  { id: 'tr10', title: 'Honey Light', artistId: 'ar2', artistName: 'The Marlow', albumId: 'al2', albumName: 'Velvet Hours', duration: 189, genre: 'Indie', year: 2024, liked: false, trackNumber: 4 },
  { id: 'tr11', title: 'Almost Home', artistId: 'ar2', artistName: 'The Marlow', albumId: 'al2', albumName: 'Velvet Hours', duration: 267, genre: 'Indie', year: 2024, liked: false, trackNumber: 5 },

  // Album: Solar Drift — by Kava
  { id: 'tr12', title: 'Solar Drift', artistId: 'ar3', artistName: 'Kava', albumId: 'al3', albumName: 'Solar Drift', duration: 312, genre: 'Ambient', year: 2025, liked: true, trackNumber: 1,
    lyrics: [
      { time: 0, text: 'Drifting through the golden haze' },
      { time: 15, text: 'Weightless, boundless, free' },
    ],
  },
  { id: 'tr13', title: 'Orbit', artistId: 'ar3', artistName: 'Kava', albumId: 'al3', albumName: 'Solar Drift', duration: 278, genre: 'Ambient', year: 2025, liked: false, trackNumber: 2 },
  { id: 'tr14', title: 'Helium', artistId: 'ar3', artistName: 'Kava', albumId: 'al3', albumName: 'Solar Drift', duration: 298, genre: 'Ambient', year: 2025, liked: false, trackNumber: 3 },
  { id: 'tr15', title: 'Quiet Sun', artistId: 'ar3', artistName: 'Kava', albumId: 'al3', albumName: 'Solar Drift', duration: 334, genre: 'Ambient', year: 2025, liked: true, trackNumber: 4 },

  // Album: Neon Heart — by Juno Rush
  { id: 'tr16', title: 'Neon Heart', artistId: 'ar4', artistName: 'Juno Rush', albumId: 'al4', albumName: 'Neon Heart', duration: 198, genre: 'Pop', year: 2026, liked: true, trackNumber: 1,
    lyrics: [
      { time: 0, text: 'Electric pulse, a neon heart' },
      { time: 8, text: 'Beating in the after-dark' },
      { time: 16, text: 'We are the light, we are the spark' },
      { time: 24, text: 'Tearing through the quiet' },
    ],
  },
  { id: 'tr17', title: 'Electric Bloom', artistId: 'ar4', artistName: 'Juno Rush', albumId: 'al4', albumName: 'Neon Heart', duration: 187, genre: 'Pop', year: 2026, liked: false, trackNumber: 2 },
  { id: 'tr18', title: 'Chasing Static', artistId: 'ar4', artistName: 'Juno Rush', albumId: 'al4', albumName: 'Neon Heart', duration: 212, genre: 'Pop', year: 2026, liked: true, trackNumber: 3 },
  { id: 'tr19', title: 'Ultra', artistId: 'ar4', artistName: 'Juno Rush', albumId: 'al4', albumName: 'Neon Heart', duration: 165, genre: 'Pop', year: 2026, liked: false, trackNumber: 4 },
  { id: 'tr20', title: 'Afterparty Ghost', artistId: 'ar4', artistName: 'Juno Rush', albumId: 'al4', albumName: 'Neon Heart', duration: 234, genre: 'Pop', year: 2026, liked: false, trackNumber: 5 },

  // Album: Letters from Nowhere — by Mira Vale
  { id: 'tr21', title: 'Dear Yesterday', artistId: 'ar5', artistName: 'Mira Vale', albumId: 'al5', albumName: 'Letters from Nowhere', duration: 245, genre: 'R&B', year: 2024, liked: true, trackNumber: 1,
    lyrics: [
      { time: 0, text: 'Dear yesterday, I forgive you' },
      { time: 12, text: 'For every word unsaid' },
      { time: 24, text: 'For all the tears I hid away' },
      { time: 36, text: 'For the hours I bled' },
    ],
  },
  { id: 'tr22', title: 'Coffee & Rain', artistId: 'ar5', artistName: 'Mira Vale', albumId: 'al5', albumName: 'Letters from Nowhere', duration: 201, genre: 'R&B', year: 2024, liked: false, trackNumber: 2 },
  { id: 'tr23', title: 'Slow Letters', artistId: 'ar5', artistName: 'Mira Vale', albumId: 'al5', albumName: 'Letters from Nowhere', duration: 223, genre: 'R&B', year: 2024, liked: true, trackNumber: 3 },
  { id: 'tr24', title: 'Nowhere', artistId: 'ar5', artistName: 'Mira Vale', albumId: 'al5', albumName: 'Letters from Nowhere', duration: 278, genre: 'R&B', year: 2024, liked: false, trackNumber: 4 },

  // Album: Wildflower Circuit — by The Marlow
  { id: 'tr25', title: 'Wildflower', artistId: 'ar2', artistName: 'The Marlow', albumId: 'al6', albumName: 'Wildflower Circuit', duration: 198, genre: 'Indie', year: 2023, liked: false, trackNumber: 1 },
  { id: 'tr26', title: 'Circuit Breaker', artistId: 'ar2', artistName: 'The Marlow', albumId: 'al6', albumName: 'Wildflower Circuit', duration: 212, genre: 'Indie', year: 2023, liked: false, trackNumber: 2 },
  { id: 'tr27', title: 'Ferris Wheel', artistId: 'ar2', artistName: 'The Marlow', albumId: 'al6', albumName: 'Wildflower Circuit', duration: 187, genre: 'Indie', year: 2023, liked: true, trackNumber: 3 },

  // Album: Pulse — by Cassian North
  { id: 'tr28', title: 'Pulse', artistId: 'ar6', artistName: 'Cassian North', albumId: 'al7', albumName: 'Pulse', duration: 256, genre: 'Rock', year: 2025, liked: false, trackNumber: 1,
    lyrics: [
      { time: 0, text: 'Feel the pulse beneath the floor' },
      { time: 12, text: 'Every beat is calling for more' },
    ],
  },
  { id: 'tr29', title: 'Gravity Well', artistId: 'ar6', artistName: 'Cassian North', albumId: 'al7', albumName: 'Pulse', duration: 223, genre: 'Rock', year: 2025, liked: false, trackNumber: 2 },
  { id: 'tr30', title: 'Iron Lung', artistId: 'ar6', artistName: 'Cassian North', albumId: 'al7', albumName: 'Pulse', duration: 289, genre: 'Rock', year: 2025, liked: true, trackNumber: 3 },
  { id: 'tr31', title: 'Echo Chamber', artistId: 'ar6', artistName: 'Cassian North', albumId: 'al7', albumName: 'Pulse', duration: 201, genre: 'Rock', year: 2025, liked: false, trackNumber: 4 },

  // Extra tracks (singles / collaborations)
  { id: 'tr32', title: 'Golden Hour', artistId: 'ar4', artistName: 'Juno Rush', albumId: 'al4', albumName: 'Neon Heart', duration: 178, genre: 'Pop', year: 2026, liked: false, trackNumber: 6 },
  { id: 'tr33', title: 'Falling Slowly', artistId: 'ar5', artistName: 'Mira Vale', albumId: 'al5', albumName: 'Letters from Nowhere', duration: 234, genre: 'R&B', year: 2024, liked: true, trackNumber: 5 },
  { id: 'tr34', title: 'Stargazer', artistId: 'ar1', artistName: 'Solene', albumId: 'al1', albumName: 'Midnight Atlas', duration: 201, genre: 'Electronic', year: 2025, liked: false, trackNumber: 7 },
  { id: 'tr35', title: 'Wider Than the Sky', artistId: 'ar3', artistName: 'Kava', albumId: 'al3', albumName: 'Solar Drift', duration: 367, genre: 'Ambient', year: 2025, liked: false, trackNumber: 5 },
  { id: 'tr36', title: 'Paper Moon', artistId: 'ar6', artistName: 'Cassian North', albumId: 'al7', albumName: 'Pulse', duration: 245, genre: 'Rock', year: 2025, liked: false, trackNumber: 5 },
];

// --- Albums ---
export const seedAlbums: Album[] = [
  {
    id: 'al1', title: 'Midnight Atlas', artistId: 'ar1', artistName: 'Solene',
    year: 2025, genre: 'Electronic',
    trackIds: ['tr1', 'tr2', 'tr3', 'tr4', 'tr5', 'tr6', 'tr34'],
    accent: '#6366f1',
    artwork: makeArtwork('midnight-atlas', '#6366f1', '#1e1b4b', '#0f0a3d'),
  },
  {
    id: 'al2', title: 'Velvet Hours', artistId: 'ar2', artistName: 'The Marlow',
    year: 2024, genre: 'Indie',
    trackIds: ['tr7', 'tr8', 'tr9', 'tr10', 'tr11'],
    accent: '#c026d3',
    artwork: makeArtwork('velvet-hours', '#c026d3', '#3b0764', '#1a0420'),
  },
  {
    id: 'al3', title: 'Solar Drift', artistId: 'ar3', artistName: 'Kava',
    year: 2025, genre: 'Ambient',
    trackIds: ['tr12', 'tr13', 'tr14', 'tr15', 'tr35'],
    accent: '#f59e0b',
    artwork: makeArtwork('solar-drift', '#f59e0b', '#78350f', '#1c1006'),
  },
  {
    id: 'al4', title: 'Neon Heart', artistId: 'ar4', artistName: 'Juno Rush',
    year: 2026, genre: 'Pop',
    trackIds: ['tr16', 'tr17', 'tr18', 'tr19', 'tr20', 'tr32'],
    accent: '#ec4899',
    artwork: makeArtwork('neon-heart', '#ec4899', '#500724', '#1a0510'),
  },
  {
    id: 'al5', title: 'Letters from Nowhere', artistId: 'ar5', artistName: 'Mira Vale',
    year: 2024, genre: 'R&B',
    trackIds: ['tr21', 'tr22', 'tr23', 'tr24', 'tr33'],
    accent: '#059669',
    artwork: makeArtwork('letters-nowhere', '#059669', '#064e3b', '#021c16'),
  },
  {
    id: 'al6', title: 'Wildflower Circuit', artistId: 'ar2', artistName: 'The Marlow',
    year: 2023, genre: 'Indie',
    trackIds: ['tr25', 'tr26', 'tr27'],
    accent: '#0891b2',
    artwork: makeArtwork('wildflower', '#0891b2', '#164e63', '#082a38'),
  },
  {
    id: 'al7', title: 'Pulse', artistId: 'ar6', artistName: 'Cassian North',
    year: 2025, genre: 'Rock',
    trackIds: ['tr28', 'tr29', 'tr30', 'tr31', 'tr36'],
    accent: '#dc2626',
    artwork: makeArtwork('pulse', '#dc2626', '#7f1d1d', '#2a0808'),
  },
];

// --- Artists ---
export const seedArtists: Artist[] = [
  {
    id: 'ar1', name: 'Solene', genre: 'Electronic', monthlyListeners: 2840000,
    bio: 'French electronic producer known for atmospheric soundscapes and nocturnal textures. Her music blends analog synths with field recordings from coastal France.',
    accent: '#6366f1',
    artwork: makeArtwork('solene', '#6366f1', '#1e1b4b', '#0f0a3d'),
    albumIds: ['al1'],
    topTrackIds: ['tr1', 'tr5', 'tr3'],
    relatedArtistIds: ['ar3', 'ar4'],
  },
  {
    id: 'ar2', name: 'The Marlow', genre: 'Indie', monthlyListeners: 1670000,
    bio: 'London-based indie quartet crafting warm, guitar-driven songs about late nights and quiet mornings. Their sound has been called "bedroom rock with a skyline view."',
    accent: '#c026d3',
    artwork: makeArtwork('marlow', '#c026d3', '#3b0764', '#1a0420'),
    albumIds: ['al2', 'al6'],
    topTrackIds: ['tr7', 'tr9', 'tr27'],
    relatedArtistIds: ['ar5', 'ar6'],
  },
  {
    id: 'ar3', name: 'Kava', genre: 'Ambient', monthlyListeners: 920000,
    bio: 'Ambient project from Icelandic composer Kava (Bergur Hólm). Long-form compositions designed for deep focus, meditation, and stargazing.',
    accent: '#f59e0b',
    artwork: makeArtwork('kava', '#f59e0b', '#78350f', '#1c1006'),
    albumIds: ['al3'],
    topTrackIds: ['tr12', 'tr15', 'tr35'],
    relatedArtistIds: ['ar1', 'ar5'],
  },
  {
    id: 'ar4', name: 'Juno Rush', genre: 'Pop', monthlyListeners: 5210000,
    bio: 'Electro-pop artist from Seoul. Bursting onto the global stage with infectious hooks and neon-soaked production. The new album "Neon Heart" is her most ambitious yet.',
    accent: '#ec4899',
    artwork: makeArtwork('juno', '#ec4899', '#500724', '#1a0510'),
    albumIds: ['al4'],
    topTrackIds: ['tr16', 'tr18', 'tr32'],
    relatedArtistIds: ['ar1', 'ar5'],
  },
  {
    id: 'ar5', name: 'Mira Vale', genre: 'R&B', monthlyListeners: 1980000,
    bio: 'Toronto R&B singer-songwriter. Her velvet vocals and introspective lyrics have drawn comparisons to the greats. "Letters from Nowhere" is her critically acclaimed second album.',
    accent: '#059669',
    artwork: makeArtwork('mira', '#059669', '#064e3b', '#021c16'),
    albumIds: ['al5'],
    topTrackIds: ['tr21', 'tr23', 'tr33'],
    relatedArtistIds: ['ar2', 'ar4'],
  },
  {
    id: 'ar6', name: 'Cassian North', genre: 'Rock', monthlyListeners: 1340000,
    bio: 'Australian rock artist blending post-punk energy with cinematic atmospherics. Known for commanding live performances and sprawling guitar work.',
    accent: '#dc2626',
    artwork: makeArtwork('cassian', '#dc2626', '#7f1d1d', '#2a0808'),
    albumIds: ['al7'],
    topTrackIds: ['tr28', 'tr30', 'tr31'],
    relatedArtistIds: ['ar2', 'ar1'],
  },
];

// --- Playlists ---
export const seedPlaylists: Playlist[] = [
  {
    id: 'pl1', title: 'Morning Focus',
    description: 'Gentle electronic and ambient tracks to ease into your day.',
    trackIds: ['tr12', 'tr13', 'tr14', 'tr15', 'tr4', 'tr35'],
    accent: '#0891b2',
    artwork: makeArtwork('morning-focus', '#0891b2', '#0e7490', '#083344'),
    curated: true,
  },
  {
    id: 'pl2', title: 'Late Night Drive',
    description: 'Moody indie and R&B for empty highways and city lights.',
    trackIds: ['tr7', 'tr21', 'tr9', 'tr23', 'tr8', 'tr24', 'tr33'],
    accent: '#4f46e5',
    artwork: makeArtwork('late-night', '#4f46e5', '#312e81', '#1e1b4b'),
    curated: true,
  },
  {
    id: 'pl3', title: 'Weekend Energy',
    description: 'High-voltage pop and electronic to kickstart your weekend.',
    trackIds: ['tr16', 'tr17', 'tr1', 'tr18', 'tr19', 'tr20', 'tr32'],
    accent: '#ec4899',
    artwork: makeArtwork('weekend-energy', '#ec4899', '#be185d', '#500724'),
    curated: true,
  },
  {
    id: 'pl4', title: 'Quiet Hours',
    description: 'Ambient soundscapes for reading, reflection, and rest.',
    trackIds: ['tr12', 'tr14', 'tr15', 'tr35', 'tr13'],
    accent: '#059669',
    artwork: makeArtwork('quiet-hours', '#059669', '#065f46', '#022c22'),
    curated: false,
  },
  {
    id: 'pl5', title: 'Discover Weekly',
    description: 'Fresh picks tailored to your taste. Updated every Monday.',
    trackIds: ['tr28', 'tr25', 'tr16', 'tr21', 'tr12', 'tr3', 'tr30'],
    accent: '#f59e0b',
    artwork: makeArtwork('discover', '#f59e0b', '#b45309', '#451a03'),
    curated: true,
  },
];

// --- Browse categories for empty search state ---
export const browseCategories = [
  { id: 'pop', label: 'Pop', genre: 'Pop', accent: '#ec4899' },
  { id: 'electronic', label: 'Electronic', genre: 'Electronic', accent: '#6366f1' },
  { id: 'jazz', label: 'Jazz', genre: 'Jazz', accent: '#f97316' },
  { id: 'indie', label: 'Indie', genre: 'Indie', accent: '#c026d3' },
  { id: 'rb', label: 'R&B', genre: 'R&B', accent: '#059669' },
  { id: 'ambient', label: 'Ambient', genre: 'Ambient', accent: '#f59e0b' },
  { id: 'rock', label: 'Rock', genre: 'Rock', accent: '#dc2626' },
  { id: 'focus', label: 'Focus', genre: 'Ambient', accent: '#0891b2' },
];
