import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { getRememberMe, getRememberedEmail, rememberEmail, setRememberMe } from "@/lib/auth-persistence";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Admin Sign In — World TEBMA Federation" },
      { name: "description", content: "Sign in to the World TEBMA Federation content management dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const nav = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<Mode>("signin");
  const [pending, setPending] = useState(false);
  const [checking, setChecking] = useState(true);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRemember(getRememberMe());
    setEmail(getRememberedEmail());
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) nav({ to: redirect ?? "/admin", replace: true });
      else setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [nav, redirect]);

  function friendly(message: string) {
    const m = message.toLowerCase();
    if (m.includes("invalid login credentials")) return "That email and password combination doesn't match an account.";
    if (m.includes("email not confirmed")) return "This email hasn't been confirmed yet. Check your inbox for the confirmation link.";
    if (m.includes("rate limit")) return "Too many attempts. Please wait a moment and try again.";
    return message;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const emailValue = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    try {
      if (mode === "forgot") {
        const { error: err } = await supabase.auth.resetPasswordForEmail(emailValue, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (err) throw err;
        toast.success("Password reset link sent. Check your inbox.");
        setMode("signin");
      } else if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email: emailValue,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (err) throw err;
        toast.success("Account created. Ask an existing admin to grant you access.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email: emailValue, password });
        if (err) throw err;
        setRememberMe(remember);
        rememberEmail(remember ? emailValue : "");
        toast.success("Signed in");
        nav({ to: redirect ?? "/admin", replace: true });
      }
    } catch (err: unknown) {
      setError(friendly(err instanceof Error ? err.message : "Authentication failed"));
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Restricted" title="Federation Dashboard" description="Sign in to manage federation content." />
      <section className="max-w-md mx-auto px-6 py-16">
        {checking ? (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking session…
          </p>
        ) : (
          <>
            <div className="flex mb-6 border-b border-border">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError(null);
                  }}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    (mode === m || (mode === "forgot" && m === "signin"))
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground"
                  }`}
                >
                  {m === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            {error && (
              <p className="mb-5 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2 rounded-sm">{error}</p>
            )}

            {mode === "forgot" && (
              <p className="mb-5 text-sm text-muted-foreground">
                Enter your email and we'll send you a link to set a new password.
              </p>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block text-sm">
                <span className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2.5 px-3 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
                />
              </label>

              {mode !== "forgot" && (
                <label className="block text-sm">
                  <span className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">Password</span>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      className="w-full py-2.5 px-3 pr-10 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
              )}

              {mode === "signin" && (
                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded-sm border-border accent-foreground"
                    />
                    Keep me signed in
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                    }}
                    className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                disabled={pending}
                className="w-full bg-foreground text-background py-3 rounded-sm text-sm font-medium disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {pending
                  ? "Please wait…"
                  : mode === "signin"
                    ? "Sign in"
                    : mode === "signup"
                      ? "Create account"
                      : "Send reset link"}
              </button>

              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  Back to sign in
                </button>
              )}
            </form>
          </>
        )}
      </section>
    </PageShell>
  );
}
