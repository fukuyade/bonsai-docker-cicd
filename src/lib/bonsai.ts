import type { Bonsai } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// DBアクセス処理はここに集約し、ページ(Server Component)からは
// この関数を呼ぶだけにする。UIとデータ取得の責務を分けるため。

export function listBonsai(): Promise<Bonsai[]> {
  return prisma.bonsai.findMany({
    orderBy: { managementNumber: "asc" },
  });
}

export function getBonsaiById(id: number): Promise<Bonsai | null> {
  return prisma.bonsai.findUnique({ where: { id } });
}
