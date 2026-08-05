import type { ReactNode } from "react";
import OrganizerAccessGate from "@/components/OrganizerAccessGate";

export default function AddMerchLayout({ children }: { children: ReactNode }) {
  return <OrganizerAccessGate>{children}</OrganizerAccessGate>;
}
