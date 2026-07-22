"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  reportId: string;
};

export default function RetryAnalysisButton({ reportId }: Props) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/retry`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Retry failed");

      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Retry failed";
      toast.error(msg);
      setRetrying(false);
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      <button
        onClick={handleRetry}
        disabled={retrying}
        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-50"
      >
        {retrying ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <RotateCcw className="w-3.5 h-3.5" />
        )}
        {retrying ? "Re-analyzing…" : "Retry with uploaded file"}
      </button>
      <a
        href="/upload"
        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition-all"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Upload different file
      </a>
    </div>
  );
}
