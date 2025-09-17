// src/app/api/test-mongo/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic"; // prevent caching in Vercel

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("awardsDB");

    // List all collections in the DB
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      success: true,
      collections: collections.map(c => c.name),
    });
  } catch (err: unknown) {
    console.error("MongoDB connection error:", err);

    const message =
      err instanceof Error ? err.message : "Unexpected server error";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
