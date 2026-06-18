type LogLevel = "info" | "warn" | "error";

type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  error?: unknown;
  metadata?: Record<string, unknown>;
};

function formatError(error: unknown): Record<string, unknown> | string {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return String(error);
}

function log(level: LogLevel, message: string, meta?: Omit<LogEntry, "timestamp" | "level" | "message">) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
    ...(meta?.error ? { error: formatError(meta.error) } : {}),
  };

  const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;

  switch (level) {
    case "error":
      console.error(prefix, message, entry.error || "", entry.requestId || "");
      break;
    case "warn":
      console.warn(prefix, message, entry.requestId || "");
      break;
    default:
      console.log(prefix, message, entry.requestId || "");
  }
}

export const logger = {
  info: (message: string, meta?: Omit<LogEntry, "timestamp" | "level" | "message">) =>
    log("info", message, meta),
  warn: (message: string, meta?: Omit<LogEntry, "timestamp" | "level" | "message">) =>
    log("warn", message, meta),
  error: (message: string, meta?: Omit<LogEntry, "timestamp" | "level" | "message">) =>
    log("error", message, meta),
};
