import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "./ConvexClientProvider";
import SyncUserWithConvex from "@/components/SyncUserWithConvex";
import "./globals.css";

export const metadata: Metadata = {
  title: "Outside Crowd",
  description: "Event marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <a className="skip-link" href="#main-content">
            Skip to main content
          </a>
          <ConvexClientProvider>
            <SyncUserWithConvex />
            <div id="main-content" tabIndex={-1}>
              {children}
            </div>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
