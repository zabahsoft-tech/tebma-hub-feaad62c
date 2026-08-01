import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, TextArea, SelectField, SaveBar } from "@/components/admin/AdminForm";
import { adminGetContactInfo, adminUpsertCert } from "@/lib/admin.functions";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { codePattern, normalizeCode, suggestCode, validateCode } from "@/lib/cert-code";
import { RefreshCw } from "lucide-react";

const settingsQO = queryOptions({ queryKey: ["admin", "contact-info"], queryFn: () => adminGetContactInfo() });

export const Route = createFileRoute("/_authenticated/admin/certificates/new")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQO),
  component: () => {
    const nav = useNavigate();
    const { data: settings } = useSuspenseQuery(settingsQO);
    const [pending, setPending] = useState(false);
    const [code, setCode] = useState(() => suggestCode(settings));
    const [codeError, setCodeError] = useState<string | null>(null);
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setPending(true);
      const fd = new FormData(e.currentTarget);
      const err = validateCode(code);
      if (err) {
        setCodeError(err);
        setPending(false);
        return;
      }
      setCodeError(null);
      try {
        await adminUpsertCert({
          data: {
            code: normalizeCode(code),
            holder_name: String(fd.get("holder_name") ?? ""),
            rank: String(fd.get("rank") ?? ""),
            style_name: String(fd.get("style_name") ?? "") || null,
            country: String(fd.get("country") ?? "") || null,
            issued_on: String(fd.get("issued_on") ?? new Date().toISOString().slice(0, 10)),
            expires_on: String(fd.get("expires_on") ?? "") || null,
            status: (String(fd.get("status") ?? "active") as "active" | "revoked" | "expired"),
            notes: String(fd.get("notes") ?? "") || null,
          },
        });
        toast.success("Certificate issued");
        nav({ to: "/admin/certificates" });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Save failed";
        if (msg.toLowerCase().includes("code")) setCodeError(msg);
        toast.error(msg);
      } finally {
        setPending(false);
      }
    }
    return (
      <AdminPage title="Issue certificate">
        <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-4 max-w-2xl">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <TextField
                label="Code"
                name="code"
                required
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeError(null); }}
                error={codeError}
                hint={`Format: ${codePattern(settings)} — editable.`}
              />
            </div>
            <button
              type="button"
              onClick={() => { setCode(suggestCode(settings)); setCodeError(null); }}
              className="mb-6 inline-flex items-center gap-2 border border-border rounded-sm px-3 py-2 text-sm hover:bg-accent"
            >
              <RefreshCw className="size-4" /> New code
            </button>
          </div>
          <TextField label="Holder name" name="holder_name" required />
          <TextField label="Rank" name="rank" required placeholder="1st Dan" />
          <TextField label="Discipline" name="style_name" />
          <TextField label="Country" name="country" />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Issued on" name="issued_on" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            <TextField label="Expires on" name="expires_on" type="date" />
          </div>
          <SelectField
            label="Status"
            name="status"
            defaultValue="active"
            options={[
              { value: "active", label: "Active" },
              { value: "revoked", label: "Revoked" },
              { value: "expired", label: "Expired" },
            ]}
          />
          <TextArea label="Notes (internal)" name="notes" rows={4} />
          <SaveBar pending={pending} cancelTo="/admin/certificates" />
        </form>
      </AdminPage>
    );
  },
});
