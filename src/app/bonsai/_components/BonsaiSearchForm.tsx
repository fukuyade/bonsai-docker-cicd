import Link from "next/link";

import { BONSAI_STATUS_LABEL } from "@/lib/bonsai-status";
import type { BonsaiSearchParams } from "@/lib/bonsai-search";

const STATUS_OPTIONS = Object.entries(BONSAI_STATUS_LABEL);

/**
 * 一覧画面の検索フォーム。
 *
 * method="get" の素のHTMLフォームなので、送信すると入力値がそのまま
 * URLのクエリパラメータ（例: /bonsai?keyword=松&status=HEALTHY）になる。
 * JavaScriptを使わずに動き、検索結果のURLをそのまま共有・ブックマークできる。
 */
export function BonsaiSearchForm({
  searchParams,
  locations,
}: {
  searchParams: BonsaiSearchParams;
  locations: string[];
}) {
  const hasCondition = Boolean(
    searchParams.keyword || searchParams.status || searchParams.location,
  );

  return (
    <form
      method="get"
      action="/bonsai"
      className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label
            htmlFor="keyword"
            className="block text-xs font-medium text-gray-600"
          >
            キーワード（管理番号・名称・樹種）
          </label>
          <input
            id="keyword"
            name="keyword"
            type="search"
            defaultValue={searchParams.keyword ?? ""}
            placeholder="例: 松"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-xs font-medium text-gray-600"
          >
            管理状態
          </label>
          <select
            id="status"
            name="status"
            defaultValue={searchParams.status ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">すべて</option>
            {STATUS_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-xs font-medium text-gray-600"
          >
            設置場所
          </label>
          <select
            id="location"
            name="location"
            defaultValue={searchParams.location ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">すべて</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          検索
        </button>
        {hasCondition && (
          <Link
            href="/bonsai"
            className="text-sm text-blue-600 hover:underline"
          >
            条件をクリア
          </Link>
        )}
      </div>
    </form>
  );
}
