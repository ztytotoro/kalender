import { eraseTime, extract, getWeekDay, normalDate } from './date';
import { WeekDay } from './definition';
import { addDays, diffTime } from './timespan';
import { lastOf } from './utils';

export function daysOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getMonthDates(year: number, month: number): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < daysOfMonth(year, month); i++) {
    days.push(normalDate(year, month, i + 1));
  }
  return days;
}

export function getCalendarMonthDates(year: number, month: number): Date[] {
  const days = getMonthDates(year, month);

  while (getWeekDay(days[0]) > 1) {
    const day = extract(days[0]);
    days.unshift(normalDate(day.year, day.month, day.day - 1));
  }

  while (getWeekDay(lastOf(days)) !== 7) {
    const day = extract(lastOf(days));
    days.push(normalDate(day.year, day.month, day.day + 1));
  }

  return days;
}

export function addMonths(
  {
    year,
    month,
  }: {
    year: number;
    month: number;
  },
  count: number
) {
  const { year: y, month: m } = extract(new Date(year, month + count - 1));
  return {
    year: y,
    month: m,
  };
}

export function isNthWeekDay(date: Date, weekDay: WeekDay, rank = 0) {
  const { year, month } = extract(date);
  if (rank === -1) {
    const diff = diffTime(theLastWeekDay(year, month, weekDay), date);
    return diff.year === 0 && diff.month === 0 && diff.day === 0;
  }
  const diff = diffTime(theFirstWeekDay(year, month, weekDay), date);
  return diff.year === 0 && diff.month === 0 && diff.day === rank * 7;
}

export function theFirstWeekDay(year: number, month: number, weekDay: WeekDay) {
  let date = normalDate(year, month, 1);

  while (getWeekDay(date) !== weekDay) {
    date = addDays(date, 1);
  }

  return date;
}

export function theLastWeekDay(year: number, month: number, weekDay: WeekDay) {
  let date = normalDate(year, month + 1, 0);

  while (getWeekDay(date) !== weekDay) {
    date = addDays(date, -1);
  }

  return date;
}
