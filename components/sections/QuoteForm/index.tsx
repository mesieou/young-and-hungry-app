"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { submitQuoteRequest } from "@/app/quote/actions";
import { StepShell } from "@/components/layout/StepShell";
import { AddressAutocompleteInput } from "@/components/ui/AddressAutocompleteInput";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconBadge } from "@/components/ui/IconBadge";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { ResponsiveDrawer } from "@/components/ui/ResponsiveDrawer";
import { quoteFlowCopy } from "@/lib/content/site-copy";
import {
  initialQuoteFormState,
  isValidAustralianPhone,
  preferredTimeWindowOptions
} from "@/lib/core/booking/quote-request";
import { EstimateReveal } from "./EstimateReveal";
import { MobileSummaryBar, QuoteSummary } from "./QuoteSummary";
import { QuoteSuccessModal } from "./QuoteSuccessModal";
import { StepProgress } from "./StepProgress";
import { inputClass, moveTypeOptions, quoteSteps } from "./constants";
import {
  applyMoveSelection,
  createClientIdempotencyKey,
  getFormSnapshot,
  getFormValue,
  getSizeOptions,
  requiresMoveSize
} from "./utils";
import type { FormSnapshot, QuoteFormProps, RouteEstimateState } from "./types";

export { QuoteSuccessModal };

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
    setFormSnapshot((previous) =>
      applyMoveSelection({
        ...previous,
        ...values
      })
    );
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
                <Eyebrow tone="muted">
                  Step {currentStep + 1} of {quoteSteps.length}
                </Eyebrow>
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
            <div className="rounded-3xl border border-line bg-ink/55 p-4 sm:p-5">
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
                    <label
                      key={option.value}
                      className={`group relative block w-full min-w-0 overflow-hidden rounded-3xl border p-4 text-sm transition hover:-translate-y-0.5 hover:border-line-hover hover:bg-navy hover:shadow-lift sm:p-5 ${
                        isSelected ? "border-blue/80 bg-blue/10" : "border-line bg-ink/60"
                      }`}
                    >
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
                      <span
                        className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border ${
                          isSelected ? "border-blue bg-blue" : "border-line"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full bg-white ${isSelected ? "opacity-100" : "opacity-0"}`} />
                      </span>
                      <IconBadge icon={Icon} />
                      <span className="mt-3 block min-w-0 break-words font-display text-xl font-semibold tracking-tight-1 text-white">
                        {option.label}
                      </span>
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
                      <label
                        key={option.value}
                        className={`grid min-h-16 min-w-0 place-items-center gap-1 overflow-hidden rounded-2xl border px-2 py-3 text-center text-sm font-semibold transition ${
                          isDisabled
                            ? "cursor-not-allowed border-line bg-ink/35 text-text-muted opacity-70"
                            : isSelected
                              ? "cursor-pointer border-blue/80 bg-blue/10 text-blue-soft hover:border-line-hover hover:bg-navy"
                              : "cursor-pointer border-line bg-ink/60 text-white hover:border-line-hover hover:bg-navy"
                        }`}
                      >
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
                          <span className="block max-w-full truncate rounded-full border border-line bg-panel/70 px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-text-muted">
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
              <label htmlFor="preferredDate" className="text-sm font-medium text-text-secondary">
                Preferred date
              </label>
              <input id="preferredDate" name="preferredDate" type="date" className={inputClass} disabled={isSuccess} />
            </div>

            <fieldset className="grid gap-3">
              <legend className="text-sm font-medium text-text-secondary">Preferred time window</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {preferredTimeWindowOptions.map((option) => (
                  <label
                    key={option.value}
                    className="cursor-pointer rounded-2xl border border-line bg-ink/60 p-4 transition hover:border-line-hover hover:bg-navy has-[:checked]:border-blue/80 has-[:checked]:bg-blue/10"
                  >
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
              <label htmlFor="notes" className="text-sm font-medium text-text-secondary">
                What are you moving?
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={6}
                className={inputClass}
                placeholder="Inventory, stairs, lift, parking, access, fragile items..."
                aria-invalid={Boolean(state.fieldErrors?.notes)}
                disabled={isSuccess}
              />
              {state.fieldErrors?.notes ? <p className="text-sm text-error">{state.fieldErrors.notes}</p> : null}
            </div>

            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium text-text-secondary">
                Name
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="name"
                  name="name"
                  className={`${inputClass} w-full pl-11`}
                  placeholder="Your name"
                  aria-invalid={Boolean(state.fieldErrors?.name)}
                  disabled={isSuccess}
                />
              </div>
              {state.fieldErrors?.name ? <p className="text-sm text-error">{state.fieldErrors.name}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium text-text-secondary">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`${inputClass} w-full pl-11`}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(state.fieldErrors?.email)}
                    disabled={isSuccess}
                  />
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
