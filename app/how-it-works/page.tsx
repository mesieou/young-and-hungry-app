import { Card, CardContent } from "@/components/ui/Card";
import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import { buildPublicPageMetadataById, requirePublicPageById } from "@/lib/seo/public-route-utils";

export const metadata = buildPublicPageMetadataById("how-it-works");

const page = requirePublicPageById("how-it-works");

const steps = [
  ["Add the route", "Start with pickup and drop-off so the estimate is based on a real move route."],
  ["Choose the move type and truck", "Pick the move type and truck size that best fit the job."],
  ["See your estimate", "The estimate appears before you send the move details, so the process feels clearer earlier."],
  ["Send the move details", "Add timing, access notes, and contact details so the team can confirm the next step."]
] as const;

export default function HowItWorksPage() {
  return (
    <PublicRoutePage page={page}>
      <div className="grid gap-4">
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
    </PublicRoutePage>
  );
}
