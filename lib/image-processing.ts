import sharp from "sharp";

export const PRODUCT_IMAGE_SIZE = { width: 1200, height: 1500 } as const;
export const BANNER_IMAGE_SIZE = { width: 1200, height: 1600 } as const;

type ImageSize = { width: number; height: number };

/**
 * Приводит изображение к формату витрины без полей по краям.
 * `attention` сохраняет наиболее заметную часть исходного кадра при обрезке.
 */
export async function normalizeImage(buffer: Buffer, { width, height }: ImageSize): Promise<Buffer> {
  return sharp(buffer)
    .resize(width, height, { fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toBuffer();
}
