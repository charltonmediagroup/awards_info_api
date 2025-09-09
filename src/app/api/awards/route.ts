import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("awardsDB")

    // Only return region names
    const regions = await db
      .collection("awards")
      .find({}, { projection: { region: 1, _id: 0 } })
      .toArray()

    return NextResponse.json({
      success: true,
      regions: regions.map(r => r.region),
    })
  } catch (err) {
    console.error("Fetch regions error:", err)
    return NextResponse.json({ error: "Failed to fetch regions" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { region } = await req.json()
    if (!region) {
      return NextResponse.json({ error: "Region required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("awardsDB")

    // Check if region already exists
    const existing = await db.collection("awards").findOne({ region })
    if (existing) {
      return NextResponse.json({ error: "Region already exists" }, { status: 400 })
    }

    // Fetch default template
    const generalInfo = await db
      .collection("general_information")
      .findOne({}, { projection: { default_region: 1 } })

    // Fallback if DB has no default_region
    const defaultJson = generalInfo?.default_region || {
      industries: [],
      recognitions: [],
      awards: [],
      synonyms: {},
    }

    // Insert new region with default data
    await db.collection("awards").insertOne({
      region,
      data: {
        ...defaultJson,
      },
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true, region })
  } catch (err) {
    console.error("Create region error:", err)
    return NextResponse.json({ error: "Failed to create region" }, { status: 500 })
  }
}
