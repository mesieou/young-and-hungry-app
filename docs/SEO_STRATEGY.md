# Young & Hungry SEO Strategy

This is the source of truth for Young & Hungry's public SEO strategy. Public page copy should be written for Melbourne movers first, then structured so search engines can understand the same intent.

For the registry mechanics (how to add a page, where files live, required fields, banned wording), see `CONTENT_SEO_SYSTEM.md`. For the keyword-to-page mapping, see `SEO_KEYWORD_MAP.md`.

## Positioning

Young & Hungry is the apartment-aware Melbourne removalist with honest hourly pricing.

The angle is not generic "Melbourne movers." The angle is that we quote and price for the moves that other removalists trip on: stairs, no-parking, lift bookings, tight CBD windows, smaller jobs that big interstate operators don't want.

Core message:

- Melbourne removalists for the hard moves: apartments, stairs, tight access
- Honest hourly pricing — first hour to pickup included, half-hour billing, return trip included
- Fast estimate flow before you talk to anyone
- Built for inner Melbourne suburbs where access matters more than truck size

Live capabilities the public pages can claim:

- Two truck classes (4-tonne, 6-tonne) with weekday/weekend rates
- Route-aware estimate (pickup → drop-off, with first hour to pickup free)
- Apartment-aware quoting (lifts, stairs, parking, access notes)
- Service-type adjustments (small moves, apartment moves, furniture, man with a van, same-day)

Interstate moves, packing services, and storage stay future-only until the pricebook supports them. Do not publish money pages around capabilities the booking flow cannot quote today.

## Execution Model

We don't need generic content volume first. We need an apartment-and-inner-Melbourne wedge that wins commercial intent fast, proves we quote honestly, then expands outward into broader removalist terms.

- Keep apartments, inner-suburb access, hourly pricing, and small-move expertise as the default proof layer.
- Broader removalist pages are allowed when they support the apartment wedge, not when they dilute it.
- Suburb pages must carry a unique local angle (parking, stairs, lift, laneway, building type) — never generic "removalists in {suburb}" filler.

## Page Classes

### Money Pages

These pages exist to win commercial intent and push the next action.

- service pages (`/services/{slug}`)
- location pages (`/locations/{slug}`)
- pricing page
- cost / ROI pages (`/resources/cost/{slug}`)

### Comparison Pages

These pages exist to intercept active evaluation queries.

- `/resources/comparison/hourly-vs-flat-rate`
- `/resources/comparison/diy-van-vs-removalist`
- `/resources/comparison/man-with-van-vs-removalist`
- `/resources/comparison/best-removalists-melbourne`
- "vs {competitor}" pages — only with concrete differentiators (defer until proof exists)

### Support Pages

These pages exist to help money pages rank and convert, not to become the strategy by themselves.

- glossary / definition pages (`/resources/glossary/{slug}`)
- guides / explainers (`/resources/guides/{slug}`)
- moving-day checklists, packing checklists

Support pages ship only when they strengthen a live money page with internal links and unique workflow, scenario, or business-case detail.

## Keyword Strategy

Each indexable SEO page must define:

- 1 primary keyword: transactional money term
- 3 to 5 secondary keywords: problem-aware terms
- 5 to 10 semantic variations: natural supporting phrases

No SEO page should exist without mapped queries. The complete current map lives in `SEO_KEYWORD_MAP.md`.

### Layer 1: Money Keywords

These are the pages closest to buying intent.

- removalists melbourne
- moving company melbourne
- furniture removalists melbourne
- apartment removalists melbourne
- man with a van melbourne
- small removalists melbourne
- same day removalists melbourne
- 2 men and a truck melbourne
- removalists {suburb} (inner Melbourne)

### Layer 2: Problem-Aware Keywords

These queries are often easier to rank for and convert well because the buyer already feels the pain.

- how much do removalists cost melbourne
- cost to move 2 bedroom apartment melbourne
- moving cost calculator melbourne
- 4 tonne truck hourly rate melbourne
- how long does it take to move a 1 bedroom apartment
- moving with stairs melbourne
- moving with no parking melbourne
- how to book a lift for moving melbourne
- moving day checklist melbourne

### Layer 3: Category Keywords

These are harder early but build category authority over time.

- removalists
- moving company
- furniture removals
- house movers
- relocation services melbourne

Interstate, packing-service, and storage terms remain tracked research, not first-wave publishing targets. They depend on live product workflows we don't quote today.

## Query To Page Type Mapping

- `cost`, `pricing`, `how much`, and `worth it` queries map to pricing or `/resources/cost/{slug}` pages.
- `vs`, `alternative`, and `best` queries map to `/resources/comparison/{slug}` pages with explicit tradeoffs and selection criteria.
- `what is` and `how does` queries map to glossary or guide pages only when they feed a live money page.
- `moving with {constraint}` (stairs, no parking, lift, narrow stairs) queries map to guide pages with concrete workflows and scenarios.
- `removalists {suburb}` queries map to location pages with suburb-specific access notes, nearby suburbs, and at least one job pattern that page-other suburbs do not have.

## Query To Section Mapping

Each page must map keywords to specific sections:

- Hero: primary keyword plus core value proposition
- Problem section: problem-aware keywords (access, parking, stairs, time)
- Solution / workflow: service-specific keywords and semantic variations
- FAQ: long-tail questions, objections, and pricing queries
- Proof section: pricing-rule transparency, real Melbourne examples, return-trip math

No keyword should exist without a natural placement on the page.

## SERP Positioning Rules

Each SEO title should combine:

- keyword
- outcome
- differentiator

Avoid generic removalist phrasing. Emphasise apartment readiness, transparent pricing, and Melbourne suburb specificity.

Examples:

