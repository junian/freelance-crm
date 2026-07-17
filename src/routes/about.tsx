import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import { AppShell, PageHeader, Card } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site-config";
import { useT } from "@/lib/i18n";

const DEPENDENCIES = [
  { name: "@hookform/resolvers", license: "MIT" },
  { name: "@radix-ui/react-accordion", license: "MIT" },
  { name: "@radix-ui/react-alert-dialog", license: "MIT" },
  { name: "@radix-ui/react-aspect-ratio", license: "MIT" },
  { name: "@radix-ui/react-avatar", license: "MIT" },
  { name: "@radix-ui/react-checkbox", license: "MIT" },
  { name: "@radix-ui/react-collapsible", license: "MIT" },
  { name: "@radix-ui/react-context-menu", license: "MIT" },
  { name: "@radix-ui/react-dialog", license: "MIT" },
  { name: "@radix-ui/react-dropdown-menu", license: "MIT" },
  { name: "@radix-ui/react-hover-card", license: "MIT" },
  { name: "@radix-ui/react-label", license: "MIT" },
  { name: "@radix-ui/react-menubar", license: "MIT" },
  { name: "@radix-ui/react-navigation-menu", license: "MIT" },
  { name: "@radix-ui/react-popover", license: "MIT" },
  { name: "@radix-ui/react-progress", license: "MIT" },
  { name: "@radix-ui/react-radio-group", license: "MIT" },
  { name: "@radix-ui/react-scroll-area", license: "MIT" },
  { name: "@radix-ui/react-select", license: "MIT" },
  { name: "@radix-ui/react-separator", license: "MIT" },
  { name: "@radix-ui/react-slider", license: "MIT" },
  { name: "@radix-ui/react-slot", license: "MIT" },
  { name: "@radix-ui/react-switch", license: "MIT" },
  { name: "@radix-ui/react-tabs", license: "MIT" },
  { name: "@radix-ui/react-toggle", license: "MIT" },
  { name: "@radix-ui/react-toggle-group", license: "MIT" },
  { name: "@radix-ui/react-tooltip", license: "MIT" },
  { name: "@tailwindcss/vite", license: "MIT" },
  { name: "@tanstack/react-query", license: "MIT" },
  { name: "@tanstack/react-router", license: "MIT" },
  { name: "@tanstack/react-start", license: "MIT" },
  { name: "@tanstack/router-plugin", license: "MIT" },
  { name: "class-variance-authority", license: "Apache-2.0" },
  { name: "clsx", license: "MIT" },
  { name: "cmdk", license: "MIT" },
  { name: "date-fns", license: "MIT" },
  { name: "dompurify", license: "MPL-2.0 OR Apache-2.0" },
  { name: "embla-carousel-react", license: "MIT" },
  { name: "input-otp", license: "MIT" },
  { name: "localforage", license: "Apache-2.0" },
  { name: "lucide-react", license: "ISC" },
  { name: "marked", license: "MIT" },
  { name: "prosekit", license: "MIT" },
  { name: "react", license: "MIT" },
  { name: "react-day-picker", license: "MIT" },
  { name: "react-dom", license: "MIT" },
  { name: "react-hook-form", license: "MIT" },
  { name: "react-resizable-panels", license: "MIT" },
  { name: "recharts", license: "MIT" },
  { name: "rehype-parse", license: "MIT" },
  { name: "rehype-remark", license: "MIT" },
  { name: "rehype-stringify", license: "MIT" },
  { name: "remark-gfm", license: "MIT" },
  { name: "remark-parse", license: "MIT" },
  { name: "remark-rehype", license: "MIT" },
  { name: "remark-stringify", license: "MIT" },
  { name: "sonner", license: "MIT" },
  { name: "tailwind-merge", license: "MIT" },
  { name: "tailwindcss", license: "MIT" },
  { name: "tw-animate-css", license: "MIT" },
  { name: "unified", license: "MIT" },
  { name: "vaul", license: "MIT" },
  { name: "vite-tsconfig-paths", license: "MIT" },
  { name: "zod", license: "MIT" },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${SITE.name}` },
      { name: "description", content: `${SITE.name} is an offline-first CRM for freelancers to organize clients, proposals, interviews, and invoices — data stays in your browser.` },
      { property: "og:title", content: `About — ${SITE.name}` },
      { property: "og:description", content: SITE.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
      { property: "og:image", content: `${SITE.url}${SITE.ogImage}` },
      { name: "twitter:title", content: `About — ${SITE.name}` },
      { name: "twitter:description", content: SITE.description },
      { name: "twitter:image", content: `${SITE.url}${SITE.ogImage}` },
    ],
    links: [{ rel: "canonical", href: "/about" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: `About ${SITE.name}`,
        url: `${SITE.url}/about`,
        about: {
          "@type": "SoftwareApplication",
          name: SITE.name,
          description: SITE.description,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web Browser",
        },
      }),
    }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useT();

  return (
    <AppShell>
      <PageHeader
        title={`About ${SITE.name}`}
        description="An offline-first CRM built for freelancers."
      />
      <Card className="p-6 md:p-10 max-w-3xl">
        <article className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p className="text-base md:text-lg leading-relaxed text-slate-800 dark:text-slate-200">
            {SITE.name} is an offline-first CRM designed primarily for Upwork freelancers,
            and equally useful for freelancers on any platform. It helps you organize
            clients, proposals, interviews, and invoices — all in one place.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Local-first by design
            </h2>
            <p>
              Your CRM data is stored locally in your browser using IndexedDB (via
              localForage). There is no account, no cloud database, and no application
              backend to sign up for or trust with your data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              What you can do
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Track clients with flexible contact fields.</li>
              <li>Log proposals with budgets, credits/connects, and outcomes.</li>
              <li>Capture interview notes in Markdown with a live preview.</li>
              <li>Create polished invoices and print them to PDF via your browser.</li>
              <li>Export JSON backups and CSV reports anytime.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Please back up regularly
            </h2>
            <p>
              Because everything is stored in your browser, clearing site data or losing
              the device or browser profile can remove your records. Use{" "}
              <Link to="/settings" className="text-indigo-600 hover:underline dark:text-indigo-400">
                Settings → Backup
              </Link>{" "}
              to save a JSON copy you control.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Self-hostable
            </h2>
            <p>
              The app is a static website. You can host it on GitHub Pages, Cloudflare
              Pages, Netlify, or any static host. Analytics is optional and off by
              default.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {t("about.credits")}
            </h2>
            <p>{t("about.creditsIntro")}</p>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Library</th>
                    <th className="text-left px-4 py-2 font-medium">License</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {DEPENDENCIES.map((dep) => (
                    <tr key={dep.name}>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">
                        {dep.name}
                      </td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                        {dep.license}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {t("about.developer")}
            </h2>
            <p>{t("about.developerIntro")}</p>
            <div>
              <Button asChild className="gap-2">
                <a
                  href="https://www.junian.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="w-4 h-4" />
                  {t("about.visitDeveloper")}
                </a>
              </Button>
            </div>
          </section>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700"
            >
              Open the CRM
            </Link>
            <Link
              to="/privacy"
              className="inline-flex rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Read the Privacy Policy
            </Link>
          </div>
        </article>
      </Card>
    </AppShell>
  );
}

// Kept for backwards-compat imports.
export function PublicLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
