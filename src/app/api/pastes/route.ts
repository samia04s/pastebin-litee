import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { generatePasteId } from "@/lib/id";
import { getCurrentTimeMs } from "@/lib/time";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { content, ttl_seconds, max_views } = body;

    // ✅ Input validation
    if (typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "content must be a non-empty string" },
        { status: 400 }
      );
    }

    if (
      ttl_seconds !== undefined &&
      (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
    ) {
      return NextResponse.json(
        { error: "ttl_seconds must be an integer >= 1" },
        { status: 400 }
      );
    }

    if (
      max_views !== undefined &&
      (!Number.isInteger(max_views) || max_views < 1)
    ) {
      return NextResponse.json(
        { error: "max_views must be an integer >= 1" },
        { status: 400 }
      );
    }

    const pasteId = generatePasteId();
    const nowMs = await getCurrentTimeMs();

    const expiresAt =
      ttl_seconds !== undefined
        ? new Date(nowMs + ttl_seconds * 1000)
        : null;

    const doc = {
      pasteId,
      content,
      createdAt: new Date(nowMs),
      expiresAt,
      maxViews: max_views ?? null,
      remainingViews: max_views ?? null,
    };

    const client = await clientPromise;
    const db = client.db("pastebin_lite");
    await db.collection("pastes").insertOne(doc);

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.json(
      {
        id: pasteId,
        url: `${baseUrl}/p/${pasteId}`,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}
