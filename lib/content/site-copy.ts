export const trustStripItems = [
  "Melbourne suburbs covered",
  "Fast estimate flow",
  "Apartment access aware",
  "Clear pricing rules"
] as const;

export const homeFeatureCards = [
  {
    title: "Fast estimate",
    body: "Start with the route, choose the move type and truck, and see a clear estimate before you send the move details."
  },
  {
    title: "Built for apartment moves",
    body: "Stairs, lift access, parking, and tricky city access matter. The quote flow asks for those details up front."
  },
  {
    title: "Clear pricing rules",
    body: "First hour to pickup included, return trip included, and time rounded to half-hour blocks so pricing is easier to follow."
  }
] as const;

export const homeProcessSteps = [
  "Add the route",
  "Choose the move type and truck",
  "See your estimate",
  "Send your move details"
] as const;

export const homeQuoteFormCopy = {
  eyebrow: "Get a moving estimate",
  title: "Start with the route",
  description: "Enter pickup and drop-off here. The next screen covers move type, truck, timing, and move details.",
  reassurance: "No payment needed to start. Send your move details first and we will confirm the next step."
} as const;

export const quoteStepCopy = [
  {
    title: "Where are you moving?",
    shortTitle: "Route",
    description: "Add pickup and drop-off so we can map the move."
  },
  {
    title: "Choose move type & truck",
    shortTitle: "Job",
    description: "Pick the move type and the truck that fits best."
  },
  {
    title: "Your estimate",
    shortTitle: "Estimate",
    description: "See your estimate before you send the move details."
  },
  {
    title: "When should we arrive?",
    shortTitle: "Schedule",
    description: "Choose the preferred day and arrival window."
  },
  {
    title: "Move details & contact",
    shortTitle: "Submit",
    description: "Add access notes and contact details so we can confirm the next step."
  }
] as const;

export const quoteFlowCopy = {
  validation: {
    routeRequired: "Enter pickup and drop-off addresses before choosing a truck.",
    truckRequired: "Choose a 4 tonne or 6 tonne truck before viewing the estimate.",
    nameRequired: "Enter your name before sending your quote request.",
    contactRequired: "Enter an email or phone number so we can contact you.",
    phoneInvalid: "Enter a valid Australian phone number."
  },
  buttons: {
    finalSubmit: "Send quote request",
    nextJobTruck: "Next: job & truck",
    nextEstimate: "Next: view estimate",
    nextSchedule: "Next: schedule",
    nextDetails: "Next: details"
  },
  summary: {
    title: "Your move summary",
    description: "Route, truck, timing, and estimate details update as you progress.",
    mobileLabel: "Move summary",
    mobileFallback: "Estimate after route and truck",
    quotePending: "Estimate updates after route and truck selection",
    vehicleDetail: "Truck size can be adjusted if needed",
    bookingFeeDetail: "Scheduling and quote follow-up",
    routePending: "Travel cost pending final check"
  },
  estimate: {
    pendingTitle: "Choose the move type and truck first.",
    pendingBody: "Your estimate appears here after the route, move type, and truck are selected.",
    totalLabel: "Estimated total",
    intro: "Estimated total for this move.",
    breakdownLabel: "Estimate breakdown",
    roundedLabel: "Rounded dollars",
    labourDetailPrefix: "Truck + crew, ",
    travelCoverageWithExcess:
      "Includes pickup to drop-off, return to base, and any extra base-to-pickup travel beyond the first included hour.",
    travelCoverageStandard:
      "Includes pickup to drop-off and return to base. The first hour from base to pickup is included.",
    travelPending: "Travel cost is checked before the move is confirmed.",
    dayOfJobDisclaimer:
      "Final price is calculated on the day of the job and depends on access, stairs, parking, heavy items, extra handling, and actual loading time."
  },
  success: {
    eyebrow: "Quote request sent",
    title: "We’ve received your move details.",
    body: "We’ll review the route, access, timing, and anything else needed to confirm the next step. This message stays here until you choose where to go next.",
    note: "Your request has been sent to our team. You can safely return to the main page.",
    action: "Back to home now"
  },
  actions: {
    successMessage: "Thanks. We’ve received your move details and will contact you about the next step.",
    genericError: "Something went wrong sending your move details."
  }
} as const;
