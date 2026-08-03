import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-6 text-white">
      <section className="max-w-lg text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-violet-300">
          404 · Off the guest list
        </p>
        <h1 className="mt-4 text-4xl font-black">That page isn’t here.</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          The link may have expired or the page may have moved.
        </p>
        <Link
          href="/events"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-gradient-to-r from-violet-600 to-orange-500 px-6 text-sm font-black"
        >
          Explore events
        </Link>
      </section>
    </main>
  );
}
