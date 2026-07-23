export function formatMethod(method: string) {
  if (method === "qr") {
    return "QR scan";
  }

  if (method === "search") {
    return "Guest search";
  }

  return "Manual entry";
}

export function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
