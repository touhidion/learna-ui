import Link from "next/link";
import { Award, BookOpen, CheckCircle2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { HeroActions } from "@/components/common/hero-actions";
import { FeaturedCourses } from "@/components/course/featured-courses";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Ambient Hero Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform-gpu">
        <div className="h-[450px] w-[800px] bg-gradient-to-tr from-primary/15 via-indigo-500/10 to-transparent blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary backdrop-blur">
          <span className="flex size-2 rounded-full bg-primary animate-pulse" />
          <span>Modern Self-Hosted Learning Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl text-balance">
          Master new skills with structured courses &amp; verified certificates
        </h1>

        {/* Hero Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg text-pretty">
          {env.siteName} provides distraction-free learning. Follow step-by-step modules, resume
          seamlessly from any device, and claim authentic credentials upon completion.
        </p>

        {/* CTA Buttons */}
        <HeroActions />

        {/* Trust & Highlights Bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground sm:gap-10 sm:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-primary" />
            <span>100% Free &amp; Self-Paced</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span>Publicly Verifiable Credentials</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span>Persistent Progress Tracking</span>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <FeaturedCourses />

      {/* Features Section — Simple & Modern 3-Column Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24 border-t border-border/40">
        <div className="mx-auto max-w-2xl text-center space-y-3 mb-12 sm:mb-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Designed for Real Learning</h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Everything you need to acquire new skills without unnecessary complexity.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Structured Curriculum",
              body: "Organized into clear modules and lessons with formatted code, embedded videos, and focused reading materials.",
              color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
            },
            {
              icon: TrendingUp,
              title: "Seamless Progress",
              body: "Every finished lesson is securely recorded. Pick up right where you paused without losing your momentum.",
              color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
            },
            {
              icon: Award,
              title: "Verifiable Certificates",
              body: "Earn tamper-proof certificates with unique serial numbers that anyone can verify instantly via a public link.",
              color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
            },
          ].map(({ icon: Icon, title, body, color }) => (
            <Card
              key={title}
              className="group relative overflow-hidden border-border/60 bg-card/60 backdrop-blur transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-primary/5"
            >
              <CardContent className="p-6 space-y-4">
                <div className={cn("flex size-12 items-center justify-center rounded-2xl border", color)}>
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Simple Modern Bottom CTA Banner */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent p-8 sm:p-14 text-center">
          <div className="mx-auto max-w-2xl space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to expand your skillset?
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Join today, explore our course catalog, and earn your verified certificate of completion.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/courses"
                className={cn(buttonVariants({ size: "lg" }), "font-semibold shadow-md shadow-primary/20")}
              >
                Browse All Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}