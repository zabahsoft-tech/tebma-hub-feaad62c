import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronDown, Menu, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { NAV_LINKS, SITE_SHORT } from "@/lib/site";
import { getContactInfo, listNavCategories } from "@/lib/public.functions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["site", "contact-info"],
    queryFn: () => getContactInfo(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: categories } = useQuery({
    queryKey: ["site", "nav-categories"],
    queryFn: () => listNavCategories(),
    staleTime: 5 * 60 * 1000,
  });
  const info = data as {
    logo_url?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    youtube?: string | null;
    twitter?: string | null;
  } | null;
  const logoUrl = info?.logo_url ?? null;
  const cats = categories ?? [];
  const socials = [
    { label: "Facebook", href: info?.facebook, Icon: Facebook },
    { label: "Instagram", href: info?.instagram, Icon: Instagram },
    { label: "YouTube", href: info?.youtube, Icon: Youtube },
    { label: "Twitter / X", href: info?.twitter, Icon: Twitter },
  ].filter((s) => !!s.href) as Array<{ label: string; href: string; Icon: typeof Facebook }>;


  const mark = logoUrl ? (
    <img src={logoUrl} alt={`${SITE_SHORT} logo`} className="h-9 w-auto shrink-0 object-contain md:h-10" />
  ) : (
    <div className="size-9 shrink-0 bg-foreground grid place-items-center rounded-sm md:size-10">
      <span className="text-background font-semibold text-lg tracking-tighter md:text-xl">T</span>
    </div>
  );

  return (
    <header className="border-b border-border/60 bg-background/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-5">
        {/* Mobile bar */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:hidden">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            {mark}
            <span className="truncate font-medium tracking-tight text-sm uppercase">{SITE_SHORT}</span>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Open navigation menu"
              className="shrink-0 inline-flex size-10 items-center justify-center rounded-sm border border-border"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-xs uppercase tracking-widest">{SITE_SHORT}</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="mt-6 flex flex-col gap-1 pb-10">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-sm px-3 py-2.5 text-sm font-medium uppercase tracking-widest text-muted-foreground hover:bg-accent hover:text-foreground"
                    activeProps={{ className: "rounded-sm px-3 py-2.5 text-sm font-medium uppercase tracking-widest bg-accent text-foreground" }}
                  >
                    {l.label}
                  </Link>
                ))}
                {cats.map((cat) =>
                  cat.pages.length === 0 ? (
                    <Link
                      key={cat.id}
                      to="/c/$slug"
                      params={{ slug: cat.slug }}
                      onClick={() => setOpen(false)}
                      className="rounded-sm px-3 py-2.5 text-sm font-medium uppercase tracking-widest text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {cat.name}
                    </Link>
                  ) : (
                    <Collapsible key={cat.id}>
                      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-sm font-medium uppercase tracking-widest text-muted-foreground hover:bg-accent hover:text-foreground">
                        {cat.name}
                        <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="ml-3 border-l border-border pl-3">
                        <Link
                          to="/c/$slug"
                          params={{ slug: cat.slug }}
                          onClick={() => setOpen(false)}
                          className="block rounded-sm px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
                        >
                          All {cat.name}
                        </Link>
                        {cat.pages.map((p) => (
                          <Link
                            key={p.id}
                            to="/p/$slug"
                            params={{ slug: p.slug }}
                            onClick={() => setOpen(false)}
                            className="block rounded-sm px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {p.title}
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ),
                )}
              </nav>
              {socials.length > 0 && (
                <div className="flex items-center gap-2 border-t border-border pt-4">
                  {socials.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      title={label}
                      className="inline-flex size-9 items-center justify-center rounded-sm border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex flex-col items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            {mark}
            <span className="font-medium tracking-tight text-lg uppercase group-hover:opacity-80 transition-opacity">
              {SITE_SHORT}
            </span>
          </Link>
          <nav aria-label="Primary" className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{ className: "text-xs font-medium uppercase tracking-widest text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
            {cats.map((cat) =>
              cat.pages.length === 0 ? (
                <Link
                  key={cat.id}
                  to="/c/$slug"
                  params={{ slug: cat.slug }}
                  className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  {cat.name}
                </Link>
              ) : (
                <DropdownMenu key={cat.id}>
                  <DropdownMenuTrigger className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors focus:outline-none">
                    {cat.name}
                    <ChevronDown className="size-3" aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="min-w-52">
                    <DropdownMenuItem asChild>
                      <Link to="/c/$slug" params={{ slug: cat.slug }} className="text-xs uppercase tracking-widest">
                        All {cat.name}
                      </Link>
                    </DropdownMenuItem>
                    {cat.pages.map((p) => (
                      <DropdownMenuItem key={p.id} asChild>
                        <Link to="/p/$slug" params={{ slug: p.slug }}>
                          {p.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            )}
          </nav>
          {socials.length > 0 && (
            <div className="flex items-center gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
