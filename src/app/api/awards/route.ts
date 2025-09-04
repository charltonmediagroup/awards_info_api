import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const awardsDir = path.join(process.cwd(), "src/data/awards")
const defaultFile = path.join(awardsDir, "default", "default.json")

export async function POST(req: Request) {
  try {
    const { region } = await req.json()
    if (!region) return NextResponse.json({ error: "Region required" }, { status: 400 })

    const newFile = path.join(awardsDir, `${region}.json`)
    if (fs.existsSync(newFile)) {
      return NextResponse.json({ error: "Region already exists" }, { status: 400 })
    }

    const defaultData = fs.readFileSync(defaultFile, "utf8")
    fs.writeFileSync(newFile, defaultData, "utf8")

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create region" }, { status: 500 })
  }
}
