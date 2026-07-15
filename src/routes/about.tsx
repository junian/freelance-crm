import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
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
    <AppShell>
      <PageHeader
        title={`About ${SITE.name}`}
        description="An offline-first CRM built for freelancers."
      />
      <article className="prose prose-slate dark:prose-invert max-w-3xl prose-headings:tracking-tight prose-h2:mt-10 prose-h2:mb-3 prose-p:leading-relaxed prose-li:leading-relaxed prose-p:my-4 prose-ul:my-4">
        <p className="lead text-base">
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
    </AppShell>
  );
}
