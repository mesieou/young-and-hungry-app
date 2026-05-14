import type { Metadata, MetadataRoute } from "next";

const BASE_URL = "https://youngandh.co";
const OG_IMAGE = `${BASE_URL}/young-and-hungry-horizontal-logo.svg`;

export const siteConfig = {
  name: "Young & Hungry",
  legalName: "Young & Hungry",
  url: BASE_URL,
  email: "info@youngandh.co",
  areaServed: "Melbourne and nearby suburbs",
  ogImage: OG_IMAGE
} as const;

export type PublicPageFamily =
  | "core"
  | "service"
  | "location"
  | "guide"
  | "cost"
  | "comparison"
  | "glossary";
export type PageIntent = "commercial" | "local" | "informational" | "comparison" | "definition";
export type PublicSchemaType =
  | "WebPage"
  | "Service"
  | "FAQPage"
  | "MovingCompany"
  | "Article"
  | "DefinedTerm";
export type PublicPageKind = "landing" | "hub" | "leaf";
export type SitemapFamily = "core" | "services" | "locations" | "resources";

const FAMILY_TO_SITEMAP: Record<PublicPageFamily, SitemapFamily> = {
  core: "core",
  service: "services",
  location: "locations",
  guide: "resources",
  cost: "resources",
  comparison: "resources",
  glossary: "resources"
};

export interface PublicPageSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

export interface PublicPageEntry {
  id: string;
  family: PublicPageFamily;
  kind: PublicPageKind;
  label: string;
  canonicalPath: string;
  locale: "en-au";
  indexable: boolean;
  pageIntent: PageIntent;
  title: string;
  description: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  cardDescription: string;
  highlights?: string[];
  sections?: PublicPageSection[];
  faqIds?: string[];
  relatedIds: string[];
  cta: {
    label: string;
    href: string;
  };
  schemaType: PublicSchemaType;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  updatedAt: string;
  parentHub?: string;
  navOrder?: number;
  navLabel?: string;
  sitemapFamily?: SitemapFamily;
}

type CorePageConfig = Omit<PublicPageEntry, "family" | "locale" | "indexable" | "kind"> & {
  kind?: PublicPageKind;
  family?: PublicPageFamily;
  sitemapFamily?: SitemapFamily;
  indexable?: boolean;
};

type ServicePageConfig = {
  id: string;
  slug: string;
  label: string;
  title: string;
  description: string;
  heroTitle: string;
  heroDescription: string;
  cardDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  highlights: string[];
  sections: PublicPageSection[];
  faqIds: string[];
  relatedIds: string[];
  cta: {
    label: string;
    href: string;
  };
};

type LocationPageConfig = {
  slug: string;
  label: string;
  suburbName: string;
  localAngle: string;
  accessNotes: string;
  nearbySuburbs: string[];
};

type ResourcePageConfig = {
  slug: string;
  label: string;
  title: string;
  description: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  cardDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  highlights: string[];
  sections: PublicPageSection[];
  faqIds?: string[];
  relatedIds: string[];
  cta: {
    label: string;
    href: string;
  };
  updatedAt: string;
};

export const faqEntries: FaqEntry[] = [
  {
    id: "final-price",
    question: "What can change the final price on the day?",
    answer:
      "Final price depends on the real move conditions on the day, including access, stairs, parking, heavy items, extra handling, and actual loading time."
  },
  {
    id: "apartment-moves",
    question: "Do you handle apartment moves and tricky access?",
    answer:
      "Yes. Apartment moves are a core focus. We ask about lifts, stairs, parking, and access notes so the move can be quoted with the right context."
  },
  {
    id: "truck-size",
    question: "What if I choose the wrong truck size?",
    answer:
      "Choose the closest option and send the move details. We can adjust the truck if your inventory or access notes show a better fit."
  },
  {
    id: "same-day",
    question: "Can I ask for a same-day or last-minute move?",
    answer:
      "Yes. Same-day requests depend on route, crew availability, and the size of the job, but you can still send the move details through the quote flow."
  },
  {
    id: "pricing-rules",
    question: "How does the estimate work?",
    answer:
      "The estimate uses the route, truck choice, move type, and Young & Hungry pricing rules, including the first hour to pickup, return trip, and half-hour billing."
  },
  {
    id: "service-area",
    question: "Which Melbourne suburbs do you cover?",
    answer:
      "Young & Hungry is focused on Melbourne and nearby suburbs, especially inner-city and apartment-heavy areas where route clarity and access details matter."
  }
] as const;

