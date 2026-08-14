// Curated list of useful time zones with city names and IANA identifiers.
// Used by the Time-Zone Planner tool.

export interface TimeZoneCity {
  city: string;
  tz: string; // IANA time-zone identifier
  region: string;
}

export const timeZoneCities: TimeZoneCity[] = [
  { city: 'Los Angeles', tz: 'America/Los_Angeles', region: 'North America' },
  { city: 'Denver', tz: 'America/Denver', region: 'North America' },
  { city: 'Chicago', tz: 'America/Chicago', region: 'North America' },
  { city: 'New York', tz: 'America/New_York', region: 'North America' },
  { city: 'Toronto', tz: 'America/Toronto', region: 'North America' },
  { city: 'Mexico City', tz: 'America/Mexico_City', region: 'North America' },
  { city: 'São Paulo', tz: 'America/Sao_Paulo', region: 'South America' },
  { city: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires', region: 'South America' },
  { city: 'London', tz: 'Europe/London', region: 'Europe' },
  { city: 'Lisbon', tz: 'Europe/Lisbon', region: 'Europe' },
  { city: 'Dublin', tz: 'Europe/Dublin', region: 'Europe' },
  { city: 'Paris', tz: 'Europe/Paris', region: 'Europe' },
  { city: 'Berlin', tz: 'Europe/Berlin', region: 'Europe' },
  { city: 'Madrid', tz: 'Europe/Madrid', region: 'Europe' },
  { city: 'Rome', tz: 'Europe/Rome', region: 'Europe' },
  { city: 'Amsterdam', tz: 'Europe/Amsterdam', region: 'Europe' },
  { city: 'Stockholm', tz: 'Europe/Stockholm', region: 'Europe' },
  { city: 'Istanbul', tz: 'Europe/Istanbul', region: 'Europe' },
  { city: 'Moscow', tz: 'Europe/Moscow', region: 'Europe' },
  { city: 'Cape Town', tz: 'Africa/Johannesburg', region: 'Africa' },
  { city: 'Cairo', tz: 'Africa/Cairo', region: 'Africa' },
  { city: 'Dubai', tz: 'Asia/Dubai', region: 'Middle East' },
  { city: 'Tehran', tz: 'Asia/Tehran', region: 'Middle East' },
  { city: 'Mumbai', tz: 'Asia/Kolkata', region: 'Asia' },
  { city: 'Delhi', tz: 'Asia/Kolkata', region: 'Asia' },
  { city: 'Bangkok', tz: 'Asia/Bangkok', region: 'Asia' },
  { city: 'Singapore', tz: 'Asia/Singapore', region: 'Asia' },
  { city: 'Hong Kong', tz: 'Asia/Hong_Kong', region: 'Asia' },
  { city: 'Shanghai', tz: 'Asia/Shanghai', region: 'Asia' },
  { city: 'Tokyo', tz: 'Asia/Tokyo', region: 'Asia' },
  { city: 'Seoul', tz: 'Asia/Seoul', region: 'Asia' },
  { city: 'Sydney', tz: 'Australia/Sydney', region: 'Oceania' },
  { city: 'Melbourne', tz: 'Australia/Melbourne', region: 'Oceania' },
  { city: 'Auckland', tz: 'Pacific/Auckland', region: 'Oceania' },
  { city: 'Honolulu', tz: 'Pacific/Honolulu', region: 'Pacific' },
];

export const defaultTimeZones: TimeZoneCity[] = [
  { city: 'Chicago', tz: 'America/Chicago', region: 'North America' },
  { city: 'New York', tz: 'America/New_York', region: 'North America' },
  { city: 'London', tz: 'Europe/London', region: 'Europe' },
  { city: 'Tokyo', tz: 'Asia/Tokyo', region: 'Asia' },
];
