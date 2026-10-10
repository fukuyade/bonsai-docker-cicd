import { describe, expect, it } from "vitest";

import { canDeleteBonsai } from "./authorization";

describe("canDeleteBonsai", () => {
  it("ADMINは削除できる", () => {
    expect(canDeleteBonsai("ADMIN")).toBe(true);
  });

  it("STAFFは削除できない", () => {
    expect(canDeleteBonsai("STAFF")).toBe(false);
  });
});