const corePages: CorePageConfig[] = [
  {
    id: "home",
    kind: "landing",
    label: "Home",
    canonicalPath: "/",
    pageIntent: "commercial",
    title: "Melbourne Removalists for Small Moves, Apartments and Furniture Jobs",
    description:
      "Get a fast moving estimate with clear pricing for small moves, apartment moves, furniture removals, and local moves across Melbourne suburbs.",
    heroEyebrow: "Melbourne removalists",
    heroTitle: "Melbourne removalists for small moves, apartments, and furniture jobs.",
    heroDescription:
      "Get a fast estimate, see how pricing works, and send your move details in minutes. Built for Melbourne CBD and nearby suburbs where access, stairs, parking, and truck size matter.",
    primaryKeyword: "removalists melbourne",
    secondaryKeywords: ["melbourne removalists", "moving quote melbourne", "moving company melbourne"],
    cardDescription: "Fast estimate flow for local Melbourne moves.",
    highlights: ["Fast route-based estimate", "First hour to pickup included", "Apartment-ready quoting", "Melbourne suburbs"],
    sections: [
      {
        title: "Why Young & Hungry is built for city moves",
        paragraphs: [
          "Young & Hungry is designed for the kind of Melbourne moves that are usually harder to quote cleanly: apartment moves, smaller local jobs, furniture runs, and suburb-to-suburb moves where route and access matter.",
          "The public site should explain the service clearly, show how pricing works, and get customers into the estimate flow quickly instead of forcing them through vague sales copy."
        ]
      }
    ],
    faqIds: ["pricing-rules", "final-price", "apartment-moves"],
    relatedIds: ["services-hub", "pricing", "quote", "service-apartment-moves", "location-richmond"],
    cta: {
      label: "Start your estimate",
      href: "/quote"
    },
    schemaType: "MovingCompany",
    changeFrequency: "weekly",
    priority: 1,
    updatedAt: "2026-04-24"
  },
  {
    id: "how-it-works",
    navOrder: 0,
    navLabel: "How it works",
    label: "How it works",
    canonicalPath: "/how-it-works",
    pageIntent: "informational",
    title: "How Melbourne Moving Quotes Work",
    description:
      "See how Young & Hungry turns a route, truck choice, and move details into a clearer Melbourne moving estimate.",
    heroEyebrow: "How it works",
    heroTitle: "A simple path from route to confirmed next step.",
    heroDescription:
      "Start with the route, choose the job type and truck, see your estimate, then send the move details. We confirm the next step after checking the job details.",
    primaryKeyword: "how moving quotes work melbourne",
    secondaryKeywords: ["melbourne moving estimate", "how moving quotes work", "removalist quote melbourne"],
    cardDescription: "See how the estimate flow works before you book.",
    highlights: ["Route first", "Truck and move type", "Estimate before contact", "Final confirmation after review"],
    sections: [
      {
        title: "Start with the route",
        paragraphs: [
          "The quote flow starts with pickup and drop-off so the move is grounded in a real route, not a generic enquiry form.",
          "That matters most in Melbourne suburbs where traffic, parking, and return travel affect the final cost."
        ]
      },
      {
        title: "See an estimate before you send the job",
        paragraphs: [
          "After the route, move type, and truck are chosen, the estimate appears before contact details. That keeps the process quicker and more transparent.",
          "The final price is still confirmed using the real move conditions, including access, stairs, parking, and handling time."
        ]
      }
    ],
    faqIds: ["pricing-rules", "final-price"],
    relatedIds: ["pricing", "quote", "service-small-moves"],
    cta: {
      label: "Start your estimate",
      href: "/quote"
    },
    schemaType: "WebPage",
    changeFrequency: "monthly",
    priority: 0.85,
    updatedAt: "2026-04-24"
  },
  {
    id: "pricing",
    navOrder: 4,
    navLabel: "Pricing",
    label: "Pricing",
    canonicalPath: "/pricing",
    pageIntent: "commercial",
    title: "Melbourne Moving Quote Pricing",
    description:
      "Understand how Young & Hungry estimates labour, travel, truck size, and final move pricing across Melbourne suburbs.",
    heroEyebrow: "How pricing works",
    heroTitle: "Clear pricing rules before you send the move.",
    heroDescription:
      "Young & Hungry estimates labour, travel, truck size, and booking fee in a way that is easier to follow. The final price is still confirmed from the real move conditions on the day.",
    primaryKeyword: "removalist pricing melbourne",
    secondaryKeywords: ["removalist pricing melbourne", "moving estimate melbourne", "man with a van pricing melbourne"],
    cardDescription: "See the pricing rules behind the estimate.",
    highlights: ["First hour to pickup included", "Return trip included", "Half-hour billing", "Final price checked on the day"],
    sections: [
      {
        title: "What the estimate includes",
        paragraphs: [
          "Young & Hungry estimates labour, truck time, charged travel, and a booking fee using the route, move type, and selected truck.",
          "That gives customers a clearer starting point than a vague 'request a callback' form."
        ]
      },
      {
        title: "What can change later",
        paragraphs: [
          "The final price is confirmed from the real move conditions on the day, especially when stairs, parking, heavy items, extra handling, or loading time differ from the estimate.",
          "That keeps the pricing transparent without pretending a route-only estimate can see everything in advance."
        ]
      }
    ],
    faqIds: ["pricing-rules", "final-price", "truck-size"],
    relatedIds: ["quote", "how-it-works", "service-man-with-a-van"],
    cta: {
      label: "See your estimate",
      href: "/quote"
    },
    schemaType: "WebPage",
    changeFrequency: "monthly",
    priority: 0.9,
    updatedAt: "2026-04-24"
  },
  {
    id: "services-hub",
    kind: "hub",
    family: "service",
    sitemapFamily: "services",
    navOrder: 1,
    navLabel: "Services",
    label: "Services",
    canonicalPath: "/services",
    pageIntent: "commercial",
    title: "Removalist Services Melbourne",
    description:
      "Explore Young & Hungry services for small moves, apartment moves, furniture removals, same-day jobs, and man with a van requests in Melbourne.",
    heroEyebrow: "Services",
    heroTitle: "Removalist services built for Melbourne suburb-to-suburb moves.",
    heroDescription:
      "Young & Hungry is focused on smaller and access-sensitive jobs: apartment moves, furniture removals, same-day requests, and local Melbourne moves that need a clearer quote.",
    primaryKeyword: "removalist services melbourne",
    secondaryKeywords: ["small moves melbourne", "apartment movers melbourne", "furniture removalists melbourne"],
    cardDescription: "Browse the move types Young & Hungry handles across Melbourne.",
    highlights: ["Small moves", "Apartment moves", "Furniture removals", "Same-day requests"],
    sections: [
      {
        title: "Melbourne move types we target first",
        paragraphs: [
          "Young & Hungry is not trying to look like every removalist website at once. The first focus is high-intent local jobs where fast quoting and clear pricing matter most.",
          "That includes apartment moves, small local moves, furniture pickups, and short-notice requests around Melbourne and nearby suburbs."
        ]
      }
    ],
    faqIds: ["apartment-moves", "same-day", "truck-size"],
    relatedIds: ["quote", "pricing", "location-melbourne-cbd"],
    cta: {
      label: "Start your estimate",
      href: "/quote"
    },
    schemaType: "WebPage",
    changeFrequency: "monthly",
    priority: 0.92,
    updatedAt: "2026-04-24"
  },
  {
    id: "faq",
    navOrder: 5,
    navLabel: "FAQ",
    label: "FAQ",
    canonicalPath: "/faq",
    pageIntent: "informational",
    title: "Melbourne Removalist FAQ",
    description:
      "Answers about Melbourne moving estimates, apartment access, truck sizes, service areas, and what changes the final price.",
    heroEyebrow: "FAQ",
    heroTitle: "Answers to the questions customers ask before they move.",
    heroDescription:
      "This FAQ focuses on pricing, access, service area, truck size, and what affects the final price so customers can understand the move before they book.",
    primaryKeyword: "removalist faq melbourne",
    secondaryKeywords: ["moving quote questions", "removalist pricing questions", "apartment move faq"],
    cardDescription: "Common questions about quotes, pricing, truck size, and access.",
    highlights: ["Pricing", "Truck size", "Apartment access", "Service area"],
    sections: [
      {
        title: "What this page should answer",
        paragraphs: [
          "The FAQ should reduce friction and support conversion by answering the questions customers actually ask before sending a move.",
          "It should not explain backend systems or internal workflow details that do nothing for trust or decision-making."
        ]
      }
    ],
    faqIds: faqEntries.map((faq) => faq.id),
    relatedIds: ["pricing", "how-it-works", "contact"],
    cta: {
      label: "Start your estimate",
      href: "/quote"
    },
    schemaType: "FAQPage",
    changeFrequency: "monthly",
    priority: 0.7,
    updatedAt: "2026-04-24"
  },
  {
    id: "contact",
    label: "Contact",
    canonicalPath: "/contact",
    pageIntent: "commercial",
    title: "Contact Young & Hungry",
    description:
      "Contact Young & Hungry about a Melbourne move, a quote request, service area questions, or anything else you need before booking.",
    heroEyebrow: "Contact",
    heroTitle: "Talk to Young & Hungry about your move.",
    heroDescription:
      "Use the quote flow for the fastest estimate. If you need something else first, contact Young & Hungry about service areas, move types, or the next step.",
    primaryKeyword: "contact melbourne removalists",
    secondaryKeywords: ["contact removalists melbourne", "moving quote contact", "young and hungry contact"],
    cardDescription: "Get in touch about your move, service area, or quote.",
    highlights: ["Quote support", "Service area questions", "Move type questions", "Melbourne suburbs"],
    sections: [
      {
        title: "When to use this page",
        paragraphs: [
          "The quote flow is the best path if you already know the route and want an estimate.",
          "Use the contact page if you need help before that, or if you want to ask about a suburb, move type, or anything that is not obvious from the estimate flow."
        ]
      }
    ],
    faqIds: ["service-area", "same-day"],
    relatedIds: ["quote", "services-hub", "faq"],
    cta: {
      label: "Start your estimate",
      href: "/quote"
    },
    schemaType: "WebPage",
    changeFrequency: "monthly",
    priority: 0.65,
    updatedAt: "2026-04-24"
  },
  {
    id: "quote",
    label: "Quote",
    canonicalPath: "/quote",
    pageIntent: "commercial",
    title: "Get a Melbourne Moving Estimate",
    description:
      "Start a Melbourne moving estimate with pickup, drop-off, move type, truck size, timing, and access details.",
    heroEyebrow: "Get an estimate",
    heroTitle: "Start your Melbourne moving estimate.",
    heroDescription:
      "Add the route, choose the move type and truck, see your estimate, and send the move details in one guided flow.",
    primaryKeyword: "moving estimate melbourne",
    secondaryKeywords: ["moving quote melbourne", "removalist quote melbourne", "small move quote melbourne"],
    cardDescription: "Five-step estimate flow for Melbourne moves.",
    highlights: ["Route first", "Estimate before contact", "Apartment-friendly details", "No payment needed to start"],
    sections: [
      {
        title: "What the quote flow should do",
        paragraphs: [
          "The quote flow should feel faster and clearer than a generic enquiry form. Customers should understand the move, the estimate, and the next step without reading product jargon.",
          "The estimate is visible before the customer sends contact details, but the final price is still confirmed against the real move conditions."
        ]
      }
    ],
    faqIds: ["pricing-rules", "final-price"],
    relatedIds: ["pricing", "how-it-works", "services-hub"],
    cta: {
      label: "Start your estimate",
      href: "/quote"
    },
    schemaType: "WebPage",
    changeFrequency: "weekly",
    priority: 0.95,
    updatedAt: "2026-04-24"
  },
  {
    id: "locations-hub",
    kind: "hub",
    family: "location",
    sitemapFamily: "locations",
    navOrder: 2,
    navLabel: "Locations",
    label: "Locations",
    canonicalPath: "/locations",
    pageIntent: "local",
    title: "Melbourne Suburbs Young & Hungry Covers",
    description:
      "Browse Melbourne suburbs Young & Hungry covers for apartment moves, small removals, furniture jobs, and short local moves.",
    heroEyebrow: "Melbourne suburbs",
    heroTitle: "Suburbs we cover for Melbourne moves.",
    heroDescription:
      "Young & Hungry is built for Melbourne and inner-suburb moves where access, parking, and route clarity matter. Pick a suburb to see how we quote local jobs.",
    primaryKeyword: "melbourne suburbs removalists",
    secondaryKeywords: [
      "removalists melbourne suburbs",
      "moving company melbourne suburbs",
      "melbourne removalist coverage"
    ],
    cardDescription: "Melbourne suburbs covered by Young & Hungry.",
    highlights: ["Inner Melbourne ring", "Apartment-heavy suburbs", "Local route awareness", "Fast estimate flow"],
    sections: [
      {
        title: "What a suburb page should tell you",
        paragraphs: [
          "Each suburb page covers what makes that area different to quote: parking patterns, lift access, stair counts, building types, and the nearby suburbs we usually pair with it.",
          "If your suburb is not listed yet, the closest neighbour is usually a fair guide. Send the route through the estimate flow and we can confirm coverage."
        ]
      }
    ],
    faqIds: ["service-area"],
    relatedIds: ["services-hub", "quote", "pricing"],
    cta: {
      label: "Start your estimate",
      href: "/quote"
    },
    schemaType: "WebPage",
    changeFrequency: "monthly",
    priority: 0.78,
    updatedAt: "2026-05-14"
  },
  {
    id: "resources-hub",
    kind: "hub",
    sitemapFamily: "resources",
    navOrder: 3,
    navLabel: "Resources",
    label: "Resources",
    canonicalPath: "/resources",
    pageIntent: "informational",
    title: "Melbourne Moving Cost, Comparison, and Guides",
    description:
      "Cost guides, comparison pages, packing checklists, and definitions for moving in Melbourne — all written for the access patterns inner-Melbourne moves actually have.",
    heroEyebrow: "Resources",
    heroTitle: "Real-world resources for moving in Melbourne.",
    heroDescription:
      "Cost guides, comparison pages, moving-day checklists, and short definitions of the pricing terms removalists actually use.",
    primaryKeyword: "melbourne moving guides",
    secondaryKeywords: [
      "melbourne moving cost guides",
      "removalist cost guide melbourne",
      "moving guides australia"
    ],
    cardDescription: "Cost guides, comparisons, and moving-day checklists.",
    highlights: ["Cost guides", "Comparison pages", "Moving-day guides", "Glossary"],
    sections: [
      {
        title: "What lives in resources",
        paragraphs: [
          "Resources cover the questions customers ask before they request an estimate: how much a move costs, hourly versus flat-rate pricing, what changes the final price, and how to handle stairs, lifts, and parking on the day.",
          "Each piece links back to a service or location page so the next step is always one click away."
        ]
      }
    ],
    faqIds: ["pricing-rules", "final-price"],
    relatedIds: ["services-hub", "pricing", "quote"],
    cta: {
      label: "Get a fast estimate",
      href: "/quote"
    },
    schemaType: "WebPage",
    changeFrequency: "monthly",
    priority: 0.75,
    updatedAt: "2026-05-14"
  },
  {
    id: "resources-guides-hub",
    kind: "hub",
    family: "guide",
    sitemapFamily: "resources",
    parentHub: "resources-hub",
    label: "Guides",
    canonicalPath: "/resources/guides",
    pageIntent: "informational",
    title: "Melbourne Moving Guides and Checklists",
    description:
      "Practical Melbourne moving guides — packing checklists, moving-day plans, stair carries, lift bookings, and what to do when parking is tight.",
    heroEyebrow: "Guides",
    heroTitle: "Practical moving guides for Melbourne moves.",
    heroDescription:
      "Checklists and explainers for the parts of a move that actually go wrong: parking, stairs, lift bookings, packing, and timing.",
    primaryKeyword: "melbourne moving guides",
    secondaryKeywords: ["moving guides melbourne", "moving day checklist melbourne", "packing checklist melbourne"],
    cardDescription: "Practical guides for the parts of a move that trip people up.",
    highlights: ["Moving-day checklists", "Stairs and lifts", "Parking and access", "Packing tips"],
    sections: [
      {
        title: "Why these guides exist",
        paragraphs: [
          "Most moving content online is generic. These guides are written for inner-Melbourne moves where parking, stair carries, and lift bookings change the day more than truck size does."
        ]
      }
    ],
    faqIds: [],
    relatedIds: ["resources-hub", "services-hub", "quote"],
    cta: {
      label: "Get a fast estimate",
      href: "/quote"
    },
    schemaType: "WebPage",
    changeFrequency: "monthly",
    priority: 0.72,
    updatedAt: "2026-05-14"
  },
  {
    id: "resources-cost-hub",
    kind: "hub",
    family: "cost",
    sitemapFamily: "resources",
    parentHub: "resources-hub",
    label: "Cost",
    canonicalPath: "/resources/cost",
    pageIntent: "commercial",
    title: "Melbourne Moving Costs and Hourly Rates",
    description:
      "How much do removalists cost in Melbourne? Hourly rates by truck size, cost-by-bedroom guides, and a moving cost calculator.",
    heroEyebrow: "Cost",
    heroTitle: "What a Melbourne move actually costs.",
    heroDescription:
      "Hourly rates by truck size, cost-by-bedroom guides, weekend uplift, and a calculator for the most common Melbourne move shapes.",
    primaryKeyword: "removalist cost melbourne",
    secondaryKeywords: ["how much do removalists cost melbourne", "melbourne moving cost", "removalist hourly rate melbourne"],
    cardDescription: "Hourly rates, cost-by-bedroom guides, and the moving cost calculator.",
    highlights: ["Hourly rates by truck", "Cost by bedroom", "Weekend uplift", "Moving calculator"],
    sections: [
      {
        title: "How we publish prices",
        paragraphs: [
          "Every cost page shows the real Young & Hungry hourly rate for the relevant truck class, the pricing rules that apply (first hour to pickup included, half-hour billing, return trip), and the on-day variables that can change the final number."
        ]
      }
    ],
    faqIds: ["pricing-rules", "final-price"],
    relatedIds: ["pricing", "resources-hub", "quote"],
    cta: {
      label: "See your estimate",
      href: "/quote"
    },
    schemaType: "WebPage",
    changeFrequency: "monthly",
    priority: 0.78,
    updatedAt: "2026-05-14"
  },
  {
    id: "resources-comparison-hub",
    kind: "hub",
    family: "comparison",
    sitemapFamily: "resources",
    parentHub: "resources-hub",
    label: "Comparisons",
    canonicalPath: "/resources/comparison",
    pageIntent: "comparison",
    title: "Compare Melbourne Moving Options",
    description:
      "Compare hourly versus flat-rate removalists, DIY van hire versus a removalist, and man with a van versus a full removalist crew.",
    heroEyebrow: "Comparisons",
    heroTitle: "Pick the right kind of move for the job.",
    heroDescription:
      "Side-by-side comparisons of the most common Melbourne moving choices: hourly vs flat rate, DIY van hire vs hiring a removalist, man with a van vs full removalist crew.",
    primaryKeyword: "removalist comparison melbourne",
    secondaryKeywords: ["hourly vs flat rate removalists", "diy van hire vs removalists", "best removalists melbourne"],
    cardDescription: "Honest side-by-side comparisons of moving options.",
    highlights: ["Hourly vs flat rate", "DIY vs removalist", "Man with a van vs full crew", "When Y&H is not the fit"],
    sections: [
      {
        title: "Why comparison pages",
        paragraphs: [
          "Customers comparing options often haven't decided what kind of move they need. Each comparison page makes a clear recommendation by job size, budget, and access conditions — including when Young & Hungry is not the right fit."
        ]
      }
    ],
    faqIds: [],
    relatedIds: ["pricing", "resources-hub", "quote"],
    cta: {
      label: "See your estimate",
      href: "/quote"
    },
    schemaType: "WebPage",
    changeFrequency: "monthly",
    priority: 0.74,
    updatedAt: "2026-05-14"
  },
  {
    id: "resources-glossary-hub",
    kind: "hub",
    family: "glossary",
    sitemapFamily: "resources",
    parentHub: "resources-hub",
    label: "Glossary",
    canonicalPath: "/resources/glossary",
    pageIntent: "definition",
    title: "Removalist Pricing and Service Glossary",
    description:
      "Short, plain-English definitions of removalist terms — truck classes, hourly billing, return trip charges, callout fees, packing blankets, and loading zone permits.",
    heroEyebrow: "Glossary",
    heroTitle: "Plain-English definitions of removalist terms.",
    heroDescription:
      "Short definitions of the pricing terms, equipment names, and access concepts removalists use — written without the jargon.",
    primaryKeyword: "removalist glossary",
    secondaryKeywords: ["removalist terms", "moving terminology", "what is a removalist"],
    cardDescription: "Definitions of the pricing terms, equipment, and access words removalists use.",
    highlights: ["Pricing terms", "Truck classes", "Equipment", "Access concepts"],
    sections: [
      {
        title: "How to use the glossary",
        paragraphs: [
          "Each entry is short, links to the relevant service or pricing page, and explains why the term matters when you book a move. If you spot a missing term, send it through the contact page."
        ]
      }
    ],
    faqIds: [],
    relatedIds: ["pricing", "resources-hub", "services-hub"],
    cta: {
      label: "Get a fast estimate",
      href: "/quote"
    },
    schemaType: "WebPage",
    changeFrequency: "monthly",
    priority: 0.6,
    updatedAt: "2026-05-14"
  }
] as const;

