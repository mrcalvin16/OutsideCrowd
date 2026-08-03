import type { Id } from "@/convex/_generated/dataModel";
import TicketPass from "@/components/tickets/TicketPass";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TicketPass ticketId={id as Id<"tickets">} />;
}
