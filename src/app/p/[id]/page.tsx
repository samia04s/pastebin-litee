import clientPromise from "@/lib/mongodb";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PastePage({ params }: PageProps) {
  // ✅ UNWRAP params PROPERLY
  const { id: pasteId } = await params;

  const client = await clientPromise;
  const db = client.db("pastebin_lite");
  const collection = db.collection("pastes");

  const paste = await collection.findOne({ pasteId });

  // ❌ Not found
  if (!paste) {
    notFound();
  }

  // ❌ Expired
  if (paste.expiresAt && new Date() >= paste.expiresAt) {
    notFound();
  }

  // ❌ No views left
  if (paste.remainingViews !== null && paste.remainingViews <= 0) {
    notFound();
  }

  // ✅ Decrement view count (HTML view ALSO counts)
  if (paste.remainingViews !== null) {
    await collection.updateOne(
      { pasteId, remainingViews: { $gt: 0 } },
      { $inc: { remainingViews: -1 } }
    );
  }

  return (
    <main style={{ padding: "24px", fontFamily: "monospace" }}>
      <h2>Paste</h2>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          background: "#f5f5f5",
          padding: "16px",
          borderRadius: "6px",
        }}
      >
        {paste.content}
      </pre>
    </main>
  );
}
