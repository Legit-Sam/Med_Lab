"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  ImageIcon,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Search,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { useNotification } from "@/hooks/useNotification";
import { cn } from "@/lib/utils";
import ConfirmDialog from "./ConfirmDialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Report = {
  id: string;
  fileName: string;
  fileType: string;
  status: "processing" | "completed" | "failed";
  createdAt: string | Date;
};

type Props = {
  reports: Report[];
  compact?: boolean;
};

function StatusBadge({ status }: { status: Report["status"] }) {
  const config = {
    completed: {
      icon: CheckCircle2,
      text: "Completed",
      variant: "success" as const,
    },
    processing: {
      icon: Clock,
      text: "Processing",
      variant: "warning" as const,
    },
    failed: {
      icon: XCircle,
      text: "Failed",
      variant: "destructive" as const,
    },
  };

  const { icon: Icon, text, variant } = config[status];

  return (
    <Badge variant={variant}>
      <Icon className="w-3 h-3" />
      {text}
    </Badge>
  );
}

export default function ReportList({ reports, compact = false }: Props) {
  const router = useRouter();
  const { notification, close } = useNotification();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "processing" | "failed"
  >("all");

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget);
    setDeleteTarget(null);
    try {
      await fetch(`/api/reports/${deleteTarget}`, { method: "DELETE" });
      
      router.refresh();
    } catch {
      
    } finally {
      setDeletingId(null);
    }
  }, [deleteTarget, router]);

  const handleRetry = useCallback(async (reportId: string) => {
    setRetryingId(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}/retry`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Retry failed");

      // Poll for completion
      const maxAttempts = 150;
      for (let i = 0; i < maxAttempts; i++) {
        const pr = await fetch(`/api/analyze-status/${data.jobId}`);
        const pd = await pr.json();
        if (pd.status === "completed") {
          toast.success("Analysis complete!");
          router.push(`/report/${reportId}`);
          return;
        }
        if (pd.status === "failed") {
          throw new Error(pd.error || "Analysis failed");
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      throw new Error("Analysis timed out");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Retry failed";
      toast.error(msg);
      router.refresh();
    } finally {
      setRetryingId(null);
    }
  }, [router]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = report.fileName
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  if (reports.length === 0) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center gap-5 text-center border-dashed">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold">No reports analysed yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Upload your laboratory result PDFs or images to get clear translations in Yoruba, Igbo, Hausa, or English.
          </p>
        </div>
        <Link href="/upload">
          <Button variant="accent">Upload Lab Result</Button>
        </Link>
      </Card>
    );
  }

  return (
    <>
      <Modal
        isOpen={notification.isOpen}
        onClose={close}
        type={notification.type}
        title={notification.title}
        description={notification.description}
      />
      <div className="space-y-3">
      {/* Search and Filters — hidden in compact mode */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reports by file name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm font-medium rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(["all", "completed", "processing", "failed"] as const).map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all duration-150",
                    statusFilter === filter
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted",
                  )}
                >
                  {filter}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {/* Reports list */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground">
          <p className="text-sm">No reports match your filters.</p>
        </div>
      ) : (
        <div id="reports-list" className="space-y-2">
          {filteredReports.map((report) => {
            const isPdf =
              report.fileType?.includes("pdf") ||
              report.fileName?.toLowerCase().endsWith(".pdf");
            const isClickable = report.status === "completed";

            return (
              <Card key={report.id} size="sm" className={cn("group", isClickable ? "hover:bg-muted/50 cursor-pointer transition-colors" : "opacity-70")}>
                <div
                  className="flex items-center justify-between gap-4 p-3"
                  {...(isClickable ? { onClick: () => router.push(`/report/${report.id}`) } : {})}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border",
                        isPdf
                          ? "bg-destructive/8 text-destructive border-destructive/12"
                          : "bg-chart-2/8 text-chart-2 border-chart-2/12",
                      )}
                    >
                      {isPdf ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <ImageIcon className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate group-hover:text-accent transition-colors">
                        {report.fileName || "Lab Result"}
                      </p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {formatDistanceToNow(new Date(report.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={report.status} />

                    <div className="flex items-center gap-0.5">
                      {isClickable && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                      )}
                      {report.status === "failed" && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRetry(report.id);
                          }}
                          disabled={retryingId === report.id}
                          aria-label="Retry analysis"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all"
                        >
                          {retryingId === report.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      <button
                        id={`delete-report-${report.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteTarget(report.id);
                        }}
                        disabled={deletingId === report.id}
                        aria-label="Delete report"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Report"
        description="Are you sure you want to permanently delete this report? This action cannot be undone."
        confirmLabel="Delete permanently"
        isLoading={deletingId !== null}
      />
      </div>
    </>
  );
}
