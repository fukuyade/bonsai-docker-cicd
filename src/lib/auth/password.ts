import bcrypt from "bcryptjs";

// ソルトを含めてハッシュ化するため、同じパスワードでも毎回違う文字列になる。
// ラウンド数(コスト)は多いほど安全だが遅くなる。10は一般的な初期値。
const SALT_ROUNDS = 10;

export function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

// ハッシュは不可逆なので「復号して比較」はできない。
// 入力されたパスワードを同じ方式でハッシュ化し、保存済みハッシュと比較する。
export function verifyPassword(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}
