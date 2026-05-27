import PremiumEventCard from "@/components/outsidecrowd/PremiumEventCard";

type EventCardProps = {
  event: any;
};

export default function EventCard({ event }: EventCardProps) {
  const imageUrl =
    event.imageUrl ||
    event.image ||
    event.coverImage ||
    event.eventImageUrl ||
    undefined;

  return (
    <PremiumEventCard
      id={event._id}
      title={event.title || "Untitled Event"}
      date={event.dateString || event.date || "Date coming soon"}
      location={event.location || event.venue || "Location TBA"}
      imageUrl={imageUrl}
      organizerName={
        event.organizerName ||
        event.hostName ||
        event.createdByName ||
        "OutsideCrowd Organizer"
      }
      organizerAvatarUrl={event.organizerAvatarUrl}
      price={event.price}
      sellingFast={true}
    />
  );
}
