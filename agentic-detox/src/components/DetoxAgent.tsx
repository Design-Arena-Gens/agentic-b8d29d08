'use client';

import { useCallback, useMemo, useState } from "react";
import { detoxDocument, type DetoxReport } from "@/lib/detoxAgent";

type AsyncStatus = "idle" | "loading" | "complete" | "error";

export default function DetoxAgent() {
  const [documentText, setDocumentText] = useState("");
  const [report, setReport] = useState<DetoxReport | null>(null);
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState("");

  const flaggedCount = report?.flagged.length ?? 0;

  const handleAnalyze = useCallback(async () => {
    if (!documentText.trim()) {
      setErrorMessage("Paste or write a document before running the agent.");
      setReport(null);
      setStatus("idle");
      return;
    }

    setErrorMessage(null);
    setStatus("loading");
    setCopyFeedback("");

    try {
      const result = await detoxDocument(documentText);
      setReport(result);
      setStatus("complete");
    } catch (error) {
      console.error(error);
      setErrorMessage("The detox agent hit an unexpected issue. Try again.");
      setStatus("error");
    }
  }, [documentText]);

  const handleReset = useCallback(() => {
    setDocumentText("");
    setReport(null);
    setStatus("idle");
    setErrorMessage(null);
    setCopyFeedback("");
  }, []);

  const handleCopy = useCallback(async () => {
    if (!report?.sanitizedDocument) {
      return;
    }

    try {
      await navigator.clipboard.writeText(report.sanitizedDocument);
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch (error) {
      console.error(error);
      setCopyFeedback("Clipboard unavailable");
      setTimeout(() => setCopyFeedback(""), 2000);
    }
  }, [report]);

  const statusLabel = useMemo(() => {
    switch (status) {
      case "loading":
        return "Detoxing…";
      case "complete":
        return flaggedCount > 0
          ? `Detox complete · ${flaggedCount} toxic segment${
              flaggedCount === 1 ? "" : "s"
            } softened`
          : "Detox complete · No toxicity detected";
      case "error":
        return "Could not detox document";
      case "idle":
      default:
        return "Ready";
    }
  }, [status, flaggedCount]);

  return (
    <div className="w-full max-w-5xl space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-300">
          Detox Agent
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Transform toxic documents into respectful communication
        </h1>
        <p className="max-w-2xl text-lg text-slate-200 sm:text-xl">
          Paste any message, policy, or user-generated content. The agent
          analyzes it for toxicity, softens charged statements, and gives you a
          sanitized version ready to share.
        </p>
      </header>

      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-3">
          <label
            htmlFor="document-input"
            className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300"
          >
            Input document
          </label>
          <textarea
            id="document-input"
            spellCheck={true}
            value={documentText}
            onChange={(event) => setDocumentText(event.target.value)}
            placeholder="Paste the document you want to detox..."
            className="min-h-[220px] w-full resize-y rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-4 text-base text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleAnalyze}
            className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Running agent…" : "Run detox agent"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
            disabled={status === "loading"}
          >
            Reset
          </button>
          <span
            aria-live="polite"
            className="text-sm font-medium text-slate-300/80"
          >
            {statusLabel}
          </span>
        </div>
        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {errorMessage}
          </p>
        ) : null}
      </section>

      {report ? (
        <section className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
                  Sanitized document
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Flagged statements have been softened or replaced with neutral
                  phrasing.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-full border border-emerald-400/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200 transition hover:border-emerald-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
              >
                Copy
              </button>
            </div>
            {copyFeedback ? (
              <p className="text-xs font-medium text-emerald-200">{copyFeedback}</p>
            ) : null}
            <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-5">
              <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-100">
                {report.sanitizedDocument || "No content generated."}
              </p>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
              Toxicity findings
            </p>
            {report.flagged.length === 0 ? (
              <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                No toxic language detected. Your document already looks great.
              </p>
            ) : (
              <ul className="space-y-4">
                {report.flagged.map((item) => (
                  <li
                    key={item.index}
                    className="space-y-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-amber-50"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                      Segment {item.index + 1}
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-amber-100">
                        Original:{" "}
                        <span className="font-normal text-amber-50/80">
                          {item.original}
                        </span>
                      </p>
                      <p className="font-medium text-emerald-200">
                        Detoxed:{" "}
                        <span className="font-normal text-slate-100">
                          {item.sanitized}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.categories.map((category) => (
                        <span
                          key={category.label}
                          className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100"
                        >
                          {category.label} ·{" "}
                          {(category.probability * 100).toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
