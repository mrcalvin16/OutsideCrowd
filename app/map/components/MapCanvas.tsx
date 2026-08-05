"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  Popup,
  type ViewState,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

type MapEvent = {
  _id: string;
  name?: string;
  description?: string;
  location?: string;
  venueName?: string;
  venueAddress?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  dateString?: string;
  eventDate?: number;
  price?: number;
  ticketsSold?: number;
  imageUrl?: string | null;
};

type TimeMode = "all" | "tonight" | "weekend";

const DEFAULT_VIEW: ViewState = {
  longitude: -90.0715,
  latitude: 29.9511,
  zoom: 10,
  bearing: 0,
  pitch: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
};

function formatDate(event: MapEvent) {
  const raw = event.eventDate ?? (event.dateString ? Date.parse(event.dateString) : NaN);
  if (!Number.isFinite(raw)) return event.dateString || "Date coming soon";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(raw));
}

function locationLabel(event: MapEvent) {
  return (
    event.venueName ||
    event.venueAddress ||
    [event.city, event.state].filter(Boolean).join(", ") ||
    event.location ||
    "Location coming soon"
  );
}

function isTonight(event: MapEvent) {
  const raw = event.eventDate ?? (event.dateString ? Date.parse(event.dateString) : NaN);
  if (!Number.isFinite(raw)) return false;
  const date = new Date(raw);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isThisWeekend(event: MapEvent) {
  const raw = event.eventDate ?? (event.dateString ? Date.parse(event.dateString) : NaN);
  if (!Number.isFinite(raw)) return false;

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const daysUntilFriday = (5 - start.getDay() + 7) % 7;
  start.setDate(start.getDate() + daysUntilFriday);

  const end = new Date(start);
  end.setDate(end.getDate() + 3);

  const eventDate = new Date(raw);
  return eventDate >= start && eventDate < end;
}

export default function MapCanvas({ events = [] }: { events: MapEvent[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [timeMode, setTimeMode] = useState<TimeMode>("all");
  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW);

  const filteredEvents = useMemo(() => {
    if (timeMode === "tonight") return events.filter(isTonight);
    if (timeMode === "weekend") return events.filter(isThisWeekend);
    return events;
  }, [events, timeMode]);

  const mappedEvents = useMemo(
    () =>
      filteredEvents.filter(
        (event) =>
          Number.isFinite(event.latitude) &&
          Number.isFinite(event.longitude) &&
          Math.abs(Number(event.latitude)) <= 90 &&
          Math.abs(Number(event.longitude)) <= 180,
      ),
    [filteredEvents],
  );

  const selectedEvent =
    mappedEvents.find((event) => event._id === selectedId) ?? null;

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="flex h-full min-h-[520px] items-center justify-center bg-zinc-950 p-6 text-white">
        <div className="max-w-md rounded-3xl border border-orange-400/20 bg-black/70 p-6 text-center shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-300">
            Map configuration needed
          </p>
          <h2 className="mt-3 text-2xl font-black">Add your Mapbox token</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Set NEXT_PUBLIC_MAPBOX_TOKEN locally and in your deployment environment to display the geographic event map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[520px] overflow-hidden bg-zinc-950">
      <Map
        {...viewState}
        onMove={(event) => setViewState(event.viewState)}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        attributionControl={false}
        reuseMaps
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {mappedEvents.map((event) => {
          const active = event._id === selectedId;
          return (
            <Marker
              key={event._id}
              longitude={Number(event.longitude)}
              latitude={Number(event.latitude)}
              anchor="bottom"
            >
              <button
                type="button"
                aria-label={`View ${event.name || "event"}`}
                onClick={(clickEvent) => {
                  clickEvent.stopPropagation();
                  setSelectedId(event._id);
                }}
                className={`group relative grid h-10 w-10 place-items-center rounded-full border-2 border-black shadow-[0_0_24px_rgba(249,115,22,0.7)] transition hover:scale-110 ${
                  active ? "bg-violet-400" : "bg-orange-400"
                }`}
              >
                <span className="h-3 w-3 rounded-full bg-black" />
                <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-orange-400/30" />
              </button>
            </Marker>
          );
        })}

        {selectedEvent && (
          <Popup
            longitude={Number(selectedEvent.longitude)}
            latitude={Number(selectedEvent.latitude)}
            anchor="top"
            offset={14}
            closeOnClick={false}
            onClose={() => setSelectedId(null)}
            maxWidth="320px"
          >
            <div className="overflow-hidden rounded-2xl bg-zinc-950 text-white">
              {selectedEvent.imageUrl && (
                <img
                  src={selectedEvent.imageUrl}
                  alt=""
                  className="h-32 w-full object-cover"
                />
              )}
              <div className="p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">
                  {formatDate(selectedEvent)}
                </p>
                <h3 className="mt-2 line-clamp-2 text-lg font-black">
                  {selectedEvent.name || "Untitled event"}
                </h3>
                <p className="mt-2 line-clamp-1 text-sm text-zinc-400">
                  {locationLabel(selectedEvent)}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-white">
                    {Number(selectedEvent.price ?? 0) > 0
                      ? `From $${Number(selectedEvent.price).toFixed(0)}`
                      : "Free"}
                  </span>
                  <Link
                    href={`/events/${selectedEvent._id}`}
                    className="rounded-full bg-white px-4 py-2 text-xs font-black text-black"
                  >
                    View event
                  </Link>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      <div className="absolute left-4 right-4 top-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/75 p-3 shadow-2xl backdrop-blur-xl md:left-6 md:right-auto md:min-w-[420px]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-300">
            Geographic discovery
          </p>
          <p className="mt-1 text-sm font-bold text-white">
            {mappedEvents.length} mapped event{mappedEvents.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {([
            ["all", "All"],
            ["tonight", "Tonight"],
            ["weekend", "This Weekend"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTimeMode(key)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
                timeMode === key
                  ? "bg-white text-black"
                  : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mappedEvents.length === 0 && (
        <div className="pointer-events-none absolute inset-x-4 bottom-5 z-10 rounded-2xl border border-white/10 bg-black/80 p-4 text-center text-sm text-zinc-300 backdrop-blur md:left-6 md:right-auto md:max-w-md">
          No events with valid coordinates match this filter. Add latitude and longitude to event venues to place them on the map.
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 flex gap-3 overflow-x-auto border-t border-white/10 bg-black/80 p-4 backdrop-blur-xl md:hidden">
        {filteredEvents.slice(0, 8).map((event) => (
          <Link
            key={event._id}
            href={`/events/${event._id}`}
            className="min-w-[250px] rounded-2xl border border-white/10 bg-zinc-950 p-4"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
              {formatDate(event)}
            </p>
            <p className="mt-2 line-clamp-1 font-black text-white">
              {event.name || "Untitled event"}
            </p>
            <p className="mt-1 line-clamp-1 text-xs text-zinc-400">
              {locationLabel(event)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
