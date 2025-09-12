import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

const AWARDS_API_TOKEN = process.env.AWARDS_API_TOKEN

// ✅ GET region data
export async function GET(
  _req: Request,
  context: { params: Promise<{ region: string }> }
) {
  try {
    const { region } = await context.params
    const client = await clientPromise
    const db = client.db("awardsDB")

    const regionData = await db.collection("awards").findOne(
      { region: new RegExp(`^${region}$`, "i") },
      { projection: { _id: 0 } }
    )

    if (!regionData) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 })
    }

    return NextResponse.json(regionData.data, { status: 200 })
  } catch (err) {
    console.error("Fetch region error:", err)
    return NextResponse.json({ error: "Failed to fetch region" }, { status: 500 })
  }
}

// ✅ UPDATE or CREATE region data
export async function PUT(
  req: Request,
  context: { params: Promise<{ region: string }> }
) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader || authHeader !== `Bearer ${AWARDS_API_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { region } = await context.params
    const body = await req.json()
    const { awards, industries, recognitions, synonyms } = body

    const client = await clientPromise
    const db = client.db("awardsDB")

    const result = await db.collection("awards").findOneAndUpdate(
      { region: new RegExp(`^${region}$`, "i") },
      {
        $set: {
          region,
          "data.awards": awards,
          "data.industries": industries,
          "data.recognitions": recognitions,
          "data.synonyms": synonyms,
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after", projection: { _id: 0 } }
    )

    return NextResponse.json({
      success: true,
      message: result?.value
        ? `Region '${region}' updated`
        : `Region '${region}' created`,
      data: result?.value?.data ?? body,
    })
  } catch (err) {
    console.error("Update region error:", err)
    return NextResponse.json({ error: "Failed to update region" }, { status: 500 })
  }
}
