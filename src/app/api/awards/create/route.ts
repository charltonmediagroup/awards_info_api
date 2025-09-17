import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export const dynamic = "force-dynamic" // ⬅️ prevents static analysis at build

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json()
    if (!name) {
      return NextResponse.json({ error: "Region name required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("awardsDB")

    // 1. Check if region already exists
    const existing = await db.collection("awards").findOne({ region: name })
    if (existing) {
      return NextResponse.json({ error: "Region already exists" }, { status: 400 })
    }

    // 2. Fetch default template from general_information
    const generalInfo = await db
      .collection("general_information")
      .findOne({}, { projection: { default_region: 1 } })

    if (!generalInfo || !generalInfo.default_region) {
      return NextResponse.json({ error: "Default region not found" }, { status: 500 })
    }

    // 3. Insert new region with default data
    const newDoc = {
      region: name,
      ...generalInfo.default_region,
    }

    await db.collection("awards").insertOne(newDoc)

    return NextResponse.json({ success: true, region: name })
  } catch (err) {
    console.error("Create region error:", err)
    return NextResponse.json({ error: "Failed to create region" }, { status: 500 })
  }
}
