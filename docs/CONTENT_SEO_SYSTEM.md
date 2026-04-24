# Content And SEO System

Young & Hungry uses a registry-driven public content system so titles, descriptions, canonicals, structured data, sitemap membership, and on-page messaging do not drift route by route.

## Source Of Truth

- Indexable public page content lives in `lib/seo/public-pages.ts`.
- Shared homepage, quote-flow, and trust-strip microcopy lives in `lib/content/site-copy.ts`.
- Public route metadata should be built from the registry, not handwritten in route files.
- Structured data is emitted through `components/seo/PublicStructuredData.tsx`.

## Supported Page Families

- `core`
  Homepage, pricing, FAQ, contact, quote, and other top-level commercial pages.
- `service`
  Pages for service intent such as small moves, apartment moves, furniture removals, same-day jobs, and man with a van queries.
- `location`
  Melbourne suburb pages used to capture local intent.

## Required Fields For Indexable Pages

Every indexable page entry must define:

- `canonicalPath`
- `title`
- `description`
- `heroTitle`
- `heroDescription`
- `primaryKeyword`
- `secondaryKeywords`
- `schemaType`
- `relatedIds`
- `cta`
- `priority`
- `changeFrequency`
- `updatedAt`

## Messaging Rules

- Write for customers first, search engines second.
- Lead with direct service language:
  `removalists`, `small moves`, `apartment moves`, `furniture removals`, `Melbourne`, suburb names, pricing, and estimate language.
- Keep promises concrete:
  fast estimate, clear pricing rules, Melbourne suburb coverage, apartment access awareness.
- Avoid internal/product jargon in customer-facing copy.

Banned wording in public copy:

- `platform`
- `execution layer`
- `ops-reviewed`
- `real-time clarity`
- `directory chaos`
- `logistics-first`
- backend or infra terms like `Supabase`, `Postgres`, `RPC`, or `booking core`

## Metadata Rules

- One unique title per indexable page.
- One unique canonical path per indexable page.
- One primary keyword per page.
- Titles and descriptions should reflect the page intent directly, not vague brand language.
- Use the metadata builders in `lib/seo/public-route-utils.ts`.

## Structured Data Rules

- Homepage emits `MovingCompany`.
- Service and location pages emit `Service`.
- FAQ page emits `FAQPage`.
- Non-home pages emit breadcrumb structured data.
- Pages with FAQ blocks may emit FAQ structured data in addition to their main schema.

## New Page Checklist

Before adding a new indexable page:

- Add the page entry to `lib/seo/public-pages.ts`
- Add or reuse FAQ entries if needed
- Add the route file and build metadata from the registry
- Add internal links from relevant existing pages
- Confirm the page is included in the sitemap
- Confirm structured data renders
- Add or update tests if the registry shape changes

## Tests

The SEO/content test suite should keep these invariants true:

- unique canonical paths
- unique titles
- unique primary keywords within the page family strategy
- resolved FAQ references
- sitemap coverage for indexable pages
- no banned internal jargon in registry-backed content or shared site copy
