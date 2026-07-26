import { Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function TextField({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number | null;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
        className="w-full py-2 px-3 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  rows = 5,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  rows?: number;
  required?: boolean;
  defaultValue?: string | null;
}) {
  return (
    <label className="block text-sm">
      <span className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">{label}</span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue ?? undefined}
        className="w-full py-2 px-3 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground/30 font-mono text-[13px]"
      />
    </label>
  );
}

export function CheckField({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="size-4 rounded-sm" />
      <span>{label}</span>
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full py-2 px-3 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SaveBar({ pending, cancelTo }: { pending: boolean; cancelTo: string }) {
  return (
    <div className="flex justify-end gap-2 pt-4 border-t border-border">
      <Link to={cancelTo} className="px-4 py-2 rounded-sm text-sm font-medium hover:bg-accent">
        Cancel
      </Link>
      <button disabled={pending} className="px-5 py-2 rounded-sm text-sm font-medium bg-foreground text-background disabled:opacity-60">
        {pending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  editTo,
  onDelete,
  empty,
}: {
  rows: T[];
  columns: { header: string; cell: (row: T) => React.ReactNode }[];
  editTo: (row: T) => string;
  onDelete?: (row: T) => Promise<void>;
  empty?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground border border-dashed border-border rounded-md p-10 text-center">{empty ?? "No records yet."}</p>;
  }
  return (
    <div className="bg-background border border-border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            {columns.map((c) => (
              <th key={c.header} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {c.header}
              </th>
            ))}
            <th className="px-4 py-3 w-24" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-muted/30">
              {columns.map((c, i) => (
                <td key={i} className="px-4 py-3">{c.cell(r)}</td>
              ))}
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link to={editTo(r)} className="p-2 rounded-sm hover:bg-accent" aria-label="Edit">
                    <Pencil className="size-3.5" />
                  </Link>
                  {onDelete ? (
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this record?")) return;
                        try {
                          await onDelete(r);
                          toast.success("Deleted");
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Delete failed");
                        }
                      }}
                      className="p-2 rounded-sm hover:bg-destructive/10 text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
