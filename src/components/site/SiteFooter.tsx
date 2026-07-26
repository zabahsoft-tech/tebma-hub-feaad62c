import { Link } from "@tanstack/react-router";
import { SITE_SHORT } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="py-20 border-t border-border/60 mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          <div className="flex flex-col gap-6 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="size-6 bg-foreground rounded-xs" />
              <span className="text-xs font-semibold uppercase tracking-widest">{SITE_SHORT}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Official technical authority and regulatory body for traditional martial arts systems globally.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Resources</span>
              <nav className="flex flex-col gap-2">
                <Link to="/dictionary" className="text-sm text-muted-foreground hover:text-foreground">Dictionary</Link>
                <Link to="/rules" className="text-sm text-muted-foreground hover:text-foreground">Rules</Link>
                <Link to="/verify" className="text-sm text-muted-foreground hover:text-foreground">Verify Certificate</Link>
                <Link to="/gallery" className="text-sm text-muted-foreground hover:text-foreground">Gallery</Link>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Federation</span>
              <nav className="flex flex-col gap-2">
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
                <Link to="/styles" className="text-sm text-muted-foreground hover:text-foreground">Styles</Link>
                <Link to="/membership" className="text-sm text-muted-foreground hover:text-foreground">Membership</Link>
                <Link to="/news" className="text-sm text-muted-foreground hover:text-foreground">News</Link>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact</span>
              <nav className="flex flex-col gap-2">
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact HQ</Link>
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Admin Sign in</Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            &copy; {new Date().getFullYear()} {SITE_SHORT}
          </span>
          <div className="flex gap-6">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Brussels</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Tokyo</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">New York</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