const servicePagesConfig: ServicePageConfig[] = [
  {
    id: "service-small-moves",
    slug: "small-moves",
    label: "Small moves",
    title: "Small Moves Melbourne",
    description:
      "Get a fast estimate for small moves in Melbourne, including studio moves, single rooms, short local moves, and light furniture jobs.",
    heroTitle: "Small moves in Melbourne without the full-house hassle.",
    heroDescription:
      "Young & Hungry is a fit for the smaller jobs that still need a real removalist flow: studio moves, room moves, a few key pieces of furniture, or a short local move across Melbourne suburbs.",
    cardDescription: "Studio moves, room moves, and smaller local jobs across Melbourne.",
    primaryKeyword: "small moves melbourne",
    secondaryKeywords: ["small removals melbourne", "small movers melbourne", "local small move melbourne"],
    highlights: ["Studios and room moves", "Short local routes", "Fast estimate flow", "Clear pricing rules"],
    sections: [
      {
        title: "When a small move still needs proper quoting",
        paragraphs: [
          "Small moves are often harder than they look. Access, stairs, parking, and a few heavy items can change the time needed even when the inventory is short.",
          "Young & Hungry keeps the flow simple by starting with the route, then using truck choice and move details to give a clearer estimate."
        ]
      },
      {
        title: "Good fit for Melbourne suburb-to-suburb jobs",
        paragraphs: [
          "Small moves are common in Melbourne inner suburbs where customers are moving between apartments, share houses, studios, or storage.",
          "That is why the estimate flow is built for route clarity and access notes rather than a one-line contact form."
        ]
      }
    ],
    faqIds: ["pricing-rules", "truck-size", "final-price"],
    relatedIds: ["quote", "pricing", "location-richmond", "location-carlton"],
    cta: {
      label: "Get a small move estimate",
      href: "/quote"
    }
  },
  {
    id: "service-apartment-moves",
    slug: "apartment-moves",
    label: "Apartment moves",
    title: "Apartment Movers Melbourne",
    description:
      "Get a clearer estimate for apartment moves in Melbourne, including lifts, stairs, parking, building access, and suburb-to-suburb routes.",
    heroTitle: "Apartment moves in Melbourne need better access detail.",
    heroDescription:
      "Apartment moves are a strong fit for Young & Hungry because the route is only part of the job. Lift access, stairs, parking, and building rules often matter just as much.",
    cardDescription: "Apartment moves with lifts, stairs, parking, and building access considered early.",
    primaryKeyword: "apartment movers melbourne",
    secondaryKeywords: ["apartment moves melbourne", "unit movers melbourne", "city apartment removalists melbourne"],
    highlights: ["Lift and stair access", "Parking-aware quoting", "CBD and inner suburbs", "Estimate before contact"],
    sections: [
      {
        title: "Why apartment quotes often go wrong",
        paragraphs: [
          "Many apartment moves are under-quoted because the form never asks about stairs, loading zones, parking distance, or building access.",
          "Young & Hungry makes those details part of the move flow so the estimate is anchored to the real job."
        ]
      },
      {
        title: "Built for Melbourne apartment patterns",
        paragraphs: [
          "Apartment-heavy suburbs like South Yarra, Richmond, Carlton, Docklands, and St Kilda often need more access context than suburban house moves.",
          "That makes apartment moves one of the clearest early SEO and product fits for the brand."
        ]
      }
    ],
    faqIds: ["apartment-moves", "final-price", "service-area"],
    relatedIds: ["quote", "pricing", "location-south-yarra", "location-docklands"],
    cta: {
      label: "Get an apartment move estimate",
      href: "/quote"
    }
  },
  {
    id: "service-furniture-removals",
    slug: "furniture-removals",
    label: "Furniture removals",
    title: "Furniture Removalists Melbourne",
    description:
      "Get a fast estimate for furniture removals in Melbourne, including single-item jobs, couch pickups, bed moves, and apartment furniture moves.",
    heroTitle: "Furniture removals for the jobs bigger than a car but smaller than a full move.",
    heroDescription:
      "Need help moving a couch, bed, table, or a few larger items? Young & Hungry is set up for furniture jobs that still need route, access, and truck clarity.",
    cardDescription: "Single-item and furniture jobs across Melbourne suburbs.",
    primaryKeyword: "furniture removalists melbourne",
    secondaryKeywords: ["furniture movers melbourne", "couch movers melbourne", "bed movers melbourne"],
    highlights: ["Single-item jobs", "Furniture pickups", "Apartment furniture moves", "Route-based estimate"],
    sections: [
      {
        title: "Furniture jobs still need access context",
        paragraphs: [
          "Furniture moves often look simple until the crew sees stairs, tight hallways, awkward lifts, or long carries from the street.",
          "That is why Young & Hungry asks for access notes even on smaller furniture jobs."
        ]
      },
      {
        title: "Good fit for pickups and short local runs",
        paragraphs: [
          "Furniture jobs often involve a pickup from one Melbourne suburb and a delivery to another, making route, truck size, and return travel relevant from the start.",
          "The flow is built to surface those inputs early rather than hide them in a callback."
        ]
      }
    ],
    faqIds: ["truck-size", "pricing-rules", "same-day"],
    relatedIds: ["quote", "service-small-moves", "location-brunswick", "location-fitzroy"],
    cta: {
      label: "Get a furniture move estimate",
      href: "/quote"
    }
  },
  {
    id: "service-man-with-a-van",
    slug: "man-with-a-van",
    label: "Man with a van",
    title: "Man With a Van Melbourne",
    description:
      "Request a man with a van estimate in Melbourne for smaller local moves, furniture jobs, apartment moves, and flexible suburb-to-suburb jobs.",
    heroTitle: "A man with a van quote flow, without the vague pricing.",
    heroDescription:
      "The service angle is simple: smaller local moves that need a practical truck and labour estimate, not a big-house removalist process.",
    cardDescription: "Smaller Melbourne moves with a simpler van-and-labour angle.",
    primaryKeyword: "man with a van melbourne",
    secondaryKeywords: ["van movers melbourne", "small removalist melbourne", "local van move melbourne"],
    highlights: ["Smaller local jobs", "Flexible move type", "Simple estimate flow", "Melbourne suburb coverage"],
    sections: [
      {
        title: "Where this service angle fits",
        paragraphs: [
          "Customers searching for a man with a van usually want a smaller, quicker, or more affordable move than a full removalist service.",
          "Young & Hungry can meet that intent while still keeping route and access details visible."
        ]
      },
      {
        title: "Simple to understand, still operationally real",
        paragraphs: [
          "The customer-facing language can be simpler here, but the pricing still has to respect the real route, truck, labour time, and job conditions.",
          "That balance is one of the clearest Y&H differentiators."
        ]
      }
    ],
    faqIds: ["pricing-rules", "final-price", "same-day"],
    relatedIds: ["quote", "pricing", "service-small-moves", "location-melbourne-cbd"],
    cta: {
      label: "Get a van move estimate",
      href: "/quote"
    }
  },
  {
    id: "service-same-day-removals",
    slug: "same-day-removals",
    label: "Same-day removals",
    title: "Same Day Removalists Melbourne",
    description:
      "Request a same-day moving estimate in Melbourne for urgent apartment moves, furniture jobs, small removals, and last-minute suburb moves.",
    heroTitle: "Same-day removalists in Melbourne for urgent local moves.",
    heroDescription:
      "Need a move today or at short notice? Young & Hungry can still capture the route, truck size, and move details first so the job is clearer before the next step is confirmed.",
    cardDescription: "Urgent and short-notice local moves across Melbourne suburbs.",
    primaryKeyword: "same day removalists melbourne",
    secondaryKeywords: ["urgent movers melbourne", "last minute removalists melbourne", "same day movers melbourne"],
    highlights: ["Urgent local jobs", "Apartment and furniture moves", "Fast estimate flow", "Melbourne suburb coverage"],
    sections: [
      {
        title: "Urgent does not mean unclear",
        paragraphs: [
          "Same-day moves still need enough detail to avoid confusion around access, parking, truck size, and timing.",
          "Young & Hungry keeps the estimate flow short, but it still captures what matters before the next step is confirmed."
        ]
      },
      {
        title: "Best suited to smaller urgent jobs",
        paragraphs: [
          "The strongest same-day fit is smaller local work: apartment moves, furniture jobs, urgent pickups, or short-notice suburb transfers.",
          "Larger whole-house moves can still be requested, but the site should lead with the smaller jobs where speed matters most."
        ]
      }
    ],
    faqIds: ["same-day", "service-area", "final-price"],
    relatedIds: ["quote", "service-small-moves", "location-st-kilda", "location-richmond"],
    cta: {
      label: "Check a same-day estimate",
      href: "/quote"
    }
  }
] as const;

