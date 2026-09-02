import type { Bundle } from "./types";

export async function loadBundle(): Promise<Bundle> {
  const base = import.meta.env.BASE_URL;
  const res = await fetch(`${base}collection.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load collection (${res.status})`);
  return (await res.json()) as Bundle;
}
