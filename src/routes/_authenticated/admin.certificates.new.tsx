import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { TextField, TextArea, SelectField, SaveBar } from "@/components/admin/AdminForm";
import { adminUpsertCert } from "@/lib/admin.functions";
import { toast } from "sonner";

function suggestCode() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TBM-${year}-${rand}`;
}

export const Route = createFileRoute("/_authenticated/admin/certificates/new")({
  component: () => {
    const nav = useNavigate();
    const [pending, setPending] = useState(false);
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setPending(true);
      const fd = new FormData(e.currentTarget);
      try {
        await adminUpsertCert({
          data: {
            code: String(fd.get("code") ?? ""),
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
        toast.error(e instanceof Error ? e.message : "Save failed");
      } finally {
        setPending(false);
      }
    }
    return (
      <AdminPage title="Issue certificate">
        <form onSubmit={onSubmit} className="bg-background border border-border rounded-md p-6 space-y-4 max-w-2xl">
          <TextField label="Code" name="code" required defaultValue={suggestCode()} />
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
