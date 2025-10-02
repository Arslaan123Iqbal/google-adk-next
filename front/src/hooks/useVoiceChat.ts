"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "model";
  text?: string;
  hasAudio?: boolean;
};

export type UseVoiceChatOptions = {
  isAudioDefault?: boolean;
  sessionId?: string;
};

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToArray(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes.buffer;
}

export function useVoiceChat(opts: UseVoiceChatOptions = {}) {
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isAudio, setIsAudio] = useState(!!opts.isAudioDefault);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [wsEnabled, setWsEnabled] = useState<boolean>(!!opts.isAudioDefault);

  const websocketRef = useRef<WebSocket | null>(null);

  // Audio contexts/nodes
  const playerCtxRef = useRef<AudioContext | null>(null);
  const playerNodeRef = useRef<AudioWorkletNode | null>(null);

  const recCtxRef = useRef<AudioContext | null>(null);
  const recNodeRef = useRef<AudioWorkletNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const recordingRef = useRef(false);

  // Current assembling model message id during a turn
  const currentModelMsgIdRef = useRef<string | null>(null);

  const sessionId = useMemo(
    () => opts.sessionId || Math.random().toString(36).slice(2),
    [opts.sessionId]
  );

  const wsUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const host =
    'localhost:8000'?.replace(/\/$/, "") || window.location.host;
    const scheme = host.startsWith("http")
      ? host.startsWith("https")
        ? "wss"
        : "ws"
      : window.location.protocol === "https:" ? "wss" : "ws";
    const bareHost = host.replace(/^https?:\/\//, "");
    return `${scheme}://${bareHost}/ws/${sessionId}?is_audio=${isAudio}`;
  }, [isAudio, sessionId]);

  // Connect websocket
  const connect = useCallback(() => {
    if (!wsUrl) return;
    console.log("[useVoiceChat] Connecting to WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);
    websocketRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onclose = () => {
      setConnected(false);
      setTyping(false);
      // try to reconnect after 5s
      setTimeout(() => {
        if (websocketRef.current === ws && wsEnabled) connect();
      }, 5000);
    };

    ws.onerror = (err) => {
      console.error("[useVoiceChat] WebSocket error:", err);
      setConnected(false);
    };

    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);

      // typing indicator for streaming chunks
      if (!msg.turn_complete && (msg.mime_type === "text/plain" || msg.mime_type === "audio/pcm")) {
        setTyping(true);
      }

      // turn complete
      if (msg.turn_complete) {
        currentModelMsgIdRef.current = null;
        setTyping(false);
        return;
      }

      // audio
      if (msg.mime_type === "audio/pcm" && playerNodeRef.current) {
        playerNodeRef.current.port.postMessage(base64ToArray(msg.data));
        // mark the current model message as having audio
        const id = currentModelMsgIdRef.current;
        if (id) {
          setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, hasAudio: true } : m)));
        }
        return;
      }

      // text streaming
      if (msg.mime_type === "text/plain") {
        setTyping(false);
        const role: "model" | "user" = msg.role || "model";
        if (role === "model") {
          // append into current model message or create a new one
          let id = currentModelMsgIdRef.current;
          if (id) {
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, text: (m.text || "") + msg.data } : m))
            );
          } else {
            const newId: string = Math.random().toString(36).slice(2);
            currentModelMsgIdRef.current = newId;
            setMessages((prev) => [
              ...prev,
              { id: newId, role: "model", text: msg.data, hasAudio: isAudio || false },
            ]);
          }
        } else {
          // user echo (rare from server), but handle generically
          setMessages((prev) => [
            ...prev,
            { id: Math.random().toString(36).slice(2), role: "user", text: msg.data },
          ]);
        }
      }
    };
  }, [wsUrl, isAudio]);

  // Connect only when wsEnabled
  useEffect(() => {
    if (!wsEnabled) {
      // ensure closed when not enabled
      const ws = websocketRef.current;
      if (ws) {
        ws.onopen = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        try { ws.close(); } catch {}
        websocketRef.current = null;
      }
      return;
    }

    connect();
    return () => {
      const ws = websocketRef.current;
      if (ws) {
        ws.onopen = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        try { ws.close(); } catch {}
      }
    };
  }, [connect, wsEnabled]);

  // Send helpers
  const sendJson = useCallback((payload: any) => {
    const ws = websocketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
  }, []);

  const sendText = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), role: "user", text },
    ]);
    setTyping(true);
    sendJson({ mime_type: "text/plain", data: text, role: "user" });
  }, [sendJson]);

  // Audio: start
  const startVoice = useCallback(async () => {
    // enable ws and audio responses
    setWsEnabled(true);
    // player first (24k)
    const playerCtx = new AudioContext({ sampleRate: 24000 });
    await playerCtx.audioWorklet.addModule("/worklets/pcm-player-processor.js");
    const playerNode = new AudioWorkletNode(playerCtx, "pcm-player-processor");
    playerNode.connect(playerCtx.destination);
    playerCtxRef.current = playerCtx;
    playerNodeRef.current = playerNode;

    // recorder (16k)
    const recCtx = new AudioContext({ sampleRate: 16000 });
    await recCtx.audioWorklet.addModule("/worklets/pcm-recorder-processor.js");
    const recNode = new AudioWorkletNode(recCtx, "pcm-recorder-processor");

    const micStream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
    const source = recCtx.createMediaStreamSource(micStream);
    source.connect(recNode);
    recNode.port.onmessage = (event) => {
      if (!recordingRef.current) return;
      const pcmData = convertFloat32ToPCM(event.data as Float32Array);
      sendJson({ mime_type: "audio/pcm", data: arrayBufferToBase64(pcmData) });
    };

    recCtxRef.current = recCtx;
    recNodeRef.current = recNode;
    micStreamRef.current = micStream;
    recordingRef.current = true;

    // toggle audio mode and reconnect ws to include is_audio=true
    setIsAudio(true);
  }, [sendJson]);

  // Audio: stop
  const stopVoice = useCallback(async () => {
    recordingRef.current = false;

    // disconnect recorder
    const recNode = recNodeRef.current;
    if (recNode) {
      try { recNode.disconnect(); } catch {}
      recNodeRef.current = null;
    }
    const recCtx = recCtxRef.current;
    if (recCtx) {
      try { await recCtx.close(); } catch {}
      recCtxRef.current = null;
    }
    const stream = micStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }

    // disconnect player
    const playerNode = playerNodeRef.current;
    if (playerNode) {
      try { playerNode.disconnect(); } catch {}
      playerNodeRef.current = null;
    }
    const playerCtx = playerCtxRef.current;
    if (playerCtx) {
      try { await playerCtx.close(); } catch {}
      playerCtxRef.current = null;
    }

    setIsAudio(false);
    // disable ws and close it
    setWsEnabled(false);
    const ws = websocketRef.current;
    if (ws) {
      try { ws.close(); } catch {}
      websocketRef.current = null;
    }
  }, []);

  return {
    connected,
    typing,
    isAudio,
    messages,
    sendText,
    startVoice,
    stopVoice,
  };
}

// Convert Float32 samples to 16-bit PCM ArrayBuffer
function convertFloat32ToPCM(inputData: Float32Array): ArrayBuffer {
  const pcm16 = new Int16Array(inputData.length);
  for (let i = 0; i < inputData.length; i++) {
    pcm16[i] = Math.max(-32768, Math.min(32767, Math.round(inputData[i] * 0x7fff)));
  }
  return pcm16.buffer;
}
