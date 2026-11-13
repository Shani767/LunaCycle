import { addDays, diffDays, today } from './dates';

// periods come from the database newest first
export function getCycleLengths(periods) {
  const asc = [...periods].sort((a, b) => a.start_date.localeCompare(b.start_date));
  const lengths = [];
  for (let i = 1; i < asc.length; i++) {
    lengths.push(diffDays(asc[i - 1].start_date, asc[i].start_date));
  }
  return lengths;
}

export const average = (arr) =>
  arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

export const periodDuration = (p) => (p.end_date ? diffDays(p.start_date, p.end_date) + 1 : null);

export function getStats(periods, settings) {
  const cycleLengths = getCycleLengths(periods);
  const durations = periods.map(periodDuration).filter((d) => d !== null);
  return {
    cycleLengths,
    avgCycle: average(cycleLengths) ?? settings.cycleLength,
    avgPeriod: average(durations) ?? settings.periodLength,
    hasCycleData: cycleLengths.length > 0,
    shortest: cycleLengths.length ? Math.min(...cycleLengths) : null,
    longest: cycleLengths.length ? Math.max(...cycleLengths) : null,
  };
}

export function predictNextStart(periods, avgCycle) {
  if (!periods.length) return null;
  return addDays(periods[0].start_date, avgCycle);
}

export function getCycleDay(periods) {
  if (!periods.length) return null;
  return diffDays(periods[0].start_date, today()) + 1;
}
