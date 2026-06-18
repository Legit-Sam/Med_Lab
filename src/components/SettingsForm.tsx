"use client";

import { useState, useTransition, useEffect } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";

type Props = {
  initialLanguage: string;
  onSave: (lang: any) => Promise<void>;
};

export default function SettingsForm({ initialLanguage, onSave }: Props) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  
  const [lang, setLang] = useState(initialLanguage);
  const [autoplay, setAutoplay] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedAutoplay = localStorage.getItem("setting_autoplay") === "true";
    const savedEmailAlerts = localStorage.getItem("setting_email_alerts") !== "false";
    setAutoplay(savedAutoplay);
    setEmailAlerts(savedEmailAlerts);
  }, []);

  const handleSave = () => {
    setSuccess(false);
    startTransition(async () => {
      // Save language via Server Action to db
      await onSave(lang);
      
      // Save client preferences locally
      localStorage.setItem("setting_autoplay", String(autoplay));
      localStorage.setItem("setting_email_alerts", String(emailAlerts));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Language Setting */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Default Dialect Translation
        </label>
        <p className="text-[10px] text-muted-foreground">
          Choose the language you want your reports translated to by default.
        </p>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="w-full max-w-md rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary/50 transition"
        >
          <option value="english">English</option>
          <option value="yoruba">Yorùbá</option>
          <option value="hausa">Hausa</option>
          <option value="igbo">Igbo</option>
        </select>
      </div>

      {/* Divider */}
      <hr className="border-border/60" />

      {/* Autoplay setting */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Interface Preferences
        </h4>

        {/* Option 1: Autoplay */}
        <label className="flex items-start gap-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={autoplay}
            onChange={(e) => setAutoplay(e.target.checked)}
            className="mt-1 rounded border-border text-primary focus:ring-primary w-4.5 h-4.5"
          />
          <div>
            <span className="block text-xs font-bold text-foreground group-hover:text-primary transition-colors">
              Autoplay Audio Translations
            </span>
            <span className="block text-[10px] text-muted-foreground mt-0.5">
              Automatically play the text-to-speech reader when viewing a new lab result.
            </span>
          </div>
        </label>

        {/* Option 2: Email Alerts */}
        <label className="flex items-start gap-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => setEmailAlerts(e.target.checked)}
            className="mt-1 rounded border-border text-primary focus:ring-primary w-4.5 h-4.5"
          />
          <div>
            <span className="block text-xs font-bold text-foreground group-hover:text-primary transition-colors">
              Email Notifications
            </span>
            <span className="block text-[10px] text-muted-foreground mt-0.5">
              Send an email notification when your laboratory results processing is complete.
            </span>
          </div>
        </label>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isPending}
        className="btn-primary w-full inline-flex items-center justify-center gap-2 mt-4"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        <span>{isPending ? "Saving changes..." : "Save Settings"}</span>
      </button>
    </div>
  );
}
