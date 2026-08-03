"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("OutsideCrowd global error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-black px-6 text-white">
        <main className="max-w-lg text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-400">
            OutsideCrowd
          </p>
          <h1 className="mt-4 text-3xl font-black">
            The application needs a refresh.
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Try reloading the application. If the issue continues, share the
            incident code with support.
          </p>
          {error.digest ? (
            <p className="mt-4 font-mono text-[10px] text-zinc-700">
              Incident {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="mt-6 min-h-11 rounded-xl bg-white px-6 text-sm font-black text-black"
          >
            Reload application
          </button>
        </main>
      </body>
    </html>
  );
}
