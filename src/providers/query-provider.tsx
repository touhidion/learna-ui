"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { isApiError } from "@/lib/api";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Server data is stale after a minute; the window regaining focus does
        // not need to refetch a course listing that just loaded.
        staleTime: 60_000,
        refetchOnWindowFocus: false,

        retry(failureCount, error) {
          // A 4xx will not become a 2xx by asking again. Retry only the
          // network-level failures.
          if (isApiError(error) && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        // Mutations are never retried: a duplicate enrol or create is worse
        // than a visible failure the user can act on.
        retry: false,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Held in state, not a module constant: a module-level client would be
  // shared across requests during server rendering, leaking one user's cached
  // data into another's response.
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
