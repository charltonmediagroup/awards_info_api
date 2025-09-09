import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("awardsDB")

    // Fetch only the "region" field from all documents
    const regions = await db
      .collection("awards")
      .find({}, { projection: { region: 1, _id: 0 } })
      .toArray()

    // Map to array of strings
    const regionNames = regions.map(r => r.region)

    return NextResponse.json({ regions: regionNames })
  } catch (err) {
    console.error("Error fetching regions:", err)
    return NextResponse.json({ regions: [] }, { status: 500 })
  }
}
