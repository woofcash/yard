import { createFileRoute } from "@tanstack/react-router";
import { depositKennel } from "@/lib/yard-feed";

export const Route = createFileRoute("/api/kennel/deposit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          kennel?: string;
          amountWei?: string;
        };
        const result = depositKennel(String(body.kennel ?? ""), String(body.amountWei ?? "0"));
        return Response.json(result, { status: result.ok ? 200 : 400 });
      },
    },
  },
});
