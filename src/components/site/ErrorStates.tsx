import { Link, useRouter } from "@tanstack/react-router";
import { SITE_SHORT } from "@/lib/site";

function Frame({
  code,
  title,
  description,
  children,
}: {
  code: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-5 bg-foreground rounded-xs" />
            <span className="text-xs font-semibold uppercase tracking-widest">{SITE_SHORT}</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="max-w-7xl w-full mx-auto px-6 py-24 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center">
          <div className="relative">
            <span className="block text-[7rem] md:text-[10rem] leading-[0.85] font-medium tracking-tighter text-balance">
              {code}
            </span>
            <span className="mt-4 block h-px w-24 bg-brand" />
          </div>
          <div className="max-w-xl">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              {SITE_SHORT}
            </span>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-balance">{title}</h1>
            <p className="mt-4 text-muted-foreground text-pretty leading-relaxed">{description}</p>
            <div className="mt-8 flex flex-wrap gap-3">{children}</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap gap-4 justify-between">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            &copy; {new Date().getFullYear()} {SITE_SHORT}
          </span>
          <div className="flex gap-6">
            <Link to="/verify" className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">Verify</Link>
            <Link to="/news" className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">News</Link>
            <Link to="/contact" className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const primaryCls =
  "inline-flex items-center justify-center rounded-sm bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90";
const secondaryCls =
  "inline-flex items-center justify-center rounded-sm border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent";

export function NotFoundState() {
  return (
    <Frame
      code="404"
      title="This page is not on record"
      description="The document, discipline or article you requested could not be located in the federation archive. It may have been moved, renamed or withdrawn."
    >
      <Link to="/" className={primaryCls}>Return home</Link>
      <Link to="/news" className={secondaryCls}>Browse news</Link>
      <Link to="/contact" className={secondaryCls}>Contact HQ</Link>
    </Frame>
  );
}

export function ErrorState({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <Frame
      code="500"
      title="This page didn't load"
      description="An unexpected error interrupted this request. You can retry, or return to the federation homepage."
    >
      <button
        onClick={() => {
          router.invalidate();
          reset();
        }}
        className={primaryCls}
      >
        Try again
      </button>
      <a href="/" className={secondaryCls}>Go home</a>
      {import.meta.env.DEV && error?.message ? (
        <p className="w-full mt-4 font-mono text-xs text-muted-foreground break-words">{error.message}</p>
      ) : null}
    </Frame>
  );
}
