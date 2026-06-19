"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Login failed.");
          return;
        }

        toast.success("Signed in successfully.");
        router.push("/dashboard");
        router.refresh();
      } catch {
        toast.error("Unable to sign in. Please try again.");
      }
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12 bg-background">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,var(--color-accent),transparent_70%)]" />
      </div>

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm group-hover:shadow-md transition-shadow">
            <Activity className="h-5 w-5" />
          </span>
          <span
            className="text-xl font-semibold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Wasobi<span className="text-accent">Care</span>
          </span>
        </Link>

        <div className="text-center mb-8">
          <h1
            className="text-3xl font-semibold text-foreground mb-2 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to view your lab result analyses
          </p>
        </div>

        <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-accent/50 focus:ring-2 focus:ring-accent/10 focus:bg-background"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-accent/50 focus:ring-2 focus:ring-accent/10 focus:bg-background"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isPending ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-accent hover:text-accent/80 font-medium transition-colors">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
