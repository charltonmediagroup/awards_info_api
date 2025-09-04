import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const AWARDS_API_TOKEN = process.env.AWARDS_API_TOKEN
const awardsDir = path.join(process.cwd(), "src/data/awards")

export async function GET(req: Request, context: { params: { region: string } }) {
  const { region } = context.params
  const filePath = path.join(awardsDir, `${region}.json`)

  try {
    const file = fs.readFileSync(filePath, "utf8")
    return NextResponse.json(JSON.parse(file))
  } catch {
    return NextResponse.json({ error: "Region not found" }, { status: 404 })
  }
}

export async function PUT(req: Request, context: { params: { region: string } }) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader || authHeader !== `Bearer ${AWARDS_API_TOKEN}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { region } = context.params
  const filePath = path.join(awardsDir, `${region}.json`)

  try {
    const body = await req.json()
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf8")
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
