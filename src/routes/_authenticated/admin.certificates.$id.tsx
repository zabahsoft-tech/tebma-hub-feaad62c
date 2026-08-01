import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, TextArea, SelectField, SaveBar } from "@/components/admin/AdminForm";
import { adminGetCert, adminUpsertCert } from "@/lib/admin.functions";
import { toast } from "sonner";
import { normalizeCode, validateCode } from "@/lib/cert-code";

const qo = (id: string) => queryOptions({ queryKey: ["admin", "cert", id], queryFn: () => adminGetCert({ data: { id } }) });

export const Route = createFileRoute("/_authenticated/admin/certificates/$id")({
  loader: async ({ context, params }) => {
    const row = await context.queryClient.ensureQueryData(qo(params.id));
    if (!row) throw notFound();
  },
  component: () => {
    const { id } = Route.useParams();
    const { data } = useSuspenseQuery(qo(id));
    const nav = useNavigate();
    const [pending, setPending] = useState(false);
    const [code, setCode] = useState(data?.code ?? "");
    const [codeError, setCodeError] = useState<string | null>(null);
    if (!data) return null;
    const verifyUrl = typeof window !== "undefined" ? `${window.location.origin}/verify/${data.code}` : `/verify/${data.code}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(verifyUrl)}`;
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
            id,
            code: normalizeCode(code),
            holder_name: String(fd.get("holder_name") ?? ""),
            rank: String(fd.get("rank") ?? ""),
            style_name: String(fd.get("style_name") ?? "") || null,
            country: String(fd.get("country") ?? "") || null,
            issued_on: String(fd.get("issued_on") ?? ""),
            expires_on: String(fd.get("expires_on") ?? "") || null,
            status: (String(fd.get("status") ?? "active") as "active" | "revoked" | "expired"),
            notes: String(fd.get("notes") ?? "") || null,
          },
        });
        toast.success("Saved");
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
      <AdminPage title={`Certificate ${data.code}`}>
        <div className="grid md:grid-cols-[1fr_240px] gap-6 max-w-3xl">
          <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-4">
            <TextField
              label="Code"
              name="code"
              required
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeError(null); }}
              error={codeError}
              hint="Changing the code invalidates previously printed QR codes for this certificate."
            />
            <TextField label="Holder name" name="holder_name" required defaultValue={data.holder_name} />
            <TextField label="Rank" name="rank" required defaultValue={data.rank} />
            <TextField label="Discipline" name="style_name" defaultValue={data.style_name} />
            <TextField label="Country" name="country" defaultValue={data.country} />
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Issued on" name="issued_on" type="date" required defaultValue={data.issued_on?.slice(0, 10)} />
              <TextField label="Expires on" name="expires_on" type="date" defaultValue={data.expires_on?.slice(0, 10) ?? ""} />
            </div>
            <SelectField
              label="Status"
              name="status"
              defaultValue={data.status}
              options={[
                { value: "active", label: "Active" },
                { value: "revoked", label: "Revoked" },
                { value: "expired", label: "Expired" },
              ]}
            />
            <TextArea label="Notes (internal)" name="notes" rows={4} defaultValue={data.notes} />
            <SaveBar pending={pending} cancelTo="/admin/certificates" />
          </form>
          <div className="bg-background border border-border rounded-md p-4 h-fit">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Verification QR</div>
            <img src={qrUrl} alt={`QR for ${data.code}`} className="w-full aspect-square" />
            <a href={verifyUrl} target="_blank" rel="noreferrer" className="mt-3 block text-xs text-muted-foreground break-all hover:text-foreground">
              {verifyUrl}
            </a>
          </div>
        </div>
      </AdminPage>
    );
  },
});
