import type { BonsaiStatus } from "@prisma/client";

import {
  BONSAI_STATUS_COLOR,
  BONSAI_STATUS_LABEL,
} from "@/lib/bonsai-status";

// "_components"はNext.jsのルーティング対象外になる私的フォルダ(アンダースコア始まり)。
// bonsai配下のUI部品をここに置く。
export function StatusBadge({ status }: { status: BonsaiStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${BONSAI_STATUS_COLOR[status]}`}
    >
      {BONSAI_STATUS_LABEL[status]}
    </span>
  );
}
