import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";

const MAX_ZIP_SIZE = 100 * 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function getCookie(request: Request, name: string) {
  return request.headers.get("cookie")?.match(new RegExp(`(?:^|; )${name}=([^;]+)`))?.[1];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const isAdmin = await isValidAdminSession(getCookie(request, ADMIN_SESSION_COOKIE));
        const isZip = pathname.startsWith("product-imports/");
        const isImage = pathname.startsWith("product-images/") || pathname.startsWith("banners/") || pathname.startsWith("looks/");
        if (!isAdmin || (!isZip && !isImage)) {
          throw new Error("Недостаточно прав для загрузки архива.");
        }

        return {
          allowedContentTypes: isZip ? ["application/zip"] : ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: isZip ? MAX_ZIP_SIZE : MAX_IMAGE_SIZE,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось подготовить загрузку ZIP-архива." },
      { status: 400 },
    );
  }
}
