// Pure date math for sister-day calculations. No React, no DOM.

export function dayOfYear(d) {
  // Use UTC math on the local-clock date components so DST and time-of-day
  // can't drift the answer. (The pre-React version used local Date arithmetic
  // and was off-by-one for noon inputs — pinned by the test suite.)
  const startMs = Date.UTC(d.getFullYear(), 0, 1);
  const dMs = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((dMs - startMs) / 86400000) + 1;
}

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const yearLen = (y) => (isLeap(y) ? 366 : 365);
const halfYear = (y) => Math.floor(yearLen(y) / 2);

export function winterSolsticeDoy(hemisphere) {
  return hemisphere === "N" ? 355 : 172;
}

export function summerSolsticeDoy(hemisphere) {
  return hemisphere === "N" ? 172 : 355;
}

// Days between solstice and coldest day on the short side of the year.
// `year` makes the wrap leap-aware when the DOYs come from a known year;
// omit it for non-leap math.
export function thermalLag(solDoy, coldDoy, year) {
  const len = year === undefined ? 365 : yearLen(year);
  const half = year === undefined ? 182 : halfYear(year);
  let d = coldDoy - solDoy;
  if (d < 0) d += len;
  if (d > half) d -= len;
  return Math.abs(d);
}

// Given a date D and the coldest day C (both Date objects in the same year),
// return { sister, n, warmDate, coolDate } where n is the unsigned distance in days
// between D and C, and warm/cool are the two sister dates assigned to the warming
// (after-cold) and cooling (before-cold) sides of the year.
export function sisterDay(date, coldDate) {
  const yr = date.getFullYear();
  const cDoy = dayOfYear(coldDate);
  const dDoy = dayOfYear(date);
  const len = yearLen(yr);
  const half = halfYear(yr);

  let n = dDoy - cDoy;
  if (n > half) n -= len;
  if (n < -half) n += len;

  let sDoy = cDoy - n;
  if (sDoy < 1) sDoy += len;
  if (sDoy > len) sDoy -= len;

  const sister = new Date(yr, 0, sDoy, 12);
  const absN = Math.abs(n);

  const [warmDate, coolDate] = n >= 0 ? [date, sister] : [sister, date];

  return { sister, n: absN, warmDate, coolDate };
}
