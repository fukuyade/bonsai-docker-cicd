import { describe, expect, it } from "vitest";

import { canDeleteBonsai, canViewAuditLog } from "./authorization";

describe("canDeleteBonsai", () => {
  it("ADMINは削除できる", () => {
    expect(canDeleteBonsai("ADMIN")).toBe(true);
  });

  it("STAFFは削除できない", () => {
    expect(canDeleteBonsai("STAFF")).toBe(false);
  });
});

describe("canViewAuditLog", () => {
  it("ADMINは操作ログを閲覧できる", () => {
    expect(canViewAuditLog("ADMIN")).toBe(true);
  });

  it("STAFFは操作ログを閲覧できない", () => {
    expect(canViewAuditLog("STAFF")).toBe(false);
  });
});
