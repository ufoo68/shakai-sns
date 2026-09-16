import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { authenticateApiRequest } from "@/lib/api/auth"
import { corsError, corsJson, withApiCors } from "@/lib/api/response"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export async function POST(request: Request) {
  const viewer = await authenticateApiRequest(request)
  if (!viewer) return corsError(request, "UNAUTHORIZED", "Authentication required", 401)

  const contentType = request.headers.get("content-type") ?? ""
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return corsError(request, "INVALID_CONTENT_TYPE", "Use multipart/form-data with a file field", 415)
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return corsError(request, "INVALID_FORM_DATA", "Request body must be valid multipart form data", 400)
  }

  const file = formData.get("file")
  if (!(file instanceof File)) return corsError(request, "FILE_REQUIRED", "A file field is required", 422)
  if (!ALLOWED_TYPES.has(file.type)) return corsError(request, "UNSUPPORTED_MEDIA_TYPE", "Only JPEG, PNG, and WebP images are supported", 415)
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) return corsError(request, "FILE_TOO_LARGE", "Avatar must be between 1 byte and 5 MB", 413)

  try {
    const extension = file.type.split("/")[1] ?? "bin"
    const blob = await put(`avatars/${viewer.id}/${crypto.randomUUID()}.${extension}`, file, { access: "public", addRandomSuffix: false })
    await db.update(profiles).set({ avatarUrl: blob.url, updatedAt: new Date() }).where(eq(profiles.userId, viewer.id))
    return corsJson(request, { avatarUrl: blob.url })
  } catch (error) {
    console.error("Avatar upload failed", error)
    return corsError(request, "UPLOAD_FAILED", "Avatar upload failed", 500)
  }
}

export async function OPTIONS(request: Request) {
  return withApiCors(new NextResponse(null, { status: 204 }), request)
}
