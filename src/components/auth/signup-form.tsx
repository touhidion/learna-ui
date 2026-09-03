"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { errorMessage, isApiError } from "@/lib/api";
import { homeRouteFor } from "@/types/user";

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
      toast.success("Account created successfully. Welcome to Learna!");
      router.replace(homeRouteFor(user.role));
    } catch (error) {
      if (isApiError(error)) {
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
    <Card className="border-border/70 bg-card/90 shadow-2xl backdrop-blur-sm">
      <CardHeader className="space-y-1.5 pb-6 text-center">
        <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" /> Start Learning Free
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
        <CardDescription className="text-sm">
          Get unlimited access to courses &amp; verifiable certificates
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Full name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              autoComplete="name"
              placeholder="e.g. Alex Johnson"
              hasError={Boolean(errors.name)}
              className="h-11"
              {...register("name")}
            />
          </Field>

          <Field label="Email address" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              hasError={Boolean(errors.email)}
              className="h-11"
              {...register("email")}
            />
          </Field>

          <Field
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
            hint="Must be at least 8 characters."
          >
            <PasswordInput
              id="password"
              autoComplete="new-password"
              hasError={Boolean(errors.password)}
              className="h-11"
              {...register("password")}
            />
          </Field>

          <Field
            label="Confirm password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              hasError={Boolean(errors.confirmPassword)}
              className="h-11"
              {...register("confirmPassword")}
            />
          </Field>

          {formError && (
            <div
              role="alert"
              className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Button
            type="submit"
            className="h-11 w-full gap-2 bg-gradient-to-r from-primary to-indigo-600 font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:from-primary/95 hover:to-indigo-500"
            isLoading={isSubmitting}
          >
            <span>Create Account</span>
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}