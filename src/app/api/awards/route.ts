import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic"; // avoid static caching

// ✅ GET: return list of region names
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("awardsDB");

    // Only fetch region field
    const regions = await db
      .collection("awards")
      .find({}, { projection: { region: 1, _id: 0 } })
      .toArray();

    return NextResponse.json({
      success: true,
      regions: regions.map(r => r.region),
    });
  } catch (err) {
    console.error("Fetch regions error:", err);
    return NextResponse.json(
      { error: "Failed to fetch regions" },
      { status: 500 }
    );
  }
}

// ✅ POST: create new region using default template
export async function POST(req: Request) {
  try {
    const { region } = await req.json();
    if (!region) {
      return NextResponse.json(
        { error: "Region required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("awardsDB");

    // Case-insensitive check
    const existing = await db
      .collection("awards")
      .findOne({ region: new RegExp(`^${region}$`, "i") });

    if (existing) {
      return NextResponse.json(
        { error: "Region already exists" },
        { status: 400 }
      );
    }

    // Load default template
    const generalInfo = await db
      .collection("general_information")
      .findOne({}, { projection: { default_region: 1 } });

    const defaultJson = generalInfo?.default_region || {
      industries: [],
      recognitions: [],
      awards: [],
      synonyms: [],
    };

    // Insert new region with nested data
    const newDoc = {
      region,
      data: defaultJson,
      updatedAt: new Date(),
    };

    await db.collection("awards").insertOne(newDoc);

    // Return flat shape (so frontend/devs get consistent format)
    return NextResponse.json({
      success: true,
      region,
      data: defaultJson,
    });
  } catch (err) {
    console.error("Create region error:", err);
    return NextResponse.json(
      { error: "Failed to create region" },
      { status: 500 }
    );
  }
}
