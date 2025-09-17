import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic"; // avoid static caching

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("awardsDB");

    // Fetch only region names
    const regions = await db
      .collection("awards")
      .find({})
      .project({ region: 1, _id: 0 })
      .toArray();

    const regionNames = regions
      .map(r => r.region)
      .filter((r): r is string => typeof r === "string");

    return NextResponse.json({
      success: true,
      regions: regionNames,
    });
  } catch (err) {
    console.error("Error fetching regions:", err);
    return NextResponse.json(
      { success: false, regions: [] },
      { status: 500 }
    );
  }
}
