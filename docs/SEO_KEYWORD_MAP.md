# SEO Keyword Map

Living source of truth for which keywords map to which page. Add a row when you add a page; flag a row as `(deferred)` if the page can't ship yet (e.g. capability not in the pricebook).

Volumes here are *informed estimates*, not Ahrefs-verified. Re-rank once Search Console has 30 days of data — see `SEO_STRATEGY.md` "Early Traffic Feedback Loop" for the iteration rules.

## How to read this file

- **Primary keyword** — the single transactional phrase the page is built to rank for. Goes in `primaryKeyword` field, H1, and title.
- **Secondary keywords** — 3-5 problem-aware variants. Go in `secondaryKeywords` field, section headings, and FAQ questions.
- **Page** — the canonical path. `(new)` means it doesn't exist yet.
- **Status** — `live`, `draft`, `planned`, `deferred`.

---

## Layer 1 — Money keywords (transactional, hot intent)

These map to commercial pages: home, services, locations, pricing.

| Primary keyword | Secondaries | Page | Status |
|---|---|---|---|
| removalists melbourne | melbourne removalists, moving quote melbourne, moving company melbourne | `/` | live |
| moving company melbourne | melbourne moving company, melbourne removalists, removalist quote melbourne | `/` (secondary) | live |
| furniture removalists melbourne | furniture movers melbourne, couch movers melbourne, single item movers melbourne | `/services/furniture-removals` | live |
| apartment removalists melbourne | apartment movers melbourne, unit movers melbourne, city apartment removalists | `/services/apartment-moves` | live |
| man with a van melbourne | van movers melbourne, small removalist melbourne, moving truck hire with driver melbourne | `/services/man-with-a-van` | live |
| small removalists melbourne | small moves melbourne, studio movers melbourne, room move melbourne | `/services/small-moves` | live |
| same day removalists melbourne | last minute removalists melbourne, urgent movers melbourne, emergency movers melbourne | `/services/same-day-removals` | live |
| weekend removalists melbourne | saturday removalists melbourne, sunday removalists melbourne, weekend movers melbourne | `/services/weekend-moves` (new) | planned |
| 2 men and a truck melbourne | two movers and a truck melbourne, two men and a truck melbourne, 2 person removalist | `/services/two-men-and-a-truck` (new) | planned |
| office removalists melbourne | office movers melbourne, commercial removalists melbourne | `/services/office-moves` (new) | deferred — confirm pricebook supports |
| interstate removalists melbourne | melbourne to sydney removalists, melbourne to brisbane movers | (none) | deferred — pricebook is local-only |
| cheap removalists melbourne | budget removalists melbourne, affordable removalists melbourne | `/pricing` (secondary) | live (no dedicated page) |

### Suburb pages — `/locations/{slug}`

Pattern primary keyword: `removalists {suburb}`. Pattern secondaries: `{suburb} removalists`, `moving company {suburb}`, `furniture removalists {suburb}`, `apartment movers {suburb}`.

#### Live (8)

melbourne-cbd, richmond, south-yarra, brunswick, carlton, fitzroy, st-kilda, hawthorn

#### Tier A — must-have inner ring (~15, planned)

docklands, southbank, collingwood, abbotsford, prahran, windsor, toorak, kew, camberwell, north-melbourne, west-melbourne, parkville, east-melbourne, cremorne, albert-park

#### Tier B — middle ring with apartment density (~20, planned)

footscray, yarraville, williamstown, port-melbourne, south-melbourne, elwood, balaclava, caulfield, glen-iris, malvern, armadale, hawthorn-east, surrey-hills, box-hill, doncaster, bentleigh, brighton, elsternwick, coburg, preston

#### Tier C — fill-out (~25, planned)

reservoir, heidelberg, ivanhoe, northcote, thornbury, pascoe-vale, essendon, moonee-ponds, ascot-vale, flemington, kensington, maribyrnong, sunshine, altona, newport, spotswood, seddon, notting-hill, clayton, mount-waverley, glen-waverley, burwood, mitcham, ringwood

**Anti-thin rule**: Only ship a suburb page when it carries one of:
- a unique access nuance (parking, lift, laneway, no-stop zone, building-type quirk)
- a unique nearby-suburbs cluster
- a known recurring job pattern (e.g. "studios in St Kilda backpacker buildings", "Carlton terrace stair carries", "Docklands high-rise loading bay timing")

If none of those apply, fold the suburb into a "nearby suburbs covered" mention on a parent page instead.

---

## Layer 2 — Problem-aware (warm intent, easier to rank, converts well)

These map to guide, comparison, and cost pages.

### Cost pages — `/resources/cost/{slug}`

