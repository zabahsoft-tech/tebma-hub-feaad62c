import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { verifyCertificate } from "@/lib/public.functions";
import { CheckCircle2, XCircle } from "lucide-react";

const qo = (code: string) =>
  queryOptions({ queryKey: ["cert", code], queryFn: () => verifyCertificate({ data: { code } }) });

export const Route = createFileRoute("/verify/$code")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(qo(params.code)),
  head: ({ params }) => ({
    meta: [
      { title: `Verify ${params.code} — World TEBMA Federation` },
      { name: "description", content: "Certificate verification result from the World TEBMA Federation." },
      { name: "robots", content: "noindex" },
      { property: "og:url", content: `/verify/${params.code}` },
    ],
    links: [{ rel: "canonical", href: `/verify/${params.code}` }],
  }),
  component: VerifyResult,
  pendingComponent: () => (
    <PageShell>
      <section className="max-w-2xl mx-auto px-6 py-20">
        <div className="border border-border rounded-md p-10 text-center text-sm text-muted-foreground">
          Checking the federation registry…
        </div>
      </section>
    </PageShell>
  ),
  errorComponent: () => (
    <PageShell>
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <XCircle className="size-8 text-destructive mx-auto" />
        <h1 className="mt-4 text-2xl font-medium tracking-tight">Verification unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't reach the certificate registry. Please try again in a moment.
        </p>
        <Link to="/verify" className="mt-6 inline-block border border-border rounded-sm px-4 py-2.5 text-sm hover:bg-accent">
          Back to verification
        </Link>
      </section>
    </PageShell>
  ),
});

function VerifyResult() {
  const { code } = Route.useParams();
  const { data } = useSuspenseQuery(qo(code));
  return (
    <PageShell>
      <section className="max-w-2xl mx-auto px-6 py-20">
        <Link to="/verify" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">← Verify another</Link>
        {data.found ? (
          <div className="mt-8 border border-border rounded-md overflow-hidden">
            <div className={`p-6 flex items-center gap-3 ${data.certificate.status === "revoked" ? "bg-destructive/10" : "bg-emerald-500/10"}`}>
              {data.certificate.status === "revoked" ? (
                <XCircle className="size-6 text-destructive" />
              ) : (
                <CheckCircle2 className="size-6 text-emerald-700" />
              )}
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Certificate</div>
                <div className="font-medium">
                  {data.certificate.status === "revoked" ? "Revoked" : data.certificate.status === "expired" ? "Expired" : "Authentic & Valid"}
                </div>
              </div>
            </div>
            <dl className="divide-y divide-border">
              <Row label="Code" value={data.certificate.code} />
              <Row label="Holder" value={data.certificate.holder_name} />
              <Row label="Rank" value={data.certificate.rank ?? "—"} />
              <Row label="Discipline" value={data.certificate.style_name ?? "—"} />
              {data.certificate.country ? <Row label="Country" value={data.certificate.country} /> : null}
              <Row label="Issued" value={new Date(data.certificate.issued_on).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
              {data.certificate.expires_on ? (
                <Row label="Expires" value={new Date(data.certificate.expires_on).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
              ) : null}
            </dl>
          </div>
        ) : (
          <div className="mt-8 border border-border rounded-md p-8 text-center">
            <XCircle className="size-8 text-destructive mx-auto" />
            <h1 className="mt-4 text-2xl font-medium tracking-tight">No matching certificate</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The code <span className="font-mono">{code}</span> was not found in the federation registry. Please double-check the code or contact the office.
            </p>
          </div>
        )}
      </section>
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 px-6 py-4">
      <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm">{value}</dd>
    </div>
  );
}
