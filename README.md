# Freelance Hub

# CRM for Freelancer

Build a polished, production-quality offline-first web application called "Freelance CRM" for freelancers who manage clients, proposals, interviews, and invoices. The primary audience is Upwork freelancers, but its terminology and workflows must remain useful for freelancers on any platform.

This must be a fully functional application, not a static mockup. Build every described screen, storage operation, relationship, calculation, validation rule, import/export tool, print layout, SEO feature, and interaction.

## Product priorities

Prioritize:

1. Dependable local persistence.
2. Fast data entry.
3. Clear proposal and interview tracking.
4. Professional invoice creation.
5. User privacy.
6. Offline availability.
7. Static self-hosting.
8. Accessibility and responsive design.
9. Public-page SEO without exposing locally stored data.

## Core technology

Use:

* React.
* TypeScript.
* Vite.
* Tailwind CSS.
* shadcn/ui.
* Lucide icons.
* React Router or an equivalent static-host-compatible client-side router.
* `localForage` backed by IndexedDB.
* A safe Markdown renderer.
* A decimal-safe money implementation or integer minor-unit calculations.

Do not use:

* Supabase.
* Authentication.
* A remote database.
* Cloud storage.
* An application backend.
* Server-side functions.
* A server-side PDF service.
* A third-party PDF-generation API.

Generate record IDs using `crypto.randomUUID()`.

Store dates as ISO 8601 strings and display them in the user's local timezone.

The app must remain fully usable when analytics is not configured.

## Offline-first and PWA requirements

The application must work entirely offline after its initial successful load.

Make it an installable PWA with:

* A web app manifest.
* Appropriate application icons.
* A service worker.
* Static asset caching.
* An offline fallback.
* Correct update behavior.
* Theme colors.
* Apple touch icons.
* PWA metadata.

Core CRUD operations, navigation, Markdown editing, backup export, CSV export, and invoice printing must not require an internet connection.

Display a small "Local only" or "Stored in this browser" indicator in the application shell.

Show a friendly initialization state while IndexedDB is loading. Handle storage failures with clear toast notifications.

## Static hosting and deployment

The production application must compile into a completely static, self-hostable website.

The build output must contain only deployable static assets such as:

* HTML.
* CSS.
* JavaScript.
* Images and icons.
* Web app manifest.
* Service-worker files.
* `robots.txt`.
* `sitemap.xml`.
* Hosting fallback/configuration files.

The deployed application must not require:

* Node.js at runtime.
* A server-side rendering runtime.
* An API server.
* An edge function.
* A database.
* A backend service.

It must be deployable to:

* GitHub Pages.
* Cloudflare Pages.
* Netlify.

Include a concise README with:

* Installation instructions.
* Local development command.
* Production build command.
* Build output directory.
* Environment-variable documentation.
* GitHub Pages deployment instructions.
* Cloudflare Pages deployment instructions.
* Netlify deployment instructions.
* Explanation of local-only storage.
* Backup recommendations.
* Analytics configuration.

Use environment variables only at build time. Core CRM functionality must not require any environment variable.

Support deployment both:

* At the root of a custom domain.
* Under a subdirectory such as `https://username.github.io/freelance-crm/`.

Respect the configured Vite base path when generating:

* Asset URLs.
* Route URLs.
* Manifest paths.
* Service-worker paths.
* Canonical URLs.
* Sitemap entries.
* Open Graph image URLs.

Do not hard-code root-relative asset paths that would break on GitHub Pages.

Include:

* Netlify SPA redirect/fallback configuration.
* Cloudflare Pages SPA fallback configuration.
* A GitHub Pages-compatible routing strategy.
* A static `404.html` fallback that restores the requested client-side route when necessary.

Refreshing or directly opening a route must not leave the user on a broken page.

Keep offline PWA behavior compatible with every supported hosting target.

## Persistence architecture

All user-entered application data must be stored locally in IndexedDB using `localForage`.

Create separate localForage stores:

* `freelance-crm-clients`
* `freelance-crm-proposals`
* `freelance-crm-interviews`
* `freelance-crm-invoices`
* `freelance-crm-preferences`

Create a typed repository layer so UI components never access localForage directly.

Implement repository operations for:

