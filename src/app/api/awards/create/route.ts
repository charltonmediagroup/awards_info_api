import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const awardsDir = path.join(process.cwd(), "src/data/awards");
const defaultFile = path.join(awardsDir, "default", "default.json");

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name)
      return NextResponse.json({ error: "Region name required" }, { status: 400 });

    const filePath = path.join(awardsDir, `${name}.json`);
    if (fs.existsSync(filePath))
      return NextResponse.json({ error: "Region already exists" }, { status: 400 });

    const defaultData = fs.readFileSync(defaultFile, "utf8");
    fs.writeFileSync(filePath, defaultData, "utf8");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create region" }, { status: 500 });
  }
}
