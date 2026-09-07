import Image from "next/image";

import type { BonsaiImage } from "@prisma/client";

import { BONSAI_IMAGE_ANGLE_LABEL } from "@/lib/bonsai-image-angle";

// 盆栽詳細画面の写真ギャラリー(正面・右・左・背面の4方向)。
// Server Componentのままで問題ない(クリックなどの操作を持たないため)。
export function BonsaiImageGallery({ images }: { images: BonsaiImage[] }) {
  // 写真が未登録でも画面が壊れないよう、空状態を明示する。
  if (images.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        写真は登録されていません。
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {images.map((image) => (
        <li key={image.id}>
          <figure>
            <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              {/* next/imageは表示サイズに応じた画像最適化・遅延読み込みを自動で行う。
                  sizesを渡すことで、スマホでは小さい画像を配信できる。 */}
              <Image
                src={image.imagePath}
                alt={image.altText}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-1 text-center text-xs text-gray-600">
              {BONSAI_IMAGE_ANGLE_LABEL[image.angle]}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
