import { SignIn } from "@clerk/nextjs";
import { Activity } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="bg-primary-band relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12">
      {/* Decorative soft glow */}
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent) 55%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-10 flex items-center justify-center gap-2.5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
            <Activity className="h-5 w-5 text-white" />
          </span>
          <span
            className="text-xl font-semibold tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Lab<span className="text-[color-mix(in_srgb,var(--accent)_70%,white)]">Explain</span>
          </span>
        </Link>

        <div className="text-center mb-8">
          <h1
            className="text-3xl font-semibold text-white mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welcome back
          </h1>
          <p className="text-white/70 text-sm">
            Sign in to view your lab result analyses
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-white border border-white/10 shadow-2xl rounded-2xl",
              headerTitle: "text-slate-900",
              headerSubtitle: "text-slate-500",
              socialButtonsBlockButton:
                "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
              formFieldLabel: "text-slate-700 font-medium",
              formFieldInput:
                "bg-white border-slate-200 text-slate-900 focus:border-[color:var(--accent)]",
              footerActionLink:
                "text-[color:var(--accent)] hover:opacity-80",
              formButtonPrimary:
                "bg-[color:var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary),black_10%)] text-white",
              dividerLine: "bg-slate-200",
              dividerText: "text-slate-400",
              footer: "hidden",
            },
          }}
        />
      </div>
    </div>
  );
}
