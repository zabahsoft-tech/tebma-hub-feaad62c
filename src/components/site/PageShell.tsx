import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 py-20">
        {eyebrow ? (
          <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-balance max-w-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl text-pretty">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
