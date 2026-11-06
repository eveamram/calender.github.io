export type SeasonTheme = 'thanksgiving' | 'christmas' | 'newyear' | 'default';

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Fourth Thursday in November, as YYYY-MM-DD. */
export function thanksgivingDate(year: number): string {
  const first = new Date(year, 10, 1);
  const offset = (4 - first.getDay() + 7) % 7;
  return dateKey(new Date(year, 10, 1 + offset + 21));
}

/**
 * Thanksgiving: November 1 through Thanksgiving Day.
 * Christmas: the next day through December 25.
 * New Year: December 26 through January 1.
 * Every other day keeps the usual look.
 */
export function seasonForDate(date: Date): SeasonTheme {
  const key = dateKey(date);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const thanks = thanksgivingDate(date.getFullYear());

  if (month === 11 && key <= thanks) return 'thanksgiving';
  if ((month === 11 && key > thanks) || (month === 12 && day <= 25)) return 'christmas';
  if ((month === 12 && day >= 26) || (month === 1 && day === 1)) return 'newyear';
  return 'default';
}

export function seasonLabel(season: SeasonTheme): string {
  if (season === 'thanksgiving') return 'Thanksgiving';
  if (season === 'christmas') return 'Christmas';
  if (season === 'newyear') return 'New Year';
  return '';
}
