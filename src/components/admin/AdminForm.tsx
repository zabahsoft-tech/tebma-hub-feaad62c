import { Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function TextField({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  value,
  placeholder,
  maxLength,
  onChange,
  error,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number | null;
  value?: string | number;
  placeholder?: string;
  maxLength?: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  error?: string | null;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        {...(value !== undefined ? { value } : { defaultValue: defaultValue ?? undefined })}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        className={`w-full py-2 px-3 bg-background border rounded-sm focus:outline-none focus:ring-1 ${
          error ? "border-destructive focus:ring-destructive/40" : "border-border focus:ring-foreground/30"
        }`}
      />
      {error ? (
        <span className="mt-1 block text-xs text-destructive">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
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
                  {onDelete ? <DeleteButton row={r} onDelete={onDelete} /> : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeleteButton<T extends { id: string }>({ row, onDelete }: { row: T; onDelete: (row: T) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          className="p-2 rounded-sm hover:bg-destructive/10 text-destructive"
          aria-label="Delete"
        >
          <Trash2 className="size-3.5" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this record?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The record will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={async (e) => {
              e.preventDefault();
              setPending(true);
              try {
                await onDelete(row);
                toast.success("Deleted");
                setOpen(false);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Delete failed");
              } finally {
                setPending(false);
              }
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
