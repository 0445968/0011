'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, X, Copy, Check, Clock, Sun, Moon, Briefcase, Sunrise } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LabShell } from '../shared/LabShell';
import { timeZoneCities, defaultTimeZones, type TimeZoneCity } from './timezone-data';
import type { LabItem } from '@/data/studio-lab/registry';

const STORAGE_KEY = 'studio-lab-timezone-planner';

interface PlannerState {
  locations: TimeZoneCity[];
  workStart: number; // 0-23
  workEnd: number; // 0-23
  use24Hour: boolean;
}

const defaultPlannerState: PlannerState = {
  locations: defaultTimeZones,
  workStart: 9,
  workEnd: 17,
  use24Hour: false,
};

function loadState(): PlannerState {
  if (typeof window === 'undefined') return defaultPlannerState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultPlannerState, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultPlannerState;
}

// Get the hour at a given timezone for a reference Date
function getHourInTz(date: Date, tz: string): number {
  return parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      hour12: false,
    }).format(date)
  ) % 24;
}

// Get formatted time in a timezone
function formatTimeInTz(date: Date, tz: string, use24Hour: boolean): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24Hour,
  }).format(date);
}

// Get date in a timezone (for day difference)
function getDateInTz(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// Get timezone abbreviation
function getTzAbbrev(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'short',
  }).formatToParts(date);
  return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
}

// Get UTC offset string
function getUtcOffset(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'shortOffset',
  }).formatToParts(date);
  const offset = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  return offset.replace('GMT', 'UTC');
}

function isWorkingHour(hour: number, start: number, end: number): boolean {
  if (start <= end) return hour >= start && hour < end;
  return hour >= start || hour < end; // overnight range
}

