import { headers } from "next/headers";

export async function getCurrentTimeMs(): Promise<number> {
  const testMode = process.env.TEST_MODE === "1";

  if (testMode) {
    const headerList = await headers();
    const testNow = headerList.get("x-test-now-ms");

    if (testNow) {
      const parsed = Number(testNow);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return Date.now();
}
