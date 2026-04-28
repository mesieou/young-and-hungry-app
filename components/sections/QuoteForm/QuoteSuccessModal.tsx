import { CheckCircle2, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconBadge } from "@/components/ui/IconBadge";
import { quoteFlowCopy } from "@/lib/content/site-copy";

export function QuoteSuccessModal({ onReturnHome }: { onReturnHome: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/85 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-success-title"
    >
      <div className="flex min-h-full items-center justify-center">
        <div className="yh-gradient-border w-full max-w-lg animate-fade-up rounded-3xl bg-panel p-[1px] shadow-glow">
          <div className="max-h-[calc(100vh-3rem)] overflow-y-auto rounded-3xl bg-panel p-7 text-center sm:max-h-[calc(100vh-5rem)] sm:p-9">
            <IconBadge icon={CheckCircle2} variant="success" size="xl" className="mx-auto" />
            <Eyebrow size="lg" className="mt-6">
              {quoteFlowCopy.success.eyebrow}
            </Eyebrow>
            <h2 id="quote-success-title" className="mt-3 font-display text-4xl font-semibold tracking-tight-2 text-white">
              {quoteFlowCopy.success.title}
            </h2>
            <p className="mt-4 leading-7 text-text-secondary">{quoteFlowCopy.success.body}</p>
            <div className="mt-7 rounded-2xl border border-line bg-ink/70 p-4 text-sm text-text-secondary">
              {quoteFlowCopy.success.note}
            </div>
            <Button type="button" size="lg" className="mt-6 w-full" onClick={onReturnHome}>
              <Home className="h-4 w-4" />
              {quoteFlowCopy.success.action}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
