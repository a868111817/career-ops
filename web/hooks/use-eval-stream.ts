"use client";

import { useState } from "react";

type StreamSection = {
  key: string;
  title: string;
  content: string;
};

type StreamStatus = "idle" | "running" | "completed" | "error";

type StartEvent = {
  model: string;
  hasProfile: boolean;
};

function parseEventChunk(chunk: string) {
  const eventMatch = chunk.match(/^event:\s*(.+)$/m);
  const dataMatch = chunk.match(/^data:\s*(.+)$/m);

  if (!eventMatch || !dataMatch) {
    return null;
  }

  return {
    event: eventMatch[1].trim(),
    data: JSON.parse(dataMatch[1]),
  };
}

export function useEvalStream() {
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [text, setText] = useState("");
  const [sections, setSections] = useState<StreamSection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [startEvent, setStartEvent] = useState<StartEvent | null>(null);

  const runEvaluation = async (input: { jobDescription: string; sourceUrl?: string }) => {
    setStatus("running");
    setText("");
    setSections([]);
    setError(null);
    setStartEvent(null);

    const response = await fetch("/api/evaluate/stream", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok || !response.body) {
      setStatus("error");
      setError("Unable to start evaluation stream.");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() ?? "";

      for (const chunk of chunks) {
        const parsed = parseEventChunk(chunk);

        if (!parsed) {
          continue;
        }

        if (parsed.event === "start") {
          setStartEvent(parsed.data);
        }

        if (parsed.event === "text_delta") {
          setText((current) => current + parsed.data.textDelta);
        }

        if (parsed.event === "section_complete") {
          setSections((current) => [...current, parsed.data]);
        }

        if (parsed.event === "error") {
          setStatus("error");
          setError(parsed.data.message);
        }

        if (parsed.event === "complete") {
          setText(parsed.data.fullText);
          setStatus("completed");
        }
      }
    }

    setStatus((current) => (current === "error" ? current : "completed"));
  };

  return {
    status,
    text,
    sections,
    error,
    startEvent,
    runEvaluation,
  };
}
