"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Loader2, Pause, Play, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
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

const GENERATED_AUDIO_LANGUAGES = new Set<Language>(["yoruba", "hausa"]);


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

  useEffect(() => {
    window.speechSynthesis.cancel();
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    audioRef.current = null;
    utteranceRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
    setError(null);
    setAudioUrl(null);

    return () => {
      window.speechSynthesis.cancel();
      audioRef.current?.pause();
    };
  }, [language, text]);

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

    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/^[-\s•▸]+/gm, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
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

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playGeneratedSpeech = useCallback(async () => {
    if (!reportId) {
      setError("Audio is not available for this report.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/reports/${reportId}/audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      const data = (await res.json()) as {
        jobId?: string;
        audioUrl?: string;
        status?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate audio.");
      }

      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
        await playUrl(data.audioUrl);
        return;
      }

      if (!data.jobId) {
        throw new Error("No job ID returned.");
      }

      const jobId = data.jobId;

      toast.info(`Generating ${language} audio in the background. We'll play it when ready!`, {
        duration: 4000,
      });

      const nextAudioUrl = await new Promise<string>((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 120;

        pollRef.current = setInterval(async () => {
          attempts++;
          try {
            const statusRes = await fetch(`/api/tts-status/${jobId}`);
            const statusData = (await statusRes.json()) as {
              status: string;
              audioUrl?: string;
              error?: string;
            };

            if (statusData.status === "ready" && statusData.audioUrl) {
              if (pollRef.current) clearInterval(pollRef.current);
              resolve(statusData.audioUrl);
            } else if (statusData.status === "failed") {
              if (pollRef.current) clearInterval(pollRef.current);
              reject(new Error(statusData.error || "Audio generation failed."));
            } else if (attempts >= maxAttempts) {
              if (pollRef.current) clearInterval(pollRef.current);
              reject(new Error("Audio generation timed out."));
            }
          } catch {
            if (attempts >= maxAttempts) {
              if (pollRef.current) clearInterval(pollRef.current);
              reject(new Error("Audio generation timed out."));
            }
          }
        }, 2000);
      });

      setAudioUrl(nextAudioUrl);
      toast.success(`${language.charAt(0).toUpperCase() + language.slice(1)} audio ready!`);
      await playUrl(nextAudioUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate audio.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [audioUrl, language, reportId]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const playUrl = async (url: string) => {
    audioRef.current?.pause();
    const audio = new Audio(url);
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
  };

  const play = useCallback(() => {
    if (language === "igbo") {
      toast.info("Igbo audio is not available yet. Coming soon!");
      return;
    }

    if (GENERATED_AUDIO_LANGUAGES.has(language)) {
      if (isPaused && audioRef.current) {
        audioRef.current.play();
        setIsPaused(false);
        setIsPlaying(true);
        return;
      }

      void playGeneratedSpeech();
      return;
    }

    playBrowserSpeech();
  }, [isPaused, language, playBrowserSpeech, playGeneratedSpeech]);

  const pause = useCallback(() => {
    if (GENERATED_AUDIO_LANGUAGES.has(language)) {
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
          {isLoading ? "Generating..." : isPaused ? "Resume" : "Play"}
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
