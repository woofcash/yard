// Placeholder ONLY — /api/yard referenced this module but it didn't exist yet,
// which broke the build. This stub does not implement any token/mechanics logic;
// it deliberately omits `hounds` so scripts/api.js's client-side check
// (Array.isArray(data.hounds)) fails and the arena falls back to its own DEMO
// simulation instead of showing a fake "live" empty yard.
//
// Replace with the real implementation — see README.md "Data contract" section
// in the design branch for the exact shape `GET /api/yard` should return.
export function yardSnapshot() {
  return { status: "not_implemented" };
}