- Weak: Apartment Removalists Melbourne
- Strong: Apartment Removalists Melbourne | Lift, Stair & No-Parking Ready
- Weak: Removalists Richmond
- Strong: Removalists Richmond | Tight-Street, Stair, Inner-Suburb Moves
- Weak: How Much Do Removalists Cost
- Strong: How Much Do Removalists Cost in Melbourne | Real Hourly Rates by Truck Size

Meta descriptions should sell the click with concrete outcomes:

- fast estimate
- first hour to pickup included
- half-hour billing
- apartment access awareness
- transparent on-day pricing rules

## Homepage Section Architecture

The homepage must explain the buyer journey in this order:

1. Hero: apartment-aware Melbourne removalist positioning, fast-estimate CTA.
2. Problem: vague quotes, surprise charges, removalists who don't handle apartment access.
3. Solution: how the route-first estimate, two truck classes, and pricing rules work.
4. Service surface: cards linking to small moves, apartment moves, furniture, man with a van, same-day.
5. Local proof: location grid (inner Melbourne suburbs).
6. FAQ: pricing rules, final-price transparency, apartment moves.
7. CTA: start your estimate.

Do not expose SEO architecture on the homepage through labels such as "clusters", "routes built to rank", "priority pages", or directory-style sections. Internal links are required, but they must appear as natural buyer-facing cards and CTAs.

## First-Wave Publishing Strategy

The first 4 to 6 weeks are not a scale game. They are a quality-controlled push around price, comparison, and high-intent guide pages that win commercial intent fastest.

### First-Wave Order

1. `/resources/cost/removalist-cost-melbourne`
2. `/resources/cost/2-bedroom-apartment-move-cost`
3. `/resources/cost/moving-calculator`
4. `/resources/comparison/hourly-vs-flat-rate`
5. `/resources/comparison/diy-van-vs-removalist`
6. `/resources/guides/moving-day-checklist`
7. `/resources/guides/moving-with-stairs`
8. `/resources/guides/moving-with-limited-parking`

### Drafting And Editorial Model

- Manual writing for now. Every page is human-written against the brief in `SEO_KEYWORD_MAP.md`.
- A page does not ship without: primary keyword in H1, primary keyword in title, at least one Melbourne-specific scenario, at least one pricing-rule reference, internal links to 2 related pages.

## CTA Layering

Do not use one generic call to action everywhere. Match the CTA to visitor readiness.

### Top Of Page: Low Friction

Use when the visitor is cold or arriving from search.

- See How Pricing Works
- Get a Fast Estimate
- See an Apartment Move Example

### Mid Page: Engagement

Use after the problem and workflow are clear.

- Start Your Estimate
- See Your Suburb
- Try the Estimate Flow

### Bottom Page: Conversion

Use after proof and explanation.

- Send Your Move Details
- Book Your Move
- Get Your Final Quote

Avoid generic copy such as "Contact us" on cold SEO pages.

## Conversion Requirements

Every SEO page must include:

- a concrete Melbourne move scenario
- a pricing-rule reference (first hour, half-hour billing, return trip, weekend uplift)
- a clear next action (estimate or quote)
- 2 internal links to related money pages

First-wave commercial and comparison pages must also include:

- an AU pricing or decision table
- one named alternative when the query is comparative (DIY van, hourly competitor, flat-rate operator)
- one explicit statement of when Young & Hungry is and is not the right fit (e.g. interstate is not a fit today)

## Scaled Content Guardrails

No new SEO page is created unless it introduces new information not present elsewhere and includes at least one:

- unique workflow
- unique objection
- unique move scenario
- unique access edge case (lift, stair carry, laneway, no-stop zone)
- real proof or case-backed detail (a real suburb's parking rule, a real building type)

Avoid:

- city-page spam (no "removalists in {suburb}" with a search-and-replace template)
- thin service variants
- same-page-different-noun content
- internal SEO language on public pages
- pages that only funnel visitors somewhere else

Local intent is important, but local pages should be case-backed. Prefer concrete "Carlton terraces with no driveway" over generic "Melbourne suburb removalists." Reference policies:

- Helpful content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Spam and doorway policies: https://developers.google.com/search/docs/advanced/guidelines/auto-gen-content

## Internal Linking

Each commercial SEO page should link to:

- 2 relevant service pages
- 2 relevant location pages (or 1 location + 1 cost page on service pages)
- 1 core conversion page (`/quote` or `/pricing`)
- 1 supporting resource page once available (cost, comparison, or guide)

Pattern:

- Service pages prove move-type relevance and link into locations.
- Location pages prove suburb relevance and link into services.
- Cost pages bridge category evaluation and link into pricing, services, and locations.
- Comparison pages intercept evaluation and link into services and pricing.
- Guides build trust and link into services and locations.
- The homepage distributes attention to high-intent service and location pages, not low-value route lists.

## Design Constraints

SEO work must keep the current Young & Hungry design system:

- same palette
- same fonts
- same cards
- same button components
- same gradient/button language
- same page layout conventions

Reuse `<PublicRoutePage />` for every new SEO page so hero, sections, FAQ, related-pages, and structured data stay consistent.

## Early Traffic Feedback Loop

SEO pages are iterated, not shipped once.

For each new page:

- After first 100 to 300 impressions:
  - check Search Console queries
  - adjust headings to match real query language
  - expand sections that align with demand
- After first clicks:
  - improve CTR through title and meta description rewrites
- After first conversions:
  - double down on converting sections and CTAs

## Measurement

Track by page:

- impressions
- CTR
- average position
- query spread
- top CTA clicks
- mid-page CTA clicks
- bottom CTA clicks
- estimate-flow starts
- quote submissions
- conversion rate (impressions → estimate → submission)

Success means qualified Melbourne move intent and submitted move details, not traffic alone.
