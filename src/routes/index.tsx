import { createFileRoute } from "@tanstack/react-router";
import { Footer, TopBar } from "@/components/chrome";
import { YardLive } from "@/components/yard-live";
import { MUTTS } from "@/lib/world";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <TopBar settled={1.0844} settlements={412} strays={MUTTS.length} />
      <YardLive />
      <Footer />
    </div>
  );
}
