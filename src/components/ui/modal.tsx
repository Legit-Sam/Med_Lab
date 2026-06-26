"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: "info" | "success" | "warning" | "error" | "loading";
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "accent" | "secondary" | "outline" | "destructive";
    loading?: boolean;
  }>;
  children?: React.ReactNode;
  closeOnBackdropClick?: boolean;
}

const typeConfig = {
  info: {
    icon: AlertCircle,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/20",
  },
  success: {
    icon: CheckCircle2,
    color: "text-[color:var(--success)]",
    bgColor: "bg-[color:var(--success)]/10",
    borderColor: "border-[color:var(--success)]/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-[color:var(--warning)]",
    bgColor: "bg-[color:var(--warning)]/10",
    borderColor: "border-[color:var(--warning)]/20",
  },
  error: {
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/20",
  },
  loading: {
    icon: Loader2,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/20",
  },
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  type = "info",
  actions = [],
  children,
  closeOnBackdropClick = true,
}: ModalProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => closeOnBackdropClick && onClose()}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "relative w-full max-w-sm rounded-2xl border bg-card shadow-2xl",
                config.borderColor
              )}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="p-6 sm:p-8">
                {/* Icon */}
                <div className={cn("inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4", config.bgColor)}>
                  {type === "loading" ? (
                    <Icon className={cn("w-6 h-6 animate-spin", config.color)} />
                  ) : (
                    <Icon className={cn("w-6 h-6", config.color)} />
                  )}
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>

                {/* Description */}
                {description && (
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>
                )}

                {/* Custom children */}
                {children && <div className="mb-6">{children}</div>}

                {/* Actions */}
                {actions.length > 0 && (
                  <div className="flex gap-3 pt-4 border-t border-border/40">
                    {actions.map((action, idx) => (
                      <Button
                        key={idx}
                        onClick={action.onClick}
                        variant={action.variant || "primary"}
                        className={cn(
                          "flex-1",
                          actions.length === 1 && "w-full"
                        )}
                        loading={action.loading}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Modal;
