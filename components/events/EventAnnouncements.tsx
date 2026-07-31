export type EventAnnouncement = {
  id: string;
  subject: string;
  body: string;
  publishedAt: number;
};

export default function EventAnnouncements({
  announcements,
}: {
  announcements: EventAnnouncement[] | undefined;
}) {
  if (!announcements?.length) {
    return null;
  }

  return (
    <section className="oc-card mt-6 p-5 sm:mt-8 sm:p-8">
      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-300/70 sm:text-xs">
        Organizer updates
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl sm:tracking-tight">
        Latest announcements
      </h2>

      <div className="mt-6 space-y-3">
        {announcements.map((announcement) => (
          <article
            key={announcement.id}
            className="rounded-2xl border border-orange-400/10 bg-gradient-to-r from-orange-500/[0.07] to-violet-500/[0.05] p-4 sm:p-5"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h3 className="font-black text-white">
                {announcement.subject}
              </h3>
              <time
                dateTime={new Date(
                  announcement.publishedAt
                ).toISOString()}
                className="shrink-0 text-[10px] font-bold text-white/30"
              >
                {formatPublishedDate(
                  announcement.publishedAt
                )}
              </time>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/55">
              {announcement.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatPublishedDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}
