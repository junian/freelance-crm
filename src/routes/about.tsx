import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site-config";

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
  return (
    <PublicLayout>
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1>About {SITE.name}</h1>
        <p className="lead">
          {SITE.name} is an offline-first CRM designed primarily for Upwork freelancers, and
          equally useful for freelancers on any platform. It helps you organize clients,
          proposals, interviews, and invoices — all in one place.
        </p>

        <h2>Local-first by design</h2>
        <p>
          Your CRM data is stored locally in your browser using IndexedDB (via localForage).
          There is no account, no cloud database, and no application backend to sign up for
          or trust with your data.
        </p>

        <h2>What you can do</h2>
        <ul>
          <li>Track clients with flexible contact fields.</li>
          <li>Log proposals with budgets, credits/connects, and outcomes.</li>
          <li>Capture interview notes in Markdown with a live preview.</li>
          <li>Create polished invoices and print them to PDF via your browser.</li>
          <li>Export JSON backups and CSV reports anytime.</li>
        </ul>

        <h2>Please back up regularly</h2>
        <p>
          Because everything is stored in your browser, clearing site data or losing the
          device or browser profile can remove your records. Use{" "}
          <Link to="/settings">Settings → Backup</Link> to save a JSON copy you control.
        </p>

        <h2>Self-hostable</h2>
        <p>
          The app is a static website. You can host it on GitHub Pages, Cloudflare Pages,
          Netlify, or any static host. Analytics is optional and off by default.
        </p>

        <div className="mt-8 flex gap-3 not-prose">
          <Link to="/" className="inline-flex rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700">
            Open the CRM
          </Link>
          <Link to="/privacy" className="inline-flex rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
            Read the Privacy Policy
          </Link>
        </div>
      </article>
    </PublicLayout>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="border-b bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="font-semibold text-lg">{SITE.name}</Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/" className="hover:text-indigo-600">App</Link>
            <Link to="/about" className="hover:text-indigo-600">About</Link>
            <Link to="/privacy" className="hover:text-indigo-600">Privacy</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
      <footer className="border-t bg-white dark:bg-slate-900 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6 text-xs text-slate-500 flex justify-between">
          <span>© {new Date().getFullYear()} {SITE.owner}</span>
          <span>Local-only. No account required.</span>
        </div>
      </footer>
    </div>
  );
}
