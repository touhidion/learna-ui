"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { errorMessage, post } from "@/lib/api";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
});

const resetSchema = z
  .object({
    token: z.string().min(1, "The reset token is required."),
    password: z.string().min(8, "Password must be at least 8 characters.").max(72),
    confirm_password: z.string().min(1, "Confirm the new password."),
  })
  .refine((v) => v.password === v.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

type ForgotValues = z.infer<typeof forgotSchema>;
type ResetValues = z.infer<typeof resetSchema>;

/**
 * Forgot password — feature UA3.
 *
 * The API answers identically whether or not the address exists, so this shows
 * the same acknowledgement either way. Email delivery is Phase 3; outside
 * production the API returns the token in the body, and it is surfaced here so
 * the flow is testable.
 */
export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotValues) {
    try {
      const res = await post<{ message: string; token?: string }>(
        "/auth/forgot-password",
        values,
      );
      setSent(true);
      if (res.token) setDevToken(res.token);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  if (sent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            If an account exists for that address, a reset link has been sent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {devToken && (
            <div className="space-y-2 rounded-md border border-warning/40 bg-warning/10 p-3">
              <p className="text-xs font-medium">
                Development only — the API returned the token directly:
              </p>
              <code className="block break-all text-xs">{devToken}</code>
              <Link
                href={`/reset-password?token=${encodeURIComponent(devToken)}`}
                className="inline-block text-xs font-medium text-primary hover:underline"
              >
                Continue to reset →
              </Link>
            </div>
          )}
          <Link href="/login" className="block text-sm text-primary hover:underline">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>We will send you a link to set a new one.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              hasError={Boolean(errors.email)}
              {...register("email")}
            />
          </Field>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Send reset link
          </Button>
        </form>
        <Link href="/login" className="mt-4 block text-sm text-muted-foreground hover:text-foreground">
          Back to sign in
        </Link>
      </CardContent>
    </Card>
  );
}

/** Reset password — feature UA4. The token arrives as a query parameter. */
export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      token: searchParams.get("token") ?? "",
      password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(values: ResetValues) {
    try {
      await post("/auth/reset-password", {
        token: values.token,
        password: values.password,
        confirm_password: values.confirm_password,
      });
      toast.success("Password updated. Sign in with your new password.");
      router.replace("/login");
    } catch (error) {
      // An expired or spent token is a problem with the link, not the password.
      setError("token", { message: errorMessage(error) });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
        <CardDescription>This signs out every other device.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field
            label="Reset token"
            htmlFor="token"
            error={errors.token?.message}
            hint="Filled in automatically from your reset link."
          >
            <Input
              id="token"
              hasError={Boolean(errors.token)}
              className="font-mono text-xs"
              {...register("token")}
            />
          </Field>

          <Field
            label="New password"
            htmlFor="password"
            error={errors.password?.message}
            hint="At least 8 characters."
          >
            <PasswordInput
              id="password"
              autoComplete="new-password"
              hasError={Boolean(errors.password)}
              {...register("password")}
            />
          </Field>

          <Field
            label="Confirm password"
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

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
