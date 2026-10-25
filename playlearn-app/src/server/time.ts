import { APP_CONFIG } from '@/config';

function localDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

/** 返回配置业务时区下本周周一的 YYYY-MM-DD key。 */
export function weekStartKey(date = new Date(), timeZone = APP_CONFIG.timezone): string {
  const parts = localDateParts(date, timeZone);
  const localMidnight = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const daysSinceMonday = (localMidnight.getUTCDay() + 6) % 7;
  localMidnight.setUTCDate(localMidnight.getUTCDate() - daysSinceMonday);
  return localMidnight.toISOString().slice(0, 10);
}
