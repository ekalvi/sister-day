import { describe, expect, it } from "vitest";
import {
  dayOfYear,
  sisterDay,
  thermalLag,
  winterSolsticeDoy,
  summerSolsticeDoy,
} from "./sister-day.js";

const at = (y, m, d) => new Date(y, m - 1, d, 12);

describe("dayOfYear", () => {
  it("returns 1 for Jan 1", () => {
    expect(dayOfYear(at(2026, 1, 1))).toBe(1);
  });

  it("returns 365 for Dec 31 (non-leap)", () => {
    expect(dayOfYear(at(2025, 12, 31))).toBe(365);
  });

  it("handles leap years", () => {
    expect(dayOfYear(at(2024, 12, 31))).toBe(366);
  });
});

describe("solstice DOYs", () => {
  it("flips between hemispheres", () => {
    expect(winterSolsticeDoy("N")).toBe(355);
    expect(winterSolsticeDoy("S")).toBe(172);
    expect(summerSolsticeDoy("N")).toBe(172);
    expect(summerSolsticeDoy("S")).toBe(355);
  });
});

describe("thermalLag", () => {
  it("measures the short-arc distance between solstice and coldest day", () => {
    // Northern hemisphere: solstice ~Dec 21 (DOY 355), coldest ~Jan 29 (DOY 29)
    expect(thermalLag(355, 29)).toBe(39);
  });

  it("returns 0 when they coincide", () => {
    expect(thermalLag(355, 355)).toBe(0);
  });

  it("uses the year length when the DOYs come from a leap year", () => {
    // In a 366-day year, Dec 31 has DOY 366. Short-arc from summer solstice
    // (DOY 172) to DOY 366 is 172 days; the 365-wrap would return 171.
    expect(thermalLag(172, 366, 2024)).toBe(172);
  });
});

describe("sisterDay", () => {
  const coldJan29 = at(2026, 1, 29);

  it("mirrors a date after the coldest day to one before it", () => {
    // 30 days after Jan 29 → Feb 28; sister should be 30 days before → Dec 30 (prior year wraps within same calendar year)
    const { n, warmDate, coolDate } = sisterDay(at(2026, 2, 28), coldJan29);
    expect(n).toBe(30);
    // warmDate is the after-cold side, coolDate is the before-cold side
    expect(warmDate.getMonth() + 1).toBe(2);
    expect(warmDate.getDate()).toBe(28);
    expect(coolDate.getMonth() + 1).toBe(12);
    expect(coolDate.getDate()).toBe(30);
  });

  it("mirrors a date before the coldest day to one after it", () => {
    // 14 days before Jan 29 → Jan 15; sister should be 14 days after → Feb 12
    const { n, warmDate, coolDate } = sisterDay(at(2026, 1, 15), coldJan29);
    expect(n).toBe(14);
    expect(coolDate.getMonth() + 1).toBe(1);
    expect(coolDate.getDate()).toBe(15);
    expect(warmDate.getMonth() + 1).toBe(2);
    expect(warmDate.getDate()).toBe(12);
  });

  it("returns the coldest day itself when input is the coldest day", () => {
    const { n, warmDate, coolDate } = sisterDay(coldJan29, coldJan29);
    expect(n).toBe(0);
    expect(warmDate.getMonth() + 1).toBe(1);
    expect(warmDate.getDate()).toBe(29);
    expect(coolDate.getMonth() + 1).toBe(1);
    expect(coolDate.getDate()).toBe(29);
  });

  it("handles the cross-year wrap when the coldest day is in early January", () => {
    // Coldest = Jan 10. Input = Mar 1 (DOY 60). n = 60 - 10 = 50 days after.
    // Sister = 50 days before Jan 10 → Nov 21 (DOY 325).
    const cold = at(2026, 1, 10);
    const { n, warmDate, coolDate } = sisterDay(at(2026, 3, 1), cold);
    expect(n).toBe(50);
    expect(coolDate.getMonth() + 1).toBe(11);
    expect(coolDate.getDate()).toBe(21);
    expect(warmDate.getMonth() + 1).toBe(3);
    expect(warmDate.getDate()).toBe(1);
  });

  it("wraps using the leap-year length when the sister falls before Jan 1", () => {
    // Coldest = Jan 29 2024. Input = Mar 1 2024 (DOY 61 in a leap year).
    // 32 days after coldest, so the sister is 32 days before → Dec 28.
    // The 365-day wrap returns Dec 27 in a 366-day year.
    const cold = at(2024, 1, 29);
    const { n, warmDate, coolDate } = sisterDay(at(2024, 3, 1), cold);
    expect(n).toBe(32);
    expect(warmDate.getMonth() + 1).toBe(3);
    expect(warmDate.getDate()).toBe(1);
    expect(coolDate.getMonth() + 1).toBe(12);
    expect(coolDate.getDate()).toBe(28);
  });
});
