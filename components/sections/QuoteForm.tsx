import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export function QuoteForm() {
  return (
    <Card className="yh-gradient-border">
      <CardContent className="p-6 sm:p-8">
        <form className="grid gap-5">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium text-text-secondary">Name</label>
            <input id="name" name="name" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="Your name" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium text-text-secondary">Email</label>
              <input id="email" name="email" type="email" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="you@example.com" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="phone" className="text-sm font-medium text-text-secondary">Phone</label>
              <input id="phone" name="phone" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="+61" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="pickup" className="text-sm font-medium text-text-secondary">Pickup address</label>
              <input id="pickup" name="pickup" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="Pickup suburb/address" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="dropoff" className="text-sm font-medium text-text-secondary">Dropoff address</label>
              <input id="dropoff" name="dropoff" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="Dropoff suburb/address" />
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="notes" className="text-sm font-medium text-text-secondary">Job notes</label>
            <textarea id="notes" name="notes" rows={5} className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="Inventory, stairs, lift, parking, preferred day..." />
          </div>
          <Button type="submit" size="lg">Submit quote request</Button>
          <p className="text-sm text-text-muted">
            Form submission is scaffolded. Wire this to `create_quote` after the Supabase project and RPC migrations are applied.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
