import Link from "next/link";
import { Award, BookOpen, TrendingUp } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";

/**
 * Landing page — feature UP1.
 *
 * A server component with no data fetching yet: the featured-courses grid and
 * the stats row arrive with the course module (PC1).
 */
export default function LandingPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Structured training your team will actually finish
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
          {env.siteName} is a self-hosted learning portal. Build courses from modules and
          lessons, track progress, and issue verifiable certificates.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/courses" className={cn(buttonVariants({ size: "lg" }))}>
            Browse courses
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Create an account
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Structured courses",
              body: "Modules and lessons in the order you choose, with markdown content, video and downloadable attachments.",
            },
            {
              icon: TrendingUp,
              title: "Progress that sticks",
              body: "Every completed lesson is recorded, so learners always resume exactly where they stopped.",
            },
            {
              icon: Award,
              title: "Verifiable certificates",
              body: "Finish a course and get a certificate with a number anyone can check against a public URL.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <CardContent className="pt-6">
                <Icon className="size-6 text-primary" aria-hidden="true" />
                <h2 className="mt-4 font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
