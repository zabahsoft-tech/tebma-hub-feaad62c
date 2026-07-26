import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { NAV_LINKS, SITE_SHORT } from "@/lib/site";
import { getContactInfo } from "@/lib/public.functions";

export function SiteHeader() {
  const { data } = useQuery({
    queryKey: ["site", "contact-info"],
    queryFn: () => getContactInfo(),
    staleTime: 5 * 60 * 1000,
  });
  const logoUrl = (data as { logo_url?: string | null } | null)?.logo_url ?? null;

  return (
    <header className="border-b border-border/60 bg-background/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex flex-col items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${SITE_SHORT} logo`}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="size-10 bg-foreground grid place-items-center rounded-sm">
                <span className="text-background font-semibold text-xl tracking-tighter">T</span>
              </div>
            )}
            <span className="font-medium tracking-tight text-lg uppercase group-hover:opacity-80 transition-opacity">
              {SITE_SHORT}
            </span>
          </Link>
          <nav aria-label="Primary" className="flex flex-wrap justify-center gap-x-8 gap-y-2">
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
          </nav>
        </div>
      </div>
    </header>
  );
}
