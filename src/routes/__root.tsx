import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { RouteLoader } from "@/components/RouteLoader";
import { NotFoundState, ErrorState } from "@/components/site/ErrorStates";
import { enforceSessionPersistence } from "@/lib/auth-persistence";


function NotFoundComponent() {
  return <NotFoundState />;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return <ErrorState error={error} reset={reset} />;
}


export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "World TEBMA Martial Arts Federation" },
      {
        name: "description",
        content:
          "Global governing body for traditional TEBMA martial arts. Certification, competition, and standards across 140 member nations.",
      },
      { name: "author", content: "World TEBMA Federation" },
      { property: "og:site_name", content: "World TEBMA Federation" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "World TEBMA Martial Arts Federation",
              url: "https://tebma-hub.lovable.app",
              description:
                "The global governing body for traditional TEBMA martial arts, overseeing certification, competition, and standards across 140 member nations.",
              foundingDate: "1974",
            },
            {
              "@type": "WebSite",
              name: "World TEBMA Martial Arts Federation",
              url: "https://tebma-hub.lovable.app",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://tebma-hub.lovable.app/dictionary?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    void enforceSessionPersistence();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouteLoader />
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
