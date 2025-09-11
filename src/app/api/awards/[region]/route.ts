import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

type ParamsPromise = { params: Promise<{ region: string }> }

// ✅ GET region data
export async function GET(_req: NextRequest, { params }: ParamsPromise) {
  try {
    const { region } = await params
    const client = await clientPromise
    const db = client.db("awardsDB")

    const regionData = await db.collection("awards").findOne(
      { region: new RegExp(`^${region}$`, "i") },
      { projection: { _id: 0 } }
    )

    if (!regionData) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 })
    }

    return NextResponse.json(regionData.data)
  } catch (err) {
    console.error("Fetch region error:", err)
    return NextResponse.json(
      { error: "Failed to fetch region" },
      { status: 500 }
    )
  }
}

// ✅ UPDATE or CREATE region data
export async function PUT(req: NextRequest, { params }: ParamsPromise) {
  try {
    const { region } = await params
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
      {
        upsert: true,
        returnDocument: "after",
        projection: { _id: 0 },
      }
    )

    // ✅ Handle null safely
    if (!result || !result.value) {
      return NextResponse.json(
        {
          success: true,
          message: `Region '${region}' created/updated successfully`,
          data: { awards, industries, recognitions, synonyms },
        },
        { status: 201 } // better REST convention for creation
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: `Region '${region}' updated successfully`,
        data: result.value.data,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error("Update region error:", err)
    return NextResponse.json(
      { error: "Failed to update region" },
      { status: 500 }
    )
  }
}
// ✅ DELETE region
export async function DELETE(_req: NextRequest, { params }: ParamsPromise) {
  try {
    const { region } = await params
    const client = await clientPromise
    const db = client.db("awardsDB")

    const deleted = await db.collection("awards").deleteOne({
      region: new RegExp(`^${region}$`, "i"),
    })

    if (!deleted || deleted.deletedCount === 0) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Region '${region}' deleted`,
    })
  } catch (err) {
    console.error("Delete region error:", err)
    return NextResponse.json(
      { error: "Failed to delete region" },
      { status: 500 }
    )
  }
}
