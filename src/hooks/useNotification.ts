"use client";

import { useState, useCallback } from "react";

export type NotificationType = "success" | "error" | "warning" | "info" | "loading";

interface NotificationState {
  isOpen: boolean;
  type: NotificationType;
  title: string;
  description?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "accent" | "secondary" | "outline" | "destructive";
    loading?: boolean;
  }>;
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: "info",
    title: "",
  });

  const show = useCallback(
    (
      type: NotificationType,
      title: string,
      description?: string,
      actions?: NotificationState["actions"]
    ) => {
      setNotification({
        isOpen: true,
        type,
        title,
        description,
        actions,
      });
    },
    []
  );

  const close = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const success = useCallback(
    (title: string, description?: string, actions?: NotificationState["actions"]) => {
      show("success", title, description, actions);
    },
    [show]
  );

  const error = useCallback(
    (title: string, description?: string, actions?: NotificationState["actions"]) => {
      show("error", title, description, actions);
    },
    [show]
  );

  const warning = useCallback(
    (title: string, description?: string, actions?: NotificationState["actions"]) => {
      show("warning", title, description, actions);
    },
    [show]
  );

  const info = useCallback(
    (title: string, description?: string, actions?: NotificationState["actions"]) => {
      show("info", title, description, actions);
    },
    [show]
  );

  const loading = useCallback(
    (title: string, description?: string) => {
      show("loading", title, description);
    },
    [show]
  );

  // Auto-close success and info messages after 3 seconds (if no actions)
  const autoCloseSuccessOrInfo = useCallback(
    (title: string, description?: string) => {
      show("success", title, description);
      setTimeout(() => {
        setNotification((prev) => ({
          ...prev,
          isOpen: false,
        }));
      }, 3000);
    },
    [show]
  );

  return {
    notification,
    show,
    close,
    success,
    error,
    warning,
    info,
    loading,
    autoCloseSuccessOrInfo,
  };
}
