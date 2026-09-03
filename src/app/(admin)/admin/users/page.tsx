import { Placeholder } from "@/components/common/placeholder";

export default function AdminUsersPage() {
  return (
    <Placeholder
      title="Users"
      features="AUM1, AUM3-AUM6, U1-U6"
      description="Searchable user table with role badges. Only a super admin sees the role and delete actions."
      backHref="/admin/dashboard"
      backLabel="Back to dashboard"
    />
  );
}
