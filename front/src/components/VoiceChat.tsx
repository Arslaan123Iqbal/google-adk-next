"use client";

import { FormEvent, useState } from "react";
import { useVoiceChat } from "../hooks/useVoiceChat";

export default function VoiceChat() {
  const { connected, typing, isAudio, messages, sendText, startVoice, stopVoice } = useVoiceChat();
  const [input, setInput] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    sendText(v);
    setInput("");
  };

  return (
    <div className="w-full max-w-2xl gap-4 flex flex-col">
      <div className="flex items-center gap-2 text-sm">
        <span className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-400"}`} />
        <span>{connected ? "Connected" : "Disconnected"}</span>
        <div className="ml-auto flex items-center gap-2">
          {!isAudio ? (
            <button onClick={startVoice} className="px-3 py-1.5 rounded bg-black text-white text-sm">
              Enable Voice
            </button>
          ) : (
            <button onClick={stopVoice} className="px-3 py-1.5 rounded bg-gray-200 text-sm">
              Stop Voice
            </button>
          )}
        </div>
      </div>

      <div className="border rounded p-3 h-80 overflow-y-auto text-sm bg-white/50">
        {messages.map((m) => (
          <p key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <span className={`px-2 py-1 inline-block rounded ${m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
              {m.text}
              {m.role === "model" && m.hasAudio && (
                <span className="ml-1 align-middle" title="Audio">🔊</span>
              )}
            </span>
          </p>
        ))}
        {typing && (
          <p className="text-left">
            <span className="px-2 py-1 inline-block rounded bg-gray-100">Typing…</span>
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit" className="px-3 py-2 rounded bg-black text-white text-sm">
          Send
        </button>
      </form>
    </div>
  );
}
