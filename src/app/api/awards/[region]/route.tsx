import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Use a secret token stored in .env
const AWARDS_API_TOKEN = process.env.AWARDS_API_TOKEN

export async function GET(req: Request, context: { params: Promise<{ region: string }> }) {
  const { region } = await context.params
  const filePath = path.join(process.cwd(), "src/data/awards", `${region}.json`)

  try {
    const file = fs.readFileSync(filePath, "utf8")
    const json = JSON.parse(file)
    return NextResponse.json(json)
  } catch (err) {
    return NextResponse.json({ error: "Region not found" }, { status: 404 })
  }
}

export async function PUT(req: Request, context: { params: Promise<{ region: string }> }) {
  // ---------- AUTH ----------
  const authHeader = req.headers.get("authorization")
  if (!authHeader || authHeader !== `Bearer ${AWARDS_API_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { region } = await context.params
  const filePath = path.join(process.cwd(), "src/data/awards", `${region}.json`)

  try {
    const body = await req.json()
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf8")
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Save error:", err)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
