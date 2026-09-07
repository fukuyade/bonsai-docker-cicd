import { BonsaiStatus } from "@prisma/client";

// Excel運用の「状態」列に相当する表示用の日本語ラベル。
export const BONSAI_STATUS_LABEL: Record<BonsaiStatus, string> = {
  HEALTHY: "健康",
  NEEDS_CARE: "手入れが必要",
  UNDER_TREATMENT: "治療中",
  INACTIVE: "管理対象外",
};

// 文字だけでなく色でも状態が判別できるようにするためのTailwindクラス。
export const BONSAI_STATUS_COLOR: Record<BonsaiStatus, string> = {
  HEALTHY: "bg-green-100 text-green-800",
  NEEDS_CARE: "bg-yellow-100 text-yellow-800",
  UNDER_TREATMENT: "bg-orange-100 text-orange-800",
  INACTIVE: "bg-gray-100 text-gray-600",
};
