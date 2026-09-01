import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { BANNER_IMAGE_SIZE, normalizeImage, PRODUCT_IMAGE_SIZE } from "@/lib/image-processing";
import { isBlobUrl } from "@/lib/product-images";

export const runtime = "nodejs";

type NormalizeImageRequest = { blobUrl?: unknown; kind?: unknown };

function getCookie(request: Request, name: string) {
  return request.headers.get("cookie")?.match(new RegExp(`(?:^|; )${name}=([^;]+)`))?.[1];
}

function getOriginalDirectory(blobUrl: string) {
  const pathname = new URL(blobUrl).pathname.replace(/^\//, "");
  const lastSlash = pathname.lastIndexOf("/");
  return lastSlash >= 0 ? pathname.slice(0, lastSlash + 1) : "";
}

export async function POST(request: Request) {
  const isAdmin = await isValidAdminSession(getCookie(request, ADMIN_SESSION_COOKIE));
  if (!isAdmin) return NextResponse.json({ error: "Недостаточно прав." }, { status: 401 });

  try {
    const body = await request.json() as NormalizeImageRequest;
    if (typeof body.blobUrl !== "string" || !isBlobUrl(body.blobUrl)) {
      return NextResponse.json({ error: "Некорректная ссылка на изображение." }, { status: 400 });
    }
    if (body.kind !== "product" && body.kind !== "banner" && body.kind !== "look") {
      return NextResponse.json({ error: "Некорректный тип изображения." }, { status: 400 });
    }

    const source = await fetch(body.blobUrl);
    if (!source.ok) throw new Error("Не удалось получить загруженное изображение.");
    const image = await normalizeImage(
      Buffer.from(await source.arrayBuffer()),
      body.kind === "product" ? PRODUCT_IMAGE_SIZE : BANNER_IMAGE_SIZE,
    );
    const blob = await put(`${getOriginalDirectory(body.blobUrl)}normalized-image.webp`, image, {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/webp",
    });
    await del(body.blobUrl);
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось обработать изображение." },
      { status: 500 },
    );
  }
}
