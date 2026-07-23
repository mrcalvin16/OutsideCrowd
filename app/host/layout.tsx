import type { ReactNode } from "react";
import OrganizerShell from "@/components/host/OrganizerShell";

export default function HostLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <OrganizerShell>
      {children}
    </OrganizerShell>
  );
}
