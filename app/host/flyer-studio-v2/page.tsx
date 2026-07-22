"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { toPng } from "html-to-image";

type SidebarTool =
  | "templates"
  | "uploads"
  | "ai"
  | "text"
  | "brand"
  | "elements"
  | "background";

type TextAlign = "left" | "center" | "right";
type ElementKind = "text" | "button";
type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

type CanvasElement = {
  id: string;
  kind: ElementKind;
  name: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: TextAlign;
  uppercase?: boolean;
  letterSpacing?: number;
  borderRadius?: number;
  background?: string;
  hidden?: boolean;
  locked?: boolean;
};

type Guide = {
  axis: "x" | "y";
  position: number;
};

type Interaction =
  | {
      mode: "drag";
      elementId: string;
      startClientX: number;
      startClientY: number;
      startElement: CanvasElement;
      startSnapshot: CanvasElement[];
    }
  | {
      mode: "resize";
      elementId: string;
      handle: ResizeHandle;
      startClientX: number;
      startClientY: number;
      startElement: CanvasElement;
      startSnapshot: CanvasElement[];
    };

const CANVAS_WIDTH = 520;
const SNAP_THRESHOLD = 6;
const MIN_WIDTH = 40;
const MIN_HEIGHT = 24;
const HISTORY_LIMIT = 100;

const sidebarTools: { id: SidebarTool; label: string; icon: string }[] = [
  { id: "templates", label: "Templates", icon: "▦" },
  { id: "uploads", label: "Uploads", icon: "↑" },
  { id: "ai", label: "AI Images", icon: "✦" },
  { id: "text", label: "Text", icon: "T" },
  { id: "brand", label: "Brand Kit", icon: "◆" },
  { id: "elements", label: "Layers", icon: "○" },
  { id: "background", label: "Background", icon: "▨" },
];

const templates = [
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

const formats = [
  { id: "poster", label: "Poster", height: 780 },
  { id: "square", label: "Square", height: 520 },
  { id: "story", label: "Story", height: 924 },
];

const styleOptions = [
  "Luxury",
  "Underground",
  "Festival",
  "Rooftop",
  "EDM",
  "Afrobeats",
  "College",
];

const resizeHandles: ResizeHandle[] = [
  "nw",
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w",
];

const initialElements: CanvasElement[] = [
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

function cloneElements(elements: CanvasElement[]) {
  return elements.map((element) => ({ ...element }));
}

function snapshotsEqual(a: CanvasElement[], b: CanvasElement[]) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function getElementAnchors(element: CanvasElement) {
  return {
    left: element.x,
    centerX: element.x + element.width / 2,
    right: element.x + element.width,
    top: element.y,
    centerY: element.y + element.height / 2,
    bottom: element.y + element.height,
  };
}

function resizeHandleClass(handle: ResizeHandle) {
  const positions: Record<ResizeHandle, string> = {
    nw: "-left-1.5 -top-1.5 cursor-nwse-resize",
    n: "left-1/2 -top-1.5 -translate-x-1/2 cursor-ns-resize",
    ne: "-right-1.5 -top-1.5 cursor-nesw-resize",
    e: "-right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize",
    se: "-bottom-1.5 -right-1.5 cursor-nwse-resize",
    s: "bottom-[-6px] left-1/2 -translate-x-1/2 cursor-ns-resize",
    sw: "-bottom-1.5 -left-1.5 cursor-nesw-resize",
    w: "-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize",
  };

  return positions[handle];
}

function ToolPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-violet-300">
        {title}
      </p>
      {children}
    </section>
  );
}

