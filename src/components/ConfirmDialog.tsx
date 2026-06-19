"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Loader2, AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  isLoading = false,
}: Props) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div className="space-y-1.5">
              <AlertDialog.Title className="text-lg font-semibold text-foreground">
                {title}
              </AlertDialog.Title>
              <AlertDialog.Description className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </AlertDialog.Description>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
            <AlertDialog.Cancel asChild>
              <button
                disabled={isLoading}
                className="flex-1 h-11 rounded-xl border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLoading ? "Deleting..." : confirmLabel}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
