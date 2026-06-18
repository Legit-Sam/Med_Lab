"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

type Size = "sm" | "md";

export default function ThemeToggle({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const dims = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const icon = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground",
        "hover:text-foreground hover:border-border-strong hover:bg-muted",
        "transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        dims,
        className,
      )}
    >
      <Sun
        className={cn(
          icon,
          "absolute transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0",
        )}
      />
      <Moon
        className={cn(
          icon,
          "absolute transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100",
        )}
      />
    </button>
  );
}
