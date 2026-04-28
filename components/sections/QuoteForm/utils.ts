import { quoteFlowCopy } from "@/lib/content/site-copy";
import { getRecommendedTruckClassForServiceType } from "@/lib/core/booking/quote-request";
import {
  calculateYoungHungryQuoteEstimate,
  type YoungHungryQuoteEstimate
} from "@/lib/core/pricing/young-hungry-pricebook";
import {
  apartmentSizeOptions,
  houseSizeOptions,
  moveTypeOptions,
  type MoveTypeValue
} from "./constants";
import type { FormSnapshot, RouteEstimateState } from "./types";

export function createClientIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `quote_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getFormValue(form: HTMLFormElement | null, name: string) {
  if (!form) return "";
  const value = new FormData(form).get(name);

  return typeof value === "string" ? value.trim() : "";
}

export function getFormSnapshot(form: HTMLFormElement | null) {
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

export function isMoveType(value: string | undefined): value is MoveTypeValue {
  return Boolean(value && moveTypeOptions.some((option) => option.value === value));
}

export function requiresMoveSize(moveType: string | undefined) {
  return moveType === "apartment" || moveType === "house";
}

export function getSizeOptions(moveType: string | undefined) {
  if (moveType === "apartment") return apartmentSizeOptions;
  if (moveType === "house") return houseSizeOptions;
  return [];
}

export function composeServiceType(moveType: string | undefined, moveSize: string | undefined) {
  if (moveType === "delivery_run" || moveType === "small_move") return moveType;
  if (moveSize === "four_plus") return "";
  if ((moveType === "apartment" || moveType === "house") && moveSize) return `${moveType}_${moveSize}`;
  return "";
}

export function getMoveTypeFromServiceType(serviceType: string | undefined) {
  if (serviceType === "delivery_run" || serviceType === "small_move") return serviceType;
  if (serviceType?.startsWith("apartment_")) return "apartment";
  if (serviceType?.startsWith("house_")) return "house";
  if (serviceType === "apartment_move") return "apartment";
  if (serviceType === "house_move") return "house";
  return "";
}

export function getMoveSizeFromServiceType(serviceType: string | undefined) {
  if (!serviceType) return "";
  if (serviceType.startsWith("apartment_")) return serviceType.replace("apartment_", "");
  if (serviceType.startsWith("house_")) return serviceType.replace("house_", "");
  return "";
}

export function applyMoveSelection(snapshot: FormSnapshot) {
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

export function getServiceTypeLabel(value: string | undefined) {
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

export function displayValue(value: string | undefined, fallback = "Not set") {
  return value?.trim() ? value.trim() : fallback;
}

export function formatLineItemAmount(cents: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0
  }).format(cents / 100);
}

export function formatHourlyRate(cents: number) {
  return `${formatLineItemAmount(cents)}/hr`;
}

export function formatCustomerHours(minutes: number | null | undefined) {
  if (typeof minutes !== "number" || !Number.isFinite(minutes)) return "Pending";

  const safeMinutes = Math.max(0, Math.round(minutes));
  const roundedHalfHours = Math.max(0.5, Math.round(safeMinutes / 30) / 2);
  const label = Number.isInteger(roundedHalfHours) ? String(roundedHalfHours) : roundedHalfHours.toFixed(1);

  return `${label} ${roundedHalfHours === 1 ? "hour" : "hours"}`;
}

export function formatMinutesForDetail(minutes: number | null | undefined) {
  if (typeof minutes !== "number" || !Number.isFinite(minutes)) return "Pending";

  const safeMinutes = Math.max(0, Math.round(minutes));
  return `${safeMinutes} min`;
}

export function formatDistanceForDetail(distanceKm: number | null | undefined) {
  if (typeof distanceKm !== "number" || !Number.isFinite(distanceKm)) return "Pending";

  const safeDistance = Math.max(0, Math.round(distanceKm * 10) / 10);
  const label = Number.isInteger(safeDistance) ? String(safeDistance) : safeDistance.toFixed(1);
  return `${label} km`;
}

export function getQuoteEstimate(snapshot: FormSnapshot, routeEstimate: RouteEstimateState) {
  return calculateYoungHungryQuoteEstimate({
    ...snapshot,
    routeDistanceKm: routeEstimate.status === "ready" ? routeEstimate.distanceKm : null,
    routeDurationMinutes: routeEstimate.status === "ready" ? routeEstimate.durationMinutes : null,
    baseToPickup: routeEstimate.status === "ready" ? routeEstimate.baseToPickup : null,
    pickupToDropoff: routeEstimate.status === "ready" ? routeEstimate.pickupToDropoff : null,
    dropoffToBase: routeEstimate.status === "ready" ? routeEstimate.dropoffToBase : null
  });
}

export function getLabourDetail(quoteEstimate: YoungHungryQuoteEstimate) {
  const prefix = quoteFlowCopy.estimate.labourDetailPrefix;
  const billableTime = formatCustomerHours(quoteEstimate.billableMinutes);
  const loadStr = formatMinutesForDetail(quoteEstimate.loadUnloadMinutes);

  if (quoteEstimate.routeDurationMinutes === null) {
    return `${prefix}${loadStr} load/unload + travel time, rounded up to ${billableTime}`;
  }

  const travelStr = formatMinutesForDetail(quoteEstimate.routeDurationMinutes);
  const totalEstimated = quoteEstimate.loadUnloadMinutes + quoteEstimate.routeDurationMinutes;

  if (totalEstimated === quoteEstimate.billableMinutes) {
    return `${prefix}${loadStr} load/unload + ${travelStr} travel = ${billableTime} total`;
  }

  const totalStr = formatMinutesForDetail(totalEstimated);
  return `${prefix}${loadStr} load/unload + ${travelStr} travel = ${totalStr}, rounded up to ${billableTime}`;
}
