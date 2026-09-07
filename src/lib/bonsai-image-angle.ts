import { BonsaiImageAngle } from "@prisma/client";

// 撮影方向の日本語ラベル。画面表示・alt属性で使う。
export const BONSAI_IMAGE_ANGLE_LABEL: Record<BonsaiImageAngle, string> = {
  FRONT: "正面",
  RIGHT: "右",
  LEFT: "左",
  BACK: "背面",
};
