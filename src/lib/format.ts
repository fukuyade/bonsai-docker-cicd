// 日付表示を画面全体で統一するための小さなユーティリティ。
export function formatDate(date: Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// <input type="date">のvalueに渡すための"YYYY-MM-DD"形式に変換する。
export function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}
