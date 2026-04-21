import type { Metadata } from "next";
import { QuoteForm } from "@/components/sections/QuoteForm";

export const metadata: Metadata = {
  title: "Start A Quote",
  description: "Request a Young & Hungry removalist quote."
};

export default function QuotePage() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-blue-soft">Instant quote request</p>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em]">Tell us what needs moving.</h1>
          <p className="mt-5 leading-8 text-text-secondary">
            Stage 1 captures the job cleanly. Stage 2 will calculate versioned quotes. Stage 3 will reserve availability and confirm bookings with deposit-backed holds.
          </p>
        </div>
        <QuoteForm />
      </div>
    </section>
  );
}
