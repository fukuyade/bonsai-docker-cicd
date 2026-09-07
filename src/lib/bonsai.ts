import type { Bonsai } from "@prisma/client";

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

export function createBonsai(data: BonsaiCreateInput): Promise<Bonsai> {
  return prisma.bonsai.create({ data });
}

export function updateBonsai(
  id: number,
  data: BonsaiCreateInput,
): Promise<Bonsai> {
  return prisma.bonsai.update({ where: { id }, data });
}
