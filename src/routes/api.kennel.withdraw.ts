import { createFileRoute } from "@tanstack/react-router";
import { withdrawKennel } from "@/lib/yard-feed";

export const Route = createFileRoute("/api/kennel/withdraw")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { kennel?: string };
        const result = withdrawKennel(String(body.kennel ?? ""));
        return Response.json(result, { status: result.ok ? 200 : 400 });
      },
    },
  },
});
