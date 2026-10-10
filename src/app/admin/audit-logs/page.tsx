import Link from "next/link";
import { redirect } from "next/navigation";

import {
  AUDIT_ACTION_LABEL,
  AUDIT_ENTITY_LABEL,
  describeAuditDetail,
} from "@/lib/audit-format";
import { listRecentAuditLogs } from "@/lib/audit";
import { canViewAuditLog } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Tokyo",
});

// 操作ログ(誰が・いつ・何を変更したか)の閲覧画面。管理者のみ。
export default async function AuditLogsPage() {
  // 一般ユーザーが直接URLを開いても見られないようにする(リンクの非表示だけに頼らない)。
  const user = await getCurrentUser();
  if (!user || !canViewAuditLog(user.role)) {
    redirect("/bonsai");
  }

  const logs = await listRecentAuditLogs(100);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/bonsai"
        className="mb-6 inline-block text-sm text-blue-600 hover:underline"
      >
        ← 盆栽一覧へ戻る
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-gray-900">操作ログ</h1>
      <p className="mb-6 text-sm text-gray-500">
        手入れ履歴の登録・更新を、新しい順に直近100件まで表示します。
      </p>

      {logs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          操作ログはまだありません。
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
          {logs.map((log) => {
            const lines = describeAuditDetail(log.action, log.detail);
            const bonsaiId =
              typeof log.detail === "object" &&
              log.detail !== null &&
              !Array.isArray(log.detail) &&
              typeof log.detail.bonsaiId === "number"
                ? log.detail.bonsaiId
                : null;

            return (
              <li key={log.id} className="p-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-medium text-white">
                    {AUDIT_ACTION_LABEL[log.action]}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {AUDIT_ENTITY_LABEL[log.entity] ?? log.entity} #
                    {log.entityId}
                  </span>
                  {bonsaiId !== null && (
                    <Link
                      href={`/bonsai/${bonsaiId}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      盆栽の詳細へ
                    </Link>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {DATE_TIME_FORMAT.format(log.createdAt)} ・ {log.userName}
                </p>
                {lines.length > 0 && (
                  <ul className="mt-2 space-y-0.5 text-sm text-gray-700">
                    {lines.map((line) => (
                      <li key={line} className="break-words">
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
