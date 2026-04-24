import { Building2, Clock3, MapPinned, ReceiptText, type LucideIcon } from "lucide-react";
import { SiteContainer } from "@/components/layout/SiteContainer";
import { trustStripItems } from "@/lib/content/site-copy";

const icons: LucideIcon[] = [MapPinned, Clock3, Building2, ReceiptText];

export function TrustStrip() {
  return (
    <section className="border-y border-line bg-navy/60 py-5">
      <SiteContainer className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {trustStripItems.map((label, index) => {
          const Icon = icons[index] ?? ReceiptText;

          return (
            <div key={label} className="flex items-center gap-3 text-text-secondary">
              <Icon className="h-5 w-5 text-blue-soft" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          );
        })}
      </SiteContainer>
    </section>
  );
}
