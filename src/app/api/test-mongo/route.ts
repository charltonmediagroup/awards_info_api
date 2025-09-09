// src/app/api/test-mongo/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("awardsDB");
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      success: true,
      collections: collections.map(c => c.name),
    });
  } catch (err: unknown) {
    console.error("MongoDB connection error:", err);

    let message = "Unknown error";
    if (err instanceof Error) {
      message = err.message;
    }

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
