"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Boxes,
  Building2,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Home,
  Mail,
  PackageOpen,
  ShieldCheck,
  Truck,
  UserRound
} from "lucide-react";
import { useRouter } from "next/navigation";
import { submitQuoteRequest } from "@/app/quote/actions";
import { StepShell } from "@/components/layout/StepShell";
import { AddressAutocompleteInput } from "@/components/ui/AddressAutocompleteInput";
import { Button } from "@/components/ui/Button";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { ResponsiveDrawer } from "@/components/ui/ResponsiveDrawer";
import { quoteFlowCopy, quoteStepCopy } from "@/lib/content/site-copy";
import {
  getRecommendedTruckClassForServiceType,
  getPreferredTimeWindowLabel,
  getTruckClassLabel,
  initialQuoteFormState,
  isValidAustralianPhone,
  preferredTimeWindowOptions
} from "@/lib/core/booking/quote-request";
import {
  calculateYoungHungryQuoteEstimate,
  type YoungHungryQuoteEstimate
} from "@/lib/core/pricing/young-hungry-pricebook";

type RouteEstimateState =
  | {
      status: "idle" | "loading";
    }
  | {
      status: "ready";
      distanceKm: number;
      durationMinutes: number;
      chargeableDistanceKm: number;
      chargeableTravelMinutes: number;
      baseAddress: string;
      baseToPickup: {
        distanceKm: number;
        durationMinutes: number;
      };
      pickupToDropoff: {
        distanceKm: number;
        durationMinutes: number;
      };
      dropoffToBase: {
        distanceKm: number;
        durationMinutes: number;
      };
    }
  | {
      status: "unavailable";
      message: string;
    };

function createClientIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `quote_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

type QuoteStep = {
  title: string;
  shortTitle: string;
};

const quoteSteps: QuoteStep[] = quoteStepCopy.map((step) => ({
  title: step.title,
  shortTitle: step.shortTitle
}));

const moveTypeOptions = [
  {
    value: "delivery_run",
    label: "Item delivery",
    description: "One bulky item or a marketplace pickup.",
    example: "Sofa, fridge, table",
    icon: PackageOpen
  },
  {
    value: "small_move",
    label: "Small move",
    description: "A few items, room move, or storage run.",
    example: "Boxes plus small furniture",
    icon: Boxes
  },
  {
    value: "apartment",
    label: "Apartment / unit",
    description: "Building access, lifts, stairs, and loading bays.",
    example: "Studio to 4+ bedrooms",
    icon: Building2
  },
  {
    value: "house",
    label: "House",
    description: "More rooms, outdoor items, and larger loads.",
    example: "1 to 4+ bedrooms",
    icon: Home
  }
] as const;

const apartmentSizeOptions = [
  { value: "studio", label: "Studio" },
  { value: "one_bed", label: "1 bedroom" },
  { value: "two_bed", label: "2 bedrooms" },
  { value: "three_bed", label: "3 bedrooms" },
  { value: "four_plus", label: "4+ bedrooms", disabled: true, status: "Coming soon" }
] as const;

const houseSizeOptions = [
  { value: "one_bed", label: "1 bedroom" },
  { value: "two_bed", label: "2 bedrooms" },
  { value: "three_bed", label: "3 bedrooms" },
  { value: "four_plus", label: "4+ bedrooms", disabled: true, status: "Coming soon" }
] as const;

const inputClass =
  "w-full min-w-0 rounded-2xl border border-line bg-ink/70 px-4 py-4 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30";

type FormSnapshot = Record<string, string | undefined>;
type MoveTypeValue = (typeof moveTypeOptions)[number]["value"];

type QuoteFormProps = {
  initialPickupAddress?: string;
  initialDropoffAddress?: string;
};

function getFormValue(form: HTMLFormElement | null, name: string) {
  if (!form) return "";
  const value = new FormData(form).get(name);

  return typeof value === "string" ? value.trim() : "";
}

function getFormSnapshot(form: HTMLFormElement | null) {
  if (!form) return {} as FormSnapshot;
  const formData = new FormData(form);
  const snapshot: FormSnapshot = {};

  formData.forEach((value, key) => {
    if (typeof value === "string") {
      snapshot[key] = value.trim();
    }
  });

  return applyMoveSelection(snapshot);
}

function isMoveType(value: string | undefined): value is MoveTypeValue {
  return Boolean(value && moveTypeOptions.some((option) => option.value === value));
}

function requiresMoveSize(moveType: string | undefined) {
  return moveType === "apartment" || moveType === "house";
}

function getSizeOptions(moveType: string | undefined) {
  if (moveType === "apartment") return apartmentSizeOptions;
  if (moveType === "house") return houseSizeOptions;
  return [];
}

function composeServiceType(moveType: string | undefined, moveSize: string | undefined) {
  if (moveType === "delivery_run" || moveType === "small_move") return moveType;
  if (moveSize === "four_plus") return "";
  if ((moveType === "apartment" || moveType === "house") && moveSize) return `${moveType}_${moveSize}`;
  return "";
}

function getMoveTypeFromServiceType(serviceType: string | undefined) {
  if (serviceType === "delivery_run" || serviceType === "small_move") return serviceType;
  if (serviceType?.startsWith("apartment_")) return "apartment";
  if (serviceType?.startsWith("house_")) return "house";
  if (serviceType === "apartment_move") return "apartment";
  if (serviceType === "house_move") return "house";
  return "";
}

function getMoveSizeFromServiceType(serviceType: string | undefined) {
  if (!serviceType) return "";
  if (serviceType.startsWith("apartment_")) return serviceType.replace("apartment_", "");
  if (serviceType.startsWith("house_")) return serviceType.replace("house_", "");
  return "";
}

function applyMoveSelection(snapshot: FormSnapshot) {
  const moveType = isMoveType(snapshot.moveType)
    ? snapshot.moveType
    : getMoveTypeFromServiceType(snapshot.serviceType);
  const rawMoveSize = snapshot.moveSize || getMoveSizeFromServiceType(snapshot.serviceType);
  const moveSize = rawMoveSize === "four_plus" ? "" : rawMoveSize;
  const serviceType = moveType ? composeServiceType(moveType, moveSize) : snapshot.serviceType || "";
  const truckClass = getRecommendedTruckClassForServiceType(serviceType) ?? "";

  return {
    ...snapshot,
    moveType,
    moveSize,
    serviceType,
    truckClass
  };
}

function getServiceTypeLabel(value: string | undefined) {
  const labels: Record<string, string> = {
    removal: "Standard move",
    delivery_run: "Item delivery",
    small_move: "Small move",
    apartment_move: "Apartment / unit",
    apartment_studio: "Apartment / unit, studio",
    apartment_one_bed: "Apartment / unit, 1 bedroom",
    apartment_two_bed: "Apartment / unit, 2 bedrooms",
    apartment_three_bed: "Apartment / unit, 3 bedrooms",
    apartment_four_plus: "Apartment / unit, 4+ bedrooms",
    house_move: "House",
    house_one_bed: "House, 1 bedroom",
    house_two_bed: "House, 2 bedrooms",
    house_three_bed: "House, 3 bedrooms",
    house_four_plus: "House, 4+ bedrooms"
  };

  return value ? labels[value] ?? "Move type selected" : "Choose move type";
}

function displayValue(value: string | undefined, fallback = "Not set") {
  return value?.trim() ? value.trim() : fallback;
}

export function QuoteForm({ initialPickupAddress = "", initialDropoffAddress = "" }: QuoteFormProps = {}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const idempotencyKey = useRef(createClientIdempotencyKey());
  const [state, formAction, isPending] = useActionState(submitQuoteRequest, initialQuoteFormState);
  const hasInitialRoute = Boolean(initialPickupAddress.trim() && initialDropoffAddress.trim());
  const [currentStep, setCurrentStep] = useState(hasInitialRoute ? 1 : 0);
  const [stepError, setStepError] = useState("");
  const [formSnapshot, setFormSnapshot] = useState<FormSnapshot>({
    preferredTimeWindow: "flexible",
    pickupAddress: initialPickupAddress,
    dropoffAddress: initialDropoffAddress
  });
  const [routeEstimate, setRouteEstimate] = useState<RouteEstimateState>({ status: "idle" });
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const isSuccess = state.status === "success";
  const isFinalStep = currentStep === quoteSteps.length - 1;
  const pickupAddress = formSnapshot.pickupAddress;
  const dropoffAddress = formSnapshot.dropoffAddress;
  const selectedMoveType = formSnapshot.moveType;
  const selectedMoveSize = formSnapshot.moveSize;
  const selectedServiceType = formSnapshot.serviceType;
  const recommendedTruckClass = formSnapshot.truckClass;
  const selectedSizeOptions = getSizeOptions(selectedMoveType);

  useEffect(() => {
    if (!pickupAddress?.trim() || !dropoffAddress?.trim()) {
      setRouteEstimate({ status: "idle" });
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setRouteEstimate({ status: "loading" });

      fetch("/api/quote/route-estimate", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          pickupAddress,
          dropoffAddress
        }),
        signal: controller.signal
      })
        .then((response) => response.json())
        .then((result: {
          ok?: boolean;
          distanceKm?: number;
          durationMinutes?: number;
          chargeableDistanceKm?: number;
          chargeableTravelMinutes?: number;
          baseAddress?: string;
          baseToPickup?: { distanceKm: number; durationMinutes: number };
          pickupToDropoff?: { distanceKm: number; durationMinutes: number };
          dropoffToBase?: { distanceKm: number; durationMinutes: number };
          message?: string;
        }) => {
          if (controller.signal.aborted) return;

          if (
            result.ok &&
            typeof result.distanceKm === "number" &&
            typeof result.durationMinutes === "number" &&
            typeof result.chargeableDistanceKm === "number" &&
            typeof result.chargeableTravelMinutes === "number" &&
            typeof result.baseAddress === "string" &&
            result.baseToPickup &&
            result.pickupToDropoff &&
            result.dropoffToBase
          ) {
            setRouteEstimate({
              status: "ready",
              distanceKm: result.distanceKm,
              durationMinutes: result.durationMinutes,
              chargeableDistanceKm: result.chargeableDistanceKm,
              chargeableTravelMinutes: result.chargeableTravelMinutes,
              baseAddress: result.baseAddress,
              baseToPickup: result.baseToPickup,
              pickupToDropoff: result.pickupToDropoff,
              dropoffToBase: result.dropoffToBase
            });
            return;
          }

          setRouteEstimate({
            status: "unavailable",
            message: result.message ?? "Route distance is not available yet."
          });
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setRouteEstimate({
            status: "unavailable",
            message: error instanceof Error ? error.message : "Route distance is not available yet."
          });
        });
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [dropoffAddress, pickupAddress]);

  useEffect(() => {
    setIsSummaryOpen(false);
  }, [currentStep, isSuccess]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0 });
  }, [currentStep]);

  function updateSnapshotValue(name: string, value: string) {
    setFormSnapshot((previous) => ({
      ...previous,
      [name]: value.trim()
    }));
  }

  function syncSummary() {
    setFormSnapshot((previous) => ({
      preferredTimeWindow: "flexible",
      ...previous,
      ...getFormSnapshot(formRef.current)
    }));
  }

  function updateMoveSelection(values: Partial<FormSnapshot>) {
    setFormSnapshot((previous) => applyMoveSelection({
      ...previous,
      ...values
    }));
  }

  function validateStep(stepIndex: number) {
    const form = formRef.current;

    if (stepIndex === 0) {
      const pickup = getFormValue(form, "pickupAddress");
      const dropoff = getFormValue(form, "dropoffAddress");

      if (pickup.length < 3 || dropoff.length < 3) {
        setStepError(quoteFlowCopy.validation.routeRequired);
        return false;
      }
    }

    if (stepIndex === 1) {
      const snapshot = getFormSnapshot(form);

      if (!snapshot.moveType) {
        setStepError(quoteFlowCopy.validation.truckRequired);
        return false;
      }

      if (requiresMoveSize(snapshot.moveType) && !snapshot.moveSize) {
        setStepError(quoteFlowCopy.validation.moveSizeRequired);
        return false;
      }
    }

    if (stepIndex === 4) {
      const name = getFormValue(form, "name");
      const email = getFormValue(form, "email");
      const phone = getFormValue(form, "phone");

      if (name.length < 2) {
        setStepError(quoteFlowCopy.validation.nameRequired);
        return false;
      }

      if (!email && !phone) {
        setStepError(quoteFlowCopy.validation.contactRequired);
        return false;
      }

      if (phone && !isValidAustralianPhone(phone)) {
        setStepError(quoteFlowCopy.validation.phoneInvalid);
        return false;
      }
    }

    setStepError("");
    syncSummary();
    return true;
  }

  function goToStep(stepIndex: number) {
    if (stepIndex <= currentStep) {
      setStepError("");
      setCurrentStep(stepIndex);
      syncSummary();
      return;
    }

    for (let index = 0; index < stepIndex; index += 1) {
      if (!validateStep(index)) {
        setCurrentStep(index);
        return;
      }
    }

    setCurrentStep(stepIndex);
    syncSummary();
  }

  function goNext() {
    if (!validateStep(currentStep)) return;
    setCurrentStep((step) => Math.min(step + 1, quoteSteps.length - 1));
  }

  function goBack() {
    setStepError("");
    setCurrentStep((step) => Math.max(step - 1, 0));
    syncSummary();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    syncSummary();

    if (!isFinalStep) {
      event.preventDefault();
      goNext();
      return;
    }

    for (let index = 0; index < quoteSteps.length; index += 1) {
      if (!validateStep(index)) {
        event.preventDefault();
        setCurrentStep(index);
        return;
      }
    }
  }

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        onChange={syncSummary}
        onInput={syncSummary}
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="idempotencyKey" value={idempotencyKey.current} />
        <input type="hidden" name="serviceType" value={selectedServiceType ?? ""} />
        <input type="hidden" name="truckClass" value={recommendedTruckClass ?? ""} />

        <StepShell
          sidebar={<QuoteSummary snapshot={formSnapshot} routeEstimate={routeEstimate} currentStep={currentStep} mode="desktop" />}
          mobileAccessory={
            <MobileSummaryBar
              snapshot={formSnapshot}
              routeEstimate={routeEstimate}
              onOpen={() => setIsSummaryOpen(true)}
            />
          }
          footer={
            <div className="flex flex-col gap-4">
              {state.status === "error" && state.message ? (
                <div className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                  <p>{state.message}</p>
                </div>
              ) : (
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-text-muted">
                  Step {currentStep + 1} of {quoteSteps.length}
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={currentStep === 0 || isPending || isSuccess}
                  onClick={goBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                {isFinalStep ? (
                  <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isPending || isSuccess}>
                    {isPending ? "Submitting..." : quoteFlowCopy.buttons.finalSubmit}
                  </Button>
                ) : (
                  <Button type="button" size="lg" className="w-full sm:w-auto" disabled={isPending || isSuccess} onClick={goNext}>
                    {currentStep === 0
                      ? quoteFlowCopy.buttons.nextJobTruck
                      : currentStep === 1
                        ? quoteFlowCopy.buttons.nextEstimate
                        : currentStep === 2
                          ? quoteFlowCopy.buttons.nextSchedule
                          : quoteFlowCopy.buttons.nextDetails}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          }
          contentClassName="p-4 sm:p-8 lg:p-12"
        >
          <StepProgress currentStep={currentStep} isSuccess={isSuccess} onStepClick={goToStep} />

          {stepError ? (
            <div className="mt-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning" role="alert">
              {stepError}
            </div>
          ) : null}

          <section className={currentStep === 0 ? "mt-6 grid gap-5 animate-fade-up sm:mt-8" : "hidden"}>
            <div className="rounded-[1.5rem] border border-line bg-ink/55 p-4 sm:p-5">
              <div className="grid gap-4">
                <AddressAutocompleteInput
                  id="pickupAddress"
                  name="pickupAddress"
                  label="Pickup address"
                  defaultValue={initialPickupAddress}
                  placeholder="Pickup suburb/address"
                  required
                  error={state.fieldErrors?.pickupAddress}
                  disabled={isSuccess}
                  onValueChange={(value) => updateSnapshotValue("pickupAddress", value)}
                />
                <div className="ml-5 h-7 w-px bg-gradient-to-b from-blue to-violet" aria-hidden="true" />
                <AddressAutocompleteInput
                  id="dropoffAddress"
                  name="dropoffAddress"
                  label="Dropoff address"
                  defaultValue={initialDropoffAddress}
                  placeholder="Dropoff suburb/address"
                  required
                  error={state.fieldErrors?.dropoffAddress}
                  disabled={isSuccess}
                  onValueChange={(value) => updateSnapshotValue("dropoffAddress", value)}
                />
              </div>
            </div>
          </section>

          <section className={currentStep === 1 ? "mt-6 grid min-w-0 gap-4 animate-fade-up sm:mt-8" : "hidden"}>
            <fieldset className="grid gap-3">
              <legend className="text-sm font-medium text-text-secondary">What are you moving?</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {moveTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedMoveType === option.value;

                  return (
                  <label key={option.value} className={`group relative block w-full min-w-0 overflow-hidden rounded-[1.5rem] border p-4 text-sm transition hover:-translate-y-0.5 hover:border-line-hover hover:bg-navy hover:shadow-lift sm:p-5 ${
                    isSelected ? "border-blue/80 bg-blue/10" : "border-line bg-ink/60"
                  }`}>
                    <input
                      className="peer sr-only"
                      type="radio"
                      name="moveType"
                      value={option.value}
                      checked={isSelected}
                      disabled={isSuccess}
                      onChange={() => {
                        const nextSizeOptions = getSizeOptions(option.value);
                        const nextMoveSize = nextSizeOptions.some((sizeOption) => sizeOption.value === selectedMoveSize)
                          ? selectedMoveSize
                          : "";

                        updateMoveSelection({
                          moveType: option.value,
                          moveSize: requiresMoveSize(option.value) ? nextMoveSize : ""
                        });
                      }}
                    />
                    <span className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected ? "border-blue bg-blue" : "border-line"
                    }`}>
                      <span className={`h-2 w-2 rounded-full bg-white ${isSelected ? "opacity-100" : "opacity-0"}`} />
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet/20 to-blue/20 text-blue-soft">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="mt-3 block min-w-0 break-words font-display text-xl font-semibold tracking-[-0.03em] text-white">{option.label}</span>
                    <span className="mt-2 block min-w-0 break-words text-sm leading-6 text-text-secondary">
                      {option.description} <span className="text-text-muted">e.g. {option.example.toLowerCase()}</span>
                    </span>
                  </label>
                  );
                })}
              </div>
            </fieldset>

            {selectedSizeOptions.length ? (
              <fieldset className="grid gap-2">
                <legend className="sr-only">How big is the move?</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {selectedSizeOptions.map((option) => {
                    const isSelected = selectedMoveSize === option.value;
                    const isComingSoon = "disabled" in option && option.disabled;
                    const isDisabled = isComingSoon || isSuccess;

                    return (
                      <label key={option.value} className={`grid min-h-16 min-w-0 place-items-center gap-1 overflow-hidden rounded-2xl border px-2 py-3 text-center text-sm font-semibold transition ${
                        isDisabled
                          ? "cursor-not-allowed border-line bg-ink/35 text-text-muted opacity-70"
                          : isSelected
                            ? "cursor-pointer border-blue/80 bg-blue/10 text-blue-soft hover:border-line-hover hover:bg-navy"
                            : "cursor-pointer border-line bg-ink/60 text-white hover:border-line-hover hover:bg-navy"
                      }`}>
                        <input
                          className="sr-only"
                          type="radio"
                          name="moveSize"
                          value={option.value}
                          checked={isSelected && !isComingSoon}
                          disabled={isDisabled}
                          onChange={() =>
                            updateMoveSelection({
                              moveType: selectedMoveType,
                              moveSize: option.value
                            })
                          }
                        />
                        <span className="block max-w-full min-w-0 break-words leading-5">{option.label}</span>
                        {isComingSoon ? (
                          <span className="block max-w-full truncate rounded-full border border-line bg-panel/70 px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-text-muted">
                            {"status" in option ? option.status : "Coming soon"}
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}

            {state.fieldErrors?.truckClass ? <p className="text-sm text-error">{state.fieldErrors.truckClass}</p> : null}
          </section>

          <section className={currentStep === 2 ? "mt-6 animate-fade-up sm:mt-8" : "hidden"}>
            <EstimateReveal snapshot={formSnapshot} routeEstimate={routeEstimate} />
          </section>

          <section className={currentStep === 3 ? "mt-6 grid gap-8 animate-fade-up sm:mt-8" : "hidden"}>
            <div className="grid gap-2">
              <label htmlFor="preferredDate" className="text-sm font-medium text-text-secondary">Preferred date</label>
              <input id="preferredDate" name="preferredDate" type="date" className={inputClass} disabled={isSuccess} />
            </div>

            <fieldset className="grid gap-3">
              <legend className="text-sm font-medium text-text-secondary">Preferred time window</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {preferredTimeWindowOptions.map((option) => (
                  <label key={option.value} className="cursor-pointer rounded-2xl border border-line bg-ink/60 p-4 transition hover:border-line-hover hover:bg-navy has-[:checked]:border-blue/80 has-[:checked]:bg-blue/10">
                    <input
                      className="peer sr-only"
                      type="radio"
                      name="preferredTimeWindow"
                      value={option.value}
                      defaultChecked={option.value === "flexible"}
                      disabled={isSuccess}
                    />
                    <span className="block font-semibold text-white peer-checked:text-blue-soft">{option.label}</span>
                    <span className="mt-1 block text-sm text-text-secondary">{option.description}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className={currentStep === 4 ? "mt-6 grid gap-6 animate-fade-up sm:mt-8" : "hidden"}>
            <div className="grid gap-2">
              <label htmlFor="notes" className="text-sm font-medium text-text-secondary">What are you moving?</label>
              <textarea id="notes" name="notes" rows={6} className={inputClass} placeholder="Inventory, stairs, lift, parking, access, fragile items..." aria-invalid={Boolean(state.fieldErrors?.notes)} disabled={isSuccess} />
              {state.fieldErrors?.notes ? <p className="text-sm text-error">{state.fieldErrors.notes}</p> : null}
            </div>

            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium text-text-secondary">Name</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input id="name" name="name" className={`${inputClass} w-full pl-11`} placeholder="Your name" aria-invalid={Boolean(state.fieldErrors?.name)} disabled={isSuccess} />
              </div>
              {state.fieldErrors?.name ? <p className="text-sm text-error">{state.fieldErrors.name}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium text-text-secondary">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input id="email" name="email" type="email" className={`${inputClass} w-full pl-11`} placeholder="you@example.com" aria-invalid={Boolean(state.fieldErrors?.email)} disabled={isSuccess} />
                </div>
                {state.fieldErrors?.email ? <p className="text-sm text-error">{state.fieldErrors.email}</p> : null}
              </div>
              <PhoneInput
                id="phone"
                name="phone"
                label="Phone"
                disabled={isSuccess}
                error={state.fieldErrors?.phone}
                onValueChange={(value) => updateSnapshotValue("phone", value)}
              />
            </div>
          </section>
        </StepShell>
      </form>

      <ResponsiveDrawer
        open={isSummaryOpen}
        onOpenChange={setIsSummaryOpen}
        title={quoteFlowCopy.summary.title}
        description={quoteFlowCopy.summary.description}
        side="bottom"
      >
        <QuoteSummary snapshot={formSnapshot} routeEstimate={routeEstimate} currentStep={currentStep} mode="mobile" />
      </ResponsiveDrawer>

      {isSuccess ? (
        <QuoteSuccessModal
          onReturnHome={() => {
            startTransition(() => {
              router.push("/");
            });
          }}
        />
      ) : null}
    </>
  );
}

function StepProgress({
  currentStep,
  isSuccess,
  onStepClick
}: {
  currentStep: number;
  isSuccess: boolean;
  onStepClick: (stepIndex: number) => void;
}) {
  return (
    <div className="mb-8">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-blue-soft">
        Step {currentStep + 1}/{quoteSteps.length}
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl">
        {quoteSteps[currentStep]?.title}
      </h2>
      <div className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2" aria-label="Quote steps">
        {quoteSteps.map((step, index) => {
          const isActive = currentStep === index;
          const isComplete = currentStep > index || isSuccess;
          const canOpenStep = index <= currentStep && !isSuccess;

          return (
            <button
              key={step.title}
              type="button"
              className={`h-1.5 rounded-full transition ${
                isActive
                  ? "bg-gradient-to-r from-violet to-blue shadow-glow"
                  : isComplete
                    ? "bg-success/80"
                    : "bg-line/70 hover:bg-line-hover"
              }`}
              aria-label={`0${index + 1} ${step.shortTitle}`}
              aria-current={isActive ? "step" : undefined}
              disabled={!canOpenStep}
              onClick={() => onStepClick(index)}
            />
          );
        })}
      </div>
      <div className="mt-3 hidden grid-cols-5 gap-2 sm:grid">
        {quoteSteps.map((step, index) => {
          const isActive = index === currentStep;
          const canOpenStep = index <= currentStep && !isSuccess;

          return (
            <button
              key={step.title}
              type="button"
              className={`text-left text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                isActive ? "text-white" : "text-text-muted"
              } ${canOpenStep ? "cursor-pointer hover:text-white" : "cursor-default opacity-60"}`}
              disabled={!canOpenStep}
              onClick={() => onStepClick(index)}
            >
              {step.shortTitle}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getQuoteEstimate(snapshot: FormSnapshot, routeEstimate: RouteEstimateState) {
  return calculateYoungHungryQuoteEstimate({
    ...snapshot,
    routeDistanceKm: routeEstimate.status === "ready" ? routeEstimate.distanceKm : null,
    routeDurationMinutes: routeEstimate.status === "ready" ? routeEstimate.durationMinutes : null,
    baseToPickup: routeEstimate.status === "ready" ? routeEstimate.baseToPickup : null,
    pickupToDropoff: routeEstimate.status === "ready" ? routeEstimate.pickupToDropoff : null,
    dropoffToBase: routeEstimate.status === "ready" ? routeEstimate.dropoffToBase : null
  });
}

function formatCustomerHours(minutes: number | null | undefined) {
  if (typeof minutes !== "number" || !Number.isFinite(minutes)) return "Pending";

  const safeMinutes = Math.max(0, Math.round(minutes));
  const roundedHalfHours = Math.max(0.5, Math.round(safeMinutes / 30) / 2);
  const label = Number.isInteger(roundedHalfHours) ? String(roundedHalfHours) : roundedHalfHours.toFixed(1);

  return `${label} ${roundedHalfHours === 1 ? "hour" : "hours"}`;
}

function formatMinutesForDetail(minutes: number | null | undefined) {
  if (typeof minutes !== "number" || !Number.isFinite(minutes)) return "Pending";

  const safeMinutes = Math.max(0, Math.round(minutes));
  return `${safeMinutes} min`;
}

function formatDistanceForDetail(distanceKm: number | null | undefined) {
  if (typeof distanceKm !== "number" || !Number.isFinite(distanceKm)) return "Pending";

  const safeDistance = Math.max(0, Math.round(distanceKm * 10) / 10);
  const label = Number.isInteger(safeDistance) ? String(safeDistance) : safeDistance.toFixed(1);
  return `${label} km`;
}

function formatHourlyRate(cents: number) {
  return `${formatLineItemAmount(cents)}/hr`;
}

function getLabourDetail(quoteEstimate: YoungHungryQuoteEstimate) {
  const billableTime = formatCustomerHours(quoteEstimate.billableMinutes);

  if (quoteEstimate.rawEstimatedMinutes === quoteEstimate.billableMinutes) {
    return `${quoteFlowCopy.estimate.labourDetailPrefix}${billableTime} estimated time`;
  }

  return `${quoteFlowCopy.estimate.labourDetailPrefix}${formatMinutesForDetail(quoteEstimate.rawEstimatedMinutes)} estimated, rounded up to ${billableTime}`;
}

function TravelBreakdownDetail({
  quoteEstimate,
  routeEstimate
}: {
  quoteEstimate: YoungHungryQuoteEstimate;
  routeEstimate: RouteEstimateState;
}) {
  if (routeEstimate.status !== "ready" || !quoteEstimate.routePricingIncluded) {
    return <span>{quoteFlowCopy.estimate.travelPending}</span>;
  }

  const baseToPickupDetail =
    quoteEstimate.chargeableBaseToPickupMinutes > 0
      ? `Base -> pickup: ${formatMinutesForDetail(routeEstimate.baseToPickup.durationMinutes)} (${formatMinutesForDetail(quoteEstimate.freeBaseToPickupAppliedMinutes)} included, ${formatMinutesForDetail(quoteEstimate.chargeableBaseToPickupMinutes)} charged)`
      : `Base -> pickup: ${formatMinutesForDetail(routeEstimate.baseToPickup.durationMinutes)}, included`;

  return (
    <div className="grid gap-1">
      <span>{baseToPickupDetail}</span>
      <span>{`Pickup -> drop-off: ${formatMinutesForDetail(routeEstimate.pickupToDropoff.durationMinutes)}`}</span>
      <span>{`Drop-off -> base: ${formatMinutesForDetail(routeEstimate.dropoffToBase.durationMinutes)}`}</span>
      <span>
        Charged travel: {formatMinutesForDetail(quoteEstimate.routeDurationMinutes)} / {formatDistanceForDetail(quoteEstimate.routeDistanceKm)}
      </span>
    </div>
  );
}

function EstimateReveal({ snapshot, routeEstimate }: { snapshot: FormSnapshot; routeEstimate: RouteEstimateState }) {
  const quoteEstimate = getQuoteEstimate(snapshot, routeEstimate);

  if (!quoteEstimate) {
      return (
      <div className="rounded-[2rem] border border-line bg-ink/65 p-6 sm:p-8">
        <p className="font-display text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">{quoteFlowCopy.estimate.pendingTitle}</p>
        <p className="mt-3 max-w-2xl leading-7 text-text-secondary">
          {quoteFlowCopy.estimate.pendingBody}
        </p>
      </div>
    );
  }

  return (
    <div className="yh-gradient-border rounded-[2rem] bg-panel p-[1px] shadow-glow">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink/92 p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.16),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_50%)]" />
        <div className="relative">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-blue-soft">{quoteFlowCopy.estimate.totalLabel}</p>
            <p className="mt-3 font-display text-4xl font-semibold tracking-[-0.06em] text-white sm:text-7xl">
              {quoteEstimate.rangeLabel}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
              {quoteFlowCopy.estimate.intro}
            </p>
          </div>

          <div className="mt-8 pt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">{quoteFlowCopy.estimate.breakdownLabel}</p>
              <p className="text-sm text-text-muted">{quoteFlowCopy.estimate.roundedLabel}</p>
            </div>

            <div className="mt-5 grid gap-4">
              <BreakdownRow
                label="Move type"
                detail={`${getServiceTypeLabel(snapshot.serviceType)}. ${getTruckClassLabel(snapshot.truckClass) ?? "Truck"} · ${formatHourlyRate(quoteEstimate.hourlyRateCents)} recommended for this size.`}
                value=""
              />
              <BreakdownRow
                label="Labour"
                detail={getLabourDetail(quoteEstimate)}
                value={formatLineItemAmount(quoteEstimate.laborCents)}
              />
              <BreakdownRow
                label="Travel"
                detail={<TravelBreakdownDetail quoteEstimate={quoteEstimate} routeEstimate={routeEstimate} />}
                value={quoteEstimate.routePricingIncluded ? formatLineItemAmount(quoteEstimate.routeCents) : "Pending"}
              />
              <BreakdownRow
                label="Booking fee"
                detail={quoteFlowCopy.summary.bookingFeeDetail}
                value={formatLineItemAmount(quoteEstimate.bookingFeeCents)}
              />
              <div className="flex items-center justify-between gap-4 border-t border-dashed border-line pt-4">
                <span className="text-sm font-semibold text-white">Estimated total</span>
                <span className="font-display text-2xl font-semibold tracking-[-0.03em] text-white">{quoteEstimate.label}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-violet/12 text-violet-soft">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <p className="text-sm leading-7 text-text-secondary">
                {quoteFlowCopy.estimate.dayOfJobDisclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  detail,
  value
}: {
  label: string;
  detail?: ReactNode;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        {detail ? <div className="mt-1 max-w-xl text-sm leading-6 text-text-secondary">{detail}</div> : null}
      </div>
      {value ? <span className="shrink-0 text-base font-semibold text-white">{value}</span> : null}
    </div>
  );
}

function QuoteSummary({
  snapshot,
  routeEstimate,
  currentStep,
  mode = "desktop"
}: {
  snapshot: FormSnapshot;
  routeEstimate: RouteEstimateState;
  currentStep: number;
  mode?: "desktop" | "mobile";
}) {
  const truckLabel = getTruckClassLabel(snapshot.truckClass);
  const moveTypeLabel = getServiceTypeLabel(snapshot.serviceType);
  const moveTypeDetail = truckLabel ? `Truck: ${truckLabel}` : quoteFlowCopy.summary.vehicleDetail;
  const timeWindowLabel = getPreferredTimeWindowLabel(snapshot.preferredTimeWindow);
  const timingValue = `${displayValue(snapshot.preferredDate, "Select a date")} / ${timeWindowLabel}`;
  const quoteEstimate = getQuoteEstimate(snapshot, routeEstimate);
  const quoteDetail =
    routeEstimate.status === "ready"
      ? `${Math.round(routeEstimate.chargeableDistanceKm)} km travel, return included`
      : routeEstimate.status === "loading"
        ? "Calculating route..."
        : routeEstimate.status === "unavailable"
          ? quoteFlowCopy.summary.routePending
          : quoteEstimate
            ? quoteFlowCopy.summary.quotePending
            : quoteFlowCopy.summary.mobileFallback;

  const content = (
    <div className={mode === "desktop" ? "mx-auto max-w-sm lg:mx-0" : "grid gap-6"}>
      <p className="font-display text-3xl font-semibold tracking-[-0.04em] text-white">Your move</p>
      <div className="mt-8 grid gap-6">
        <SummaryTimelineItem icon={ArrowUp} label="Pickup" value={displayValue(snapshot.pickupAddress)} accent="blue" />
        <SummaryTimelineItem icon={ArrowDown} label="Drop-off" value={displayValue(snapshot.dropoffAddress)} accent="violet" />
        <SummaryTimelineItem icon={PackageOpen} label="Move type" value={moveTypeLabel} detail={moveTypeDetail} />
        <SummaryTimelineItem
          icon={DollarSign}
          label="Estimate"
          value={quoteEstimate?.rangeLabel ?? "Choose move type"}
          detail={quoteDetail}
        />
        <SummaryTimelineItem icon={CalendarDays} label="Schedule" value={timingValue} />
        <SummaryTimelineItem icon={Truck} label="Move details" value={displayValue(snapshot.notes, "Add move details")} />
      </div>
    </div>
  );

  if (mode === "mobile") {
    return <div>{content}</div>;
  }

  return (
    <aside
      className={`border-r border-line bg-ink/70 p-6 transition duration-300 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto lg:p-8 ${
        currentStep === 2 ? "opacity-60 saturate-50" : "opacity-100"
      }`}
    >
      {content}
    </aside>
  );
}

function formatLineItemAmount(cents: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0
  }).format(cents / 100);
}

function MobileSummaryBar({
  snapshot,
  routeEstimate,
  onOpen
}: {
  snapshot: FormSnapshot;
  routeEstimate: RouteEstimateState;
  onOpen: () => void;
}) {
  const quoteEstimate = getQuoteEstimate(snapshot, routeEstimate);
  const routeLabel = `${displayValue(snapshot.pickupAddress, "Add pickup")} -> ${displayValue(snapshot.dropoffAddress, "Add drop-off")}`;

  return (
    <div className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-soft">{quoteFlowCopy.summary.mobileLabel}</p>
        <p className="mt-1 text-sm font-semibold text-white">{quoteEstimate?.rangeLabel ?? quoteFlowCopy.summary.mobileFallback}</p>
        <p className="mt-1 truncate text-xs text-text-muted">{routeLabel}</p>
      </div>
      <Button type="button" variant="secondary" size="sm" className="shrink-0" onClick={onOpen}>
        View
      </Button>
    </div>
  );
}

function SummaryTimelineItem({
  icon: Icon,
  label,
  value,
  detail,
  lineItems,
  accent
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
  lineItems?: Array<{
    label: string;
    value: string;
  }>;
  accent?: "blue" | "violet";
}) {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full border border-line ${
            accent === "blue"
              ? "bg-blue/20 text-blue-soft"
              : accent === "violet"
                ? "bg-violet/20 text-violet-soft"
                : "bg-panel text-text-secondary"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="mt-2 h-full min-h-5 w-px bg-line" aria-hidden="true" />
      </div>
      <div className="min-w-0 pb-1">
        <p className="text-xs font-medium text-text-muted">{label}</p>
        <p className={`${lineItems ? "text-xl" : "text-sm"} mt-1 break-words font-semibold leading-5 text-white`}>{value}</p>
        {detail ? <p className="mt-1 text-xs leading-5 text-text-muted">{detail}</p> : null}
        {lineItems?.length ? (
          <div className="mt-3 grid gap-1.5 rounded-2xl border border-line bg-panel/60 p-3">
            {lineItems.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-3 text-xs">
                <span className="leading-5 text-text-muted">{item.label}</span>
                <span className="font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function QuoteSuccessModal({ onReturnHome }: { onReturnHome: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/85 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10" role="dialog" aria-modal="true" aria-labelledby="quote-success-title">
      <div className="flex min-h-full items-center justify-center">
        <div className="yh-gradient-border w-full max-w-lg animate-fade-up rounded-3xl bg-panel p-[1px] shadow-glow">
          <div className="max-h-[calc(100vh-3rem)] overflow-y-auto rounded-3xl bg-panel p-7 text-center sm:max-h-[calc(100vh-5rem)] sm:p-9">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success shadow-glow">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.28em] text-blue-soft">{quoteFlowCopy.success.eyebrow}</p>
          <h2 id="quote-success-title" className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-white">
            {quoteFlowCopy.success.title}
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            {quoteFlowCopy.success.body}
          </p>
          <div className="mt-7 rounded-2xl border border-line bg-ink/70 p-4 text-sm text-text-secondary">
            {quoteFlowCopy.success.note}
          </div>
          <Button type="button" size="lg" className="mt-6 w-full" onClick={onReturnHome}>
            <Home className="h-4 w-4" />
            {quoteFlowCopy.success.action}
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
