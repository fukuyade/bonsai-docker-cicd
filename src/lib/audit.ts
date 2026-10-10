import type { AuditLog } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// 操作ログ画面用に、新しい順で直近の件数だけ取得する。
// ログは増え続けるため、全件ではなく件数を絞る(ページネーションは今後の改善)。
export function listRecentAuditLogs(limit = 100): Promise<AuditLog[]> {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