const locationPagesConfig: LocationPageConfig[] = [
  {
    slug: "melbourne-cbd",
    label: "Melbourne CBD",
    suburbName: "Melbourne CBD",
    localAngle: "city apartments, loading zones, and tighter building access",
    accessNotes: "high-rise access, loading bay timing, and CBD parking",
    nearbySuburbs: ["Docklands", "Carlton", "Southbank"]
  },
  {
    slug: "richmond",
    label: "Richmond",
    suburbName: "Richmond",
    localAngle: "apartment moves, terrace streets, and busy local traffic",
    accessNotes: "tight parking, stairs, and dense local streets",
    nearbySuburbs: ["South Yarra", "Hawthorn", "Collingwood"]
  },
  {
    slug: "south-yarra",
    label: "South Yarra",
    suburbName: "South Yarra",
    localAngle: "apartment-heavy moves and high-access buildings",
    accessNotes: "apartment towers, loading access, and short parking windows",
    nearbySuburbs: ["Richmond", "Prahran", "Toorak"]
  },
  {
    slug: "brunswick",
    label: "Brunswick",
    suburbName: "Brunswick",
    localAngle: "small moves, furniture jobs, and apartment-to-house routes",
    accessNotes: "mixed apartment access, parking, and longer carries",
    nearbySuburbs: ["Carlton North", "Coburg", "Parkville"]
  },
  {
    slug: "carlton",
    label: "Carlton",
    suburbName: "Carlton",
    localAngle: "student moves, apartment moves, and short local jobs",
    accessNotes: "older buildings, stairs, and inner-city parking",
    nearbySuburbs: ["Melbourne CBD", "Brunswick", "Parkville"]
  },
  {
    slug: "fitzroy",
    label: "Fitzroy",
    suburbName: "Fitzroy",
    localAngle: "apartment moves, furniture pickups, and compact local routes",
    accessNotes: "tight streets, laneways, and parking constraints",
    nearbySuburbs: ["Collingwood", "Carlton", "Richmond"]
  },
  {
    slug: "st-kilda",
    label: "St Kilda",
    suburbName: "St Kilda",
    localAngle: "apartment moves, furniture runs, and short-notice local jobs",
    accessNotes: "beachside parking, apartment access, and busy local traffic",
    nearbySuburbs: ["Elwood", "Balaclava", "South Melbourne"]
  },
  {
    slug: "hawthorn",
    label: "Hawthorn",
    suburbName: "Hawthorn",
    localAngle: "local house-to-apartment routes and furniture jobs",
    accessNotes: "mixed residential access, driveways, and local traffic",
    nearbySuburbs: ["Richmond", "Kew", "Camberwell"]
  }
] as const;

