"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { FileText, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Spinner from "./ui/Spinner";

type UploadState =
  | { type: "idle" }
  | { type: "uploading"; progress: number }
  | { type: "analyzing" }
  | { type: "success"; reportId: string }
  | { type: "error"; message: string };

type UploadedFile = { fileUrl: string; name: string; type?: string };
type AnalyzeResponse = {
  report?: { id: string };
  error?: string;
  errorMessage?: string;
  errorType?: string;
  reportId?: string;
  requestId?: string;
};

function getTypeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "gif") return "image/gif";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

export default function FileUploader() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>({ type: "idle" });

  const handleUploadComplete = useCallback(
    async (res: UploadedFile[]) => {
      if (!res || res.length === 0) return;

      const file = res[0];
      setState({ type: "analyzing" });

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileUrl: file.fileUrl,
            fileName: file.name,
            fileType: file.type || getTypeFromName(file.name),
          }),
        });

        const data = await readAnalyzeResponse(response);

        if (!response.ok) {
          throw new Error(formatAnalyzeError(data));
        }

        const reportId = data.report?.id;
        if (!reportId) {
          throw new Error("Analysis completed without a report ID.");
        }

        setState({ type: "success", reportId });
        setTimeout(() => {
          router.push(`/report/${reportId}`);
        }, 1200);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to analyze file";
        toast.error(message);
        setState({
          type: "error",
          message,
        });
      }
    },
    [router]
  );

  if (state.type === "analyzing") {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center gap-5 min-h-[300px]">
        <Spinner size="lg" />
        <div className="text-center space-y-1">
          <p className="text-primary font-bold text-base">
            Analyzing your lab results…
          </p>
          <p className="text-muted-foreground text-xs max-w-sm mx-auto leading-relaxed">
            Our AI is reading and interpreting your results in Yoruba, Igbo, Hausa, and English. This takes up to 45 seconds.
          </p>
        </div>
      </div>
    );
  }

  if (state.type === "success") {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center gap-4 min-h-[300px] fade-in">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-primary font-bold text-base">
            Analysis complete!
          </p>
          <p className="text-muted-foreground text-xs">Redirecting to your results…</p>
        </div>
      </div>
    );
  }

  if (state.type === "error") {
    return (
      <div className="space-y-4">
        <div className="glass-card p-6 flex items-start gap-4 border-rose-500/30 bg-rose-500/5">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-rose-600 dark:text-rose-400 font-bold text-sm">Analysis failed</p>
            <p className="text-muted-foreground text-xs leading-relaxed">{state.message}</p>
          </div>
        </div>
        <button
          id="retry-upload-btn"
          onClick={() => setState({ type: "idle" })}
          className="btn-secondary w-full"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UploadDropzone<OurFileRouter, "labResultUploader">
        endpoint="labResultUploader"
        onUploadProgress={(progress) =>
          setState({ type: "uploading", progress })
        }
        onClientUploadComplete={(res) => {
          if (res) {
            handleUploadComplete(
              res.map((file) => ({
                fileUrl: file.ufsUrl,
                name: file.name,
                type:
                  "type" in file && typeof file.type === "string"
                    ? file.type
                    : undefined,
              }))
            );
          }
        }}
        onUploadError={(error) => {
          toast.error(error.message);
          setState({ type: "error", message: error.message });
        }}
        appearance={{
          container:
            "border-2 border-dashed border-border hover:border-primary/50 rounded-2xl bg-muted/25 transition-all duration-300 cursor-pointer min-h-[260px] p-6 flex flex-col justify-center items-center gap-1",
          uploadIcon: "text-primary",
          label: "text-foreground font-bold text-sm",
          allowedContent: "text-muted-foreground text-xs",
          button:
            "!bg-primary !text-primary-foreground font-semibold text-sm rounded-xl px-5 py-2.5 mt-4 hover:opacity-90 transition-all ut-readying:opacity-70 ut-uploading:opacity-70",
        }}
        content={{
          label: "Drop your lab result here or click to browse",
          allowedContent: "PDF, JPG, PNG, WEBP — up to 16MB",
        }}
      />

      {/* Supported formats */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
          <FileText className="w-4 h-4 text-rose-500" />
          <span>PDF lab reports</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
          <ImageIcon className="w-4 h-4 text-teal-500" />
          <span>JPG, PNG, WEBP images</span>
        </div>
      </div>
    </div>
  );
}

function formatAnalyzeError(data: AnalyzeResponse) {
  if (data.error) return data.error;
  if (data.errorMessage) {
    const reference = data.requestId ? ` Reference: ${data.requestId}` : "";
    return `${data.errorMessage}${reference}`;
  }

  return "Analysis failed.";
}

async function readAnalyzeResponse(response: Response): Promise<AnalyzeResponse> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as AnalyzeResponse;
  }

  const text = await response.text();
  if (/inactivity timeout/i.test(text) || text.trim().startsWith("<")) {
    return {
      error:
        "The analysis took too long for the production server. Please try again with a clearer image or a smaller file.",
    };
  }

  return { error: text || "Analysis failed." };
}
