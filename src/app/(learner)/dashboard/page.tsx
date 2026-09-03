import type { Metadata } from "next";

import { Placeholder } from "@/components/common/placeholder";

export const metadata: Metadata = { title: "My learning" };

export default function DashboardPage() {
  return (
    <Placeholder
      title="My courses"
      features="LD1, LD2, E3"
      description="Enrolled courses with a progress bar on each card, and a Continue button that jumps to the first incomplete lesson."
      backHref="/courses"
      backLabel="Browse courses"
    />
  );
}
