import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const AWARDS_API_TOKEN = process.env.AWARDS_API_TOKEN;

export const dynamic = "force-dynamic"; // ⬅️ avoid static build issues

interface RegionData {
  awards?: string[];
  industries?: string[];
  recognitions?: string[];
  synonyms?: string[];
}

// ✅ GET region data
export async function GET(
  _req: NextRequest,
  { params }: { params: { region: string } }
) {
  try {
    const { region } = params;
    const client = await clientPromise;
    const db = client.db("awardsDB");

    const regionData = await db.collection("awards").findOne(
      { region: new RegExp(`^${region}$`, "i") },
      { projection: { _id: 0 } }
    );

    if (!regionData) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 });
    }

    return NextResponse.json(regionData, { status: 200 });
  } catch (err) {
    console.error("Fetch region error:", err);
    return NextResponse.json(
      { error: "Failed to fetch region" },
      { status: 500 }
    );
  }
}

// ✅ UPDATE or CREATE region data
export async function PUT(
  req: NextRequest,
  { params }: { params: { region: string } }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${AWARDS_API_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { region } = params;
    const body: RegionData = await req.json();

    const client = await clientPromise;
    const db = client.db("awardsDB");

    const result = await db.collection("awards").findOneAndUpdate(
      { region: new RegExp(`^${region}$`, "i") },
      {
        $set: {
          region,
          "data.awards": body.awards ?? [],
          "data.industries": body.industries ?? [],
          "data.recognitions": body.recognitions ?? [],
          "data.synonyms": body.synonyms ?? [],
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after", projection: { _id: 0 } }
    );

    return NextResponse.json({
      success: true,
      message: result?.value
        ? `Region '${region}' updated`
        : `Region '${region}' created`,
      data: result?.value?.data ?? body,
    });
  } catch (err) {
    console.error("Update region error:", err);
    return NextResponse.json(
      { error: "Failed to update region" },
      { status: 500 }
    );
  }
}
