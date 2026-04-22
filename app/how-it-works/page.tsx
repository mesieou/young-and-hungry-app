import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "How It Works",
  description: "How Young & Hungry turns moving enquiries into scheduled removalist jobs."
};

const steps = [
  ["Quote request", "Capture addresses, inventory, access notes, and preferred job time."],
  ["Ops review email", "Send the full quote payload to Young & Hungry for review and follow-up."],
  ["Clear quote", "Confirm pricing, timing, and any access constraints directly with the customer."],
  ["Manual confirmation", "Lock in the accepted job manually while the automated booking core remains ready for later."]
];

export default function HowItWorksPage() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <Badge tone="gradient">Operational flow</Badge>
        <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em]">A safer path from lead to confirmed job.</h1>
        <div className="mt-10 grid gap-4">
          {steps.map(([title, body], index) => (
            <Card key={title}>
              <CardContent className="flex gap-5 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-blue font-mono text-sm">
                  {index + 1}
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold">{title}</h2>
                  <p className="mt-2 leading-7 text-text-secondary">{body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
