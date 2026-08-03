"use client";

import { FormEvent, useState } from "react";
import {
  ArrowUp,
  Bot,
  CircleAlert,
  Lightbulb,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useEventCommandCenter } from "./EventCommandCenter";

type OrganizerAnswer = {
  title: string;
  answer: string;
  insights: string[];
  recommendedActions: string[];
  confidence: "high" | "medium" | "low";
  generatedAt: number;
  isLimited: boolean;
};

const starterQuestions = [
  "Which VIPs haven't checked in?",
  "Forecast attendance for this event.",
  "What ticket pricing would you recommend?",
  "Summarize this event's performance.",
  "Write a social post using current event facts.",
  "Are there any attendance risks?",
];

export default function AiOrganizerWorkspace() {
  const { event, capabilities } = useEventCommandCenter();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<OrganizerAnswer | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const canViewReports = capabilities.includes("view_reports");

  async function askOrganizer(nextQuestion: string) {
    const trimmedQuestion = nextQuestion.trim();

    if (!trimmedQuestion || isLoading) return;

    setQuestion(trimmedQuestion);
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/organizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event._id, question: trimmedQuestion }),
      });
      const result = (await response.json()) as
        | OrganizerAnswer
        | { error?: string };

      if (!response.ok || !("answer" in result)) {
        throw new Error(
          "error" in result && result.error
            ? result.error
            : "AI Organizer is unavailable."
        );
      }

      setAnswer(result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "AI Organizer is unavailable."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void askOrganizer(question);
  }

  if (!canViewReports) {
    return (
      <section className="mx-auto max-w-2xl rounded-[1.75rem] border border-white/[0.08] bg-[#0c0b14]/90 p-7 text-center">
        <CircleAlert className="mx-auto h-8 w-8 text-orange-300" />
        <h2 className="mt-4 text-xl font-black">Report access required</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Ask an event owner or admin for report access to use AI Organizer.
        </p>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-10">
      <header>
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-400">
          Event copilot
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
          AI Organizer
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Ask grounded questions about {event.name}. Answers use the event data
          you already have permission to view.
        </p>
      </header>

      <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#0c0b14]/95 p-5 shadow-2xl shadow-black/20 sm:p-7">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-600/15 blur-[90px]" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-200">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black">What should we look at?</p>
              <p className="text-xs text-zinc-600">Live event context · read only</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {starterQuestions.map((starter) => (
              <button
                key={starter}
                type="button"
                disabled={isLoading}
                onClick={() => void askOrganizer(starter)}
                className="rounded-full border border-white/[0.09] bg-white/[0.035] px-3.5 py-2 text-left text-[11px] font-bold text-zinc-400 transition hover:border-orange-400/25 hover:text-white disabled:opacity-50"
              >
                {starter}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
            <label className="sr-only" htmlFor="organizer-question">
              Ask AI Organizer
            </label>
            <textarea
              id="organizer-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Ask about VIP arrivals, sales, pricing, risk, or promotion…"
              className="min-h-14 flex-1 resize-none rounded-2xl border border-white/[0.1] bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-400/35"
            />
            <button
              type="submit"
              disabled={isLoading || question.trim().length < 3}
              aria-label="Ask AI Organizer"
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-orange-500 text-white shadow-[0_0_28px_rgba(124,58,237,0.25)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </button>
          </form>

          {error ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-400/[0.07] px-4 py-3 text-xs leading-5 text-red-100/80">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              {error}
            </div>
          ) : null}
        </div>
      </section>

      {answer ? (
        <section className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <article className="rounded-[1.75rem] border border-white/[0.09] bg-white/[0.035] p-6 sm:p-7">
            <div className="flex items-center gap-2 text-orange-300">
              <Sparkles className="h-4 w-4" />
              <span className="text-[9px] font-black uppercase tracking-[0.18em]">
                AI brief · {answer.confidence} confidence
              </span>
            </div>
            <h3 className="mt-4 text-xl font-black">{answer.title}</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
              {answer.answer}
            </p>

            {answer.insights.length > 0 ? (
              <div className="mt-6 border-t border-white/[0.08] pt-5">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600">
                  Supporting signals
                </p>
                <ul className="mt-3 space-y-3">
                  {answer.insights.map((insight) => (
                    <li key={insight} className="flex gap-3 text-sm leading-6 text-zinc-400">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {answer.isLimited ? (
              <p className="mt-5 text-[11px] leading-5 text-amber-200/70">
                This high-volume event reached the reporting sample limit, so
                totals may be partial.
              </p>
            ) : null}
          </article>

          <aside className="rounded-[1.75rem] border border-orange-400/10 bg-orange-400/[0.045] p-6">
            <div className="flex items-center gap-2 text-orange-300">
              <Lightbulb className="h-4 w-4" />
              <h3 className="text-xs font-black uppercase tracking-[0.16em]">
                Recommended moves
              </h3>
            </div>
            {answer.recommendedActions.length > 0 ? (
              <ol className="mt-5 space-y-4">
                {answer.recommendedActions.map((action, index) => (
                  <li key={action} className="flex gap-3 text-sm leading-6 text-zinc-300">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-400/10 text-[10px] font-black text-orange-300">
                      {index + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm leading-6 text-zinc-500">
                No immediate action is needed from this brief.
              </p>
            )}
            <p className="mt-6 border-t border-orange-300/10 pt-4 text-[10px] leading-5 text-zinc-600">
              AI can make mistakes. Review recommendations before changing
              pricing, communications, or event operations.
            </p>
          </aside>
        </section>
      ) : null}
    </div>
  );
}
