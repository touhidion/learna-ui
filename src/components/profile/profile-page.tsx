"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Badge, PageSpinner } from "@/components/ui/feedback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useChangePassword, useUpdateProfile } from "@/hooks/use-api";
import { useAuth } from "@/providers/auth-provider";
import { isApiError } from "@/lib/api";
import { formatDate, initials } from "@/lib/utils";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Enter your current password."),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password must be at most 72 characters."),
    confirm_password: z.string().min(1, "Confirm the new password."),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  })
  .refine((v) => v.new_password !== v.current_password, {
    message: "New password must differ from the current one.",
    path: ["new_password"],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

/** Profile page — features LP1, LP2, LP3. */
export function ProfilePage() {
  const { user, refreshUser } = useAuth();

  if (!user) return <PageSpinner label="Loading your profile" />;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <ProfileSummary />
      <ProfileForm onSaved={refreshUser} />
      <PasswordForm />
    </div>
  );
}

/** LP1 — read-only identity summary. */
function ProfileSummary() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-lg font-semibold text-primary-foreground">
          {user.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element --
               avatars come from Cloudinary, which is not a next/image host */
            <img src={user.avatar_url} alt="" className="size-16 object-cover" />
          ) : (
            initials(user.name)
          )}
        </div>

        <div className="min-w-0 space-y-1">
          <h1 className="truncate text-xl font-semibold">{user.name}</h1>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-2 pt-1">
            <Badge variant={user.role === "learner" ? "secondary" : "default"}>
              {user.role === "super_admin" && (
                <Shield className="mr-1 size-3" aria-hidden="true" />
              )}
              {user.role.replace("_", " ")}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Joined {formatDate(user.created_at)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** LP2 — edit name. */
function ProfileForm({ onSaved }: { onSaved: () => Promise<void> }) {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? "" },
  });

  async function onSubmit(values: ProfileValues) {
    try {
      await updateProfile.mutateAsync(values);
      // The provider caches the user, so it has to re-read after a change or
      // the navbar keeps showing the old name.
      await onSaved();
    } catch (error) {
      if (isApiError(error) && error.isValidation) {
        for (const f of error.fields) {
          if (f.field === "name") setError("name", { message: f.message });
        }
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your email address cannot be changed here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" hasError={Boolean(errors.name)} {...register("name")} />
          </Field>

          <Field label="Email" htmlFor="email" hint="Contact an administrator to change this.">
            <Input id="email" value={user?.email ?? ""} disabled readOnly />
          </Field>

          <Button type="submit" isLoading={updateProfile.isPending} disabled={!isDirty}>
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/** LP3 — change password. */
function PasswordForm() {
  const changePassword = useChangePassword();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  });

  async function onSubmit(values: PasswordValues) {
    try {
      await changePassword.mutateAsync({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      reset();
      setDone(true);
    } catch (error) {
      // The API answers 401 for a wrong current password, which belongs on
      // that field rather than as a generic banner.
      if (isApiError(error) && error.status === 401) {
        setError("current_password", { message: error.message });
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Changing your password signs out every other device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field
            label="Current password"
            htmlFor="current_password"
            error={errors.current_password?.message}
          >
            <PasswordInput
              id="current_password"
              autoComplete="current-password"
              hasError={Boolean(errors.current_password)}
              {...register("current_password")}
            />
          </Field>

          <Field
            label="New password"
            htmlFor="new_password"
            error={errors.new_password?.message}
            hint="At least 8 characters."
          >
            <PasswordInput
              id="new_password"
              autoComplete="new-password"
              hasError={Boolean(errors.new_password)}
              {...register("new_password")}
            />
          </Field>

          <Field
            label="Confirm new password"
            htmlFor="confirm_password"
            error={errors.confirm_password?.message}
          >
            <PasswordInput
              id="confirm_password"
              autoComplete="new-password"
              hasError={Boolean(errors.confirm_password)}
              {...register("confirm_password")}
            />
          </Field>

          {done && (
            <p className="text-sm text-success" role="status">
              Password updated.
            </p>
          )}

          <Button type="submit" isLoading={changePassword.isPending}>
            Change password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
