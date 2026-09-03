import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <iframe
      title="WoofCash yard"
      src="/yard.html"
      className="fixed inset-0 h-dvh w-full border-0 bg-[#0a0c0b]"
    />
  );
}
