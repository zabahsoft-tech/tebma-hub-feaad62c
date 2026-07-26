import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { AdminPage } from "@/components/admin/AdminShell";
import { adminListContact } from "@/lib/admin.functions";

const qo = queryOptions({ queryKey: ["admin", "messages"], queryFn: () => adminListContact() });

export const Route = createFileRoute("/_authenticated/admin/messages")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: () => {
    const { data } = useSuspenseQuery(qo);
    return (
      <AdminPage title="Contact messages" description="Messages submitted from the public contact form.">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground border border-dashed rounded-md p-10 text-center">No messages yet.</p>
        ) : (
          <div className="space-y-3">
            {data.map((m) => (
              <article key={m.id} className="bg-background border border-border rounded-md p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <a href={`mailto:${m.email}`} className="text-sm text-muted-foreground hover:text-foreground">{m.email}</a>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
                </div>
                {m.subject ? <div className="mt-2 text-sm font-medium">{m.subject}</div> : null}
                <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{m.message}</p>
              </article>
            ))}
          </div>
        )}
      </AdminPage>
    );
  },
});