const costPagesConfig: ResourcePageConfig[] = [
  {
    slug: "removalist-cost-melbourne",
    label: "Removalist cost Melbourne",
    title: "How Much Do Removalists Cost in Melbourne | Real Hourly Rates by Truck Size",
    description:
      "Real removalist hourly rates in Melbourne by truck size, plus how the first hour to pickup, half-hour billing, return trip, and weekend uplift change the final number.",
    heroEyebrow: "Cost",
    heroTitle: "How much do removalists cost in Melbourne?",
    heroDescription:
      "Most Melbourne removalists charge by the hour. The number depends on truck size, day of week, route distance, and the on-day variables nobody quotes upfront.",
    cardDescription: "Hourly rates by truck size, plus the rules that change the final number.",
    primaryKeyword: "removalist cost melbourne",
    secondaryKeywords: [
      "how much do removalists cost melbourne",
      "melbourne moving cost",
      "removalist hourly rate melbourne",
      "moving cost melbourne"
    ],
    highlights: [
      "$159-$179/hr by truck and day",
      "First hour to pickup included",
      "Half-hour billing increments",
      "Return trip included"
    ],
    sections: [
      {
        title: "Hourly rates by truck size",
        paragraphs: [
          "Young & Hungry runs two truck classes for Melbourne moves. The 4-tonne fits most studios, 1-bedroom moves, and item deliveries. The 6-tonne is sized for 2 and 3-bedroom apartment or house moves.",
          "Both rates include the truck, the crew, fuel, basic equipment, and the standard pricing rules below. There is no separate callout fee."
        ],
        bullets: [
          "4-tonne truck: $159/hr weekday, $169/hr weekend",
          "6-tonne truck: $169/hr weekday, $179/hr weekend",
          "Booking fee: $25 AUD"
        ]
      },
      {
        title: "Pricing rules that change the total",
        paragraphs: [
          "The hourly rate is only one input. Three rules decide what shows up on the invoice.",
          "First hour to pickup is included. Half-hour billing means the clock rounds to 30-minute blocks, not 15. Return trip is included so you do not pay the truck back to depot."
        ],
        bullets: [
          "Free first hour from base to pickup",
          "30-minute billing increment, rounded up",
          "Minimum 2-hour billable",
          "Return trip from drop-off included"
        ]
      },
      {
        title: "What changes the final price on the day",
        paragraphs: [
          "Estimates use the route, truck choice, and average load times. The final number reflects the real conditions: stairs, parking distance, lift availability, heavy items, and any extra handling.",
          "Apartment moves with stairs and tight parking can run 30-60 minutes longer than estimated. Inner-CBD moves with loading-zone access usually land closer to estimate."
        ]
      },
      {
        title: "A real Melbourne example",
        paragraphs: [
          "A 1-bedroom apartment move from Richmond to Brunswick with a 6-tonne truck on a Saturday: roughly 40 minutes pickup, 25 minutes drive, 35 minutes drop-off. With the first hour included and the return trip included, you are billed for 2 hours at $179/hr plus the $25 booking fee. Total: $383.",
          "Same move with bad parking and a stair carry on the drop-off: add a 30-minute block, total $472."
        ]
      }
    ],
    faqIds: ["pricing-rules", "final-price", "truck-size"],
    relatedIds: [
      "pricing",
      "service-apartment-moves",
      "service-small-moves",
      "resources-cost-hub",
      "quote"
    ],
    cta: {
      label: "Run your estimate",
      href: "/quote"
    },
    updatedAt: "2026-05-14"
  }
];

