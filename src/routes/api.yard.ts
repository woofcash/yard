import { createFileRoute } from "@tanstack/react-router";
import { yardSnapshot } from "@/lib/yard-feed";

export const Route = createFileRoute("/api/yard")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(yardSnapshot(), {
          headers: { "cache-control": "no-store" },
        }),
    },
  },
});
