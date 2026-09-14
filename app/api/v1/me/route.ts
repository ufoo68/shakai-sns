import { authenticateApiRequest } from "@/lib/api/auth"
import { corsError, corsJson } from "@/lib/api/response"

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request)
  if (!auth) return corsError(request, "UNAUTHORIZED", "有効なBearerトークンが必要です。", 401)
  return corsJson(request, { id: auth.id, name: auth.name, email: auth.email, image: auth.image, role: auth.role })
}

export function OPTIONS() { return new Response(null, { status: 204 }) }