* Listing records.
* Finding a record by ID.
* Creating records.
* Updating records.
* Deleting records.
* Soft-deleting proposals.
* Restoring proposals.
* Permanently deleting proposals.
* Creating and removing relationships safely.
* Importing backups.
* Exporting backups.
* Resetting all application data.

Persist changes immediately after create, update, or delete operations.

Keep React state synchronized after every repository mutation. Never require a hard refresh to show updated data.

Seed realistic demo data only on the first launch. Include a visible "Delete demo data" action. Never recreate demo data after the user has removed it unless the user explicitly requests it.

## Data models

Use these TypeScript models as the foundation. Additional internal fields may be added when necessary for reliable persistence, migrations, or display preferences.

```ts
type ContactField = {
  id: string;
  label: string;
  value: string;
};

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  contacts: ContactField[];
  createdAt: string;
  updatedAt: string;
};

type AdditionalField = {
  id: string;
  label: string;
  value: string;
};

type ProposalBudget =
  | {
      type: "fixed";
      amount: number;
      currency: string;
    }
  | {
      type: "hourly";
      hourlyRate: number;
      currency: string;
    };

type ProposalFinalState =
  | "pending"
  | "accepted"
  | "rejected"
  | "deleted";

type Proposal = {
  id: string;
  clientId: string | null;
  workTitle: string;
  workDescription: string;
  submittedProposal: string;
  additionalFields: AdditionalField[];
  submittedAt: string;
  credit: number | null;
  budget: ProposalBudget;
  finalState: ProposalFinalState;
  interviewId: string | null;
  createdAt: string;
  updatedAt: string;
};

type Interview = {
  id: string;
  proposalId: string;
  notesMarkdown: string;
  createdAt: string;
  updatedAt: string;
};

type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "void";

type FixedPriceInvoiceItem = {
  id: string;
  type: "fixed";
  description: string;
  quantity: number;
  unitPrice: number;
};

type HourlyInvoiceItem = {
  id: string;
  type: "hourly";
  description: string;
  hours: number;
  hourlyRate: number;
};

type InvoiceItem =
  | FixedPriceInvoiceItem
  | HourlyInvoiceItem;

type InvoicePartySnapshot = {
  name: string;
  contactLines: string[];
  addressLines: string[];
  taxId: string;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  clientId: string | null;
  clientSnapshot: InvoicePartySnapshot;
  issuer: InvoicePartySnapshot;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  discountAmount: number;
  taxLabel: string;
  taxRate: number;
  notes: string;
  paymentInstructions: string;
  createdAt: string;
  updatedAt: string;
};
```

"Credit" represents the number of platform credits spent, such as Upwork Connects. Label it "Credits / Connects" in the interface.

## Entity relationships

Apply these relationship rules in the repository layer:

* A proposal may have no client.
* A proposal may have zero or one interview.
* An interview must belong to exactly one proposal.
* Keep `Proposal.interviewId` and `Interview.proposalId` synchronized.
* A client relationship on an invoice is optional.
* An invoice must store a recipient snapshot and must not depend solely on the live client record.
* Deleting a client must not delete related proposals.
* When deleting a client, set related proposal `clientId` values to `null`.
* Deleting a client must not delete related invoices.
* When deleting a client, set related invoice `clientId` values to `null` while retaining their recipient snapshots.
* Deleting an interview must set its proposal's `interviewId` to `null`.
* Permanently deleting a proposal must also delete its associated interview.
* Permanently deleting an invoice must not delete its client.

## Application shell

Create a responsive dashboard-style shell with:

* Desktop sidebar navigation.
* Compact mobile header.
* Slide-out mobile navigation.
* Dashboard navigation.
* Clients navigation.
* Proposals navigation.
* Interviews navigation.
* Invoices navigation.
* About navigation.
* Privacy Policy navigation.
* Settings navigation.
* Global Quick Add button.
* Quick Add actions for New Client, New Proposal, and New Invoice.
* Application name.
* Local-only/offline indicator.
* Light and dark themes.
* Persisted theme preference.
* Tooltips for unfamiliar icons.

Use a refined, calm professional style:

