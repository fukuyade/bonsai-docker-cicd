import { describe, expect, it } from "vitest";

import {
  diffMaintenanceRecord,
  toLoggableValues,
  type MaintenanceSnapshot,
} from "./maintenance-diff";

// 変更前の基準データ。各テストで必要な項目だけ上書きして使う。
const base: MaintenanceSnapshot = {
  maintenanceDate: new Date("2026-03-01"),
  workType: "REPOTTING",
  workerName: "サンプル担当者A",
  memo: "植え替え実施。",
};

describe("diffMaintenanceRecord", () => {
  it("何も変わっていなければ空オブジェクトを返す", () => {
    expect(diffMaintenanceRecord(base, { ...base })).toEqual({});
  });

  it("変更された項目だけを変更前・変更後つきで返す", () => {
    const after = { ...base, workType: "PEST_CONTROL" as const };

    expect(diffMaintenanceRecord(base, after)).toEqual({
      workType: { before: "REPOTTING", after: "PEST_CONTROL" },
    });
  });

  it("複数項目が変わったときは全て返す", () => {
    const after = {
      ...base,
      maintenanceDate: new Date("2026-03-05"),
      memo: "用土を追加。",
    };

    expect(diffMaintenanceRecord(base, after)).toEqual({
      maintenanceDate: { before: "2026-03-01", after: "2026-03-05" },
      memo: { before: "植え替え実施。", after: "用土を追加。" },
    });
  });

  it("日付は時刻ではなく日付で比較する(同じ日なら変更なし)", () => {
    const after = { ...base, maintenanceDate: new Date("2026-03-01T00:00:00Z") };
    expect(diffMaintenanceRecord(base, after)).toEqual({});
  });

  it("nullと値の間の変更も検出する(未入力→入力、入力→未入力)", () => {
    const cleared = { ...base, workerName: null };
    expect(diffMaintenanceRecord(base, cleared)).toEqual({
      workerName: { before: "サンプル担当者A", after: null },
    });

    const filled = { ...cleared, workerName: "サンプル担当者B" };
    expect(diffMaintenanceRecord(cleared, filled)).toEqual({
      workerName: { before: null, after: "サンプル担当者B" },
    });
  });
});

describe("toLoggableValues", () => {
  it("日付を YYYY-MM-DD の文字列にして返す", () => {
    expect(toLoggableValues(base)).toEqual({
      maintenanceDate: "2026-03-01",
      workType: "REPOTTING",
      workerName: "サンプル担当者A",
      memo: "植え替え実施。",
    });
  });
});
