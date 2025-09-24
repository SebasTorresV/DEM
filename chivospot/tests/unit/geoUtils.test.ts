import { describe, it, expect } from "vitest";
import { haversineDistance, withinRadius } from "@/lib/utils/geo";

describe("geo utils", () => {
  it("computes distance", () => {
    const distance = haversineDistance(13.6929, -89.2182, 13.6769, -89.2797);
    expect(distance).toBeGreaterThan(4);
  });

  it("checks radius", () => {
    expect(withinRadius(13.6929, -89.2182, 13.6989, -89.2241, 5)).toBe(true);
  });
});