* Neutral slate page background.
* White or dark elevated cards.
* Indigo or violet primary accent.
* Green for accepted, paid, and success states.
* Red for rejected and destructive states.
* Amber for pending, outstanding, or overdue states.
* Rounded cards.
* Subtle borders.
* Restrained shadows.
* Generous spacing.
* Strong information hierarchy.

Avoid:

* Excessive gradients.
* Oversized marketing headings inside the CRM.
* Glassmorphism.
* Decorative clutter.
* Unnecessary animations.

Ensure accessibility through:

* Keyboard navigation.
* Visible focus states.
* Correct labels.
* Accessible dialogs.
* Semantic HTML.
* Sufficient color contrast.
* Accessible validation messages.
* Touch-friendly mobile controls.

## Suggested routes

Create these routes:

* `/`
* `/clients`
* `/clients/:id`
* `/proposals`
* `/proposals/:id`
* `/interviews`
* `/interviews/:id`
* `/invoices`
* `/invoices/new`
* `/invoices/:id`
* `/invoices/:id/edit`
* `/invoices/:id/print`
* `/about`
* `/privacy`
* `/settings`

Add a custom not-found page.

Direct navigation and browser refresh must work for all routes when deployed to each supported static host.

## Dashboard

Create a useful dashboard containing:

* Total clients.
* Total proposals.
* Pending proposals.
* Accepted proposals.
* Total interviews.
* Proposal acceptance rate.
* Total Credits / Connects spent.
* Total accepted fixed-price proposal value.
* Average accepted hourly rate.
* Total invoices.
* Outstanding invoice value grouped by currency.
* Paid invoice value grouped by currency.
* Overdue invoice count.
* Recent proposals.
* Recent invoices.
* Proposal status breakdown.
* Useful empty-state guidance.

Calculate proposal acceptance rate from accepted and rejected proposals only.

Do not combine unrelated currencies into a single mathematically invalid total. Group monetary totals by currency.

Dashboard cards should be clickable where useful and navigate to the related filtered page.

## Clients module

Create a Clients page with:

* Search by first name.
* Search by last name.
* Search by any contact value.
* Sort by name.
* Sort by newest.
* Sort by recently updated.
* Responsive desktop table.
* Responsive mobile cards.
* Client name.
* Primary contact.
* Proposal count.
* Invoice count.
* Last updated date.
* Create, view, edit, and delete actions.
* Helpful empty state with a "Create first client" button.

### Client form

Include:

* Required first name.
* Optional last name.
* Dynamic contact fields.
* Custom label and value for every contact field.
* Suggestions for Email, Phone, Upwork Profile, LinkedIn, Website, Telegram, and Other.
* Add contact field.
* Remove contact field.
* Reorder contact fields where practical.
* Email validation only when the label indicates an email address.
* Preservation of entered values when validation fails.

### Client detail

Show:

* Client name.
* All contact fields.
* Clickable email links.
* Clickable telephone links.
* Clickable URLs.
* Related proposals.
* Related invoices.
* Edit action.
* Delete action.
* Create Proposal for Client action.
* Create Invoice for Client action.

When deleting a client, clearly explain that proposals and invoices will remain but become unlinked. Preserve invoice recipient snapshots.

## Proposals module

Create a Proposals page with:

* Search across work title.
* Search across work description.
* Search across submitted proposal.
* Search by client name.
* Search across additional fields.
* Final-state filter.
* Client filter.
* Budget-type filter.
* Submission-date range.
* Sort by newest submission.
* Sort by oldest submission.
* Sort by budget.
* Sort by Credits / Connects.
* Sort by recently updated.
* Clear-all-filters action.
* Responsive desktop table.
* Responsive mobile cards.

Display:

* Work title.
* Client.
* Submitted date.
* Budget.
* Credits / Connects.
* Final state.
* Interview indicator.

Use status badges for:

* Pending.
* Accepted.
* Rejected.
* Deleted.

Support:

* Create.
* View.
* Edit.
* Duplicate.
* Soft delete.
* Restore.
* Permanent delete.

Hide proposals whose state is `deleted` by default. Include an archived/deleted filter.

A normal delete must be a soft delete that changes the state to `deleted`. Permanent deletion must require explicit confirmation.

### Proposal form

Include:

