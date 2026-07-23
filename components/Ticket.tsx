"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  CalendarDays,
  IdCard,
  MapPin,
  Ticket as TicketIcon,
  User,
} from "lucide-react";
import QRCode from "react-qr-code";
import Spinner from "./Spinner";
import { useStorageUrl } from "@/lib/utils";
import Image from "next/image";

type EventCancellationShape = {
  is_cancelled?: boolean;
  isCancelled?: boolean;
  cancelled?: boolean;
  canceled?: boolean;
  status?: string;
};

function isEventCancelled(event: unknown): boolean {
  if (!event || typeof event !== "object") {
    return false;
  }

  const candidate = event as EventCancellationShape;
  const normalizedStatus = candidate.status?.toLowerCase();

  return (
    candidate.is_cancelled === true ||
    candidate.isCancelled === true ||
    candidate.cancelled === true ||
    candidate.canceled === true ||
    normalizedStatus === "cancelled" ||
    normalizedStatus === "canceled"
  );
}


export default function Ticket({ ticketId }: { ticketId: Id<"tickets"> }) {
  const ticket = useQuery(api.tickets.getTicketDetails, { ticketId });
  const imageUrl = useStorageUrl(ticket?.event?.imageStorageId);

  if (!ticket || !ticket.event) {
    return <Spinner />;
  }

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-xl border ${isEventCancelled(ticket.event) ? "border-red-200" : "border-gray-100"}`}
    >
      {/* Event Header with Image */}
      <div className="relative">
        {imageUrl && (
          <div className="relative w-full aspect-[21/9] ">
            <Image
              src={imageUrl}
              alt={ticket.event.name}
              fill
              className={`object-cover object-center ${isEventCancelled(ticket.event) ? "opacity-50" : ""}`}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/90" />
          </div>
        )}
        <div
          className={`px-6 py-4 ${imageUrl ? "absolute bottom-0 left-0 right-0" : isEventCancelled(ticket.event) ? "bg-red-600" : "bg-blue-600"} `}
        >
          <h2
            className={`text-2xl font-bold ${imageUrl || !imageUrl ? "text-white" : "text-black"}`}
          >
            {ticket.event.name}
          </h2>
          {isEventCancelled(ticket.event) && (
            <p className="text-red-300 mt-1">This event has been cancelled</p>
          )}
        </div>
      </div>

      {/* Ticket Content */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Event Details */}
          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <CalendarDays
                className={`w-5 h-5 mr-3 ${isEventCancelled(ticket.event) ? "text-red-600" : "text-blue-600"}`}
              />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {new Date(ticket.event.eventDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <MapPin
                className={`w-5 h-5 mr-3 ${isEventCancelled(ticket.event) ? "text-red-600" : "text-blue-600"}`}
              />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{ticket.event.location}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <User
                className={`w-5 h-5 mr-3 ${isEventCancelled(ticket.event) ? "text-red-600" : "text-blue-600"}`}
              />
              <div>
                <p className="text-sm text-gray-500">Ticket Holder</p>
                <p className="font-medium">{ticket.holder.name}</p>
                <p className="text-sm text-gray-500">{ticket.holder.email}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600 break-all">
              <IdCard
                className={`w-5 h-5 mr-3 ${isEventCancelled(ticket.event) ? "text-red-600" : "text-blue-600"}`}
              />
              <div>
                <p className="text-sm text-gray-500">Ticket Holder ID</p>
                <p className="font-medium">{ticket.holder.userId}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <TicketIcon
                className={`w-5 h-5 mr-3 ${isEventCancelled(ticket.event) ? "text-red-600" : "text-blue-600"}`}
              />
              <div>
                <p className="text-sm text-gray-500">Ticket Price</p>
                <p className="font-medium">£{(ticket.event.price ?? 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code */}
          <div className="flex flex-col items-center justify-center border-l border-gray-200 pl-6">
            <div
              className={`bg-gray-100 p-4 rounded-lg ${isEventCancelled(ticket.event) ? "opacity-50" : ""}`}
            >
              <QRCode value={ticket._id} className="w-32 h-32" />
            </div>
            <p className="mt-2 text-sm text-gray-500 break-all text-center max-w-[200px] md:max-w-full">
              Ticket ID: {ticket._id}
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Important Information
          </h3>
          {isEventCancelled(ticket.event) ? (
            <p className="text-sm text-red-600">
              This event has been cancelled. A refund will be processed if it
              hasn&apos;t been already.
            </p>
          ) : (
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Please arrive at least 30 minutes before the event</li>
              <li>• Have your ticket QR code ready for scanning</li>
              <li>• This ticket is non-transferable</li>
            </ul>
          )}
        </div>
      </div>

      {/* Ticket Footer */}
      <div
        className={`${isEventCancelled(ticket.event) ? "bg-red-50" : "bg-gray-50"} px-6 py-4 flex justify-between items-center`}
      >
        <span className="text-sm text-gray-500">
          Purchase Date: {ticket.purchasedAt
            ? new Date(ticket.purchasedAt).toLocaleString()
            : "Unavailable"}
        </span>
        <span
          className={`text-sm font-medium ${isEventCancelled(ticket.event) ? "text-red-600" : "text-blue-600"}`}
        >
          {isEventCancelled(ticket.event) ? "Cancelled" : "Valid Ticket"}
        </span>
      </div>
    </div>
  );
}
