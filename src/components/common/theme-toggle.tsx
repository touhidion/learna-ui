"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Light/dark toggle — feature UI6. next-themes persists the choice.
 *
 * Both icons are always rendered and swapped by the `dark:` variant, rather
 * than picking one from `resolvedTheme`. The resolved theme is unknown during
 * server rendering, so choosing in JS would either flash the wrong icon or
 * need a mounted flag; CSS keys off the same `.dark` class next-themes writes
 * onto <html> before hydration, so the icon is correct on first paint.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <Moon className="dark:hidden" aria-hidden="true" />
      <Sun className="hidden dark:block" aria-hidden="true" />
    </Button>
  );
}
