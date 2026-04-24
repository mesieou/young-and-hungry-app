import type { Metadata } from "next";
import { PageSection } from "@/components/layout/PageSection";
import { QuoteForm } from "@/components/sections/QuoteForm";

export const metadata: Metadata = {
  title: "Start A Quote",
  description: "Request a Young & Hungry removalist quote through a guided moving flow."
};

type QuotePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function QuotePage({ searchParams }: QuotePageProps) {
  const params = (await searchParams) ?? {};
  const pickupAddress = getSingleSearchParam(params.pickupAddress) ?? "";
  const dropoffAddress = getSingleSearchParam(params.dropoffAddress) ?? "";

  return (
    <PageSection padding="compact">
      <div className="mx-auto max-w-6xl">
        <QuoteForm initialPickupAddress={pickupAddress} initialDropoffAddress={dropoffAddress} />
      </div>
    </PageSection>
  );
}
