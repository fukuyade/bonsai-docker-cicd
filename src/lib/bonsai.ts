import type { Bonsai, BonsaiImage, MaintenanceRecord } from "@prisma/client";

import {
  buildBonsaiWhere,
  type BonsaiSearchParams,
} from "@/lib/bonsai-search";
import { prisma } from "@/lib/prisma";
import type { BonsaiCreateInput } from "@/lib/validation/bonsai";

// DBアクセス処理はここに集約し、ページ・Server Actionからは
// この関数を呼ぶだけにする。UIとデータ取得の責務を分けるため。
// エラー(Prismaの一意制約違反など)はここでは握りつぶさず、呼び出し元(Server Action)で
// ユーザー向けメッセージに変換する。

// 検索条件を渡さなければ全件、渡せば絞り込んで取得する。
// where句の組み立ては純粋関数(buildBonsaiWhere)に切り出してテスト可能にしている。
export function listBonsai(
  searchParams: BonsaiSearchParams = {},
): Promise<Bonsai[]> {
  return prisma.bonsai.findMany({
    where: buildBonsaiWhere(searchParams),
    orderBy: { managementNumber: "asc" },
  });
}

// 設置場所の絞り込み候補を、実際に登録されている値から作る。
// 固定のリストを持たず、DBの実データに追従させるための取得処理。
export async function listBonsaiLocations(): Promise<string[]> {
  const rows = await prisma.bonsai.findMany({
    where: { location: { not: null } },
    select: { location: true },
    distinct: ["location"],
    orderBy: { location: "asc" },
  });
  return rows
    .map((row) => row.location)
    .filter((location): location is string => Boolean(location));
}

export function getBonsaiById(id: number): Promise<Bonsai | null> {
  return prisma.bonsai.findUnique({ where: { id } });
}

// 盆栽詳細画面用: 手入れ履歴(実施日の降順)と写真(表示順)を一緒に取得する。
// includeはPrismaのJOINに相当し、盆栽1件 + 関連レコードを
// 1回のクエリでまとめて取得できる(別々にfindするより効率的)。
export function getBonsaiWithMaintenanceRecords(id: number): Promise<
  | (Bonsai & {
      maintenanceRecords: MaintenanceRecord[];
      images: BonsaiImage[];
    })
  | null
> {
  return prisma.bonsai.findUnique({
    where: { id },
    include: {
      maintenanceRecords: {
        orderBy: { maintenanceDate: "desc" },
      },
      images: {
        orderBy: { sortOrder: "asc" },
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

// 盆栽を物理削除する。
// 手入れ履歴が残っている場合は外部キー制約(onDelete: Restrict)により
// DB側で拒否され、Prismaが P2003 を投げる。その判定は呼び出し元で行う。
// 写真(BonsaiImage)は onDelete: Cascade なので自動的に削除される。
export function deleteBonsai(id: number): Promise<Bonsai> {
  return prisma.bonsai.delete({ where: { id } });
}
