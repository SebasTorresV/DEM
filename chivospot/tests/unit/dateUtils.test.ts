import { describe, it, expect } from "vitest";
import { formatDateRange, getNowRange, getUpcomingRange } from "@/lib/utils/date";

describe("date utils", () => {
  it("formats range on same day", () => {
    const start = new Date(Date.UTC(2024, 0, 1, 10, 0));
    const end = new Date(Date.UTC(2024, 0, 1, 12, 0));
    expect(formatDateRange(start, end)).toMatch(/\d{1,2}:\d{2}/);
  });

  it("returns now range with end after start", () => {
    const range = getNowRange();
    expect(range.end.getTime()).toBeGreaterThan(range.start.getTime());
  });

  it("returns upcoming range with days", () => {
    const range = getUpcomingRange(30);
    const diff = (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24);
    expect(diff).toBeLessThanOrEqual(31);
  });
});
