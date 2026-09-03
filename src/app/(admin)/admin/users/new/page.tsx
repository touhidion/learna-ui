import { Placeholder } from "@/components/common/placeholder";

export default function NewUserPage() {
  return (
    <Placeholder
      title="New user"
      features="AUM2, U2"
      description="Create an account with a role. The admin option is visible to super admins only."
      backHref="/admin/users"
      backLabel="Back to users"
    />
  );
}
