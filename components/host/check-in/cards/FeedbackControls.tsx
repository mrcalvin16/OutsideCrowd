"use client";

import { Smartphone, Volume2, VolumeX } from "lucide-react";

export default function FeedbackControls({
  soundEnabled,
  hapticsEnabled,
  onSoundToggle,
  onHapticsToggle,
}: {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onSoundToggle: () => void;
  onHapticsToggle: () => void;
}) {
  return (
    <div className="flex min-h-12 items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950 p-1.5">
      <button
        type="button"
        onClick={onSoundToggle}
        aria-pressed={soundEnabled}
        className={`flex min-h-9 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-[10px] font-black uppercase tracking-[0.12em] transition ${
          soundEnabled
            ? "bg-white/10 text-white"
            : "text-zinc-600 hover:text-zinc-300"
        }`}
      >
        {soundEnabled ? (
          <Volume2 className="h-3.5 w-3.5" />
        ) : (
          <VolumeX className="h-3.5 w-3.5" />
        )}
        Sound
      </button>
      <button
        type="button"
        onClick={onHapticsToggle}
        aria-pressed={hapticsEnabled}
        className={`flex min-h-9 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-[10px] font-black uppercase tracking-[0.12em] transition ${
          hapticsEnabled
            ? "bg-orange-400/10 text-orange-200"
            : "text-zinc-600 hover:text-zinc-300"
        }`}
      >
        <Smartphone className="h-3.5 w-3.5" />
        Haptics
      </button>
    </div>
  );
}
