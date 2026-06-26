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
    bgColor: "bg-gradient-to-br from-accent/20 to-accent/10",
    borderColor: "border-accent/30",
    dotColor: "bg-accent",
  },
  success: {
    icon: CheckCircle2,
    color: "text-[color:var(--success)]",
    bgColor: "bg-gradient-to-br from-[color:var(--success)]/20 to-[color:var(--success)]/10",
    borderColor: "border-[color:var(--success)]/30",
    dotColor: "bg-[color:var(--success)]",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-[color:var(--warning)]",
    bgColor: "bg-gradient-to-br from-[color:var(--warning)]/20 to-[color:var(--warning)]/10",
    borderColor: "border-[color:var(--warning)]/30",
    dotColor: "bg-[color:var(--warning)]",
  },
  error: {
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-gradient-to-br from-destructive/20 to-destructive/10",
    borderColor: "border-destructive/30",
    dotColor: "bg-destructive",
  },
  loading: {
    icon: Loader2,
    color: "text-accent",
    bgColor: "bg-gradient-to-br from-accent/20 to-accent/10",
    borderColor: "border-accent/30",
    dotColor: "bg-accent",
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => closeOnBackdropClick && onClose()}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "relative w-full max-w-md rounded-2xl border backdrop-blur-xl",
                "bg-gradient-to-br from-card to-card/80",
                "shadow-2xl shadow-black/40",
                config.borderColor
              )}
            >
              {/* Gradient accent line at top */}
              <div className={cn("absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r",
                type === "success" ? "from-[color:var(--success)] via-[color:var(--success)]/60 to-transparent" :
                type === "error" ? "from-destructive via-destructive/60 to-transparent" :
                type === "warning" ? "from-[color:var(--warning)] via-[color:var(--warning)]/60 to-transparent" :
                "from-accent via-accent/60 to-transparent"
              )} />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all z-10"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="p-7 sm:p-8">
                {/* Icon with gradient background */}
                <div className={cn("inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5", config.bgColor)}>
                  {type === "loading" ? (
                    <Icon className={cn("w-7 h-7 animate-spin", config.color)} />
                  ) : (
                    <Icon className={cn("w-7 h-7", config.color)} />
                  )}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">{title}</h2>

                {/* Description */}
                {description && (
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{description}</p>
                )}

                {/* Custom children */}
                {children && <div className="mb-6">{children}</div>}

                {/* Actions */}
                {actions.length > 0 && (
                  <div className={cn("flex gap-3 pt-5 border-t border-border/40",
                    actions.length === 1 ? "flex-col" : "flex-row"
                  )}>
                    {actions.map((action, idx) => (
                      <Button
                        key={idx}
                        onClick={action.onClick}
                        variant={action.variant || "primary"}
                        className={cn(
                          actions.length === 1 && "w-full",
                          actions.length > 1 && "flex-1"
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
