import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentTimeMs } from "@/lib/time";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: pasteId } = await context.params;

  const client = await clientPromise;
  const db = client.db("pastebin_lite");
  const collection = db.collection("pastes");

  // 1️⃣ Fetch paste
  const paste = await collection.findOne({ pasteId });

  if (!paste) {
    return NextResponse.json({ error: "Paste not found" }, { status: 404 });
  }

  const nowMs = await getCurrentTimeMs();

  // 2️⃣ TTL check
  if (paste.expiresAt && nowMs >= paste.expiresAt.getTime()) {
    return NextResponse.json({ error: "Paste expired" }, { status: 404 });
  }

  // 3️⃣ Handle view limit
  if (paste.remainingViews !== null) {
    if (paste.remainingViews <= 0) {
      return NextResponse.json(
        { error: "View limit exceeded" },
        { status: 404 }
      );
    }

    // decrement safely
    await collection.updateOne(
      { pasteId },
      { $inc: { remainingViews: -1 } }
    );
  }

  // 4️⃣ Fetch updated paste (source of truth)
  const updatedPaste = await collection.findOne({ pasteId });

  return NextResponse.json(
    {
      content: updatedPaste!.content,
      remaining_views: updatedPaste!.remainingViews,
      expires_at: updatedPaste!.expiresAt
        ? updatedPaste!.expiresAt.toISOString()
        : null,
    },
    { status: 200 }
  );
}