* Optional searchable client selector.
* Inline "Create client" action that does not lose proposal form progress.
* Required work title.
* Multiline work description.
* Large multiline user-submitted proposal.
* Dynamic additional label/value fields.
* Suggested labels: Screening Question, Screening Answer, Attachment, Job URL, and Notes.
* Submission date and time defaulting to the current local date and time.
* Credits / Connects accepting a positive integer or zero and allowing an empty value.
* Budget type toggle between Fixed Price and Hourly.
* Fixed amount and currency for fixed-price proposals.
* Hourly rate and currency for hourly proposals.
* Default currency of USD.
* Common currency selector.
* Custom three-letter currency code support.
* Final state defaulting to Pending.
* Inline validation.

Switching budget types must not leave invalid stale values in the stored record.

### Proposal detail

Display:

* Work title.
* Linked client.
* Final state.
* Submission date and time.
* Credits / Connects.
* Budget.
* Work description.
* Submitted proposal.
* Additional fields.
* Linked interview.

Preserve line breaks in long text.

Provide:

* Edit.
* Duplicate.
* Update State.
* Create Interview.
* View Interview.
* Delete.

If no client is linked, display "No client linked" gracefully.

Duplicating a proposal must:

* Generate a new ID.
* Reset submission date to the current time.
* Set state to Pending.
* Not copy the interview.

## Interviews module

Create an Interviews page containing proposals that have interviews.

Include:

* Search by proposal title.
* Search by client name.
* Search by interview content.
* Sort by newest.
* Sort by oldest.
* Sort by proposal title.
* Sort by recently updated.
* Proposal title.
* Client.
* Proposal state.
* Interview content preview.
* Last updated date.
* Responsive desktop and mobile layouts.
* Create, view, edit, and delete actions.

Allow creating an interview only for a proposal that does not already have one.

### Interview editor

Include:

* Required searchable proposal selector.
* Protection against accidentally changing the proposal relationship after creation.
* Large Markdown editor.
* Edit mode.
* Preview mode.
* Side-by-side mode on larger screens.
* Safe Markdown rendering.
* Headings.
* Lists.
* Links.
* Blockquotes.
* Inline code.
* Code blocks.
* Checklists.
* Small Markdown formatting toolbar.
* Debounced autosave.
* "Saving…" indicator.
* "Saved locally" indicator.
* Unsaved-change warning only when changes have not yet been persisted.

Deleting an interview must unlink it from its proposal.

## Invoices module

Create a complete Invoices module.

The Invoices page must include:

* Create Invoice action.
* Search by invoice number.
* Search by recipient/client name.
* Search by item description.
* Status filters for Draft, Sent, Paid, Overdue, and Void.
* Issue-date range filter.
* Due-date range filter.
* Client filter.
* Currency filter.
* Sort by newest.
* Sort by oldest.
* Sort by due date.
* Sort by invoice number.
* Sort by total.
* Sort by recently updated.
* Responsive desktop table.
* Responsive mobile cards.
* Clear empty state.

Display:

* Invoice number.
* Recipient.
* Issue date.
* Due date.
* Status.
* Currency.
* Total.

Support:

* Create.
* View.
* Edit.
* Duplicate.
* Print / Save as PDF.
* Permanently delete with explicit confirmation.

### Invoice form

Build a complete manual invoice form containing:

* Required editable invoice number.
* Sensible generated default invoice number.
* Optional linked client.
* Editable recipient/client snapshot.
* Issuer or "From" details.
* Issue date defaulting to today.
* Optional due date.
* Currency defaulting to USD.
* Status defaulting to Draft.
* Fixed currency discount.
* Configurable tax label such as Tax, VAT, or GST.
* Tax percentage.
* Notes.
* Payment instructions.

Persist reusable issuer information locally in preferences.

When a client is selected:

* Offer to populate the recipient snapshot from the client.
* Do not overwrite manually edited snapshot values without confirmation.
* Store the recipient snapshot in the invoice.
* Do not make the saved invoice depend on the current client record.

Allow completely standalone invoices without a client.

### Invoice items

Users must be able to add unlimited invoice items.

Each item can independently be:

* Fixed Price.
* Hourly.

Users can:

* Add an item.
* Duplicate an item.
* Reorder items.
* Remove an item.
* Switch an item's type.