const guidePagesConfig: ResourcePageConfig[] = [];
const comparisonPagesConfig: ResourcePageConfig[] = [];
const glossaryPagesConfig: ResourcePageConfig[] = [];

function createResourcePage(
  page: ResourcePageConfig,
  family: "guide" | "cost" | "comparison" | "glossary"
): PublicPageEntry {
  const familyToPath: Record<typeof family, string> = {
    guide: "guides",
    cost: "cost",
    comparison: "comparison",
    glossary: "glossary"
  };
  const familyToHub: Record<typeof family, string> = {
    guide: "resources-guides-hub",
    cost: "resources-cost-hub",
    comparison: "resources-comparison-hub",
    glossary: "resources-glossary-hub"
  };
  const familyToSchema: Record<typeof family, PublicSchemaType> = {
    guide: "Article",
    cost: "WebPage",
    comparison: "WebPage",
    glossary: "DefinedTerm"
  };
  const familyToIntent: Record<typeof family, PageIntent> = {
    guide: "informational",
    cost: "commercial",
    comparison: "comparison",
    glossary: "definition"
  };
  const familyToPriority: Record<typeof family, number> = {
    guide: 0.7,
    cost: 0.78,
    comparison: 0.74,
    glossary: 0.6
  };

  return {
    ...page,
    id: `${family}-${page.slug}`,
    family,
    kind: "leaf",
    locale: "en-au",
    indexable: true,
    pageIntent: familyToIntent[family],
    canonicalPath: `/resources/${familyToPath[family]}/${page.slug}`,
    parentHub: familyToHub[family],
    schemaType: familyToSchema[family],
    changeFrequency: "monthly",
    priority: familyToPriority[family]
  };
}

