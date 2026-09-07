import type { Bonsai, MaintenanceRecord } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { BonsaiCreateInput } from "@/lib/validation/bonsai";

// DBアクセス処理はここに集約し、ページ・Server Actionからは
// この関数を呼ぶだけにする。UIとデータ取得の責務を分けるため。
// エラー(Prismaの一意制約違反など)はここでは握りつぶさず、呼び出し元(Server Action)で
// ユーザー向けメッセージに変換する。

export function listBonsai(): Promise<Bonsai[]> {
  return prisma.bonsai.findMany({
    orderBy: { managementNumber: "asc" },
  });
}

export function getBonsaiById(id: number): Promise<Bonsai | null> {
  return prisma.bonsai.findUnique({ where: { id } });
}

// 盆栽詳細画面用: 手入れ履歴を「実施日の降順」で一緒に取得する。
// includeはPrismaのJOINに相当し、盆栽1件 + 関連するMaintenanceRecordを
// 1回のクエリでまとめて取得できる(別々にfindするより効率的)。
export function getBonsaiWithMaintenanceRecords(
  id: number,
): Promise<(Bonsai & { maintenanceRecords: MaintenanceRecord[] }) | null> {
  return prisma.bonsai.findUnique({
    where: { id },
    include: {
      maintenanceRecords: {
        orderBy: { maintenanceDate: "desc" },
      },
    },
  });
}

export function createBonsai(data: BonsaiCreateInput): Promise<Bonsai> {
  return prisma.bonsai.create({ data });
}

export function updateBonsai(
  id: number,
  data: BonsaiCreateInput,
): Promise<Bonsai> {
  return prisma.bonsai.update({ where: { id }, data });
}
