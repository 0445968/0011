'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  seedTrip,
  type Activity,
  type Day,
  type RoamlyTrip,
  type SavedPlace,
  type PlaceCategory,
} from '@/data/demos/travel-planner';

let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}${idCounter++}`;

export interface NewActivityInput {
  time: string;
  endTime?: string;
  type: Activity['type'];
  title: string;
  location: string;
  description: string;
  cost: number;
}

export function useTripState() {
  const [days] = useState<Day[]>(seedTrip.days);
  const [activities, setActivities] = useState<Activity[]>(
    seedTrip.activities
  );
  const [places, setPlaces] = useState<SavedPlace[]>(seedTrip.places);
  const [activeDayId, setActiveDayId] = useState<string>(seedTrip.days[0].id);

  const dayActivities = useMemo(
    () =>
      activities
        .filter((a) => a.dayId === activeDayId)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [activities, activeDayId]
  );

  const addActivity = useCallback(
    (dayId: string, input: NewActivityInput) => {
      const activity: Activity = {
        id: nextId('a'),
        dayId,
        time: input.time,
        endTime: input.endTime,
        type: input.type,
        title: input.title,
        location: input.location,
        description: input.description,
        cost: input.cost,
        favorite: false,
      };
      setActivities((prev) => [...prev, activity]);
    },
    []
  );

  const updateActivity = useCallback(
    (id: string, input: Partial<NewActivityInput>) => {
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...input } : a))
      );
    },
    []
  );

  const deleteActivity = useCallback((id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, favorite: !a.favorite } : a
      )
    );
  }, []);

  const moveActivity = useCallback((id: string, direction: -1 | 1) => {
    setActivities((prev) => {
      for (const dayId of Array.from(new Set(prev.map((a) => a.dayId)))) {
        const dayActs = prev
          .filter((a) => a.dayId === dayId)
          .sort((a, b) => a.time.localeCompare(b.time));
        const idx = dayActs.findIndex((a) => a.id === id);
        if (idx === -1) continue;
        const swapIdx = idx + direction;
        if (swapIdx < 0 || swapIdx >= dayActs.length) return prev;
        const a = dayActs[idx];
        const b = dayActs[swapIdx];
        return prev.map((x) => {
          if (x.id === a.id) return { ...x, time: b.time };
          if (x.id === b.id) return { ...x, time: a.time };
          return x;
        });
      }
      return prev;
    });
  }, []);

  const togglePlaceFavorite = useCallback((id: string) => {
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, favorite: !p.favorite } : p
      )
    );
  }, []);

  const addPlaceToItinerary = useCallback(
    (placeId: string, dayId: string) => {
      const place = places.find((p) => p.id === placeId);
      if (!place) return;
      addActivity(dayId, {
        time: '14:00',
        type: place.category === 'Food' ? 'lunch' : 'landmark',
        title: place.name,
        location: place.address,
        description: place.note,
        cost: place.priceLevel * 15,
      });
    },
    [places, addActivity]
  );

  const reset = useCallback(() => {
    setActivities(seedTrip.activities);
    setPlaces(seedTrip.places);
    setActiveDayId(seedTrip.days[0].id);
  }, []);

  return {
    trip: seedTrip as RoamlyTrip,
    days,
    activities,
    places,
    activeDayId,
    dayActivities,
    setActiveDayId,
    addActivity,
    updateActivity,
    deleteActivity,
    toggleFavorite,
    moveActivity,
    togglePlaceFavorite,
    addPlaceToItinerary,
    reset,
  };
}

export type TripState = ReturnType<typeof useTripState>;

// ---- Budget helpers ----

export type BudgetCategory =
  | 'accommodation'
  | 'food'
  | 'activities'
  | 'transportation'
  | 'shopping';

export interface BudgetLine {
  category: BudgetCategory;
  label: string;
  amount: number;
  color: string;
}

const categoryColors: Record<BudgetCategory, string> = {
  accommodation: '#c2876b',
  food: '#d9a86c',
  activities: '#6b9bb0',
  transportation: '#7a8fb0',
  shopping: '#b07a9a',
};

const foodTypes = new Set(['breakfast', 'lunch', 'dinner']);
const transportTypes = new Set(['transport']);
const shoppingTypes = new Set(['shopping']);

function categorize(a: Activity): BudgetCategory {
  if (foodTypes.has(a.type)) return 'food';
  if (transportTypes.has(a.type)) return 'transportation';
  if (shoppingTypes.has(a.type)) return 'shopping';
  return 'activities';
}

export function computeBudget(
  trip: RoamlyTrip,
  activities: Activity[]
) {
  const accom =
    trip.accommodation.nightlyCost * trip.accommodation.nights;
  const lines: Record<BudgetCategory, number> = {
    accommodation: accom,
    food: 0,
    activities: 0,
    transportation: 0,
    shopping: 0,
  };
  for (const a of activities) {
    if (a.cost <= 0) continue;
    const cat = categorize(a);
    lines[cat] += a.cost;
  }
  const totalSpent = Object.values(lines).reduce((s, v) => s + v, 0);
  const remaining = trip.budgetTotal - totalSpent;

  const breakdown: BudgetLine[] = (
    Object.keys(lines) as BudgetCategory[]
  ).map((k) => ({
    category: k,
    label: labelFor(k),
    amount: lines[k],
    color: categoryColors[k],
  }));

  return {
    totalSpent,
    remaining,
    pct: Math.min(100, (totalSpent / trip.budgetTotal) * 100),
    breakdown,
    lines,
  };
}

function labelFor(c: BudgetCategory): string {
  switch (c) {
    case 'accommodation': return 'Accommodation';
    case 'food': return 'Food & Drink';
    case 'activities': return 'Activities';
    case 'transportation': return 'Transportation';
    case 'shopping': return 'Shopping';
  }
}

export const placeCategories: PlaceCategory[] = [
  'Food',
  'Culture',
  'Shopping',
  'Nightlife',
  'Sightseeing',
];

export const activityTypeLabels: Record<Activity['type'], string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  landmark: 'Landmark',
  museum: 'Museum',
  walk: 'Neighborhood Walk',
  viewpoint: 'Viewpoint',
  shopping: 'Shopping',
  transport: 'Transport',
  nightlife: 'Nightlife',
  rest: 'Rest',
};