function createGuidePage(page: ResourcePageConfig) {
  return createResourcePage(page, "guide");
}
function createCostPage(page: ResourcePageConfig) {
  return createResourcePage(page, "cost");
}
function createComparisonPage(page: ResourcePageConfig) {
  return createResourcePage(page, "comparison");
}
function createGlossaryPage(page: ResourcePageConfig) {
  return createResourcePage(page, "glossary");
}

function createCorePage(page: CorePageConfig): PublicPageEntry {
  return {
    ...page,
    family: page.family ?? "core",
    kind: page.kind ?? "leaf",
    locale: "en-au",
    indexable: page.indexable ?? true
  };
}

function createServicePage(page: ServicePageConfig): PublicPageEntry {
  return {
    ...page,
    family: "service",
    kind: "leaf",
    locale: "en-au",
    indexable: true,
    pageIntent: "commercial",
    canonicalPath: `/services/${page.slug}`,
    heroEyebrow: "Melbourne service",
    schemaType: "Service",
    changeFrequency: "monthly",
    priority: 0.82,
    updatedAt: "2026-04-24",
    parentHub: "services-hub"
  };
}

function createLocationPage(page: LocationPageConfig): PublicPageEntry {
  return {
    id: `location-${page.slug}`,
    family: "location",
    kind: "leaf",
    parentHub: "locations-hub",
    label: page.label,
    canonicalPath: `/locations/${page.slug}`,
    locale: "en-au",
    indexable: true,
    pageIntent: "local",
    title: `Removalists ${page.suburbName}`,
    description: `Get a fast moving estimate for apartment moves, small removals, furniture jobs, and local moves in ${page.suburbName} and nearby Melbourne suburbs.`,
    heroEyebrow: "Melbourne suburb moves",
    heroTitle: `Removalists in ${page.suburbName} for small moves and apartment jobs.`,
    heroDescription: `Young & Hungry is a strong fit for ${page.suburbName} moves where ${page.localAngle} matter to the quote. The flow keeps route, truck size, and access clearer from the start.`,
    primaryKeyword: `removalists ${page.suburbName.toLowerCase()}`,
    secondaryKeywords: [
      `${page.suburbName.toLowerCase()} removalists`,
      `${page.suburbName.toLowerCase()} movers`,
      `${page.suburbName.toLowerCase()} moving quote`
    ],
    cardDescription: `${page.suburbName} moves with clearer route and access detail.`,
    highlights: [
      page.suburbName,
      "Small and apartment moves",
      "Fast estimate flow",
      "Nearby Melbourne suburbs"
    ],
    sections: [
      {
        title: `Why ${page.suburbName} moves need clearer quoting`,
        paragraphs: [
          `${page.suburbName} moves often involve ${page.localAngle}. That means the route is only part of the job.`,
          `Young & Hungry gives customers a faster estimate, but still leaves room to confirm the final price against ${page.accessNotes} on the day.`
        ]
      },
      {
        title: `What the estimate should cover around ${page.suburbName}`,
        paragraphs: [
          "The estimate uses the route, move type, truck choice, and Young & Hungry pricing rules so customers get a clearer starting point before sending the move details.",
          `That works well for ${page.suburbName} and nearby suburbs like ${page.nearbySuburbs.join(", ")} where local access conditions can change the real move time.`
        ]
      }
    ],
    faqIds: ["service-area", "apartment-moves", "final-price"],
    relatedIds: ["quote", "pricing", "service-apartment-moves", "service-small-moves"],
    cta: {
      label: `Start a ${page.suburbName} estimate`,
      href: "/quote"
    },
    schemaType: "Service",
    changeFrequency: "monthly",
    priority: 0.76,
    updatedAt: "2026-04-24"
  };
}