Warn before switching item type if incompatible values will be discarded.

Require at least one valid invoice item.

For fixed-price items:

* Description is required.
* Quantity defaults to 1.
* Quantity must be greater than zero.
* Unit price must be zero or greater.
* Line total equals quantity multiplied by unit price.

For hourly items:

* Description is required.
* Hours must be greater than zero.
* Hours may contain decimals.
* Hourly rate must be zero or greater.
* Line total equals hours multiplied by hourly rate.

### Invoice calculations

Do not use uncorrected binary floating-point arithmetic for money. Use integer minor units or a decimal-safe money library.

Calculate:

* Subtotal as the sum of line totals.
* Discount as a fixed currency amount.
* Discounted taxable base as subtotal minus discount, with a minimum of zero.
* Tax as the discounted taxable base multiplied by the tax rate.
* Grand total as discounted subtotal plus tax.

Display calculations live.

Reject:

* Negative invalid values.
* `NaN`.
* Infinite values.
* Invalid numeric input.

Round consistently according to the selected currency.

Warn about unsaved changes when navigating away from an invoice that has unpersisted changes.

### Invoice detail

Show:

* Invoice number.
* Status.
* Issuer information.
* Recipient information.
* Issue date.
* Due date.
* Itemized fixed-price work.
* Itemized hourly work.
* Subtotal.
* Discount when applicable.
* Tax label, rate, and amount when applicable.
* Grand total.
* Notes.
* Payment instructions.

Provide:

* Edit.
* Duplicate.
* Update Status.
* Print / Save as PDF.
* Delete.

Duplicating an invoice must:

* Generate a new ID.
* Generate a new suggested invoice number.
* Reset the status to Draft.
* Preserve copied content as editable values.

## Browser print and PDF invoices

Generate invoice PDFs exclusively through the browser's native print feature.

The "Print / Save as PDF" action must:

* Open a dedicated invoice print layout.
* Wait until the layout is ready.
* Invoke `window.print()`.
* Explain that the user can choose "Save as PDF" in the browser print dialog.
* Leave the print page usable if automatic print-dialog opening is blocked.

Do not:

* Upload invoice data.
* Use a backend.
* Use a server-side PDF service.
* Use a third-party PDF API.

### Print stylesheet

Optimize print output for both A4 and US Letter.

The printed invoice must:

* Use a clean white document background.
* Use high-contrast black or dark-gray text.
* Hide the sidebar.
* Hide navigation.
* Hide buttons.
* Hide toasts.
* Hide application chrome.
* Hide editing controls.
* Avoid splitting a line item across pages where practical.
* Repeat table headers on additional pages where supported.
* Keep totals together where practical.
* Use readable print margins.
* Avoid depending on background colors to communicate meaning.
* Handle multi-page invoices.
* Include only the selected invoice.
* Exclude local record IDs.
* Exclude debug information.

Use a filename suggestion such as `invoice-{invoiceNumber}.pdf` where browser capabilities permit, while recognizing that the browser controls the final filename.

## Settings and local data management

Create a Settings page with:

* Light theme.
* Dark theme.
* System theme.
* Local record counts.
* Client count.
* Proposal count.
* Interview count.
* Invoice count.
* JSON backup export.
* JSON backup import.
* Proposal CSV export.
* Invoice CSV export.
* Delete demo data.
* Reset all data.
* Analytics/privacy information.

Make it unmistakably clear that CRM and invoice data is stored only in the current browser and is not synchronized to the cloud.

Resetting all data must require a typed confirmation phrase.

## Backup format and migrations

Export all application data as a versioned JSON file:

```ts
type BackupFileV2 = {
  app: "freelance-crm";
  version: 2;
  exportedAt: string;
  clients: Client[];
  proposals: Proposal[];
  interviews: Interview[];
  invoices: Invoice[];
};
```

Validate:

* Application identifier.
* Backup version.
* Array structures.
* Required record fields.
* Relationships.
* Dates where practical.
* Numeric values.

Before importing, let the user choose:

* Replace all existing local data.
* Merge with existing local data.

For merge conflicts:

* Match records by ID.
* Keep the record with the newest valid `updatedAt`.

Show an import summary before confirmation.

