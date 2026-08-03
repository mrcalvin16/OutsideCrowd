import type {
  CanvasElement,
  ResizeHandle,
  SidebarTool,
} from "./types";

export const CANVAS_WIDTH = 520;
export const SNAP_THRESHOLD = 6;
export const MIN_WIDTH = 40;
export const MIN_HEIGHT = 24;
export const HISTORY_LIMIT = 100;

export const sidebarTools: Array<{
  id: SidebarTool;
  label: string;
  icon: string;
}> = [
  { id: "templates", label: "Templates", icon: "▦" },
  { id: "uploads", label: "Uploads", icon: "↑" },
  { id: "ai", label: "AI Images", icon: "✦" },
  { id: "text", label: "Text", icon: "T" },
  { id: "brand", label: "Brand Kit", icon: "◆" },
  { id: "elements", label: "Layers", icon: "○" },
  { id: "background", label: "Background", icon: "▨" },
];

export const templates = [
  {
    name: "Luxury Nightlife",
    style: "Luxury",
    prompt:
      "Luxury nightlife party with a stylish crowd, velvet rope exclusivity, cinematic lighting and premium event branding",
  },
  {
    name: "Afrobeats Night",
    style: "Afrobeats",
    prompt:
      "Afrobeats party with premium cultural nightlife energy, dancing crowd, warm luxury lighting and modern editorial styling",
  },
  {
    name: "Rooftop Social",
    style: "Rooftop",
    prompt:
      "Luxury rooftop event with skyline views, champagne atmosphere, elegant guests and cinematic sunset lighting",
  },
  {
    name: "Festival Energy",
    style: "Festival",
    prompt:
      "Large outdoor music festival with stage lights, crowd energy, confetti and premium campaign design",
  },
];

export const formats = [
  { id: "poster", label: "Poster", height: 780 },
  { id: "square", label: "Square", height: 520 },
  { id: "story", label: "Story", height: 924 },
];

export const styleOptions = [
  "Luxury",
  "Underground",
  "Festival",
  "Rooftop",
  "EDM",
  "Afrobeats",
  "College",
];

export const resizeHandles: ResizeHandle[] = [
  "nw",
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w",
];

export const initialElements: CanvasElement[] = [
  {
    id: "kicker",
    kind: "text",
    name: "Kicker",
    text: "OUTSIDECROWD PRESENTS",
    x: 40,
    y: 44,
    width: 430,
    height: 28,
    fontSize: 12,
    fontWeight: 900,
    color: "#ffffff",
    align: "left",
    uppercase: true,
    letterSpacing: 4.2,
  },
  {
    id: "headline",
    kind: "text",
    name: "Headline",
    text: "NIGHT MOVES",
    x: 40,
    y: 105,
    width: 430,
    height: 168,
    fontSize: 58,
    fontWeight: 900,
    color: "#ffffff",
    align: "left",
    uppercase: true,
    letterSpacing: -3,
  },
  {
    id: "subheadline",
    kind: "text",
    name: "Description",
    text: "A premium event experience curated for the city.",
    x: 40,
    y: 300,
    width: 360,
    height: 78,
    fontSize: 16,
    fontWeight: 400,
    color: "#ffffff",
    align: "left",
  },
  {
    id: "venue",
    kind: "text",
    name: "Venue",
    text: "NEW ORLEANS",
    x: 40,
    y: 668,
    width: 250,
    height: 24,
    fontSize: 12,
    fontWeight: 500,
    color: "#ffffff",
    align: "left",
    uppercase: true,
    letterSpacing: 3,
  },
  {
    id: "style",
    kind: "text",
    name: "Style",
    text: "LUXURY",
    x: 40,
    y: 702,
    width: 250,
    height: 34,
    fontSize: 20,
    fontWeight: 900,
    color: "#ffffff",
    align: "left",
    uppercase: true,
  },
  {
    id: "cta",
    kind: "button",
    name: "Call to action",
    text: "GET TICKETS",
    x: 350,
    y: 687,
    width: 130,
    height: 48,
    fontSize: 12,
    fontWeight: 900,
    color: "#000000",
    align: "center",
    uppercase: true,
    borderRadius: 999,
    background: "#ffffff",
  },
];