| Primary keyword | Secondaries | Page | Status |
|---|---|---|---|
| how much do removalists cost melbourne | removalist cost melbourne, melbourne moving cost, removalist hourly rate melbourne | `/resources/cost/removalist-cost-melbourne` | planned (first wave) |
| cost to move 2 bedroom apartment melbourne | 2 bedroom apartment move cost, 2 bedroom move price melbourne, 2 bed unit move cost | `/resources/cost/2-bedroom-apartment-move-cost` | planned (first wave) |
| cost to move 1 bedroom apartment melbourne | 1 bedroom move cost, 1 bedroom apartment move price melbourne | `/resources/cost/1-bedroom-apartment-move-cost` | planned |
| cost to move studio melbourne | studio move cost, studio apartment move price | `/resources/cost/studio-move-cost` | planned |
| moving cost calculator melbourne | melbourne removalist calculator, moving estimate calculator | `/resources/cost/moving-calculator` | planned (first wave) |
| 4 tonne truck hourly rate melbourne | 4 tonne truck price melbourne, 4t truck hire with driver | `/resources/cost/4-tonne-truck-rate` | planned |
| 6 tonne truck hourly rate melbourne | 6 tonne truck price melbourne, 6t truck hire with driver | `/resources/cost/6-tonne-truck-rate` | planned |

### Guides — `/resources/guides/{slug}`

| Primary keyword | Secondaries | Page | Status |
|---|---|---|---|
| how long does it take to move a 1 bedroom apartment | 1 bedroom move duration, how long to move a unit | `/resources/guides/how-long-1-bedroom-move` | planned |
| best time to move house melbourne | cheapest day to move melbourne, best month to move melbourne | `/resources/guides/best-time-to-move-melbourne` | planned |
| how to prepare for removalists | how to get ready for movers, what to do before removalists arrive | `/resources/guides/prepare-for-removalists` | planned |
| moving day checklist melbourne | melbourne moving day checklist, moving day to-do list | `/resources/guides/moving-day-checklist` | planned (first wave) |
| how to pack for a move | packing checklist for moving, packing tips for moving house | `/resources/guides/packing-checklist` | planned |
| moving with stairs melbourne | stair carry removalists melbourne, walk-up apartment moves | `/resources/guides/moving-with-stairs` | planned (first wave) |
| moving with no parking melbourne | no parking move melbourne, loading zone permit melbourne, double parking move | `/resources/guides/moving-with-limited-parking` | planned (first wave) |
| how to book a lift for moving melbourne | building lift booking for move, residential lift access for movers | `/resources/guides/booking-building-lift` | planned |
| how much to tip removalists australia | tipping movers australia, do you tip removalists | `/resources/guides/tipping-removalists-australia` | planned |
| what to do if removalists are late | removalists late, removalist no show | `/resources/guides/late-removalists` | planned |
| moving insurance melbourne | removalist insurance melbourne, transit insurance for moving | `/resources/guides/moving-insurance` | planned |

---

## Layer 3 — Category authority (slow, long-term)

These ride on existing pages as secondaries. No standalone pages.

| Keyword | Riding on |
|---|---|
| removalists | `/services` (secondary) |
| moving company | `/` (secondary) |
| furniture removals | `/services/furniture-removals` (already primary cluster) |
| house movers | `/services` (secondary) |
| relocation services melbourne | `/services` (secondary) |

---

## Comparison & vs (intercept evaluation)

| Primary keyword | Secondaries | Page | Status |
|---|---|---|---|
| hourly removalists vs flat rate | flat rate removalists vs hourly, hourly vs fixed price moving | `/resources/comparison/hourly-vs-flat-rate` | planned (first wave) |
| diy van hire vs removalists | hire a van or removalist, ute and trailer vs removalists | `/resources/comparison/diy-van-vs-removalist` | planned (first wave) |
| man with a van vs removalist | man with van or full removalist, small mover vs full removalist | `/resources/comparison/man-with-van-vs-removalist` | planned |
| best removalists melbourne | top removalists melbourne, melbourne removalists reviews | `/resources/comparison/best-removalists-melbourne` | planned |
| young and hungry vs {competitor} | (per competitor) | (none) | deferred — only ship with concrete differentiators and proof |

---

## Glossary — `/resources/glossary/{slug}`

Cheap topical authority. Only ship if the entry links into a money page.

| Term | Page | Links into |
|---|---|---|
| what is a removalist | `/resources/glossary/what-is-a-removalist` | `/services` |
| 4 tonne truck | `/resources/glossary/4-tonne-truck` | `/services/small-moves`, `/resources/cost/4-tonne-truck-rate` |
| 6 tonne truck | `/resources/glossary/6-tonne-truck` | `/services/apartment-moves`, `/resources/cost/6-tonne-truck-rate` |
| depot to depot pricing | `/resources/glossary/depot-to-depot-pricing` | `/pricing`, `/how-it-works` |
| hourly billing increment | `/resources/glossary/hourly-billing-increment` | `/pricing` |
| return trip charge | `/resources/glossary/return-trip-charge` | `/pricing`, `/how-it-works` |
| callout fee | `/resources/glossary/callout-fee` | `/pricing` |
| packing blanket | `/resources/glossary/packing-blanket` | `/services/furniture-removals` |
| dolly and trolley | `/resources/glossary/dolly-and-trolley` | `/services/apartment-moves` |
| loading zone permit melbourne | `/resources/glossary/loading-zone-permit-melbourne` | `/resources/guides/moving-with-limited-parking` |

---

## Process

1. Before adding a page: add a row here first. If the keyword can't be defended in 1-2 sentences as worth ranking for, drop it.
2. When the page ships: change `Status` to `live`.
3. When Search Console shows real impressions: add the actual top queries as new rows so we map them to existing or future pages.
4. When a deferred capability ships in the pricebook: re-evaluate the deferred rows.
