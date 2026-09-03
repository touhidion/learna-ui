import type { Metadata } from "next";

import { Placeholder } from "@/components/common/placeholder";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <Placeholder
      title="Profile"
      features="LP1-LP3, P1-P3"
      description="View and edit your profile, upload an avatar, change your password. All three API endpoints are live."
      backHref="/dashboard"
      backLabel="Back to my courses"
    />
  );
}
