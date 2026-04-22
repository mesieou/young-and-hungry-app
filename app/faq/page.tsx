import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Young & Hungry removalist platform questions."
};

const faqs = [
  ["Is this a directory?", "No. The product direction is an execution layer for physical jobs, not a listing site."],
  ["What happens after I request a quote?", "Young & Hungry receives the full job details by email, reviews the move, then follows up with pricing and timing."],
  ["How do you prevent double bookings later?", "The booking core already uses normalized 15-minute buckets and Postgres constraints for the automated booking phase."]
];

export default function FaqPage() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-5xl font-semibold tracking-[-0.05em]">FAQ</h1>
        <div className="mt-10 grid gap-4">
          {faqs.map(([question, answer]) => (
            <Card key={question}>
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-semibold">{question}</h2>
                <p className="mt-3 leading-7 text-text-secondary">{answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
