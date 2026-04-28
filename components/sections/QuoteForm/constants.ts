import { Boxes, Building2, Home, PackageOpen } from "lucide-react";
import { quoteStepCopy } from "@/lib/content/site-copy";
import { inputShellClasses } from "@/components/ui/Input";
import type { QuoteStep } from "./types";

export const quoteSteps: QuoteStep[] = quoteStepCopy.map((step) => ({
  title: step.title,
  shortTitle: step.shortTitle
}));

export const moveTypeOptions = [
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

export const apartmentSizeOptions = [
  { value: "studio", label: "Studio" },
  { value: "one_bed", label: "1 bedroom" },
  { value: "two_bed", label: "2 bedrooms" },
  { value: "three_bed", label: "3 bedrooms" },
  { value: "four_plus", label: "4+ bedrooms", disabled: true, status: "Coming soon" }
] as const;

export const houseSizeOptions = [
  { value: "one_bed", label: "1 bedroom" },
  { value: "two_bed", label: "2 bedrooms" },
  { value: "three_bed", label: "3 bedrooms" },
  { value: "four_plus", label: "4+ bedrooms", disabled: true, status: "Coming soon" }
] as const;

export const inputClass = inputShellClasses;

export type MoveTypeValue = (typeof moveTypeOptions)[number]["value"];
