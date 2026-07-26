import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { AdminPage } from "@/components/admin/AdminShell";
import { adminListMemberships } from "@/lib/admin.functions";

const qo = queryOptions({ queryKey: ["admin", "memberships"], queryFn: () => adminListMemberships() });

export const Route = createFileRoute("/_authenticated/admin/memberships")({
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: () => {
    const { data } = useSuspenseQuery(qo);
    return (
      <AdminPage title="Membership applications" description="Applications submitted from the public membership page.">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground border border-dashed rounded-md p-10 text-center">No applications yet.</p>
        ) : (
          <div className="space-y-3">
            {data.map((m) => (
              <article key={m.id} className="bg-background border border-border rounded-md p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <div className="font-medium">{m.full_name}</div>
                    <a href={`mailto:${m.email}`} className="text-sm text-muted-foreground hover:text-foreground">{m.email}</a>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
                    <div className="text-xs mt-1">
                      <span className="px-2 py-0.5 rounded-sm bg-muted text-muted-foreground uppercase tracking-widest">{m.tier}</span>
                      {m.country ? <span className="ml-2">{m.country}</span> : null}
                    </div>
                  </div>
                </div>
                {m.message ? <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{m.message}</p> : null}
              </article>
            ))}
          </div>
        )}
      </AdminPage>
    );
  },
});
