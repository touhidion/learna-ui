"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { errorMessage, isApiError } from "@/lib/api";
import { homeRouteFor } from "@/types/user";

// Mirrors the API's binding tags on request.Signup: 2..120, email, 8..72.
// Validating here too means a typo is caught before a round trip; the API
// stays the authority.
const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
    email: z.string().min(1, "Email is required.").email("Enter a valid email address.").max(255),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password must be at most 72 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;

/** Registration form — feature UA1. Self-registration always creates a learner. */
export function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: SignupValues) {
    setFormError(null);
    try {
      const user = await signup(values.name, values.email, values.password);
      toast.success("Account created. Welcome to Learna.");
      router.replace(homeRouteFor(user.role));
    } catch (error) {
      if (isApiError(error)) {
        // A taken email comes back as 409, not a field error.
        if (error.code === "CONFLICT") {
          setError("email", { message: error.message });
          return;
        }
        if (error.isValidation) {
          for (const field of error.fields) {
            if (field.field === "name" || field.field === "email" || field.field === "password") {
              setError(field.field, { message: field.message });
            }
          }
          return;
        }
      }
      setFormError(errorMessage(error));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Free, and takes a moment.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Ada Lovelace"
              hasError={Boolean(errors.name)}
              {...register("name")}
            />
          </Field>

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

          <Field
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
            hint="At least 8 characters."
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              hasError={Boolean(errors.password)}
              {...register("password")}
            />
          </Field>

          <Field
            label="Confirm password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
          >
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              hasError={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
          </Field>

          {formError && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Create account
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
