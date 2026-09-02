// Pull the public collection bundle from R2 into public/collection.json so the
// site serves it same-origin (no CORS). Runs before dev and build.
import { mkdir, writeFile } from "node:fs/promises";

const URL =
  process.env.COLLECTION_URL ||
  "https://pub-dc09609b8c5f489097753c392d7aa5db.r2.dev/collection.json";

try {
  const res = await fetch(URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  JSON.parse(text); // validate
  await mkdir("public", { recursive: true });
  await writeFile("public/collection.json", text, "utf8");
  const kb = (text.length / 1024).toFixed(1);
  console.log(`✓ fetched collection.json (${kb} KB) from R2`);
} catch (e) {
  console.error(`✗ could not fetch collection bundle: ${e.message}`);
  console.error(`  (set COLLECTION_URL or run \`npm run publish:data\` in Coinex first)`);
  process.exit(1);
}
