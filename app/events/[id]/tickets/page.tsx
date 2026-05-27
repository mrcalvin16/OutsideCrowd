import { redirect } from "next/navigation";

export default async function EventTicketsRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  redirect(`/host/events/${id}/tickets`);
}
