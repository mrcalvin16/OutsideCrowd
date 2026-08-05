import type { ReactNode } from "react";
import OrganizerAccessGate from "@/components/OrganizerAccessGate";

export default function EditMerchLayout({ children }: { children: ReactNode }) {
  return <OrganizerAccessGate>{children}</OrganizerAccessGate>;
}
