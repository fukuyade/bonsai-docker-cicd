import { BonsaiStatus, type Prisma } from "@prisma/client";

// 一覧画面の検索条件。URLのクエリパラメータから組み立てる。
export type BonsaiSearchParams = {
  /// 管理番号・名称・樹種に対するキーワード（部分一致）
  keyword?: string;
  /// 管理状態での絞り込み
  status?: string;
  /// 設置場所での絞り込み（部分一致）
  location?: string;
};

// 有効な管理状態かどうかを判定する。
// URLは利用者が自由に書き換えられるため、不正な値は「指定なし」として扱う。
function isBonsaiStatus(value: string): value is BonsaiStatus {
  return Object.values(BonsaiStatus).includes(value as BonsaiStatus);
}

/**
 * 検索条件からPrismaのwhere句を組み立てる純粋関数。
 *
 * DBアクセスを含まないので、そのまま単体テストできる。
 * （検索ロジックの正しさをテストするために、あえてDB処理から分離している）
 */
export function buildBonsaiWhere(
  params: BonsaiSearchParams,
): Prisma.BonsaiWhereInput {
  const conditions: Prisma.BonsaiWhereInput[] = [];

  const keyword = params.keyword?.trim();
  if (keyword) {
    // 管理番号・名称・樹種のいずれかに含まれていればヒットさせる（OR条件）。
    // SQLの LIKE '%キーワード%' に相当する。
    conditions.push({
      OR: [
        { managementNumber: { contains: keyword } },
        { name: { contains: keyword } },
        { species: { contains: keyword } },
      ],
    });
  }

  const status = params.status?.trim();
  if (status && isBonsaiStatus(status)) {
    conditions.push({ status });
  }

  const location = params.location?.trim();
  if (location) {
    conditions.push({ location: { contains: location } });
  }

  // 条件が1つもなければ空のwhere（＝全件取得）を返す。
  if (conditions.length === 0) {
    return {};
  }

  // 複数条件はAND（すべてを満たすもの）で絞り込む。
  return { AND: conditions };
}

/**
 * 検索条件が1つでも指定されているかを判定する。
 * 「検索結果0件」と「そもそも1件も登録がない」を画面で出し分けるために使う。
 */
export function hasSearchCondition(params: BonsaiSearchParams): boolean {
  return Boolean(
    params.keyword?.trim() || params.status?.trim() || params.location?.trim(),
  );
}
