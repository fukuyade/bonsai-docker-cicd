import type { MaintenanceWorkType } from "@prisma/client";

import { toDateInputValue } from "@/lib/format";

// 手入れ履歴の「変更前→変更後」の差分を求める純粋関数。
// DBに触れないので、単体テストで変更の検出ロジックだけを検証できる
// (bonsai-search.tsと同じ考え方)。

export type MaintenanceSnapshot = {
  maintenanceDate: Date;
  workType: MaintenanceWorkType;
  workerName: string | null;
  memo: string | null;
};

export type FieldChange = { before: string | null; after: string | null };

export type MaintenanceChanges = Partial<
  Record<keyof MaintenanceSnapshot, FieldChange>
>;

// ログに保存する形(全て文字列かnull)へ揃える。日付は時刻を除いた"YYYY-MM-DD"にする。
export function toLoggableValues(
  snapshot: MaintenanceSnapshot,
): Record<keyof MaintenanceSnapshot, string | null> {
  return {
    maintenanceDate: toDateInputValue(snapshot.maintenanceDate),
    workType: snapshot.workType,
    workerName: snapshot.workerName,
    memo: snapshot.memo,
  };
}

// 値が変わった項目だけを返す。何も変わっていなければ空オブジェクト。
export function diffMaintenanceRecord(
  before: MaintenanceSnapshot,
  after: MaintenanceSnapshot,
): MaintenanceChanges {
  const beforeValues = toLoggableValues(before);
  const afterValues = toLoggableValues(after);
  const changes: MaintenanceChanges = {};

  for (const key of Object.keys(beforeValues) as Array<
    keyof MaintenanceSnapshot
  >) {
    if (beforeValues[key] !== afterValues[key]) {
      changes[key] = { before: beforeValues[key], after: afterValues[key] };
    }
  }

  return changes;
}
