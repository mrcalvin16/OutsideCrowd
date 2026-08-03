import type { CanvasElement, ResizeHandle } from "./types";

export function cloneElements(elements: CanvasElement[]) {
  return elements.map((element) => ({ ...element }));
}

export function snapshotsEqual(
  first: CanvasElement[],
  second: CanvasElement[]
) {
  return JSON.stringify(first) === JSON.stringify(second);
}

export function getElementAnchors(element: CanvasElement) {
  return {
    left: element.x,
    centerX: element.x + element.width / 2,
    right: element.x + element.width,
    top: element.y,
    centerY: element.y + element.height / 2,
    bottom: element.y + element.height,
  };
}

export function resizeHandleClass(handle: ResizeHandle) {
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
