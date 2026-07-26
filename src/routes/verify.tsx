import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { QrCode, Search, X } from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify a Certificate — World TEBMA Federation" },
      { name: "description", content: "Verify the authenticity of a World TEBMA Federation rank certificate by code or QR scan." },
      { property: "og:title", content: "Verify a Certificate — World TEBMA Federation" },
      { property: "og:description", content: "Verify the authenticity of a TEBMA certificate." },
      { property: "og:url", content: "/verify" },
    ],
    links: [{ rel: "canonical", href: "/verify" }],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);

  return (
    <PageShell>
      <PageHeader eyebrow="Anti-fraud" title="Verify a Certificate" description="Every federation-issued certificate carries a unique code and QR. Confirm authenticity here." />
      <section className="max-w-2xl mx-auto px-6 py-16 space-y-8">
        <form
          className="border border-border rounded-md p-6"
          onSubmit={(e) => {
            e.preventDefault();
            const c = code.trim();
            if (c) nav({ to: "/verify/$code", params: { code: c } });
          }}
        >
          <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            Certificate code
          </label>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="TBM-2025-8829XK"
              className="flex-1 py-3 px-4 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground/30 uppercase tracking-wider"
            />
            <button className="bg-foreground text-background py-3 px-5 rounded-sm text-sm font-medium inline-flex items-center gap-2">
              <Search className="size-4" /> Check
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            onClick={() => setScanning((s) => !s)}
            className="inline-flex items-center gap-2 text-sm font-medium border border-border rounded-sm px-4 py-2.5 hover:bg-accent"
          >
            <QrCode className="size-4" /> {scanning ? "Close scanner" : "Scan QR code"}
          </button>
        </div>
        {scanning ? (
          <QrScanner
            onResult={(text) => {
              try {
                const url = new URL(text);
                const parts = url.pathname.split("/").filter(Boolean);
                const last = parts[parts.length - 1];
                if (last) {
                  nav({ to: "/verify/$code", params: { code: last } });
                  return;
                }
              } catch {
                // not a URL — treat as raw code
              }
              nav({ to: "/verify/$code", params: { code: text } });
            }}
            onClose={() => setScanning(false)}
          />
        ) : null}
      </section>
    </PageShell>
  );
}

function QrScanner({ onResult, onClose }: { onResult: (t: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let stop: (() => Promise<void>) | null = null;
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("html5-qrcode");
        if (cancelled || !ref.current) return;
        const scanner = new mod.Html5Qrcode(ref.current.id);
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            onResult(decoded);
            scanner.stop().catch(() => {});
          },
          () => {},
        );
        stop = () => scanner.stop().then(() => scanner.clear()).catch(() => {});
      } catch (e) {
        console.error(e);
        setError("Unable to access the camera.");
      }
    })();
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [onResult]);
  return (
    <div className="border border-border rounded-md p-4 relative">
      <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-sm hover:bg-accent">
        <X className="size-4" />
      </button>
      <div id="tebma-qr" ref={ref} className="w-full aspect-square bg-black rounded-sm overflow-hidden" />
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