Support importing the previous version-1 format without invoices by treating its invoice collection as empty.

Never destroy existing data before the import file has been validated.

## CSV export

Export proposals as CSV using useful flattened columns.

Export invoices as CSV with:

* Invoice number.
* Recipient.
* Issue date.
* Due date.
* Status.
* Currency.
* Subtotal.
* Discount.
* Tax.
* Total.
* Item count.

Generate CSV files locally in the browser.

## Public pages and search-engine crawlability

Add public informational pages:

* `/about`
* `/privacy`

About and Privacy Policy must be:

* Crawlable.
* Indexable.
* Available as static or prerendered HTML in the production output.
* Readable without waiting for client-side data.
* Linked through normal semantic HTML links.

Important public content must be present in the initial HTML and must not depend exclusively on client-side JavaScript.

The home route should contain a useful public introduction to the product when no local CRM data is being displayed.

If the selected routing architecture conflicts with reliable static prerendering, restructure the public pages so they generate real static HTML while preserving the client-side offline CRM.

Use:

* One logical `h1` per public page.
* Semantic headings.
* Header, main, nav, and footer landmarks.
* Descriptive internal-link text.
* Accessible page structure.

Generate:

* A valid `sitemap.xml`.
* A valid `robots.txt`.
* A sitemap reference inside `robots.txt`.

Only include public indexable pages in the sitemap.

Never include:

* Client IDs.
* Client details.
* Proposals.
* Interviews.
* Invoices.
* Search results.
* User-entered content.
* Local record URLs.

Application data routes should use `noindex, nofollow` because their contents are private, local, and user-specific.

Never serialize IndexedDB content into:

* Static HTML.
* Build output.
* Metadata.
* Structured data.
* URLs.
* Logs.
* Analytics.

## Complete SEO metadata

Implement complete SEO metadata for each public page.

Include:

* Unique title.
* Unique meta description.
* Canonical URL.
* Correct robots directive.
* Open Graph title.
* Open Graph description.
* Open Graph type.
* Open Graph URL.
* Open Graph site name.
* Open Graph locale.
* Open Graph image.
* Twitter/X `summary_large_image` card.
* Twitter/X title.
* Twitter/X description.
* Twitter/X image.
* Theme color.
* Favicons.
* Apple touch icon.
* Web app manifest metadata.

Metadata must update correctly during client-side navigation, while public routes must also contain correct metadata in their prerendered HTML.

Centralize public configuration:

* Product name.
* Product description.
* Production site URL.
* Default Open Graph image.
* Site owner name.
* Privacy contact email.
* Cloudflare Web Analytics configuration.
* Google Analytics configuration.

Make these settings easy to replace before deployment.

## Open Graph image

Create a polished static Open Graph image.

Requirements:

* Exactly 1200 × 630 pixels.
* Contains the app name.
* Contains a concise product description.
* Uses the professional indigo/violet visual system.
* Remains readable as a small social preview.
* Is stored as a local static asset.
* Uses an absolute production URL in social metadata.
* Contains no user-entered CRM data.

## Schema.org structured data

Add valid schema.org JSON-LD to public pages.

Use:

* `WebApplication` or `SoftwareApplication` for the product.
* `WebSite` for the website where appropriate.
* `AboutPage` for the About page.
* `PrivacyPolicy`, or the closest valid `CreativeWork` or `WebPage` representation, for the Privacy Policy.

Describe the product as:

* A browser-based business/productivity application.
* An offline-first CRM for freelancers.
* Suitable primarily for Upwork freelancers and other independent professionals.
* Compatible with web browsers.

Use an appropriate application category.

Do not fabricate:

* Reviews.
* Ratings.
* Pricing.
* Awards.
* Adoption statistics.
* Company history.
* Organization details.
* Personal details.

Never include locally stored user data in structured data.

## About page

Create a polished `/about` page explaining:

* Freelance CRM is an offline-first CRM.
* It is designed primarily for Upwork freelancers.
* It is also suitable for freelancers on other platforms.
* It helps organize clients, proposals, interviews, and invoices.
* CRM data is stored locally in the browser using IndexedDB through localForage.
* The core application does not require an account.
* The core application does not require a cloud database.
* The core application does not require an application backend.
* Users should regularly export backups.
* Clearing browser storage may remove local data.
* Losing the browser profile or device may remove access to local data.
* The app can be self-hosted as a static website.
* Analytics may be enabled by the site operator.
* Analytics must never contain CRM or invoice content.

