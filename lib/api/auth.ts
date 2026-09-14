import { and, eq, gt } from "drizzle-orm"
import { db } from "@/lib/db"
import { session, user } from "@/lib/db/schema"

export async function authenticateApiRequest(request: Request) {
  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) return null
  const token = authorization.slice("Bearer ".length).trim()
  if (!token) return null

  const rows = await db
    .select({ id: user.id, name: user.name, email: user.email, image: user.image, role: user.role, status: user.status })
    .from(session)
    .innerJoin(user, eq(session.userId, user.id))
    .where(and(eq(session.token, token), gt(session.expiresAt, new Date()), eq(user.status, "active")))
    .limit(1)
  return rows[0] ?? null
}
