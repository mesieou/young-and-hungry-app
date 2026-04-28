import type { LucideIcon } from "lucide-react";
import { PageSection } from "@/components/layout/PageSection";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { IconBadge } from "@/components/ui/IconBadge";

export type IntroFeatureCardItem = {
  icon: LucideIcon;
  title: string;
  body: string;
};

type IntroFeatureCardsProps = {
  eyebrow: string;
  title: string;
  description: string;
  features: readonly IntroFeatureCardItem[];
  columns?: 2 | 3 | 4;
};

const columnClassMap = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4"
} as const;

export function IntroFeatureCards({
  eyebrow,
  title,
  description,
  features,
  columns = 3
}: IntroFeatureCardsProps) {
  return (
    <PageSection>
      <div>
        <div className="max-w-3xl">
          <Badge>{eyebrow}</Badge>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight-2 sm:text-4xl">{title}</h2>
          <p className="mt-5 leading-8 text-text-secondary">{description}</p>
        </div>
        <div className={`mt-10 grid gap-4 ${columnClassMap[columns]}`}>
          {features.map((feature) => (
            <Card key={feature.title} variant="interactive">
              <CardContent className="p-6">
                <IconBadge icon={feature.icon} shape="squircle" className="mb-5" />
                <h3 className="font-display text-2xl font-semibold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-text-secondary">{feature.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageSection>
  );
}
