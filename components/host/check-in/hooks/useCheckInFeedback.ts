"use client";

import { useEffect, useState } from "react";

type FeedbackStatus = "success" | "duplicate" | "error";

const SOUND_KEY = "outsidecrowd:check-in-sound";
const HAPTICS_KEY = "outsidecrowd:check-in-haptics";

export function useCheckInFeedback() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  useEffect(() => {
    setSoundEnabled(window.localStorage.getItem(SOUND_KEY) !== "off");
    setHapticsEnabled(
      window.localStorage.getItem(HAPTICS_KEY) !== "off"
    );
  }, []);

  function toggleSound() {
    setSoundEnabled((current) => {
      const next = !current;
      window.localStorage.setItem(SOUND_KEY, next ? "on" : "off");
      return next;
    });
  }

  function toggleHaptics() {
    setHapticsEnabled((current) => {
      const next = !current;
      window.localStorage.setItem(HAPTICS_KEY, next ? "on" : "off");
      return next;
    });
  }

  function playFeedback(status: FeedbackStatus) {
    if (hapticsEnabled && "vibrate" in navigator) {
      navigator.vibrate(
        status === "success"
          ? 80
          : status === "duplicate"
            ? [80, 60, 80]
            : [160, 80, 160]
      );
    }

    if (!soundEnabled) return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextClass) return;

      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;

      oscillator.type = status === "success" ? "sine" : "square";
      oscillator.frequency.setValueAtTime(
        status === "success" ? 880 : status === "duplicate" ? 440 : 220,
        now
      );
      if (status === "success") {
        oscillator.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
      }
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.2);
      oscillator.addEventListener("ended", () => void context.close());
    } catch {
      // Browsers can block audio until the first direct interaction.
    }
  }

  return {
    soundEnabled,
    hapticsEnabled,
    toggleSound,
    toggleHaptics,
    playFeedback,
  };
}
