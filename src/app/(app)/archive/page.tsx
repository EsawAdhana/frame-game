import Link from "next/link";
import { listPastPrompts } from "@/lib/db/prompts";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const prompts = await listPastPrompts(60);

  return (
    <main className="flex-1 px-5 py-6">
      <h1 className="font-serif text-2xl font-medium text-foreground">Archive</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every prompt that&apos;s come before.
      </p>

      {prompts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
          No past prompts yet. Come back tomorrow.
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {prompts.map((p) => {
            const label = new Date(
              `${p.active_date}T00:00:00Z`,
            ).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            });
            return (
              <li key={p.id}>
                <Link
                  href={`/archive/${p.active_date}`}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
                >
                  <div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {label}
                    </div>
                    <div className="mt-0.5 text-sm font-medium leading-snug text-foreground">
                      {p.text}
                    </div>
                  </div>
                  <span className="pt-0.5 text-muted-foreground">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
