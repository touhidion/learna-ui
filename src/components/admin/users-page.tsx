"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Shield, Trash2, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";
import { Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "@/hooks/use-api";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/providers/auth-provider";
import { isApiError } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { type Role, type User, isSuperAdmin } from "@/types/user";

const createSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
  role: z.enum(["learner", "admin"]),
});

type CreateValues = z.infer<typeof createSchema>;

/** Admin user management — features AUM1..AUM6. */
export function AdminUsersPage() {
  const { user: me } = useAuth();
  const canManageRoles = isSuperAdmin(me?.role); // AUM6

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useUsers({
    search: debouncedSearch || undefined,
    role: role || undefined,
    page,
    page_size: 20,
  });

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  const deleteUser = useDeleteUser();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            {canManageRoles
              ? "Create accounts, assign roles and deactivate access."
              : "You can create and edit learners. Only a super admin can manage admins."}
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus aria-hidden="true" />
          New user
        </Button>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // a new filter invalidates the current page number
            }}
            placeholder="Search name or email"
            aria-label="Search users"
            className="pl-9"
          />
        </div>
        <Select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by role"
          className="w-44"
        >
          <option value="">All roles</option>
          <option value="learner">Learner</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super admin</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableEmpty colSpan={6}>
                  <EmptyState
                    title="No users match"
                    description="Try a different search or filter."
                    className="border-0"
                  />
                </TableEmpty>
              ) : (
                data?.items.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "learner" ? "secondary" : "default"}>
                        {u.role === "super_admin" && (
                          <Shield className="mr-1 size-3" aria-hidden="true" />
                        )}
                        {u.role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.is_active ? "success" : "outline"}>
                        {u.is_active ? "active" : "inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(u.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Your own row is not editable here — the API refuses it,
                          so offering the action would only produce a 403. */}
                      {u.id === me?.id ? (
                        <span className="text-xs text-muted-foreground">You</span>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditing(u)}
                            aria-label={`Edit ${u.name}`}
                          >
                            <UserCog aria-hidden="true" />
                          </Button>
                          {canManageRoles && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleting(u)}
                              aria-label={`Delete ${u.name}`}
                            >
                              <Trash2 className="text-destructive" aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data && data.meta.total_pages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {data.meta.page} of {data.meta.total_pages} · {data.meta.total_items} users
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.meta.has_prev}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.meta.has_next}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <CreateUserDialog
        open={creating}
        onClose={() => setCreating(false)}
        canCreateAdmin={canManageRoles}
      />

      <EditUserDialog
        user={editing}
        onClose={() => setEditing(null)}
        canManageRoles={canManageRoles}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        isLoading={deleteUser.isPending}
        title={`Delete ${deleting?.name}?`}
        confirmLabel="Delete user"
        description={
          <>
            This permanently removes the account along with its enrollments,
            progress and certificates. It cannot be undone.
          </>
        }
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteUser.mutateAsync(deleting.id);
            setDeleting(null);
          } catch {
            // The toast in useApiMutation already reported it; keep the dialog
            // open so the reason stays visible next to the action.
          }
        }}
      />
    </div>
  );
}

/** AUM2 — create a user. */
function CreateUserDialog({
  open,
  onClose,
  canCreateAdmin,
}: {
  open: boolean;
  onClose: () => void;
  canCreateAdmin: boolean;
}) {
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", email: "", password: "", role: "learner" },
  });

  async function onSubmit(values: CreateValues) {
    try {
      await createUser.mutateAsync(values);
      reset();
      onClose();
    } catch (error) {
      if (isApiError(error)) {
        if (error.code === "CONFLICT") {
          setError("email", { message: error.message });
          return;
        }
        for (const f of error.fields) {
          if (f.field in values) {
            setError(f.field as keyof CreateValues, { message: f.message });
          }
        }
      }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New user"
      description="The account is active immediately."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            isLoading={createUser.isPending}
          >
            Create user
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Name" htmlFor="new-name" error={errors.name?.message}>
          <Input id="new-name" hasError={Boolean(errors.name)} {...register("name")} />
        </Field>

        <Field label="Email" htmlFor="new-email" error={errors.email?.message}>
          <Input
            id="new-email"
            type="email"
            hasError={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="new-password"
          error={errors.password?.message}
          hint="The user can change this later."
        >
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            hasError={Boolean(errors.password)}
            {...register("password")}
          />
        </Field>

        <div className="space-y-2">
          <Label htmlFor="new-role">Role</Label>
          <Select id="new-role" {...register("role")}>
            <option value="learner">Learner</option>
            {/* AUM6: only a super admin sees this, and the API enforces it too. */}
            {canCreateAdmin && <option value="admin">Admin</option>}
          </Select>
        </div>
      </form>
    </Dialog>
  );
}

/** AUM3, AUM4 — edit a user's name, role and active status. */
function EditUserDialog({
  user,
  onClose,
  canManageRoles,
}: {
  user: User | null;
  onClose: () => void;
  canManageRoles: boolean;
}) {
  const updateUser = useUpdateUser();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("learner");
  const [isActive, setIsActive] = useState(true);

  // Re-seed the form whenever a different row is opened.
  const [seeded, setSeeded] = useState<string | null>(null);
  if (user && seeded !== user.id) {
    setSeeded(user.id);
    setName(user.name);
    setRole(user.role);
    setIsActive(user.is_active);
  }

  if (!user) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Edit ${user.name}`}
      description={user.email}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={updateUser.isPending}
            onClick={async () => {
              try {
                await updateUser.mutateAsync({
                  id: user.id,
                  name,
                  ...(canManageRoles && role !== user.role ? { role } : {}),
                  ...(isActive !== user.is_active ? { is_active: isActive } : {}),
                });
                onClose();
              } catch {
                // Reported by the mutation's error toast.
              }
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name" htmlFor="edit-name">
          <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        {canManageRoles && (
          <div className="space-y-2">
            <Label htmlFor="edit-role">Role</Label>
            <Select
              id="edit-role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="learner">Learner</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </Select>
          </div>
        )}

        <label className="flex items-center gap-2 text-sm" htmlFor="edit-active">
          <input
            id="edit-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-4 rounded border-input"
          />
          Account is active
        </label>
        <p className="text-xs text-muted-foreground">
          Deactivating signs the user out everywhere and blocks new sign-ins.
          Their data is kept.
        </p>
      </div>
    </Dialog>
  );
}
