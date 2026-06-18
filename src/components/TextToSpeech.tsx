"use client";

import { useState, useRef, useCallback } from "react";
import { Loader2, Pause, Play, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";

type Props = {
  text: string;
  language: Language;
  reportId?: string;
  initialAudioUrl?: string | null;
};

const LANG_CODE_MAP: Record<string, string> = {
  english: "en-NG",
  yoruba: "yo-NG",
  hausa: "ha-NG",
  igbo: "ig-NG",
};

const ELEVENLABS_LANGUAGES = new Set<Language>(["yoruba", "hausa", "igbo"]);

export default function TextToSpeech({
  text,
  language,
  reportId,
  initialAudioUrl,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    audioRef.current?.pause();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsPaused(false);
    utteranceRef.current = null;
  }, []);

  const playBrowserSpeech = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      setError("Text-to-speech is not supported in your browser.");
      return;
    }

    if (isPaused && utteranceRef.current) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = LANG_CODE_MAP[language] || "en-NG";

    const voices = window.speechSynthesis.getVoices();
    const match =
      voices.find((v) => v.lang === langCode) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];

    if (match) utterance.voice = match;
    utterance.lang = langCode;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, language, isPaused]);

  const playElevenLabsSpeech = useCallback(async () => {
    if (!reportId) {
      setError("Audio is not available for this report.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      let nextAudioUrl = audioUrl;
      if (!nextAudioUrl) {
        nextAudioUrl = await fetch(`/api/reports/${reportId}/audio`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language }),
        }).then(async (response) => {
          const data = (await response.json()) as {
            audioUrl?: string;
            error?: string;
          };
          if (!response.ok || !data.audioUrl) {
            throw new Error(data.error || "Failed to generate audio.");
          }
          return data.audioUrl;
        });
      }

      if (!nextAudioUrl) {
        throw new Error("Generated audio URL was not returned.");
      }

      setAudioUrl(nextAudioUrl);

      audioRef.current?.pause();
      const audio = new Audio(nextAudioUrl);
      audioRef.current = audio;
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setIsPaused(false);
      });
      audio.addEventListener("error", () => {
        setIsPlaying(false);
        setIsPaused(false);
        setError("Unable to play generated audio.");
      });

      await audio.play();
      setIsPlaying(true);
      setIsPaused(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate audio.");
    } finally {
      setIsLoading(false);
    }
  }, [audioUrl, language, reportId]);

  const play = useCallback(() => {
    if (ELEVENLABS_LANGUAGES.has(language)) {
      if (isPaused && audioRef.current) {
        audioRef.current.play();
        setIsPaused(false);
        setIsPlaying(true);
        return;
      }

      void playElevenLabsSpeech();
      return;
    }

    playBrowserSpeech();
  }, [isPaused, language, playBrowserSpeech, playElevenLabsSpeech]);

  const pause = useCallback(() => {
    if (ELEVENLABS_LANGUAGES.has(language)) {
      audioRef.current?.pause();
    } else {
      window.speechSynthesis.pause();
    }
    setIsPaused(true);
    setIsPlaying(false);
  }, [language]);

  const disabled = (cond: boolean) =>
    cond ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <div className="space-y-2">
      <div
        id="tts-controls"
        className="flex items-center gap-2 p-2 rounded-xl bg-secondary border border-border w-fit"
      >
        <div className="flex items-center gap-1.5 px-2 text-muted-foreground text-xs font-medium">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Listen</span>
        </div>
        <div className="h-4 w-px bg-border" />

        {/* Play / Resume */}
        <button
          id="tts-play-btn"
          onClick={play}
          disabled={isLoading || (isPlaying && !isPaused)}
          aria-label={isPaused ? "Resume" : "Play"}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
            isLoading || (isPlaying && !isPaused)
              ? "bg-muted text-muted-foreground"
              : "bg-accent text-accent-foreground hover:opacity-90 shadow-sm",
            disabled(isLoading || (isPlaying && !isPaused))
          )}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          {isLoading ? "Preparing" : isPaused ? "Resume" : "Play"}
        </button>

        {/* Pause */}
        <button
          id="tts-pause-btn"
          onClick={pause}
          disabled={!isPlaying || isPaused}
          aria-label="Pause"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
            !isPlaying || isPaused
              ? "bg-muted text-muted-foreground"
              : "bg-secondary text-foreground hover:bg-border",
            disabled(!isPlaying || isPaused)
          )}
        >
          <Pause className="w-3.5 h-3.5" />
          Pause
        </button>

        {/* Stop */}
        <button
          id="tts-stop-btn"
          onClick={stop}
          disabled={!isPlaying && !isPaused}
          aria-label="Stop"
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
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
