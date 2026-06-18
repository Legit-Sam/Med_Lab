import FileUploader from "@/components/FileUploader";
import { ShieldCheck, Zap, Globe, Info } from "lucide-react";

export const metadata = {
  title: "Upload Lab Result — WazobiCare Nigeria",
  description: "Upload your medical lab result PDF or image to get a simple explanation.",
};

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 fade-in text-foreground">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Upload Your Lab Result
        </h1>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Upload a PDF or image of your lab results and our AI will translate each value in simple language — in your preferred local dialect.
        </p>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: Zap,
            text: "Results in 15–30 seconds",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            icon: Globe,
            text: "4 languages available",
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            icon: ShieldCheck,
            text: "Safe, educational only",
            color: "text-teal-600 dark:text-teal-400",
            bg: "bg-teal-500/10",
          },
        ].map(({ icon: Icon, text, color, bg }) => (
          <div
            key={text}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-card border border-border/80 shadow-sm"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className="text-foreground/80 text-xs font-semibold">{text}</span>
          </div>
        ))}
      </div>

      {/* Uploader Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <FileUploader />
      </div>

      {/* Fine print / Disclaimer */}
      <div className="flex items-start gap-2.5 max-w-lg mx-auto text-center justify-center">
        <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          By uploading files, you agree that this translation is for educational clarity only. We do not store files permanently on our database.
        </p>
      </div>
    </div>
  );
}
