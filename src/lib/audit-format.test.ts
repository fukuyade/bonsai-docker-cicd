import { describe, expect, it } from "vitest";

import { describeAuditDetail } from "./audit-format";

describe("describeAuditDetail", () => {
  it("更新ログは項目ごとに「変更前 → 変更後」で整形する", () => {
    const lines = describeAuditDetail("UPDATE", {
      bonsaiId: 1,
      changes: {
        maintenanceDate: { before: "2026-03-01", after: "2026-03-05" },
        memo: { before: "植え替え実施。", after: "用土を追加。" },
      },
    });

    expect(lines).toEqual([
      "実施日: 2026-03-01 → 2026-03-05",
      "備考: 植え替え実施。 → 用土を追加。",
    ]);
  });

  it("作業種別はDB上の値ではなく日本語ラベルで表示する(消毒を含む)", () => {
    const lines = describeAuditDetail("UPDATE", {
      changes: { workType: { before: "WATERING", after: "PEST_CONTROL" } },
    });

    expect(lines).toEqual(["作業種別: 水やり → 消毒"]);
  });

  it("nullは「(未入力)」と表示する", () => {
    const lines = describeAuditDetail("UPDATE", {
      changes: { workerName: { before: "サンプル担当者A", after: null } },
    });

    expect(lines).toEqual(["担当者名: サンプル担当者A → (未入力)"]);
  });

  it("作成ログは登録した値を並べる", () => {
    const lines = describeAuditDetail("CREATE", {
      values: { maintenanceDate: "2026-06-15", workType: "WATERING" },
    });

    expect(lines).toEqual(["実施日: 2026-06-15", "作業種別: 水やり"]);
  });

  it("想定外の形のdetailでも例外にせず空配列を返す", () => {
    expect(describeAuditDetail("UPDATE", null)).toEqual([]);
    expect(describeAuditDetail("UPDATE", "文字列")).toEqual([]);
    expect(describeAuditDetail("UPDATE", { changes: "壊れた値" })).toEqual([]);
    expect(describeAuditDetail("DELETE", { foo: 1 })).toEqual([]);
  });
});
