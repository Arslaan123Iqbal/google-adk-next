"use client";

import Image from "next/image";
import VoiceChat from "@/components/VoiceChat";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={120}
          height={26}
          priority
        />
        <VoiceChat />
      </main>
      <footer className="row-start-3 text-xs text-gray-500">ADK Voice Agent Demo</footer>
    </div>
  );
}
