import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";

export function VerifyWidget() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  return (
    <div className="p-6 bg-card rounded-md ring-1 ring-black/5 max-w-md">
      <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Certificate Verification
      </span>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const c = code.trim();
          if (!c) return;
          navigate({ to: "/verify/$code", params: { code: c } });
        }}
      >
        <div className="relative flex-grow">
          <input
            type="text"
            aria-label="Certificate code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. TBM-2025-8829XK"
            className="w-full text-sm py-2.5 px-3 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground/30 uppercase tracking-wider"
          />
        </div>
        <button
          type="submit"
          className="bg-foreground text-background text-sm font-medium py-2.5 px-4 rounded-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2"
        >
          <Search className="size-4" />
          Verify
        </button>
      </form>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Enter a certificate ID or scan the QR from an official certificate.
      </p>
    </div>
  );
}
