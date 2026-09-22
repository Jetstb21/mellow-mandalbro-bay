import { createFileRoute } from "@tanstack/react-router";
import { RimDesk } from "@/components/rim/RimDesk";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <RimDesk />;
}
