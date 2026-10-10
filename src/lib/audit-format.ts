import type { AuditAction, MaintenanceWorkType } from "@prisma/client";

import { MAINTENANCE_WORK_TYPE_LABEL } from "@/lib/maintenance-work-type";

// 操作ログ画面用の表示整形。DBに保存したJSON(detail)を、人が読める文言へ変換する。
// 保存形式が将来変わっても画面が壊れないよう、想定外の形は空配列(=表示なし)にする。

export const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  CREATE: "作成",
  UPDATE: "更新",
  DELETE: "削除",
};

export const AUDIT_ENTITY_LABEL: Record<string, string> = {
  MaintenanceRecord: "手入れ履歴",
};

const FIELD_LABEL: Record<string, string> = {
  maintenanceDate: "実施日",
  workType: "作業種別",
  workerName: "担当者名",
  memo: "備考",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// 作業種別はDB上の値(例: PEST_CONTROL)ではなく、画面と同じ日本語ラベルで見せる。
function formatValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "(未入力)";
  if (field === "workType" && typeof value === "string") {
    return MAINTENANCE_WORK_TYPE_LABEL[value as MaintenanceWorkType] ?? value;
  }
  return String(value);
}

export function describeAuditDetail(
  action: AuditAction,
  detail: unknown,
): string[] {
  if (!isRecord(detail)) return [];

  if (action === "UPDATE" && isRecord(detail.changes)) {
    return Object.entries(detail.changes).flatMap(([field, change]) => {
      if (!isRecord(change)) return [];
      return [
        `${FIELD_LABEL[field] ?? field}: ${formatValue(field, change.before)} → ${formatValue(field, change.after)}`,
      ];
    });
  }

  if (action === "CREATE" && isRecord(detail.values)) {
    return Object.entries(detail.values).map(
      ([field, value]) =>
        `${FIELD_LABEL[field] ?? field}: ${formatValue(field, value)}`,
    );
  }

  return [];
}