export default function FlyerStudioV2Page() {
  const { isLoaded, isSignedIn } = useAuth();
  const events = useQuery(
    api.events.getMyEvents,
    isLoaded && isSignedIn ? {} : "skip",
  ) as any[] | undefined;

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const editingStartRef = useRef<CanvasElement[] | null>(null);
  const pastRef = useRef<CanvasElement[][]>([]);
  const clipboardRef = useRef<CanvasElement | null>(null);
  const futureRef = useRef<CanvasElement[][]>([]);

  const [activeTool, setActiveTool] = useState<SidebarTool>("templates");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Luxury");
  const [format, setFormat] = useState("poster");
  const [imagePreview, setImagePreview] = useState("");
  const [variations, setVariations] = useState<
    { id: string; imageUrl: string; caption?: string }[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("");
  const [overlayStrength, setOverlayStrength] = useState(55);
  const [zoom, setZoom] = useState(85);
  const [elements, setElements] = useState<CanvasElement[]>(initialElements);
  const [selectedElementId, setSelectedElementId] = useState("headline");
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [, setHistoryVersion] = useState(0);

  const selectedEvent = events?.find((event) => event._id === selectedEventId);
  const selectedFormat =
    formats.find((item) => item.id === format) || formats[0];
  const canvasHeight = selectedFormat.height;
  const canvasScale = useMemo(() => zoom / 100, [zoom]);
  const selectedElement =
    elements.find((element) => element.id === selectedElementId) || null;
  const headline =
    elements.find((element) => element.id === "headline")?.text ||
    "Night Moves";
  const eventTitle = selectedEvent?.name || headline;
  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  const commitElements = useCallback(
    (
      next: CanvasElement[] | ((current: CanvasElement[]) => CanvasElement[]),
    ) => {
      setElements((current) => {
        const resolved =
          typeof next === "function" ? next(current) : cloneElements(next);

        if (snapshotsEqual(current, resolved)) return current;

        pastRef.current.push(cloneElements(current));
        if (pastRef.current.length > HISTORY_LIMIT) pastRef.current.shift();
        futureRef.current = [];
        setHistoryVersion((value) => value + 1);
        return resolved;
      });
    },
    [],
  );

  const updateElement = useCallback(
    (
      id: string,
      patch:
        | Partial<CanvasElement>
        | ((element: CanvasElement) => Partial<CanvasElement>),
      recordHistory = true,
    ) => {
      const updater = (current: CanvasElement[]) =>
        current.map((element) =>
          element.id === id
            ? {
                ...element,
                ...(typeof patch === "function" ? patch(element) : patch),
              }
            : element,
        );

      if (recordHistory) commitElements(updater);
      else setElements(updater);
    },
    [commitElements],
  );

  const undo = useCallback(() => {
    const previous = pastRef.current.pop();
    if (!previous) return;

    setElements((current) => {
      futureRef.current.push(cloneElements(current));
      return cloneElements(previous);
    });
    setEditingElementId(null);
    setGuides([]);
    setHistoryVersion((value) => value + 1);
  }, []);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;

    setElements((current) => {
      pastRef.current.push(cloneElements(current));
      return cloneElements(next);
    });
    setEditingElementId(null);
    setGuides([]);
    setHistoryVersion((value) => value + 1);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isTyping) return;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
        return;
      }

      // Copy the selected element to the internal clipboard.
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "c" &&
        selectedElementId
      ) {
        event.preventDefault();

        const selected = elements.find(
          (element) => element.id === selectedElementId,
        );

        if (selected) {
          clipboardRef.current = cloneElements([selected])[0];
        }

        return;
      }

      // Paste the copied element with a small visual offset.
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "v" &&
        clipboardRef.current
      ) {
        event.preventDefault();

        const copied = cloneElements([clipboardRef.current])[0];
        const pastedId = `${copied.id}-copy-${Date.now()}`;

        const pastedElement: CanvasElement = {
          ...copied,
          id: pastedId,
          x: Math.min(
            CANVAS_WIDTH - copied.width,
            Math.max(0, copied.x + 20),
          ),
          y: Math.min(
            canvasHeight - copied.height,
            Math.max(0, copied.y + 20),
          ),
        };

        commitElements((current) => [...current, pastedElement]);
        clipboardRef.current = cloneElements([pastedElement])[0];
        setSelectedElementId(pastedId);
        setEditingElementId(null);
        setGuides([]);

        return;
      }

      // Duplicate the selected element immediately.
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "d" &&
        selectedElementId
      ) {
        event.preventDefault();

        const selected = elements.find(
          (element) => element.id === selectedElementId,
        );

        if (!selected) return;

        const duplicateId = `${selected.id}-copy-${Date.now()}`;

        const duplicatedElement: CanvasElement = {
          ...cloneElements([selected])[0],
          id: duplicateId,
          x: Math.min(
            CANVAS_WIDTH - selected.width,
            Math.max(0, selected.x + 20),
          ),
          y: Math.min(
            canvasHeight - selected.height,
            Math.max(0, selected.y + 20),
          ),
        };

        commitElements((current) => [...current, duplicatedElement]);
        setSelectedElementId(duplicateId);
        setEditingElementId(null);
        setGuides([]);

        return;
      }

      // Escape clears the current selection.
      if (event.key === "Escape") {
        event.preventDefault();
        setSelectedElementId("");
        setEditingElementId(null);
        setGuides([]);
        return;
      }

      // Arrow keys move the selected element by 1px.
      // Hold Shift to move it by 10px.
      if (
        selectedElementId &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        event.preventDefault();

        const distance = event.shiftKey ? 10 : 1;

        commitElements((current) =>
          current.map((element) => {
            if (element.id !== selectedElementId || element.locked) {
              return element;
            }

            let x = element.x;
            let y = element.y;

            switch (event.key) {
              case "ArrowLeft":
                x = Math.max(0, x - distance);
                break;

              case "ArrowRight":
                x = Math.min(
                  CANVAS_WIDTH - element.width,
                  x + distance,
                );
                break;

              case "ArrowUp":
                y = Math.max(0, y - distance);
                break;

              case "ArrowDown":
                y = Math.min(
                  canvasHeight - element.height,
                  y + distance,
                );
                break;
            }

            return {
              ...element,
              x,
              y,
            };
          }),
        );

        return;
      }

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedElementId
      ) {
        event.preventDefault();
        commitElements((current) =>
          current.filter((element) => element.id !== selectedElementId),
        );
        setSelectedElementId("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvasHeight, commitElements, elements, redo, selectedElementId, undo]);

  function applyTemplate(template: (typeof templates)[number]) {
    setPrompt(template.prompt);
    setStyle(template.style);
    commitElements((current) =>
      current.map((element) => {
        if (element.id === "headline") {
          return { ...element, text: template.name.toUpperCase() };
        }
        if (element.id === "style") {
          return { ...element, text: template.style.toUpperCase() };
        }
        return element;
      }),
    );
    setActiveTool("ai");
  }

  function addTextElement(kind: "heading" | "subheading" | "body") {
    const id = `text-${Date.now()}`;
    const presets = {
      heading: {
        text: "NEW HEADING",
        fontSize: 42,
        fontWeight: 900,
        height: 90,
      },
      subheading: {
        text: "Add a subheading",
        fontSize: 24,
        fontWeight: 700,
        height: 54,
      },
      body: {
        text: "Add body text",
        fontSize: 16,
        fontWeight: 400,
        height: 48,
      },
    };
    const preset = presets[kind];

    commitElements((current) => [
      ...current,
      {
        id,
        kind: "text",
        name: `Text ${current.length + 1}`,
        text: preset.text,
        x: 80,
        y: 180,
        width: 360,
        height: preset.height,
        fontSize: preset.fontSize,
        fontWeight: preset.fontWeight,
        color: "#ffffff",
        align: "left",
      },
    ]);
    setSelectedElementId(id);
  }

  async function generateFlyer() {
    if (!prompt.trim()) {
      alert("Add a creative prompt first.");
      return;
    }

    try {
      setIsGenerating(true);
      setStatus("Generating your flyer...");
      const response = await fetch("/api/ai/generate-flyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style,
          format,
          eventType: selectedEvent?.category || "nightlife",
          composition: "cinematic",
          quality: "premium",
          city: selectedEvent?.city || "New Orleans",
          eventTitle,
          venue: selectedEvent?.venue || "",
          cta:
            elements.find((element) => element.id === "cta")?.text ||
            "Get Tickets",
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success || !data.imageUrl) {
        throw new Error(data.error || "No image was returned.");
      }

      setImagePreview(data.imageUrl);
      setVariations(data.variations || []);
      setStatus("Flyer generated.");
    } catch (error) {
      console.error(error);
      setStatus("");
      alert(
        error instanceof Error
          ? error.message
          : "The flyer could not be generated.",
      );
    } finally {
      setIsGenerating(false);
      window.setTimeout(() => setStatus(""), 2500);
    }
  }

  async function downloadCanvas() {
    if (!canvasRef.current) return;
    const dataUrl = await toPng(canvasRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#000000",
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${eventTitle || "outsidecrowd-flyer"}.png`;
    link.click();
  }

  function calculateSnappedPosition(
    moving: CanvasElement,
    proposedX: number,
    proposedY: number,
  ) {
    const candidate = { ...moving, x: proposedX, y: proposedY };
    const candidateAnchors = getElementAnchors(candidate);
    const xTargets = [0, CANVAS_WIDTH / 2, CANVAS_WIDTH];
    const yTargets = [0, canvasHeight / 2, canvasHeight];

    elements
      .filter((element) => element.id !== moving.id && !element.hidden)
      .forEach((element) => {
        const anchors = getElementAnchors(element);
        xTargets.push(anchors.left, anchors.centerX, anchors.right);
        yTargets.push(anchors.top, anchors.centerY, anchors.bottom);
      });

    let nextX = proposedX;
    let nextY = proposedY;
    let bestXDistance = SNAP_THRESHOLD + 1;
    let bestYDistance = SNAP_THRESHOLD + 1;
    let xGuide: Guide | null = null;
    let yGuide: Guide | null = null;

    const xCandidates = [
      { value: candidateAnchors.left, offset: 0 },
      { value: candidateAnchors.centerX, offset: moving.width / 2 },
      { value: candidateAnchors.right, offset: moving.width },
    ];
    const yCandidates = [
      { value: candidateAnchors.top, offset: 0 },
      { value: candidateAnchors.centerY, offset: moving.height / 2 },
      { value: candidateAnchors.bottom, offset: moving.height },
    ];

    xTargets.forEach((target) => {
      xCandidates.forEach((anchor) => {
        const distance = Math.abs(anchor.value - target);
        if (distance < bestXDistance && distance <= SNAP_THRESHOLD) {
          bestXDistance = distance;
          nextX = target - anchor.offset;
          xGuide = { axis: "x", position: target };
        }
      });
    });

    yTargets.forEach((target) => {
      yCandidates.forEach((anchor) => {
        const distance = Math.abs(anchor.value - target);
        if (distance < bestYDistance && distance <= SNAP_THRESHOLD) {
          bestYDistance = distance;
          nextY = target - anchor.offset;
          yGuide = { axis: "y", position: target };
        }
      });
    });

    const nextGuides: Guide[] = [];
    if (xGuide) nextGuides.push(xGuide);
    if (yGuide) nextGuides.push(yGuide);

    return {
      x: Math.max(0, Math.min(CANVAS_WIDTH - moving.width, nextX)),
      y: Math.max(0, Math.min(canvasHeight - moving.height, nextY)),
      guides: nextGuides,
    };
  }

  function beginDrag(
    event: React.PointerEvent<HTMLDivElement>,
    element: CanvasElement,
  ) {
    if (element.locked || editingElementId === element.id) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedElementId(element.id);
    interactionRef.current = {
      mode: "drag",
      elementId: element.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startElement: { ...element },
      startSnapshot: cloneElements(elements),
    };
  }

  function beginResize(
    event: React.PointerEvent<HTMLButtonElement>,
    element: CanvasElement,
    handle: ResizeHandle,
  ) {
    if (element.locked) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedElementId(element.id);
    interactionRef.current = {
      mode: "resize",
      elementId: element.id,
      handle,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startElement: { ...element },
      startSnapshot: cloneElements(elements),
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const interaction = interactionRef.current;
    if (!interaction) return;

    const dx = (event.clientX - interaction.startClientX) / canvasScale;
    const dy = (event.clientY - interaction.startClientY) / canvasScale;
    const start = interaction.startElement;

    if (interaction.mode === "drag") {
      const snapped = calculateSnappedPosition(
        start,
        start.x + dx,
        start.y + dy,
      );
      setGuides(snapped.guides);
      updateElement(
        interaction.elementId,
        { x: snapped.x, y: snapped.y },
        false,
      );
      return;
    }

    let x = start.x;
    let y = start.y;
    let width = start.width;
    let height = start.height;
    const { handle } = interaction;

    if (handle.includes("e")) width = Math.max(MIN_WIDTH, start.width + dx);
    if (handle.includes("s")) height = Math.max(MIN_HEIGHT, start.height + dy);
    if (handle.includes("w")) {
      width = Math.max(MIN_WIDTH, start.width - dx);
      x = start.x + (start.width - width);
    }
    if (handle.includes("n")) {
      height = Math.max(MIN_HEIGHT, start.height - dy);
      y = start.y + (start.height - height);
    }

    x = Math.max(0, x);
    y = Math.max(0, y);
    width = Math.min(width, CANVAS_WIDTH - x);
    height = Math.min(height, canvasHeight - y);
    updateElement(interaction.elementId, { x, y, width, height }, false);
  }

  function finishInteraction() {
    const interaction = interactionRef.current;
    if (!interaction) return;
    interactionRef.current = null;
    setGuides([]);

    setElements((current) => {
      if (!snapshotsEqual(interaction.startSnapshot, current)) {
        pastRef.current.push(cloneElements(interaction.startSnapshot));
        if (pastRef.current.length > HISTORY_LIMIT) pastRef.current.shift();
        futureRef.current = [];
        setHistoryVersion((value) => value + 1);
      }
      return current;
    });
  }

  function startInlineEditing(
    event: React.MouseEvent<HTMLDivElement>,
    element: CanvasElement,
  ) {
    if (element.locked || element.kind !== "text") return;
    event.stopPropagation();
    editingStartRef.current = cloneElements(elements);
    setSelectedElementId(element.id);
    setEditingElementId(element.id);

    window.setTimeout(() => {
      const editable = document.querySelector<HTMLElement>(
        `[data-editable-id="${element.id}"]`,
      );
      editable?.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      if (editable && selection) {
        range.selectNodeContents(editable);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }, 0);
  }

  function finishInlineEditing() {
    const startSnapshot = editingStartRef.current;
    editingStartRef.current = null;
    setEditingElementId(null);
    if (!startSnapshot) return;

    setElements((current) => {
      if (!snapshotsEqual(startSnapshot, current)) {
        pastRef.current.push(cloneElements(startSnapshot));
        if (pastRef.current.length > HISTORY_LIMIT) pastRef.current.shift();
        futureRef.current = [];
        setHistoryVersion((value) => value + 1);
      }
      return current;
    });
  }

  function duplicateSelected() {
    if (!selectedElement) return;
    const id = `${selectedElement.id}-${Date.now()}`;
    commitElements((current) => [
      ...current,
      {
        ...selectedElement,
        id,
        name: `${selectedElement.name} copy`,
        x: Math.min(
          CANVAS_WIDTH - selectedElement.width,
          selectedElement.x + 18,
        ),
        y: Math.min(
          canvasHeight - selectedElement.height,
          selectedElement.y + 18,
        ),
      },
    ]);
    setSelectedElementId(id);
  }

  function moveLayer(direction: "up" | "down") {
    if (!selectedElementId) return;
    commitElements((current) => {
      const index = current.findIndex(
        (element) => element.id === selectedElementId,
      );
      if (index < 0) return current;
      const nextIndex =
        direction === "up"
          ? Math.min(current.length - 1, index + 1)
          : Math.max(0, index - 1);
      if (nextIndex === index) return current;
      const next = cloneElements(current);
      const [element] = next.splice(index, 1);
      next.splice(nextIndex, 0, element);
      return next;
    });
  }

  function deleteSelected() {
    if (!selectedElementId) return;
    commitElements((current) =>
      current.filter((element) => element.id !== selectedElementId),
    );
    setSelectedElementId("");
  }

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <header className="flex min-h-16 items-center justify-between border-b border-white/10 bg-[#181818] px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/host/flyer-studio"
            className="rounded-lg px-3 py-2 text-sm font-bold text-white/60 hover:bg-white/10 hover:text-white"
          >
            ← Back
          </Link>
          <div>
            <p className="text-sm font-black">OutsideCrowd Studio</p>
            <p className="text-xs text-white/35">Canva-style editor V2</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold hover:bg-white/10 disabled:opacity-30"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold hover:bg-white/10 disabled:opacity-30"
          >
            Redo
          </button>
          <button
            type="button"
            onClick={downloadCanvas}
            className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-black hover:bg-violet-500"
          >
            Download
          </button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-64px)] grid-cols-[76px_300px_minmax(0,1fr)_290px]">
        <aside className="border-r border-white/10 bg-[#171717] py-3">
          <div className="space-y-2 px-2">
            {sidebarTools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveTool(tool.id)}
                className={`flex w-full flex-col items-center gap-1 rounded-xl px-1 py-3 text-[10px] font-bold transition ${
                  activeTool === tool.id
                    ? "bg-violet-600 text-white"
                    : "text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-xl">{tool.icon}</span>
                {tool.label}
              </button>
            ))}
          </div>
        </aside>

        <aside className="overflow-y-auto border-r border-white/10 bg-[#202020] p-4">
          {activeTool === "templates" && (
            <ToolPanel title="Templates">
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="overflow-hidden rounded-xl border border-white/10 bg-black/30 text-left hover:border-violet-400/50"
                  >
                    <div className="aspect-[4/5] bg-gradient-to-br from-violet-700/50 via-black to-orange-500/30 p-3">
                      <p className="text-xs font-black">{template.name}</p>
                    </div>
                    <p className="p-2 text-[11px] font-bold text-white/60">
                      Use template
                    </p>
                  </button>
                ))}
              </div>
            </ToolPanel>
          )}

          {activeTool === "uploads" && (
            <ToolPanel title="Uploads">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 p-7 text-center hover:border-violet-400/50">
                <span className="text-2xl">↑</span>
                <span className="mt-2 text-sm font-black">Upload media</span>
                <span className="mt-1 text-xs text-white/40">
                  JPG, PNG or WebP
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setImagePreview(URL.createObjectURL(file));
                  }}
                />
              </label>
            </ToolPanel>
          )}

          {activeTool === "ai" && (
            <ToolPanel title="AI Image Generator">
              <label className="text-xs font-bold text-white/50">
                Select event
              </label>
              <select
                value={selectedEventId}
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedEventId(value);
                  const nextEvent = events?.find((item) => item._id === value);
                  commitElements((current) =>
                    current.map((element) => {
                      if (element.id === "headline" && nextEvent?.name) {
                        return {
                          ...element,
                          text: String(nextEvent.name).toUpperCase(),
                        };
                      }
                      if (
                        element.id === "venue" &&
                        (nextEvent?.venue || nextEvent?.city)
                      ) {
                        return {
                          ...element,
                          text: String(
                            nextEvent.venue || nextEvent.city,
                          ).toUpperCase(),
                        };
                      }
                      return element;
                    }),
                  );
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm outline-none"
              >
                <option value="">No event selected</option>
                {(events || []).map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.name || "Untitled Event"}
                  </option>
                ))}
              </select>

              <label className="mt-5 block text-xs font-bold text-white/50">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Describe the flyer background and atmosphere..."
                className="mt-2 min-h-36 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm outline-none focus:border-violet-400"
              />

              <label className="mt-5 block text-xs font-bold text-white/50">
                Style
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {styleOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setStyle(option);
                      updateElement("style", { text: option.toUpperCase() });
                    }}
                    className={`rounded-full border px-3 py-2 text-xs font-bold ${style === option ? "border-violet-400 bg-violet-500/20" : "border-white/10 bg-white/5 text-white/55"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={generateFlyer}
                disabled={isGenerating}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-600 to-orange-500 px-4 py-3 text-sm font-black disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Generate Image"}
              </button>
              {status && (
                <p className="mt-3 text-center text-xs font-bold text-white/50">
                  {status}
                </p>
              )}
            </ToolPanel>
          )}

          {activeTool === "text" && (
            <ToolPanel title="Text">
              <div className="space-y-3">
                {(["heading", "subheading", "body"] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => addTextElement(kind)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10"
                  >
                    <span
                      className={`block font-black ${kind === "heading" ? "text-2xl" : kind === "subheading" ? "text-lg" : "text-sm"}`}
                    >
                      Add {kind}
                    </span>
                  </button>
                ))}
              </div>
            </ToolPanel>
          )}

          {activeTool === "elements" && (
            <ToolPanel title="Layers">
              <div className="space-y-2">
                {[...elements].reverse().map((element) => (
                  <button
                    key={element.id}
                    type="button"
                    onClick={() => setSelectedElementId(element.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${selectedElementId === element.id ? "border-violet-400 bg-violet-500/15" : "border-white/10 bg-white/5"}`}
                  >
                    <span className="flex-1 truncate text-sm font-bold">
                      {element.name}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        updateElement(element.id, { hidden: !element.hidden });
                      }}
                      className="rounded px-2 py-1 text-xs text-white/50 hover:bg-white/10"
                    >
                      {element.hidden ? "Show" : "Hide"}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        updateElement(element.id, { locked: !element.locked });
                      }}
                      className="rounded px-2 py-1 text-xs text-white/50 hover:bg-white/10"
                    >
                      {element.locked ? "Unlock" : "Lock"}
                    </span>
                  </button>
                ))}
              </div>
            </ToolPanel>
          )}

          {activeTool === "brand" && (
            <ToolPanel title="Brand Kit">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-black">OutsideCrowd</p>
                <p className="mt-1 text-xs text-white/40">
                  Brand presets can be connected here next.
                </p>
              </div>
            </ToolPanel>
          )}

          {activeTool === "background" && (
            <ToolPanel title="Background">
              <label className="text-xs font-bold text-white/50">
                Overlay strength
              </label>
              <input
                type="range"
                min={0}
                max={90}
                value={overlayStrength}
                onChange={(event) =>
                  setOverlayStrength(Number(event.target.value))
                }
                className="mt-3 w-full"
              />
              <div className="mt-4 grid grid-cols-3 gap-2">
                {variations.map((variation) => (
                  <button
                    key={variation.id}
                    type="button"
                    onClick={() => setImagePreview(variation.imageUrl)}
                    className="aspect-square overflow-hidden rounded-lg border border-white/10"
                  >
                    <img
                      src={variation.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </ToolPanel>
          )}
        </aside>

        <section className="relative flex min-w-0 flex-col bg-[#ececef] text-black">
          <div className="flex min-h-[56px] items-center justify-between border-b border-black/10 bg-white px-4">
            <div className="flex items-center gap-2">
              {formats.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormat(item.id)}
                  className={`rounded-lg px-3 py-2 text-xs font-black ${format === item.id ? "bg-black text-white" : "bg-black/5 text-black/55"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((value) => Math.max(40, value - 5))}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm font-black"
              >
                −
              </button>
              <span className="min-w-12 text-center text-xs font-black">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((value) => Math.min(120, value + 5))}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm font-black"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-1 items-start justify-center overflow-auto p-12">
            <div
              className="relative shrink-0"
              style={{
                width: CANVAS_WIDTH * canvasScale,
                height: canvasHeight * canvasScale,
              }}
            >
              <div
                ref={canvasRef}
                className="absolute left-0 top-0 origin-top-left overflow-hidden bg-black shadow-2xl"
                style={{
                  width: CANVAS_WIDTH,
                  height: canvasHeight,
                  transform: `scale(${canvasScale})`,
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={finishInteraction}
                onPointerCancel={finishInteraction}
                onPointerDown={(event) => {
                  if (event.target === event.currentTarget) {
                    setSelectedElementId("");
                    setEditingElementId(null);
                  }
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt=""
                    draggable={false}
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,.9),transparent_35%),radial-gradient(circle_at_85%_85%,rgba(249,115,22,.7),transparent_40%),linear-gradient(145deg,#111,#26113e_55%,#190b10)]" />
                )}
                <div
                  className="pointer-events-none absolute inset-0 bg-black"
                  style={{ opacity: overlayStrength / 100 }}
                />

                {elements.map((element) => {
                  if (element.hidden) return null;
                  const isSelected = selectedElementId === element.id;
                  const isEditing = editingElementId === element.id;

                  return (
                    <div
                      key={element.id}
                      className={`absolute select-none ${element.locked ? "cursor-default" : isEditing ? "cursor-text" : "cursor-move"}`}
                      style={{
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                      }}
                      onPointerDown={(event) => beginDrag(event, element)}
                      onDoubleClick={(event) =>
                        startInlineEditing(event, element)
                      }
                    >
                      <div
                        data-editable-id={element.id}
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        onInput={(event) =>
                          updateElement(
                            element.id,
                            { text: event.currentTarget.textContent || "" },
                            false,
                          )
                        }
                        onBlur={finishInlineEditing}
                        onKeyDown={(event) => {
                          event.stopPropagation();
                          if (event.key === "Escape") {
                            event.preventDefault();
                            finishInlineEditing();
                          }
                        }}
                        className="flex h-full w-full items-center whitespace-pre-wrap break-words outline-none"
                        style={{
                          justifyContent:
                            element.align === "left"
                              ? "flex-start"
                              : element.align === "right"
                                ? "flex-end"
                                : "center",
                          textAlign: element.align,
                          fontSize: element.fontSize,
                          fontWeight: element.fontWeight,
                          color: element.color,
                          letterSpacing: element.letterSpacing,
                          textTransform: element.uppercase
                            ? "uppercase"
                            : "none",
                          borderRadius: element.borderRadius,
                          background:
                            element.kind === "button"
                              ? element.background
                              : undefined,
                          padding:
                            element.kind === "button" ? "0 16px" : undefined,
                          lineHeight: element.kind === "button" ? 1 : 1.05,
                        }}
                      >
                        {element.text}
                      </div>

                      {isSelected && !isEditing && (
                        <>
                          <div className="pointer-events-none absolute inset-0 border-2 border-violet-500" />
                          <div className="pointer-events-none absolute -top-7 left-0 rounded bg-violet-600 px-2 py-1 text-[10px] font-black text-white">
                            {Math.round(element.width)} ×{" "}
                            {Math.round(element.height)}
                          </div>
                          {!element.locked &&
                            resizeHandles.map((handle) => (
                              <button
                                key={handle}
                                type="button"
                                aria-label={`Resize ${handle}`}
                                onPointerDown={(event) =>
                                  beginResize(event, element, handle)
                                }
                                className={`absolute z-20 h-3 w-3 rounded-full border-2 border-white bg-violet-600 ${resizeHandleClass(handle)}`}
                              />
                            ))}
                        </>
                      )}
                    </div>
                  );
                })}

                {guides.map((guide, index) => (
                  <div
                    key={`${guide.axis}-${guide.position}-${index}`}
                    className={`pointer-events-none absolute z-[999] bg-cyan-400 ${guide.axis === "x" ? "bottom-0 top-0 w-px" : "left-0 right-0 h-px"}`}
                    style={
                      guide.axis === "x"
                        ? { left: guide.position }
                        : { top: guide.position }
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="overflow-y-auto border-l border-white/10 bg-[#1b1b1b] p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
            Properties
          </p>

          {selectedElement ? (
            <div className="mt-4 space-y-5">
              <div>
                <label className="text-xs font-bold text-white/50">Text</label>
                <textarea
                  value={selectedElement.text}
                  onChange={(event) =>
                    updateElement(selectedElement.id, {
                      text: event.target.value,
                    })
                  }
                  className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-bold text-white/50">
                  Width
                  <input
                    type="number"
                    value={Math.round(selectedElement.width)}
                    onChange={(event) =>
                      updateElement(selectedElement.id, {
                        width: Math.max(MIN_WIDTH, Number(event.target.value)),
                      })
                    }
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-2 text-white"
                  />
                </label>
                <label className="text-xs font-bold text-white/50">
                  Height
                  <input
                    type="number"
                    value={Math.round(selectedElement.height)}
                    onChange={(event) =>
                      updateElement(selectedElement.id, {
                        height: Math.max(
                          MIN_HEIGHT,
                          Number(event.target.value),
                        ),
                      })
                    }
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-2 text-white"
                  />
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-white/50">
                  Font size
                </label>
                <input
                  type="range"
                  min={8}
                  max={120}
                  value={selectedElement.fontSize}
                  onChange={(event) =>
                    updateElement(selectedElement.id, {
                      fontSize: Number(event.target.value),
                    })
                  }
                  className="mt-2 w-full"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(["left", "center", "right"] as TextAlign[]).map(
                  (alignment) => (
                    <button
                      key={alignment}
                      type="button"
                      onClick={() =>
                        updateElement(selectedElement.id, { align: alignment })
                      }
                      className={`rounded-lg border px-2 py-2 text-xs font-black ${selectedElement.align === alignment ? "border-violet-400 bg-violet-500/20" : "border-white/10 bg-white/5"}`}
                    >
                      {alignment}
                    </button>
                  ),
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateElement(selectedElement.id, {
                      fontWeight: selectedElement.fontWeight >= 700 ? 400 : 900,
                    })
                  }
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-black"
                >
                  Bold
                </button>
                <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-black">
                  Color
                  <input
                    type="color"
                    value={selectedElement.color}
                    onChange={(event) =>
                      updateElement(selectedElement.id, {
                        color: event.target.value,
                      })
                    }
                    className="h-5 w-5"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => moveLayer("up")}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-black"
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => moveLayer("down")}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-black"
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={duplicateSelected}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-black"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateElement(selectedElement.id, {
                      locked: !selectedElement.locked,
                    })
                  }
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-black"
                >
                  {selectedElement.locked ? "Unlock" : "Lock"}
                </button>
              </div>

              <button
                type="button"
                onClick={deleteSelected}
                className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-300"
              >
                Delete element
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-white/35">
              Select an element on the canvas to edit its properties.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