Include clear actions to:

* Open the CRM.
* Read the Privacy Policy.

Do not include fake testimonials, user numbers, or unsupported security claims.

## Privacy Policy page

Create a clear, readable `/privacy` page written in plain language and consistent with the implementation.

Clearly distinguish local CRM data from website analytics.

Explain that the following are stored locally in the user's browser using IndexedDB/localForage:

* Client records.
* Contact fields.
* Proposals.
* Work descriptions.
* Submitted proposal text.
* Additional proposal fields.
* Interview notes.
* Invoices.
* Invoice recipient details.
* Invoice items.
* Payment instructions.
* Application settings.

Clearly state:

* User-entered CRM and invoice data is not sent to, stored on, or synchronized with the site owner's server.
* The application has no account system.
* The application has no CRM backend.
* PDF invoices are created through the browser's print feature.
* Invoice data is not uploaded for PDF generation.
* JSON backups are generated locally.
* CSV exports are generated locally.
* Users are responsible for managing their exported files.
* Local data may be deleted through the app's reset tools or browser storage settings.
* Clearing site data can remove local records.
* Private/incognito browsing may not preserve records.
* Changing browsers or devices does not automatically transfer records.

Explain that the site operator may use:

* Cloudflare Web Analytics.
* Google Analytics 4.

Explain that analytics may collect usage insights such as:

* Active users.
* Sessions.
* Page views.
* Referrers.
* Browser type.
* Device type.
* Approximate location.
* Similar technical usage metrics depending on configuration.

Clearly state that analytics must never receive:

* Client names.
* Contact details.
* Work titles.
* Work descriptions.
* Submitted proposals.
* Screening answers.
* Interview notes.
* Invoice numbers.
* Invoice recipients.
* Invoice items.
* Payment instructions.
* Search queries.
* Form values.
* Exported data.
* Local record IDs.
* Other user-entered CRM content.

Explain that users may use browser privacy controls, content blockers, or available consent controls to limit analytics where applicable.

Include:

* A visible "Last updated" date.
* Configurable site-owner name.
* Configurable privacy contact email.
* A visible reminder for the site owner to review the policy for their jurisdiction before publishing.

Do not claim that analytics is:

* Anonymous.
* Cookie-free.
* Consent-free.
* GDPR-compliant.
* Legally compliant.

Only make such a claim if it is guaranteed by the actual deployed configuration.

## Privacy-safe analytics

Add optional support for:

* Cloudflare Web Analytics.
* Google Analytics 4.

Analytics must be:

* Disabled by default.
* Enabled only when valid build-time configuration is provided.
* Loaded only in production.
* Independently configurable.
* Isolated from core CRM functionality.
* Removable without breaking the app.
* Documented in `.env.example`.

Do not break the build when analytics configuration is absent.

Do not load analytics while the installed app is being used offline.

Do not proxy analytics through an application backend.

Never send user-entered data to analytics.

Do not include CRM data in:

* Page titles.
* Analytics URLs.
* Query parameters.
* URL fragments.
* Event names.
* Event properties.
* Virtual page-view values.

Do not enable:

* Session replay.
* Heatmaps.
* Keystroke recording.
* Form-field analytics.
* Advertising features.
* Google Signals.
* User-ID.
* User-provided-data collection.

Prevent automatic event tracking from collecting user-entered values where practical.

Track only:

* Public page views.
* Coarse application route templates.
* Basic non-sensitive navigation insights.

Normalize routes before analytics. For example:

* Report `/clients/:id` as `/clients/detail`.
* Report `/proposals/:id` as `/proposals/detail`.
* Report `/interviews/:id` as `/interviews/detail`.
* Report `/invoices/:id` as `/invoices/detail`.

Never report real local IDs.

Strip query strings and URL fragments from analytics page paths.

If the selected Google Analytics configuration or deployment jurisdiction requires consent:

* Add a simple consent interface.
* Prevent Google Analytics from loading before consent.
* Persist the consent preference locally.
* Allow the user to change the preference later.
* Keep Cloudflare and Google Analytics independently configurable.

