import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Password — World TEBMA Federation" },
      { name: "description", content: "Set a new password for your World TEBMA Federation dashboard account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) setReady(true);
      else setError("This reset link is invalid or has expired. Request a new one from the sign-in page.");
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      toast.success("Password updated");
      nav({ to: "/admin", replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Account" title="Set a New Password" description="Choose a new password for your dashboard account." />
      <section className="max-w-md mx-auto px-6 py-16">
        {error && (
          <p className="mb-5 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2 rounded-sm">{error}</p>
        )}
        {!ready && !error ? (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Verifying reset link…
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm">
              <span className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">New password</span>
              <div className="relative">
                <input
                  name="password"
                  type={show ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  className="w-full py-2.5 px-3 pr-10 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <label className="block text-sm">
              <span className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">Confirm password</span>
              <input
                name="confirm"
                type={show ? "text" : "password"}
                required
                autoComplete="new-password"
                className="w-full py-2.5 px-3 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
              />
            </label>
            <button
              disabled={pending || !ready}
              className="w-full bg-foreground text-background py-3 rounded-sm text-sm font-medium disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </section>
    </PageShell>
  );
}
