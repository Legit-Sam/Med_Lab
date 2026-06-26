"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, Eye, EyeOff, Loader2, Lock, FileText, Zap } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useNotification } from "@/hooks/useNotification";

export default function SignInPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const { notification, close, error, success } = useNotification();

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
          error("Sign in failed", data.error || "Invalid email or password. Please try again.");
          return;
        }

        success(
          "Welcome back! 👋",
          "Redirecting to your dashboard...",
          [
            {
              label: "Go to Dashboard",
              onClick: () => {
                router.push("/dashboard");
                router.refresh();
              },
              variant: "primary",
            },
          ]
        );
      } catch {
        error("Connection error", "Unable to sign in. Please check your connection and try again.");
      }
    });
  };

  return (
    <>
      <Modal
        isOpen={notification.isOpen}
        onClose={close}
        type={notification.type}
        title={notification.title}
        description={notification.description}
        actions={notification.actions}
        closeOnBackdropClick={!isPending}
      />
      <div className="relative min-h-screen flex overflow-hidden bg-background">
      {/* ─── Gradient backdrops ─── */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* ═══ LEFT SIDE: MESSAGING ═══ */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="hidden lg:flex flex-col justify-center items-start w-1/2 px-12 py-20 relative z-10"
      >
        <Link href="/" className="mb-auto flex items-center gap-2.5 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-emerald-600 text-accent-foreground shadow-lg shadow-accent/30 group-hover:scale-110 transition-transform">
            <Activity className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Wazobi<span className="text-accent">Care</span>
          </span>
        </Link>

        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
              Welcome back to your health insights
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Access your lab report library and continue your journey to understanding your health.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-5">
            {[
              {
                icon: FileText,
                title: "Your Reports",
                desc: "View all your analyzed lab results",
              },
              {
                icon: Zap,
                title: "Instant Analysis",
                desc: "Upload new results and get instant explanations",
              },
              {
                icon: Lock,
                title: "Secure Access",
                desc: "Your data is safe with encryption",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mt-1">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="pt-8 border-t border-border/40"
          >
            <p className="text-sm italic text-muted-foreground">
              &ldquo;Finally, I can understand what my doctor is telling me. No more confusion.&rdquo;
            </p>
            <p className="text-xs text-muted-foreground mt-2">— Sarah, Lagos</p>
          </motion.div>
        </div>
      </motion.div>

      {/* ═══ RIGHT SIDE: FORM ═══ */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-1 lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-8 py-8 sm:py-20"
      >
        <div className="w-full max-w-sm">
          {/* Logo for mobile */}
          <Link href="/" className="lg:hidden mb-8 flex items-center justify-center gap-2.5 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-emerald-600 text-accent-foreground shadow-lg shadow-accent/30">
              <Activity className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight">
              Wazobi<span className="text-accent">Care</span>
            </span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access your lab results
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-xl p-6 sm:p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-accent/50 focus:ring-2 focus:ring-accent/10 focus:bg-background"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-xs text-accent hover:text-accent/80 transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-accent/50 focus:ring-2 focus:ring-accent/10 focus:bg-background"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-accent text-accent-foreground font-semibold text-sm shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isPending ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="pt-4 border-t border-border/40 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="text-accent hover:text-accent/80 font-semibold transition-colors">
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </>
  );
}
