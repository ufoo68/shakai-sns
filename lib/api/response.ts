import { NextResponse } from "next/server"

export function apiData<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init)
}

export function apiError(code: string, message: string, status: number, details?: unknown) {
  return NextResponse.json({ error: { code, message, ...(details === undefined ? {} : { details }) } }, { status })
}

export function apiOptions() {
  return new NextResponse(null, { status: 204 })
}

export function withApiCors(response: NextResponse, request: Request) {
  const origin = request.headers.get("origin")
  const allowed = (process.env.API_CORS_ORIGINS ?? "").split(",").map((value) => value.trim()).filter(Boolean)
  if (origin && allowed.includes(origin)) response.headers.set("Access-Control-Allow-Origin", origin)
  response.headers.set("Vary", "Origin")
  response.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type, Idempotency-Key")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
  response.headers.set("X-Content-Type-Options", "nosniff")
  return response
}

export function corsJson<T>(request: Request, data: T, init?: ResponseInit) {
  return withApiCors(apiData(data, init), request)
}

export function corsError(request: Request, code: string, message: string, status: number, details?: unknown) {
  return withApiCors(apiError(code, message, status, details), request)
}

export function parsePositiveInt(value: string | null, fallback: number, max: number) {
  const parsed = value ? Number(value) : fallback
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback
}

export function parseId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}
