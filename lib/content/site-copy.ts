export const trustStripItems = [
  "Melbourne suburbs covered",
  "Fast estimate flow",
  "Apartment access aware",
  "Clear pricing rules"
] as const;

export const homeFeatureCards = [
  {
    title: "Fast estimate",
    body: "Start with the route, choose the move type and size, and see the recommended truck in the estimate before you send the move details."
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
  "Choose the move type and size",
  "See your estimate",
  "Send your move details"
] as const;

export const homeQuoteFormCopy = {
  eyebrow: "Get a moving estimate",
  title: "Start with the route",
  description: "Enter pickup and drop-off here. The next screen covers move type, size, timing, and move details.",
  reassurance: "No payment needed to start. Send your move details first and we will confirm the next step."
} as const;

export const quoteStepCopy = [
  {
    title: "Where are you moving?",
    shortTitle: "Route"
  },
  {
    title: "Choose move type",
    shortTitle: "Job"
  },
  {
    title: "Your estimate",
    shortTitle: "Estimate"
  },
  {
    title: "When should we arrive?",
    shortTitle: "Schedule"
  },
  {
    title: "Move details & contact",
    shortTitle: "Submit"
  }
] as const;

export const quoteFlowCopy = {
  validation: {
    routeRequired: "Enter pickup and drop-off addresses before choosing the move type.",
    truckRequired: "Choose what you are moving before viewing the estimate.",
    moveSizeRequired: "Choose the move size before viewing the estimate.",
    nameRequired: "Enter your name before sending your quote request.",
    contactRequired: "Enter an email or phone number so we can contact you.",
    phoneInvalid: "Enter a valid Australian phone number."
  },
  buttons: {
    finalSubmit: "Send quote request",
    nextJobTruck: "Next: move type",
    nextEstimate: "Next: view estimate",
    nextSchedule: "Next: schedule",
    nextDetails: "Next: details"
  },
  summary: {
    title: "Your move summary",
    description: "Route, move type, timing, and estimate details update as you progress.",
    mobileLabel: "Move summary",
    mobileFallback: "Estimate after route and move type",
    quotePending: "Estimate updates after route and move type",
    vehicleDetail: "Truck recommended from move type and size",
    bookingFeeDetail: "Scheduling and quote follow-up",
    routePending: "Travel cost pending final check"
  },
  estimate: {
    pendingTitle: "Choose the move type first.",
    pendingBody: "Your estimate appears here after the route and move type are selected.",
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
