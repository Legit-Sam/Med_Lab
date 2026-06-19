"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";

type Props = {
  text: string;
  language: Language;
  audioUrl?: string | null;
};

const LANG_CODES: Record<string, string> = {
  english: "en-NG",
  yoruba: "yo-NG",
  hausa: "ha-NG",
  igbo: "ig-NG",
};

export default function DemoTextToSpeech({ text, language, audioUrl }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    window.speechSynthesis.cancel();
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    audioRef.current = null;
    utteranceRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);

    return () => {
      window.speechSynthesis.cancel();
      audioRef.current?.pause();
    };
  }, [language, text]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setIsPaused(false);
    utteranceRef.current = null;
  }, []);

  const playBrowserSpeech = useCallback(() => {
    if (!("speechSynthesis" in window)) return;

    if (isPaused && utteranceRef.current) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const clean = text
      .replace(/\*\*/g, "").replace(/\*/g, "").replace(/#/g, "")
      .replace(/^[-\s•▸]+/gm, "").replace(/\n+/g, " ").replace(/\s+/g, " ").trim();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = LANG_CODES[language] || "en-NG";
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang === utterance.lang) || voices.find((v) => v.lang.startsWith("en")) || voices[0];
    if (match) utterance.voice = match;

    utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); };
    utterance.onend = () => { setIsPlaying(false); setIsPaused(false); utteranceRef.current = null; };
    utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); utteranceRef.current = null; };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, language, isPaused]);

  const playAudio = useCallback(() => {
    if (!audioUrl) { playBrowserSpeech(); return; }

    audioRef.current?.pause();
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.addEventListener("ended", () => { setIsPlaying(false); setIsPaused(false); });
    audio.addEventListener("error", () => { setIsPlaying(false); setIsPaused(false); playBrowserSpeech(); });
    audio.play();
    setIsPlaying(true);
    setIsPaused(false);
  }, [audioUrl, playBrowserSpeech]);

  const play = useCallback(() => {
    if (language === "igbo") { toast.info("Igbo audio is not available yet. Coming soon!"); return; }

    if (isPaused && audioRef.current) {
      audioRef.current.play();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    playAudio();
  }, [language, isPaused, playAudio]);

  const pause = useCallback(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.pause();
    } else {
      window.speechSynthesis.pause();
    }
    setIsPaused(true);
    setIsPlaying(false);
  }, [audioUrl]);

  const disabled = (cond: boolean) => (cond ? "opacity-50 cursor-not-allowed" : "cursor-pointer");

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-2 rounded-xl bg-secondary border border-border w-fit">
        <div className="flex items-center gap-1.5 px-2 text-muted-foreground text-xs font-medium">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Listen</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <button
          onClick={play}
          disabled={isPlaying && !isPaused}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
            isPlaying && !isPaused
              ? "bg-muted text-muted-foreground"
              : "bg-accent text-accent-foreground hover:opacity-90 shadow-sm",
            disabled(isPlaying && !isPaused)
          )}
        >
          <Play className="w-3.5 h-3.5" />
          {isPaused ? "Resume" : "Play"}
        </button>
        <button
          onClick={pause}
          disabled={!isPlaying || isPaused}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
            !isPlaying || isPaused ? "bg-muted text-muted-foreground" : "bg-secondary text-foreground hover:bg-border",
            disabled(!isPlaying || isPaused)
          )}
        >
          <Pause className="w-3.5 h-3.5" />
          Pause
        </button>
        <button
          onClick={stop}
          disabled={!isPlaying && !isPaused}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border",
            !isPlaying && !isPaused
              ? "bg-muted text-muted-foreground border-border"
              : "bg-destructive/15 text-destructive border-destructive/25 hover:bg-destructive/25",
            disabled(!isPlaying && !isPaused)
          )}
        >
          <Square className="w-3 h-3" />
          Stop
        </button>
      </div>
    </div>
  );
}
