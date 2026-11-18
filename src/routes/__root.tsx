import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { AppDataProvider } from "../lib/app-data";
import { I18nProvider } from "../lib/i18n";
import { SITE } from "../lib/site-config";

const BASE_URL = import.meta.env.BASE_URL;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${SITE.name} — Offline-first CRM for freelancers` },
      { name: "description", content: SITE.description },
      { name: "author", content: SITE.owner },
      { name: "theme-color", content: SITE.themeColor },
      { property: "og:site_name", content: SITE.name },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "CRM for Freelancer" },
      { property: "og:title", content: "CRM for Freelancer" },
      { name: "twitter:title", content: "CRM for Freelancer" },
      { name: "description", content: "Freelance Hub is an offline-first web CRM for freelancers to manage clients, proposals, interviews, and invoices." },
      { property: "og:description", content: "Freelance Hub is an offline-first web CRM for freelancers to manage clients, proposals, interviews, and invoices." },
      { name: "twitter:description", content: "Freelance Hub is an offline-first web CRM for freelancers to manage clients, proposals, interviews, and invoices." },
      { property: "og:image", content: `${SITE.url}${SITE.ogImage}` },
      { name: "twitter:image", content: `${SITE.url}${SITE.ogImage}` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: `${BASE_URL}favicon.ico`, type: "image/x-icon" },
      { rel: "manifest", href: `${BASE_URL}manifest.webmanifest` },
      { rel: "apple-touch-icon", href: `${BASE_URL}favicon.ico` },
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

  return (
    <QueryClientProvider client={queryClient}>
      <AppDataProvider>
        <I18nProvider>
          <Outlet />
          <Toaster richColors position="top-right" />
        </I18nProvider>
      </AppDataProvider>
    </QueryClientProvider>
  );
}