export function TimezonePlanner({ item }: { item: LabItem }) {
  const [state, setState] = useState<PlannerState>(loadState);
  const [refDate, setRefDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedMinute, setSelectedMinute] = useState(new Date().getMinutes());
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Tick every minute to keep "now" fresh when not using custom date
  useEffect(() => {
    const interval = setInterval(() => {
      setRefDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  // The reference point-in-time: selected hour on the ref date
  const refDateTime = useMemo(() => {
    const d = new Date(refDate);
    d.setHours(selectedHour, selectedMinute, 0, 0);
    return d;
  }, [refDate, selectedHour, selectedMinute]);

  // For each location, compute the hour at the reference time
  const locationHours = useMemo(() => {
    return state.locations.map((loc) => ({
      ...loc,
      hour: getHourInTz(refDateTime, loc.tz),
      time: formatTimeInTz(refDateTime, loc.tz, state.use24Hour),
      date: getDateInTz(refDateTime, loc.tz),
      abbrev: getTzAbbrev(refDateTime, loc.tz),
      offset: getUtcOffset(refDateTime, loc.tz),
    }));
  }, [state.locations, refDateTime, state.use24Hour]);

  // Calculate overlap: find hours where ALL locations are in working hours
  const overlapHours = useMemo(() => {
    const overlap: number[] = [];
    for (let h = 0; h < 24; h++) {
      const allWorking = state.locations.every((loc) => {
        const locHour = getHourInTz(
          new Date(refDateTime.getTime() + (h - refDateTime.getHours()) * 3600000),
          loc.tz
        );
        return isWorkingHour(locHour, state.workStart, state.workEnd);
      });
      if (allWorking) overlap.push(h);
    }
    return overlap;
  }, [state.locations, refDateTime, state.workStart, state.workEnd]);

  // Best overlap range (longest consecutive run)
  const bestOverlap = useMemo(() => {
    if (overlapHours.length === 0) return null;
    let bestStart = overlapHours[0], bestLen = 1;
    let curStart = overlapHours[0], curLen = 1;
    for (let i = 1; i < overlapHours.length; i++) {
      if (overlapHours[i] === overlapHours[i - 1] + 1) {
        curLen++;
        if (curLen > bestLen) { bestLen = curLen; bestStart = curStart; }
      } else {
        curStart = overlapHours[i];
        curLen = 1;
      }
    }
    return { start: bestStart, end: bestStart + bestLen - 1, hours: overlapHours };
  }, [overlapHours]);

  const addLocation = (loc: TimeZoneCity) => {
    if (state.locations.some((l) => l.tz === loc.tz)) return;
    setState((p) => ({ ...p, locations: [...p.locations, loc] }));
    setShowAddMenu(false);
    setSearchQuery('');
  };

  const removeLocation = (tz: string) =>
    setState((p) => ({ ...p, locations: p.locations.filter((l) => l.tz !== tz) }));

  const copyTimes = async () => {
    const lines = locationHours.map((loc) => `${loc.city} — ${loc.time}`);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  const handleReset = () => {
    setState(defaultPlannerState);
    setRefDate(new Date());
    setSelectedHour(new Date().getHours());
    setSelectedMinute(new Date().getMinutes());
  };

  const jumpToNow = () => {
    const now = new Date();
    setRefDate(now);
    setSelectedHour(now.getHours());
    setSelectedMinute(now.getMinutes());
  };

  const filteredCities = timeZoneCities.filter((c) =>
    c.city.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !state.locations.some((l) => l.tz === c.tz)
  );

  const dateInputValue = refDate.toISOString().split('T')[0];

  return (
    <LabShell item={item} onReset={handleReset}>
      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Date</label>
          <input
            type="date"
            value={dateInputValue}
            onChange={(e) => {
              const d = new Date(e.target.value);
              d.setHours(selectedHour, selectedMinute, 0, 0);
              setRefDate(d);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Hour</label>
          <input
            type="number"
            min={0}
            max={23}
            value={selectedHour}
            onChange={(e) => setSelectedHour(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
            className="h-9 w-16 rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Minute</label>
          <input
            type="number"
            min={0}
            max={59}
            value={selectedMinute}
            onChange={(e) => setSelectedMinute(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            className="h-9 w-16 rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={jumpToNow}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Clock size={15} />
          Now
        </button>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Work Hours</label>
          <div className="flex items-center gap-1">
            <input
              type="number" min={0} max={23}
              value={state.workStart}
              onChange={(e) => setState((p) => ({ ...p, workStart: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)) }))}
              className="h-9 w-14 rounded-md border border-input bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="number" min={1} max={24}
              value={state.workEnd}
              onChange={(e) => setState((p) => ({ ...p, workEnd: Math.max(1, Math.min(24, parseInt(e.target.value) || 0)) }))}
              className="h-9 w-14 rounded-md border border-input bg-background px-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <button
          onClick={() => setState((p) => ({ ...p, use24Hour: !p.use24Hour }))}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          {state.use24Hour ? '24-hour' : '12-hour'}
        </button>
        <button
          onClick={copyTimes}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
          {copied ? 'Copied' : 'Copy times'}
        </button>
      </div>

      {/* Overlap summary */}
      <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Briefcase size={16} className="text-primary" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {bestOverlap ? (
                <>Best overlap: {state.use24Hour ? `${bestOverlap.start}:00` : formatHour12(bestOverlap.start)} – {state.use24Hour ? `${bestOverlap.end + 1}:00` : formatHour12(bestOverlap.end + 1)} UTC</>
              ) : (
                'No full-team overlap found'
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {bestOverlap
                ? `${bestOverlap.hours.length} overlapping hour${bestOverlap.hours.length > 1 ? 's' : ''} where all locations are within working hours (${state.workStart}:00–${state.workEnd}:00).`
                : 'Try adjusting work hours or removing a location to find partial overlap.'
              }
            </p>
            {bestOverlap && (
              <div className="mt-3 flex flex-wrap gap-3">
                {locationHours.map((loc) => {
                  const overlapTime = new Date(refDateTime.getTime() + (bestOverlap.start - refDateTime.getHours()) * 3600000);
                  return (
                    <span key={loc.tz} className="text-xs">
                      <span className="font-medium">{loc.city}</span>
                      <span className="text-muted-foreground">: {formatTimeInTz(overlapTime, loc.tz, state.use24Hour)}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location rows */}
      <div className="space-y-2">
        {locationHours.map((loc) => {
          const userHour = loc.hour;
          const isDaytime = userHour >= 6 && userHour < 18;
          const isWorking = isWorkingHour(userHour, state.workStart, state.workEnd);
          return (
            <div key={loc.tz} className="rounded-2xl border border-border bg-card p-4">
              {/* Location header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    isDaytime ? 'bg-amber-500/10' : 'bg-indigo-500/10',
                  )}>
                    {isDaytime ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-indigo-400" />}
                  </span>
                  <div>
                    <p className="font-semibold">{loc.city}</p>
                    <p className="text-xs text-muted-foreground">
                      {loc.time} · {loc.abbrev} · {loc.offset}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isWorking ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                      <Briefcase size={11} /> Working
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {isDaytime ? 'Daytime' : 'Off hours'}
                    </span>
                  )}
                  <button
                    onClick={() => removeLocation(loc.tz)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-error/10 hover:text-error"
                    aria-label={`Remove ${loc.city}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* 24-hour timeline */}
              <div className="overflow-x-auto">
                <div className="flex min-w-[680px] gap-0.5">
                  {Array.from({ length: 24 }, (_, h) => {
                    const locHour = getHourInTz(
                      new Date(refDateTime.getTime() + (h - refDateTime.getHours()) * 3600000),
                      loc.tz
                    );
                    const working = isWorkingHour(locHour, state.workStart, state.workEnd);
                    const day = locHour >= 6 && locHour < 18;
                    const isSelected = h === selectedHour;
                    const inOverlap = bestOverlap?.hours.includes(h);

                    return (
                      <div
                        key={h}
                        className={cn(
                          'relative flex flex-col items-center rounded-md py-1.5 text-[10px] transition-colors',
                          working
                            ? 'bg-success/15 text-success'
                            : day
                            ? 'bg-amber-500/5 text-amber-600/50'
                            : 'bg-indigo-500/5 text-indigo-400/40',
                          inOverlap && 'ring-2 ring-primary',
                          isSelected && 'bg-primary text-primary-foreground',
                        )}
                      >
                        <span className={cn('font-medium', isSelected && 'text-primary-foreground')}>
                          {state.use24Hour ? `${h}` : formatHour12(h)}
                        </span>
                        {isSelected && (
                          <span className={cn('mt-0.5 text-[8px]', isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                            {loc.time.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add location */}
        {showAddMenu ? (
          <div className="rounded-2xl border border-border bg-card p-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cities..."
              autoFocus
              className="mb-3 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="max-h-60 overflow-y-auto">
              {filteredCities.map((c) => (
                <button
                  key={c.tz}
                  onClick={() => addLocation(c)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                >
                  <span className="font-medium">{c.city}</span>
                  <span className="text-xs text-muted-foreground">{c.region}</span>
                </button>
              ))}
              {filteredCities.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No more cities available</p>
              )}
            </div>
            <button
              onClick={() => { setShowAddMenu(false); setSearchQuery(''); }}
              className="mt-3 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMenu(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Plus size={16} />
            Add Location
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-success/15" /> Working hours
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-500/5" /> Daytime
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-indigo-500/5" /> Night
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded ring-2 ring-primary" /> Overlap
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-primary" /> Selected
        </span>
      </div>
    </LabShell>
  );
}

function formatHour12(hour: number): string {
  const h = hour % 24;
  if (h === 0) return '12a';
  if (h < 12) return `${h}a`;
  if (h === 12) return '12p';
  return `${h - 12}p`;
}
