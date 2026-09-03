"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Lock, LogIn, Mail } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { errorMessage, isApiError } from "@/lib/api";
import { homeRouteFor } from "@/types/user";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      const user = await login(values.email, values.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);

      const next = searchParams.get("next");
      router.replace(next && next.startsWith("/") ? next : homeRouteFor(user.role));
    } catch (error) {
      if (isApiError(error) && error.isValidation) {
        for (const field of error.fields) {
          if (field.field === "email" || field.field === "password") {
            setError(field.field, { message: field.message });
          }
        }
        return;
      }
      setFormError(errorMessage(error));
    }
  }

  return (
    <Card className="border-border/70 bg-card/90 shadow-2xl backdrop-blur-sm">
      <CardHeader className="space-y-1.5 pb-6 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription className="text-sm">
          Enter your credentials to continue your learning journey
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Email address" htmlFor="email" error={errors.email?.message}>
            <div className="relative">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                hasError={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="h-11"
                {...register("email")}
              />
            </div>
          </Field>

          <Field label="Password" htmlFor="password" error={errors.password?.message}>
            <div className="space-y-1">
              <PasswordInput
                id="password"
                autoComplete="current-password"
                hasError={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="h-11"
                {...register("password")}
              />
            </div>
          </Field>

          <div className="flex justify-end text-xs">
            <Link
              href="/forgot-password"
              className="text-muted-foreground transition-colors hover:text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

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
            <span>Sign in</span>
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-muted-foreground">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Create an account free
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}