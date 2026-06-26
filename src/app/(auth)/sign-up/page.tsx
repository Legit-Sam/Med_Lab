"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, Eye, EyeOff, Loader2, CheckCircle2, Globe, Lock, Volume2 } from "lucide-react";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const confirmPassword = form.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Registration failed.");
          return;
        }

        toast.success("Account created! Complete your profile to get started.");
        router.push("/complete-profile");
        router.refresh();
      } catch {
        toast.error("Unable to create account. Please try again.");
      }
    });
  };

  return (
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
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
              Understand your health in your language
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Join thousands of patients who now understand their medical lab results without confusion or panic.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              {
                icon: Lock,
                title: "Secure & Private",
                desc: "Your data is encrypted and never shared",
              },
              {
                icon: Globe,
                title: "Your Language",
                desc: "Yoruba, Igbo, Hausa, or English",
              },
              {
                icon: Volume2,
                title: "Hear It Aloud",
                desc: "Listen to clear audio explanations",
              },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mt-1">
                  <benefit.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{benefit.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            {[
              { num: "5K+", label: "Users" },
              { num: "50K+", label: "Reports" },
              { num: "4", label: "Languages" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                className="space-y-1"
              >
                <p className="text-2xl font-bold text-accent">{stat.num}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
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
              Create your free account
            </h1>
            <p className="text-sm text-muted-foreground">
              Join thousands understanding their health better
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
                <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-accent/50 focus:ring-2 focus:ring-accent/10 focus:bg-background"
                    placeholder="At least 8 characters"
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

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-accent/50 focus:ring-2 focus:ring-accent/10 focus:bg-background"
                    placeholder="Repeat your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                {isPending ? "Creating account..." : "Create Account"}
              </button>

              {/* Legal */}
              <p className="text-xs text-muted-foreground text-center">
                By creating an account, you agree to our Terms. We protect your privacy.
              </p>
            </form>

            {/* Sign In Link */}
            <div className="pt-4 border-t border-border/40 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-accent hover:text-accent/80 font-semibold transition-colors">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
