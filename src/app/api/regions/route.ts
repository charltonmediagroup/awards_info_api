import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const awardsDir = path.join(process.cwd(), "src/data/awards");

export async function GET() {
  try {
    const files = fs.readdirSync(awardsDir);
    const regions = files
      .filter(f => f.endsWith(".json") && f !== "default.json")
      .map(f => f.replace(".json", ""));
    return NextResponse.json({ regions });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ regions: [] });
  }
}
