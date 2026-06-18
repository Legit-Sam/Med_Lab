import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Premium button system.
 * - Built on base-ui's Button (render prop for polymorphism, native button props).
 * - Token-driven colors (navy primary, teal accent) — no hardcodes.
 * - Full state coverage: hover, active, focus-ring, loading, disabled.
 * - Size scale runs xs → 2xl so landing CTAs can be confident and large.
 */
const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2",
    "rounded-md border border-transparent bg-clip-padding font-medium whitespace-normal text-center",
    "transition-[background-color,color,border-color,box-shadow,transform,opacity] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]",
    "outline-none select-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50",
    "aria-busy:cursor-progress",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[var(--elevation-1)] hover:bg-[color-mix(in_srgb,var(--primary)_88%,var(--foreground))] hover:shadow-[var(--elevation-2)] hover:-translate-y-0.5",
        accent:
          "bg-accent text-accent-foreground shadow-[var(--elevation-1)] hover:bg-[color-mix(in_srgb,var(--accent)_90%,var(--foreground))] hover:shadow-[var(--elevation-2)] hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground border-border hover:bg-[color-mix(in_srgb,var(--secondary)_85%,var(--foreground))] hover:border-border-strong",
        outline:
          "bg-card border-border text-foreground hover:bg-muted hover:border-border-strong",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        subtle:
          "bg-muted text-foreground hover:bg-[color-mix(in_srgb,var(--muted)_70%,var(--muted-foreground))]",
        link: "bg-transparent text-accent underline-offset-4 hover:underline px-0 h-auto",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[var(--elevation-1)] hover:bg-[color-mix(in_srgb,var(--destructive)_88%,black)] hover:-translate-y-0.5",
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 px-3.5 text-xs rounded-md",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-[0.95rem]",
        xl: "h-12 px-6 text-base",
        "2xl": "h-14 px-8 text-base",
        icon: "size-10 p-0 [&_svg:not([class*='size-'])]:size-5",
        "icon-sm": "size-8 p-0 [&_svg:not([class*='size-'])]:size-4",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends Omit<
      React.ComponentProps<typeof ButtonPrimitive>,
      "color" | "size" | "variant"
    >,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  fullWidth?: boolean;
}

function Button({
  className,
  variant,
  size,
  fullWidth,
  loading = false,
  disabled,
  nativeButtonProps,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      nativeButtonProps={{
        ...nativeButtonProps,
        "aria-busy": loading || undefined,
      }}
      {...props}
    >
      {loading && (
        <svg
          className="size-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"
          />
        </svg>
      )}
      {children}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
