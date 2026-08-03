export type SidebarTool =
  | "templates"
  | "uploads"
  | "ai"
  | "text"
  | "brand"
  | "elements"
  | "background";

export type TextAlign = "left" | "center" | "right";
export type ElementKind = "text" | "button";
export type ResizeHandle =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w";

export type CanvasElement = {
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

export type Guide = {
  axis: "x" | "y";
  position: number;
};

export type Interaction =
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
