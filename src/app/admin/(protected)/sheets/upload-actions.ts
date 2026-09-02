"use server";

import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";

export type UploadKind = "pdf" | "image" | "audio";

export type CreateUploadUrlResult =
  | { ok: true; uploadUrl: string; key: string; publicUrl?: string }
  | { ok: false; message: string };

function isContentTypeValid(kind: UploadKind, contentType: string): boolean {
  if (kind === "pdf") return contentType === "application/pdf";
  if (kind === "image") return contentType.startsWith("image/");
  return contentType.startsWith("audio/");
}

function guessExtension(fileName: string, contentType: string): string {
  const fromName = fileName.split(".").pop();
  if (fromName && fromName.length <= 5 && fromName !== fileName) {
    return fromName.toLowerCase();
  }
  const subtype = contentType.split("/")[1] ?? "bin";
  return subtype === "mpeg" ? "mp3" : subtype;
}

export async function createUploadUrl(
  kind: UploadKind,
  fileName: string,
  contentType: string
): Promise<CreateUploadUrlResult> {
  if (!isContentTypeValid(kind, contentType)) {
    return { ok: false, message: "invalid_type" };
  }

  const ext = guessExtension(fileName, contentType);
  const prefix = kind === "pdf" ? "private" : "public";
  const key = `${prefix}/sheets/${randomUUID()}.${ext}`;

  try {
    const uploadUrl = await getSignedUrl(
      r2Client,
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 300 }
    );

    return {
      ok: true,
      uploadUrl,
      key,
      publicUrl: kind === "pdf" ? undefined : `${R2_PUBLIC_URL}/${key}`,
    };
  } catch {
    return { ok: false, message: "server_error" };
  }
}
