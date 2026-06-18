"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
  Activity,
  Upload,
  Globe,
  Volume2,
  ShieldCheck,
  Microscope,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  Eye,
  Heart,
  Accessibility as AccessIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

const FEATURES = [
  {
    icon: Upload,
    title: "Instant Upload",
    description: "Drop medical lab result PDFs or snaps of papers directly from your device.",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-500/10 dark:bg-teal-500/20",
  },
  {
    icon: Sparkles,
    title: "AI Analysis Engine",
    description: "Gemini AI breaks down complex numbers and names into everyday terms.",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Read explanations instantly in Yoruba, Igbo, Hausa, or English.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  {
    icon: Volume2,
    title: "Listen Out Loud",
    description: "Clear audio translations let you hear and understand results on the go.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Patient Education",
    description: "Purely educational insights. We explain jargon so you can talk to your doctor.",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10 dark:bg-sky-500/20",
  },
  {
    icon: Microscope,
    title: "Track History",
    description: "Keep all previous lab reports in a clean, encrypted database dashboard.",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
  },
];

const TIMELINE_STEPS = [
  {
    step: "01",
    title: "Upload Securely",
    desc: "Your reports are scanned in-browser with advanced encryption.",
  },
  {
    step: "02",
    title: "AI Extraction",
    desc: "We read your biometric values and reference ranges accurately.",
  },
  {
    step: "03",
    title: "Plain Translation",
    desc: "Complex medical terms map to simple everyday language phrases.",
  },
  {
    step: "04",
    title: "Audio Playback",
    desc: "Listen in your preferred local language with our natural voice reader.",
  },
];

const TESTIMONIALS = [
  {
    quote: "As an elderly patient, lab sheets looked like a foreign code. Hearing my blood counts in Yoruba made me feel in control of my health.",
    author: "Baba Tunde",
    role: "Patient from Ibadan",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
  },
  {
    quote: "My mother couldn't understand her cholesterol results. Translating them to Hausa let her understand the diet advice our doctor gave.",
    author: "Fatima Bello",
    role: "Caregiver from Kano",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120"
  },
  {
    quote: "Excellent software. Simple, extremely accessible, and completely safe. Highly recommend to anyone seeking clarity on their tests.",
    author: "Dr. Chioma Nwachukwu",
    role: "Family Physician",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120"
  }
];

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-md shadow-primary/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Wasobi<span className="text-primary">Care</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isLoaded && isSignedIn ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "primary" }),
                  "shadow-md shadow-primary/10 hover:shadow-primary/20"
                )}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className={cn(
                    buttonVariants({ variant: "primary" }),
                    "shadow-md shadow-primary/10 hover:shadow-primary/20"
                  )}
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Decorative Grid Backdrops */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,var(--color-accent),transparent_70%)]" />

        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pt-20 pb-28 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-xs font-semibold text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Powered by Advanced Gemini AI
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground"
            >
              Understand Your <span className="text-primary">Lab Results</span> <br />
              in Plain Language
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Translate complicated medical jargon into easy-to-understand terms. Available in{" "}
              <strong className="text-foreground font-semibold">Yorùbá, Hausa, Igbo, and English</strong>.
              Safe, educational, and instant.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {isLoaded && isSignedIn ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 px-6 text-sm w-full sm:w-auto font-medium"
                  )}
                >
                  <Upload className="mr-2 h-4.5 w-4.5" />
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/sign-up"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 px-6 text-sm w-full sm:w-auto font-medium"
                  )}
                >
                  <Upload className="mr-2 h-4.5 w-4.5" />
                  Upload Lab Result Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              )}
              <a
                href="#how-it-works"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 px-6 text-sm w-full sm:w-auto"
                )}
              >
                See How it Works
              </a>
            </motion.div>
          </div>

          {/* Hero Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 mx-auto max-w-5xl rounded-2xl border border-border/80 bg-card p-3 shadow-xl dark:shadow-2xl/40"
          >
            <div className="overflow-hidden rounded-xl border border-border/40 relative aspect-[16/9] w-full bg-muted">
              <Image
                src="/hero_dashboard.png"
                alt="WazobiCare Premium Dashboard Overview"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        </section>

        {/* Feature grid showcase */}
        <section className="border-t border-border/40 bg-muted/40 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Designed for Patients & Caregivers
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                No more Googling panic. We explain your metrics so you can have structured discussions with doctors.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, idx) => (
                <Card
                  key={idx}
                  className="bg-card border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader className="pb-4">
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl",
                        feature.bg
                      )}
                    >
                      <feature.icon className={cn("h-5 w-5", feature.color)} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CardTitle className="text-lg font-bold text-foreground">
                      {feature.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Workflow */}
        <section id="how-it-works" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                The AI Laboratory Workflow
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Transforming hard results into simple answers takes four straightforward steps.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              {TIMELINE_STEPS.map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="space-y-4">
                    <div className="text-5xl font-black text-primary/10 group-hover:text-primary/20 transition-colors">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-6 right-0 translate-x-1/2 text-border">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Double Showcase Sections */}
        <section className="py-20 border-t border-border/40 bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-32">
            
            {/* Showcase 1 */}
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <Lock className="w-3.5 h-3.5" /> High Privacy Scan
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Accurate extraction with secure processing
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Our pipeline processes your documents using high-fidelity Optical Character Recognition (OCR). The system handles blurry mobile shots, extract tables, and flags ranges without storing health metrics permanently.
                </p>
                <div className="space-y-3 pt-2">
                  {[
                    "HIPAA-compliant hosting components",
                    "Temporary processing without session cookies tracking",
                    "Intelligent outlier detection for biometric metrics",
                  ].map((bullet) => (
                    <div key={bullet} className="flex items-center gap-2.5 text-sm font-medium">
                      <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative aspect-[4/3] w-full max-w-lg mx-auto rounded-xl overflow-hidden border border-border shadow-lg">
                <Image
                  src="/upload_illustration.png"
                  alt="AI scanning lab results dashboard screen"
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Showcase 2 */}
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="relative aspect-[4/3] w-full max-w-lg mx-auto rounded-xl overflow-hidden border border-border shadow-lg order-2 lg:order-1">
                <Image
                  src="/translate_illustration.png"
                  alt="AI dashboard demonstrating language translations"
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover"
                />
              </div>
              <div className="space-y-6 order-1 lg:order-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <Globe className="w-3.5 h-3.5" /> Native Dialects
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Cultural translation for true comprehension
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Medical facts can feel distant when explained in sterile English. We structure definitions and summaries directly into cultural vernaculars like Igbo, Hausa, Yoruba, and Nigerian English.
                </p>
                <div className="space-y-3 pt-2">
                  {[
                    "Colloquial terminology matching local health concepts",
                    "High accuracy speech voice reader synthesis support",
                    "One-tap real time language toggler controls",
                  ].map((bullet) => (
                    <div key={bullet} className="flex items-center gap-2.5 text-sm font-medium">
                      <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Accessibility Panel Section */}
        <section className="py-24 border-t border-border/40">
          <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent text-primary mb-2">
              <AccessIcon className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Accessibility First Approach</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform fully supports the screen-reader-friendly Web Speech API, enabling visually impaired or non-literate patients to listen to reports in their languages. Keyboard controls are enabled across the system.
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-muted/40 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Stories of Impact</h2>
              <p className="text-lg text-muted-foreground">See how WazobiCare helps families across Nigeria take control of their diagnoses.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="flex flex-col justify-between bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm text-foreground/90 italic leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                      <Image src={t.avatar} alt={t.author} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{t.author}</h4>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-20 border-t border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Lock,
                  title: "GDPR & Privacy Guarded",
                  desc: "We process documents temporarily and do not sell, trade, or share laboratory reports with any third-party providers.",
                },
                {
                  icon: Eye,
                  title: "Transparent Sources",
                  desc: "All definitions match standard clinical reference guides. We show the exact range values from your raw document.",
                },
                {
                  icon: Heart,
                  title: "Educational Purpose Only",
                  desc: "This software is for clarity. It assists your conversation with licensed general practitioners and does not diagnose.",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent text-primary flex items-center justify-center">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call To Action */}
        <section className="py-28 relative overflow-hidden border-t border-border/40">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_65%)]" />
          <div className="mx-auto max-w-4xl px-4 text-center space-y-8">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              Democratize Your Biometrics Today
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Join thousands of patients understanding their records in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isLoaded && isSignedIn ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 px-8 text-sm font-semibold w-full sm:w-auto shadow-lg shadow-primary/20"
                  )}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/sign-up"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 px-8 text-sm font-semibold w-full sm:w-auto shadow-lg shadow-primary/20"
                  )}
                >
                  Create Free Account
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-foreground">WazobiCare Nigeria</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Disclaimer: WazobiCare leverages Gemini AI models for biometric context extraction. It is an educational tool and does not provide clinical diagnostic reports. Always discuss tests with certified clinical professionals.
          </p>
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} WazobiCare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
