import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { SITE } from "@/lib/site-config";

const LAST_UPDATED = "2026-07-14";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${SITE.name}` },
      { name: "description", content: `How ${SITE.name} handles your data: everything stays in your browser. Optional site analytics never receives CRM content.` },
      { property: "og:title", content: `Privacy Policy — ${SITE.name}` },
      { property: "og:description", content: `${SITE.name} stores CRM data locally in your browser. Read our plain-language privacy policy.` },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/privacy" },
      { property: "og:image", content: `${SITE.url}${SITE.ogImage}` },
      { name: "twitter:title", content: `Privacy Policy — ${SITE.name}` },
      { name: "twitter:description", content: `${SITE.name} stores CRM data locally in your browser.` },
      { name: "twitter:image", content: `${SITE.url}${SITE.ogImage}` },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: `Privacy Policy — ${SITE.name}`,
        url: `${SITE.url}/privacy`,
        dateModified: LAST_UPDATED,
      }),
    }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <AppShell>
      <PageHeader
        title="Privacy Policy"
        description={`Last updated: ${LAST_UPDATED}`}
      />
      <article className="prose prose-slate dark:prose-invert max-w-3xl prose-headings:tracking-tight prose-h2:mt-10 prose-h2:mb-3 prose-h3:mt-6 prose-h3:mb-2 prose-p:leading-relaxed prose-li:leading-relaxed prose-p:my-4 prose-ul:my-4">
        <p className="text-sm italic text-slate-500">
          Site operators: please review this policy for your jurisdiction before publishing.
        </p>

        <h2>Local CRM data</h2>
        <p>
          {SITE.name} stores the following in your browser using IndexedDB (via localForage):
        </p>
        <ul>
          <li>Client records and contact fields</li>
          <li>Proposals, work descriptions, submitted proposal text, additional fields</li>
          <li>Interview notes</li>
          <li>Invoices, recipient details, invoice items, payment instructions</li>
          <li>Application settings</li>
        </ul>
        <p>
          <strong>User-entered CRM and invoice data is not sent to, stored on, or
          synchronized with the site owner's servers.</strong> The application has no
          account system and no CRM backend.
        </p>

        <h3>PDFs and exports</h3>
        <p>
          PDF invoices are generated through the browser's print feature. Invoice data is
          not uploaded for PDF generation. JSON backups and CSV exports are generated
          locally in your browser. You are responsible for storing exported files safely.
        </p>

        <h3>Managing your local data</h3>
        <p>
          You can delete your data at any time through <Link to="/settings">Settings</Link>{" "}
          or your browser's site-data controls. Clearing site data will remove your local
          records. Private/incognito browsing may not preserve records. Changing browsers
          or devices does not automatically transfer records — keep JSON backups.
        </p>

        <h2>Website analytics (optional)</h2>
        <p>
          The site operator may choose to enable Cloudflare Web Analytics or Google
          Analytics 4. When configured, these services may collect:
        </p>
        <ul>
          <li>Active users, sessions, page views</li>
          <li>Referrers, browser type, device type</li>
          <li>Approximate location and similar technical usage metrics</li>
        </ul>
        <p>
          <strong>Analytics never receives</strong> client names, contact details, work
          titles, work descriptions, submitted proposals, screening answers, interview
          notes, invoice numbers, invoice recipients, invoice items, payment instructions,
          search queries, form values, exported data, local record IDs, or any other
          user-entered CRM content.
        </p>
        <p>
          Only privacy-safe, normalized route templates (for example{" "}
          <code>/clients/detail</code>, <code>/invoices/detail</code>) and coarse usage
          data are reported. You may use browser privacy controls, content blockers, or
          any provided consent controls to limit analytics.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about privacy? Contact{" "}
          <a href={`mailto:${SITE.privacyEmail}`}>{SITE.privacyEmail}</a>.
        </p>
      </article>
    </AppShell>
  );
}