## General UX requirements

Use toast notifications for:

* Successful saves.
* Deletions.
* Restores.
* Imports.
* Exports.
* Backup completion.
* Errors.

Use styled confirmation dialogs for destructive operations.

Do not use browser `alert`, `confirm`, or `prompt`.

Include:

* Skeleton loading states.
* Thoughtful empty states.
* Truncated long content in lists.
* Full content in detail views.
* Scrollable forms on small screens.
* Consistent date formatting utilities.
* Consistent currency formatting utilities.
* Form-state preservation after validation errors.
* Keyboard-completable forms.
* Responsive behavior across mobile, tablet, and desktop.

Ensure there are:

* No broken buttons.
* No placeholder interactions.
* No dead navigation links.
* No TypeScript errors.
* No build errors.
* No runtime console errors during normal use.

## Acceptance criteria

Before considering the application complete, verify all of these workflows:

1. Create a client with several custom contact fields.
2. Edit and delete individual contact fields.
3. Search for a client using a contact value.
4. Create a proposal linked to a client.
5. Create a proposal without a client.
6. Add custom additional fields to a proposal.
7. Switch between fixed-price and hourly proposal budgets without storing invalid stale data.
8. Create an interview from a proposal.
9. Confirm both proposal/interview relationship fields are synchronized.
10. Write Markdown interview notes and preview the rendered result.
11. Delete an interview and confirm the proposal becomes unlinked.
12. Delete a client and confirm related proposals remain with `clientId: null`.
13. Soft-delete a proposal.
14. Restore a proposal.
15. Permanently delete a proposal and its related interview.
16. Refresh the browser and confirm all local records remain.
17. Export a backup, reset the app, import the backup, and confirm relationships are restored.
18. Disconnect from the network and confirm the cached application remains usable.
19. Confirm all screens are responsive and usable on mobile.
20. Build the project and confirm the output is a static site requiring no server runtime.
21. Validate the build structure for GitHub Pages, Cloudflare Pages, and Netlify.
22. Directly open and refresh every public and application route without reaching a broken page.
23. Confirm About and Privacy Policy contain crawlable prerendered HTML.
24. Validate titles, descriptions, canonical links, Open Graph tags, Twitter cards, JSON-LD, `robots.txt`, and `sitemap.xml`.
25. Confirm no user-entered data appears in metadata, structured data, URLs, static output, or analytics payloads.
26. Confirm the application works when neither analytics integration is configured.
27. Confirm configured analytics receives only privacy-safe normalized route templates and coarse usage data.
28. Create a standalone invoice without selecting a client.
29. Create an invoice from a client.
30. Confirm the invoice recipient snapshot remains unchanged after editing the linked client.
31. Delete the linked client and confirm the invoice remains with its recipient snapshot.
32. Add both fixed-price and hourly items to one invoice.
33. Verify subtotal, discount, tax, and total calculations with decimal values.
34. Confirm invalid, negative, `NaN`, and infinite numeric values cannot be saved.
35. Duplicate an invoice and confirm it receives a new ID, suggested invoice number, and Draft status.
36. Print a short invoice using the browser's Save as PDF feature.
37. Print a multi-page invoice and confirm its layout remains readable.
38. Confirm print output contains no application navigation, buttons, or debug details.
39. Export and restore a version-2 backup containing invoices.
40. Import a version-1 backup and confirm it remains compatible.
41. Export invoice and proposal CSV files.
42. Confirm invoice contents, recipient names, invoice numbers, and item descriptions are never sent to analytics.
43. Confirm clearing filters, empty states, error states, and destructive confirmations all work.
44. Run the production build and resolve all TypeScript and build errors.
45. Confirm the application remains usable using keyboard navigation alone.

Build the complete application now. Do not stop at scaffolding, wireframes, placeholder pages, or mocked interactions. Implement the complete UI, localForage persistence, repositories, entity relationships, offline PWA behavior, invoice calculations, browser print layout, backups, CSV exports, analytics safeguards, static deployment support, public pages, SEO metadata, structured data, and responsive interaction flows.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://crm-for-freelancer.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b782d3f9-a8a5-4427-88a2-f412a2fbed68).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
