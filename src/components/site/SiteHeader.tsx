import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { NAV_LINKS, SITE_SHORT } from "@/lib/site";
import { getContactInfo, listNavCategories } from "@/lib/public.functions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
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
  const logoUrl = (data as { logo_url?: string | null } | null)?.logo_url ?? null;

  return (
    <header className="border-b border-border/60 bg-background/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex flex-col items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            {logoUrl ? (
              <img src={logoUrl} alt={`${SITE_SHORT} logo`} className="h-10 w-auto object-contain" />
            ) : (
              <div className="size-10 bg-foreground grid place-items-center rounded-sm">
                <span className="text-background font-semibold text-xl tracking-tighter">T</span>
              </div>
            )}
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
            {(categories ?? []).map((cat) =>
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
        </div>
      </div>
    </header>
  );
}
