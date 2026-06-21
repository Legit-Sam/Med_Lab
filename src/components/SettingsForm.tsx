"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/locale-context";

type Props = {
  initialLanguage: string;
  onSave: (lang: any) => Promise<void>;
};

const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "yoruba", label: "Yorùbá" },
  { value: "hausa", label: "Hausa" },
  { value: "igbo", label: "Igbo" },
];

export default function SettingsForm({ initialLanguage, onSave }: Props) {
  const { t, setLocale } = useT();
  const [isPending, startTransition] = useTransition();

  const [lang, setLang] = useState(initialLanguage);
  const [uiLang, setUiLang] = useState(initialLanguage);
  const [autoplay, setAutoplay] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);

  useEffect(() => {
    const savedAutoplay = localStorage.getItem("setting_autoplay") === "true";
    const savedEmailAlerts = localStorage.getItem("setting_email_alerts") !== "false";
    setAutoplay(savedAutoplay);
    setEmailAlerts(savedEmailAlerts);
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      try {
        await onSave(lang);
        setLocale(uiLang as "english" | "yoruba" | "hausa" | "igbo");
        localStorage.setItem("setting_autoplay", String(autoplay));
        localStorage.setItem("setting_email_alerts", String(emailAlerts));
        toast.success(t("settings.saved"));
      } catch {
        toast.error(t("settings.saveFailed"));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Translation Language */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {t("settings.defaultDialect")}
        </label>
        <p className="text-[10px] text-muted-foreground">
          {t("settings.defaultDialectDesc")}
        </p>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="w-full max-w-md rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary/50 transition"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Interface Language */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {t("profile.preferredLanguage")}
        </label>
        <p className="text-[10px] text-muted-foreground">
          Choose the language for dashboard buttons, labels, and navigation.
        </p>
        <select
          value={uiLang}
          onChange={(e) => setUiLang(e.target.value)}
          className="w-full max-w-md rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary/50 transition"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <hr className="border-border/60" />

      {/* Autoplay setting */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {t("settings.interfacePreferences")}
        </h4>

        <label className="flex items-start gap-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={autoplay}
            onChange={(e) => setAutoplay(e.target.checked)}
            className="mt-1 rounded border-border text-primary focus:ring-primary w-4.5 h-4.5"
          />
          <div>
            <span className="block text-xs font-bold text-foreground group-hover:text-primary transition-colors">
              {t("settings.autoplayAudio")}
            </span>
            <span className="block text-[10px] text-muted-foreground mt-0.5">
              {t("settings.autoplayAudioDesc")}
            </span>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => setEmailAlerts(e.target.checked)}
            className="mt-1 rounded border-border text-primary focus:ring-primary w-4.5 h-4.5"
          />
          <div>
            <span className="block text-xs font-bold text-foreground group-hover:text-primary transition-colors">
              {t("settings.emailNotifications")}
            </span>
            <span className="block text-[10px] text-muted-foreground mt-0.5">
              {t("settings.emailNotificationsDesc")}
            </span>
          </div>
        </label>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isPending}
        variant="accent"
        fullWidth
        className="mt-4"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        <span>{isPending ? t("settings.saving") : t("settings.saveSettings")}</span>
      </Button>
    </div>
  );
}
