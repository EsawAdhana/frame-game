import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <p className="text-xs text-muted-foreground">404</p>
      <h1 className="font-serif text-2xl font-medium text-foreground">
        Nothing to see here
      </h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        That page doesn&apos;t exist, or the post was removed.
      </p>
      <Link href="/today">
        <Button size="lg">Back to today</Button>
      </Link>
    </main>
  );
}
