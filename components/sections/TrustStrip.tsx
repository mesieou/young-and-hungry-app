import { BadgeCheck, CalendarCheck, LockKeyhole, Route, type LucideIcon } from "lucide-react";

const items: Array<[string, LucideIcon]> = [
  ["Verified crew", BadgeCheck],
  ["Scheduled jobs", CalendarCheck],
  ["Deposit-backed holds", LockKeyhole],
  ["Route-aware planning", Route]
];

export function TrustStrip() {
  return (
    <section className="border-y border-line bg-navy/60 px-6 py-5">
      <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([label, Icon]) => (
          <div key={String(label)} className="flex items-center gap-3 text-text-secondary">
            <Icon className="h-5 w-5 text-blue-soft" />
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