export const publicPages = [
  ...corePages.map(createCorePage),
  ...servicePagesConfig.map(createServicePage),
  ...locationPagesConfig.map(createLocationPage),
  ...guidePagesConfig.map(createGuidePage),
  ...costPagesConfig.map(createCostPage),
  ...comparisonPagesConfig.map(createComparisonPage),
  ...glossaryPagesConfig.map(createGlossaryPage)
] as const;

export function getPublicPageById(id: string) {
  return publicPages.find((page) => page.id === id);
}

export function getPublicPageByPath(path: string) {
  return publicPages.find((page) => page.canonicalPath === path);
}

export function getPublicPagesByFamily(family: PublicPageFamily) {
  return publicPages.filter((page) => page.family === family);
}

export function getFaqById(id: string) {
  return faqEntries.find((faq) => faq.id === id);
}

export function getFaqEntriesForPage(page: PublicPageEntry) {
  return (page.faqIds ?? [])
    .map((id) => getFaqById(id))
    .filter((faq): faq is FaqEntry => Boolean(faq));
}

export function getRelatedPages(page: PublicPageEntry) {
  return page.relatedIds
    .map((id) => getPublicPageById(id))
    .filter((entry): entry is PublicPageEntry => Boolean(entry));
}

export function getIndexablePublicPages() {
  return publicPages.filter((page) => page.indexable);
}

export function getStaticParamsForFamily(family: PublicPageFamily) {
  return publicPages
    .filter((page) => page.family === family && page.kind === "leaf")
    .map((page) => {
      const slug = page.canonicalPath.split("/").filter(Boolean).pop();

      if (!slug) {
        throw new Error(`Unable to derive static slug for ${page.id}`);
      }

      return { slug };
    });
}

export function getSitemapFamilyForPage(page: PublicPageEntry): SitemapFamily {
  return page.sitemapFamily ?? FAMILY_TO_SITEMAP[page.family];
}

export function buildSitemapUrl(path: string) {
  return `${siteConfig.url}${path}`;
}

export function getSitemapEntriesByFamily() {
  const families: Record<SitemapFamily, PublicPageEntry[]> = {
    core: [],
    services: [],
    locations: [],
    resources: []
  };

  for (const page of getIndexablePublicPages()) {
    families[getSitemapFamilyForPage(page)].push(page);
  }

  return families;
}

export function getNavHubByFamily(family: PublicPageFamily) {
  return publicPages.find((page) => page.family === family && page.kind === "hub");
}

export function getNavLeavesByFamily(family: PublicPageFamily) {
  return publicPages
    .filter((page) => page.family === family && page.kind === "leaf" && page.indexable && typeof page.navOrder === "number")
    .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0));
}

export function getBreadcrumbTrail(page: PublicPageEntry): PublicPageEntry[] {
  if (page.id === "home") {
    return [page];
  }

  const trail: PublicPageEntry[] = [page];
  let current: PublicPageEntry = page;

  while (current.parentHub) {
    const parent = getPublicPageById(current.parentHub);
    if (!parent || trail.some((entry) => entry.id === parent.id)) {
      break;
    }
    trail.unshift(parent);
    current = parent;
  }

  const home = getPublicPageById("home");
  if (home && trail[0]?.id !== "home") {
    trail.unshift(home);
  }

  return trail;
}

function buildAbsoluteTitle(title: string) {
  return `${title} | ${siteConfig.name}`;
}

export function buildPublicMetadata(page: PublicPageEntry): Metadata {
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: page.canonicalPath
    },
    robots: page.indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: buildAbsoluteTitle(page.title),
      description: page.description,
      url: `${siteConfig.url}${page.canonicalPath}`,
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 300,
          alt: siteConfig.name
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: buildAbsoluteTitle(page.title),
      description: page.description,
      images: [siteConfig.ogImage]
    }
  };
}

export function buildPublicRoute(path: string) {
  const page = getPublicPageByPath(path);

  if (!page) {
    throw new Error(`Public route is missing a page entry for ${path}`);
  }

  return {
    path: page.canonicalPath,
    priority: page.priority,
    changeFrequency: page.changeFrequency,
    lastModified: page.updatedAt
  };
}

export function buildBreadcrumbStructuredData(page: PublicPageEntry) {
  const trail = getBreadcrumbTrail(page);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.id === "home" ? "Home" : entry.label,
      item: entry.id === "home" ? siteConfig.url : `${siteConfig.url}${entry.canonicalPath}`
    }))
  };
}

export function getMovingCompanyStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    name: siteConfig.legalName,
    url: siteConfig.url,
    email: siteConfig.email,
    areaServed: siteConfig.areaServed,
    image: siteConfig.ogImage,
    logo: `${siteConfig.url}/young-and-hungry-logo-icon.svg`
  };
}

export function buildPublicPageStructuredData(page: PublicPageEntry) {
  if (page.schemaType === "MovingCompany") {
    return getMovingCompanyStructuredData();
  }

  if (page.schemaType === "Service") {
    return {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.heroTitle,
      description: page.description,
      url: `${siteConfig.url}${page.canonicalPath}`,
      areaServed: page.family === "location" ? page.label : siteConfig.areaServed,
      provider: {
        "@type": "MovingCompany",
        name: siteConfig.legalName,
        url: siteConfig.url
      }
    };
  }

  if (page.schemaType === "FAQPage") {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: getFaqEntriesForPage(page).map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer
        }
      }))
    };
  }

  if (page.schemaType === "Article") {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.heroTitle,
      description: page.description,
      url: `${siteConfig.url}${page.canonicalPath}`,
      datePublished: page.updatedAt,
      dateModified: page.updatedAt,
      author: {
        "@type": "Organization",
        name: siteConfig.legalName,
        url: siteConfig.url
      },
      publisher: {
        "@type": "Organization",
        name: siteConfig.legalName,
        url: siteConfig.url,
        logo: {
          "@type": "ImageObject",
          url: `${siteConfig.url}/young-and-hungry-logo-icon.svg`
        }
      }
    };
  }

  if (page.schemaType === "DefinedTerm") {
    return {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      name: page.label,
      description: page.description,
      url: `${siteConfig.url}${page.canonicalPath}`,
      inDefinedTermSet: `${siteConfig.url}/resources/glossary`
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.heroTitle,
    description: page.description,
    url: `${siteConfig.url}${page.canonicalPath}`
  };
}

export function buildFaqStructuredData(page: PublicPageEntry) {
  const faqs = getFaqEntriesForPage(page);

  if (!faqs.length || page.schemaType === "FAQPage") {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}
