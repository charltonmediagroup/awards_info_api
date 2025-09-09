import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// ✅ GET region data
export async function GET(
  req: Request,
  { params }: { params: { region: string } }
) {
  try {
    const { region } = params

    const client = await clientPromise
    const db = client.db("awardsDB")

    const regionData = await db.collection("awards").findOne(
      { region: new RegExp(`^${region}$`, "i") }, // case-insensitive
      { projection: { _id: 0 } }
    )

    if (!regionData) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 })
    }

    return NextResponse.json(regionData.data)
  } catch (err) {
    console.error("Fetch region error:", err)
    return NextResponse.json({ error: "Failed to fetch region" }, { status: 500 })
  }
}

// ✅ UPDATE region data
// ✅ UPDATE or CREATE region data
export async function PUT(
  req: Request,
  { params }: { params: { region: string } }
) {
  try {
    const { region } = params
    const body = await req.json()

    const { awards, industries, recognitions, synonyms } = body

    const client = await clientPromise
    const db = client.db("awardsDB")

    const updated = await db.collection("awards").findOneAndUpdate(
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
      { upsert: true, returnDocument: "after", projection: { _id: 0 } } // 👈 upsert enabled
    )

    return NextResponse.json({ success: true, data: updated.value?.data })
  } catch (err) {
    console.error("Update region error:", err)
    return NextResponse.json({ error: "Failed to update region" }, { status: 500 })
  }
}


// ✅ DELETE region
export async function DELETE(
  req: Request,
  { params }: { params: { region: string } }
) {
  try {
    const { region } = params

    const client = await clientPromise
    const db = client.db("awardsDB")

    const deleted = await db.collection("awards").deleteOne({
      region: new RegExp(`^${region}$`, "i"), // case-insensitive
    })

    if (deleted.deletedCount === 0) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: `Region '${region}' deleted` })
  } catch (err) {
    console.error("Delete region error:", err)
    return NextResponse.json({ error: "Failed to delete region" }, { status: 500 })
  }
}