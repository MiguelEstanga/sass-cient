/**
 * Genera el array de páginas con "..." para el Paginator.
 * Ej: [1, "...", 4, 5, 6, "...", 10]
 */
export function getPageNumbers(
  current: number,
  last: number,
  delta = 1
): (number | "...")[] {
  const range: number[] = [];
  const rangeWithDots: (number | "...")[] = [];

  const left = Math.max(2, current - delta);
  const right = Math.min(last - 1, current + delta);

  range.push(1);
  for (let i = left; i <= right; i++) range.push(i);
  if (last > 1) range.push(last);

  let prev: number | undefined;
  for (const page of range) {
    if (prev !== undefined) {
      if (page - prev === 2) {
        rangeWithDots.push(prev + 1);
      } else if (page - prev > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(page);
    prev = page;
  }

  return rangeWithDots;
}