import { describe, expect, it } from "vitest";

import { bonsaiFormSchema, toBonsaiCreateInput } from "./bonsai";

/**
 * 入力値検証(Zod)のテスト。
 *
 * フォームから届くFormDataはすべて文字列なので、テストでも文字列を渡している。
 * 正常系・異常系・境界値の3種類を意識して書いている。
 */

// テストの基準となる「すべて正しい入力」。
// 各テストではここから必要な項目だけを上書きする。
const validInput = {
  managementNumber: "No.001",
  name: "五葉松 弐号",
  species: "五葉松",
  status: "HEALTHY",
  location: "展示場A",
  acquiredAt: "2022-04-01",
  nextMaintenanceDate: "2026-10-01",
  memo: "備考",
};

describe("bonsaiFormSchema - 正常系", () => {
  it("すべて正しい入力を受け付ける", () => {
    const result = bonsaiFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("任意項目(設置場所・日付・備考)が未入力でも通る", () => {
    const result = bonsaiFormSchema.safeParse({
      ...validInput,
      location: "",
      acquiredAt: "",
      nextMaintenanceDate: "",
      memo: "",
    });
    expect(result.success).toBe(true);
  });

  it("前後の空白は取り除かれる", () => {
    const result = bonsaiFormSchema.safeParse({
      ...validInput,
      name: "  黒松 小品  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("黒松 小品");
    }
  });
});

describe("bonsaiFormSchema - 異常系", () => {
  it("管理番号が空だとエラーになる", () => {
    const result = bonsaiFormSchema.safeParse({
      ...validInput,
      managementNumber: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.managementNumber).toContain("管理番号を入力してください");
    }
  });

  it("空白だけの入力は「未入力」として弾かれる", () => {
    // trim()してからmin(1)で検証しているため、空白のみは通らない。
    const result = bonsaiFormSchema.safeParse({
      ...validInput,
      name: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("存在しない管理状態は弾かれる", () => {
    const result = bonsaiFormSchema.safeParse({
      ...validInput,
      status: "UNKNOWN_STATUS",
    });
    expect(result.success).toBe(false);
  });

  it("日付として解釈できない文字列は弾かれる", () => {
    const result = bonsaiFormSchema.safeParse({
      ...validInput,
      acquiredAt: "令和4年4月1日",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.acquiredAt).toContain("入手日の形式が正しくありません");
    }
  });
});

describe("bonsaiFormSchema - 境界値", () => {
  it("管理番号は50文字ちょうどなら通る", () => {
    const result = bonsaiFormSchema.safeParse({
      ...validInput,
      managementNumber: "a".repeat(50),
    });
    expect(result.success).toBe(true);
  });

  it("管理番号が51文字だと弾かれる", () => {
    const result = bonsaiFormSchema.safeParse({
      ...validInput,
      managementNumber: "a".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("管理番号が1文字なら通る（最小の有効値）", () => {
    const result = bonsaiFormSchema.safeParse({
      ...validInput,
      managementNumber: "a",
    });
    expect(result.success).toBe(true);
  });

  it("備考は2000文字まで通り、2001文字で弾かれる", () => {
    expect(
      bonsaiFormSchema.safeParse({ ...validInput, memo: "あ".repeat(2000) })
        .success,
    ).toBe(true);
    expect(
      bonsaiFormSchema.safeParse({ ...validInput, memo: "あ".repeat(2001) })
        .success,
    ).toBe(false);
  });
});

describe("toBonsaiCreateInput - 変換処理", () => {
  it("空文字の任意項目はnullに変換される", () => {
    // DBでは「未入力」をNULLで表すため、空文字と区別せず揃える。
    const parsed = bonsaiFormSchema.parse({
      ...validInput,
      location: "",
      acquiredAt: "",
      nextMaintenanceDate: "",
      memo: "",
    });
    const input = toBonsaiCreateInput(parsed);

    expect(input.location).toBeNull();
    expect(input.acquiredAt).toBeNull();
    expect(input.nextMaintenanceDate).toBeNull();
    expect(input.memo).toBeNull();
  });

  it("日付文字列はDate型に変換される", () => {
    const parsed = bonsaiFormSchema.parse(validInput);
    const input = toBonsaiCreateInput(parsed);

    expect(input.acquiredAt).toBeInstanceOf(Date);
    expect(input.acquiredAt?.toISOString()).toBe("2022-04-01T00:00:00.000Z");
  });

  it("必須項目はそのまま引き継がれる", () => {
    const parsed = bonsaiFormSchema.parse(validInput);
    const input = toBonsaiCreateInput(parsed);

    expect(input.managementNumber).toBe("No.001");
    expect(input.name).toBe("五葉松 弐号");
    expect(input.species).toBe("五葉松");
    expect(input.status).toBe("HEALTHY");
  });
});
