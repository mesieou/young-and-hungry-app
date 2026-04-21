import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Young & Hungry."
};

export default function ContactPage() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <Card className="yh-gradient-border">
          <CardContent className="p-8 sm:p-10">
            <h1 className="font-display text-5xl font-semibold tracking-[-0.05em]">Contact Young & Hungry</h1>
            <p className="mt-5 max-w-2xl leading-8 text-text-secondary">
              For MVP, contact flows should convert into structured quote requests so ops can track every job from lead to completion.
            </p>
            <Button asChild className="mt-8">
              <Link href="/quote">Start a quote</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
