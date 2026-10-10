import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("hashPassword / verifyPassword", () => {
  it("正しいパスワードはverifyPasswordがtrueを返す", async () => {
    const hash = await hashPassword("correct-password");
    await expect(verifyPassword("correct-password", hash)).resolves.toBe(
      true,
    );
  });

  it("間違ったパスワードはverifyPasswordがfalseを返す", async () => {
    const hash = await hashPassword("correct-password");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("ハッシュ化した値は平文のパスワードと異なる", async () => {
    const hash = await hashPassword("correct-password");
    expect(hash).not.toBe("correct-password");
  });

  it("同じパスワードでも毎回異なるハッシュになる(ソルトが効いている)", async () => {
    const hash1 = await hashPassword("same-password");
    const hash2 = await hashPassword("same-password");
    expect(hash1).not.toBe(hash2);
    // ハッシュ自体は違っても、どちらも元のパスワードで検証できる。
    await expect(verifyPassword("same-password", hash1)).resolves.toBe(true);
    await expect(verifyPassword("same-password", hash2)).resolves.toBe(true);
  });
});
