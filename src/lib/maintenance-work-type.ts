import { MaintenanceWorkType } from "@prisma/client";

// 手入れ履歴の作業種別に対応する日本語ラベル。
export const MAINTENANCE_WORK_TYPE_LABEL: Record<MaintenanceWorkType, string> = {
  WATERING: "水やり",
  PRUNING: "剪定",
  REPOTTING: "植え替え",
  FERTILIZING: "施肥",
  PEST_CONTROL: "病害虫防除",
  OTHER: "その他",
};
