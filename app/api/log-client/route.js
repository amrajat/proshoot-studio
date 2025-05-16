import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const clientLogPath = path.resolve(process.cwd(), "logs/client.txt");

export async function POST(req) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Logging disabled in production" },
      { status: 403 }
    );
  }
  try {
    const { context, details } = await req.json();
    const logEntry = `[${new Date().toISOString()}] [${context}] ${JSON.stringify(
      details
    )}\n`;
    await fs.appendFile(clientLogPath, logEntry, "utf8");
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
