import { cn } from "@/lib/utils";

export function PromptHero({
  date,
  text,
  eyebrow = "Today's prompt",
  className,
}: {
  date?: string;
  text: string;
  eyebrow?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border bg-card p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
        <span>{eyebrow}</span>
        {date && <span>{date}</span>}
      </div>
      <h1 className="mt-4 text-[28px] font-semibold leading-tight tracking-tight">
        {text}
      </h1>
    </section>
  );
}
