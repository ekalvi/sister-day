// Pure date math for sister-day calculations. No React, no DOM.

export function dayOfYear(d) {
  // Use UTC math on the local-clock date components so DST and time-of-day
  // can't drift the answer. (The pre-React version used local Date arithmetic
  // and was off-by-one for noon inputs — pinned by the test suite.)
  const startMs = Date.UTC(d.getFullYear(), 0, 1);
  const dMs = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((dMs - startMs) / 86400000) + 1;
}

export function winterSolsticeDoy(hemisphere) {
  return hemisphere === "N" ? 355 : 172;
}

export function summerSolsticeDoy(hemisphere) {
  return hemisphere === "N" ? 172 : 355;
}

// Days between solstice and coldest day on the short side of the year.
export function thermalLag(solDoy, coldDoy) {
  let d = coldDoy - solDoy;
  if (d < 0) d += 365;
  if (d > 182) d -= 365;
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

  let n = dDoy - cDoy;
  if (n > 182) n -= 365;
  if (n < -182) n += 365;

  let sDoy = cDoy - n;
  if (sDoy < 1) sDoy += 365;
  if (sDoy > 365) sDoy -= 365;

  const sister = new Date(yr, 0, sDoy, 12);
  const absN = Math.abs(n);

  const [warmDate, coolDate] = n >= 0 ? [date, sister] : [sister, date];

  return { sister, n: absN, warmDate, coolDate };
}
