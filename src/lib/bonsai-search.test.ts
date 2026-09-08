import { describe, expect, it } from "vitest";

import { buildBonsaiWhere, hasSearchCondition } from "./bonsai-search";

/**
 * 検索条件の組み立てロジックのテスト。
 *
 * buildBonsaiWhereはDBアクセスを含まない純粋関数なので、
 * DBを起動しなくても「どんなwhere句が組み立てられるか」を検証できる。
 * （テストしやすいように、あえてDB処理から分離した設計）
 */

describe("buildBonsaiWhere", () => {
  it("条件が空なら空のwhereを返す（全件取得）", () => {
    expect(buildBonsaiWhere({})).toEqual({});
  });

  it("空白だけの条件は指定なしとして扱う", () => {
    expect(buildBonsaiWhere({ keyword: "   ", location: "  " })).toEqual({});
  });

  it("キーワードは管理番号・名称・樹種のOR条件になる", () => {
    const where = buildBonsaiWhere({ keyword: "松" });

    expect(where).toEqual({
      AND: [
        {
          OR: [
            { managementNumber: { contains: "松" } },
            { name: { contains: "松" } },
            { species: { contains: "松" } },
          ],
        },
      ],
    });
  });

  it("キーワードの前後の空白は取り除かれる", () => {
    const where = buildBonsaiWhere({ keyword: "  松  " });
    const first = where.AND as Array<{ OR: Array<Record<string, unknown>> }>;

    expect(first[0].OR[0]).toEqual({ managementNumber: { contains: "松" } });
  });

  it("有効な管理状態は完全一致の条件になる", () => {
    expect(buildBonsaiWhere({ status: "HEALTHY" })).toEqual({
      AND: [{ status: "HEALTHY" }],
    });
  });

  it("存在しない管理状態は無視される（URLを直接書き換えられても落ちない）", () => {
    expect(buildBonsaiWhere({ status: "INVALID_STATUS" })).toEqual({});
  });

  it("設置場所は部分一致の条件になる", () => {
    expect(buildBonsaiWhere({ location: "展示場" })).toEqual({
      AND: [{ location: { contains: "展示場" } }],
    });
  });

  it("複数条件はANDで結合される", () => {
    const where = buildBonsaiWhere({
      keyword: "松",
      status: "HEALTHY",
      location: "展示場A",
    });

    expect(where.AND).toHaveLength(3);
  });
});

describe("hasSearchCondition", () => {
  it("条件が何もなければfalse", () => {
    expect(hasSearchCondition({})).toBe(false);
    expect(hasSearchCondition({ keyword: "", status: "", location: "" })).toBe(
      false,
    );
    expect(hasSearchCondition({ keyword: "   " })).toBe(false);
  });

  it("条件が1つでもあればtrue", () => {
    expect(hasSearchCondition({ keyword: "松" })).toBe(true);
    expect(hasSearchCondition({ status: "HEALTHY" })).toBe(true);
    expect(hasSearchCondition({ location: "倉庫" })).toBe(true);
  });

  // 「検索して0件」と「そもそも登録がない」で画面の文言を出し分けるために使う関数なので、
  // 無効なstatusでも「検索した」と判定されるのが正しい挙動。
  it("無効なstatusでも「検索した」とみなす", () => {
    expect(hasSearchCondition({ status: "INVALID_STATUS" })).toBe(true);
  });
});
