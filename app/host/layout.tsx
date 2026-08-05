import type { ReactNode } from "react";
import OrganizerShell from "@/components/host/OrganizerShell";
import OrganizerAccessGate from "@/components/OrganizerAccessGate";

export default function HostLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <OrganizerAccessGate>
      <OrganizerShell>{children}</OrganizerShell>
    </OrganizerAccessGate>
  );
}
