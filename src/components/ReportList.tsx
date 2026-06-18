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
} from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
      className:
        "bg-[color:var(--success)]/12 text-[color:var(--success)] border-[color:var(--success)]/20",
    },
    processing: {
      icon: Clock,
      text: "Processing",
      className:
        "bg-[color:var(--warning)]/12 text-[color:var(--warning)] border-[color:var(--warning)]/20",
    },
    failed: {
      icon: XCircle,
      text: "Failed",
      className:
        "bg-[color:var(--destructive)]/12 text-[color:var(--destructive)] border-[color:var(--destructive)]/20",
    },
  };

  const { icon: Icon, text, className } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
        className,
      )}
    >
      <Icon className="w-3 h-3" />
      {text}
    </span>
  );
}

export default function ReportList({ reports, compact = false }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "processing" | "failed"
  >("all");

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this report permanently?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/reports/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      alert("Failed to delete report");
    } finally {
      setDeletingId(null);
    }
  };

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
      <div
        id="empty-reports"
        className="surface p-12 flex flex-col items-center justify-center gap-5 text-center border-dashed"
      >
        <div className="w-14 h-14 rounded-2xl bg-accent/12 text-accent flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-foreground">
            No reports analysed yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Upload your laboratory result PDFs or images to get clear
            translations in Yoruba, Igbo, Hausa, or English.
          </p>
        </div>
        <Link href="/upload" id="empty-upload-cta" className="btn-primary">
          Upload Lab Result
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

            const row = (
              <div
                className={cn(
                  "surface flex items-center justify-between gap-4 group",
                  compact ? "p-3" : "p-4",
                  isClickable
                    ? "surface-hover cursor-pointer"
                    : "opacity-70",
                )}
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
                    <p className="text-foreground font-medium text-sm truncate group-hover:text-accent transition-colors">
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
                    <button
                      id={`delete-report-${report.id}`}
                      onClick={(e) => handleDelete(e, report.id)}
                      disabled={deletingId === report.id}
                      aria-label="Delete report"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );

            return isClickable ? (
              <Link
                key={report.id}
                href={`/report/${report.id}`}
                id={`report-item-${report.id}`}
                className="block"
              >
                {row}
              </Link>
            ) : (
              <div key={report.id} id={`report-item-${report.id}`}>
                {row}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
