import crypto from "crypto";

export function generatePasteId(): string {
  return crypto.randomBytes(6).toString("hex");
}
