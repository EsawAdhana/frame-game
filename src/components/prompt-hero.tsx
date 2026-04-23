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
        "rounded-3xl border border-border/80 bg-card p-6 shadow-[0_1px_2px_rgba(68,64,60,0.06)]",
        className,
      )}
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{eyebrow}</span>
        {date && <span className="tabular-nums">{date}</span>}
      </div>
      <h1 className="mt-4 font-serif text-[28px] font-medium leading-tight text-foreground">
        {text}
      </h1>
    </section>
  );
}
