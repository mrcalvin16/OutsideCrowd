"use client";

import { useEffect } from "react";

export default function ApplicationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("OutsideCrowd route error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-black px-6 text-white">
      <section className="max-w-lg rounded-[2rem] border border-white/10 bg-zinc-950 p-8 text-center shadow-2xl shadow-black/50">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-400">
          Something went wrong
        </p>
        <h1 className="mt-4 text-3xl font-black">We couldn’t load this page.</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Your data was not intentionally changed. Try the request again, or
          return to the dashboard if the problem continues.
        </p>
        {error.digest ? (
          <p className="mt-4 font-mono text-[10px] text-zinc-700">
            Incident {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mt-6 min-h-11 rounded-xl bg-gradient-to-r from-violet-600 to-orange-500 px-6 text-sm font-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
