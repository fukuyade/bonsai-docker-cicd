import type { MaintenanceRecord } from "@prisma/client";

import {
  diffMaintenanceRecord,
  toLoggableValues,
  type MaintenanceSnapshot,
} from "@/lib/maintenance-diff";
import { prisma } from "@/lib/prisma";

// 操作ログに「誰が」を残すための操作者情報。
export type AuditActor = { id: number; name: string };

// フォームから受け取った(検証・変換済みの)手入れ履歴の内容。
export type MaintenanceInput = MaintenanceSnapshot;

// 盆栽IDも条件に含めることで、URL上の盆栽IDと履歴IDの組み合わせが
// 食い違っている場合(他の盆栽の履歴を指している等)は取得できないようにする。
export function getMaintenanceRecord(
  id: number,
  bonsaiId: number,
): Promise<MaintenanceRecord | null> {
  return prisma.maintenanceRecord.findFirst({ where: { id, bonsaiId } });
}

// 履歴の作成と操作ログの記録を1つのトランザクションにまとめる。
// 「履歴は作れたのにログが残っていない」(またはその逆)という状態を防ぐため。
export function createMaintenanceRecordWithAudit(params: {
  bonsaiId: number;
  input: MaintenanceInput;
  actor: AuditActor;
}): Promise<MaintenanceRecord> {
  const { bonsaiId, input, actor } = params;

  return prisma.$transaction(async (tx) => {
    const record = await tx.maintenanceRecord.create({
      data: { bonsaiId, ...input },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        userName: actor.name,
        action: "CREATE",
        entity: "MaintenanceRecord",
        entityId: record.id,
        detail: { bonsaiId, values: toLoggableValues(input) },
      },
    });

    return record;
  });
}

export type UpdateMaintenanceResult = "updated" | "unchanged" | "not-found";

// 履歴の更新と操作ログの記録を1つのトランザクションにまとめる。
// 変更前の値の取得・差分の計算・更新・ログ記録を同じトランザクション内で行うため、
// 「ログに書いた変更前の値」と「実際に更新した時点の値」がずれない。
export function updateMaintenanceRecordWithAudit(params: {
  id: number;
  bonsaiId: number;
  input: MaintenanceInput;
  actor: AuditActor;
}): Promise<UpdateMaintenanceResult> {
  const { id, bonsaiId, input, actor } = params;

  return prisma.$transaction(async (tx) => {
    const before = await tx.maintenanceRecord.findFirst({
      where: { id, bonsaiId },
    });
    if (!before) return "not-found";

    const changes = diffMaintenanceRecord(before, input);
    // 何も変わっていないのに更新・ログ記録をすると、意味のないログが増えるだけなので何もしない。
    if (Object.keys(changes).length === 0) return "unchanged";

    await tx.maintenanceRecord.update({ where: { id }, data: input });
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        userName: actor.name,
        action: "UPDATE",
        entity: "MaintenanceRecord",
        entityId: id,
        detail: { bonsaiId, changes },
      },
    });

    return "updated";
  });
}
