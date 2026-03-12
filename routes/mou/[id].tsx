import { Handlers, PageProps } from "$fresh/server.ts";
import { getMOUById, MOU } from "../../db/models/mou.ts";
import AppLayout from "../../components/AppLayout.tsx";
import Accordion from "../../islands/Accordion.tsx";
import {
  IconActivity,
  IconDocument,
  IconHandshake,
  IconPaperclip,
  IconTarget,
  IconUsers,
} from "../../components/Icons.tsx";

export const handler: Handlers<MOU | null> = {
  async GET(_, ctx) {
    const { id } = ctx.params;
    const mou = await getMOUById(Number(id));
    if (!mou) {
      return ctx.renderNotFound();
    }
    return ctx.render(mou);
  },
};

export default function MOUView({ data, state }: PageProps<MOU>) {
  if (!data) return <div>MOU Not found</div>;

  const statusColors: Record<string, string> = {
    "Draft": "status-draft",
    "Active": "status-active",
    "Pending Approval": "status-pending-approval",
    "Expired": "status-expired",
    "Terminated": "status-terminated",
    "Renewed": "status-renewed",
  };

  const badgeClass = statusColors[data.status] || "status-draft";

  return (
    <AppLayout
      user={state.user as { name: string; role: string } | undefined}
      active="mous"
    >
      <div class="max-w-7xl mx-auto py-8">
        {/* Typographic Brutalist Header */}
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 animate-fade-in border-b-4 border-foreground pb-8">
          <div>
            <a
              href="/dashboard"
              class="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-4 block"
            >
              ← Return to Base
            </a>
            <div class="flex items-center gap-4 mb-6">
              <span class={`status-badge ${badgeClass}`}>
                {data.status}
              </span>
              <span class="text-xs font-black font-mono text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 border border-border">
                REF // {data.reference_no}
              </span>
            </div>
            <h1 class="text-5xl md:text-7xl font-extrabold font-serif tracking-tighter uppercase leading-none max-w-4xl">
              {data.title}
            </h1>
          </div>

          <div class="flex gap-4 shrink-0">
            <button
              type="button"
              class="btn-outline"
            >
              Edit Specs
            </button>
            <button
              type="button"
              class="btn"
            >
              Request TX
            </button>
          </div>
        </div>

        {/* Dense Asymmetric Grid */}
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Metadata / Ops Column (25%) */}
          <div
            class="lg:col-span-1 space-y-8 animate-slide-up bg-muted p-8 border-2 border-border"
            style={{ animationDelay: "100ms" }}
          >
            <div class="space-y-6">
              <h3 class="font-bold text-sm uppercase tracking-widest border-b-2 border-border pb-2 flex items-center justify-between">
                <span>Timeline</span>
                <IconActivity class="w-4 h-4" />
              </h3>
              <div class="space-y-4">
                <div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Initiation
                  </p>
                  <p class="font-medium font-serif text-lg">
                    {new Date(data.start_date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">
                    Conclusion
                  </p>
                  <p class="font-medium font-serif text-lg text-rose-400">
                    {new Date(data.end_date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-6 pt-4">
              <h3 class="font-bold text-sm uppercase tracking-widest border-b-2 border-border pb-2 flex items-center justify-between">
                <span>Directives</span>
                <IconDocument class="w-4 h-4" />
              </h3>
              <div class="flex flex-col gap-3">
                <a
                  href={`/mou/${data.mou_id}/parties`}
                  class="flex items-center justify-between p-4 bg-background border-2 border-border hover:border-primary hover:text-primary transition-all group"
                >
                  <span class="text-xs font-bold uppercase tracking-widest">
                    Parties
                  </span>
                  <IconUsers class="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                </a>
                <a
                  href={`/mou/${data.mou_id}/milestones`}
                  class="flex items-center justify-between p-4 bg-background border-2 border-border hover:border-primary hover:text-primary transition-all group"
                >
                  <span class="text-xs font-bold uppercase tracking-widest">
                    Milestones
                  </span>
                  <IconTarget class="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                </a>
                <a
                  href={`/mou/${data.mou_id}/attachments`}
                  class="flex items-center justify-between p-4 bg-background border-2 border-border hover:border-primary hover:text-primary transition-all group"
                >
                  <span class="text-xs font-bold uppercase tracking-widest">
                    Assets
                  </span>
                  <IconPaperclip class="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Main Content Column (75%) */}
          <div
            class="lg:col-span-3 space-y-8 animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            <div class="glass-card p-8 md:p-12 mb-8 bg-black/40 text-white">
              <h2 class="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 border-l-4 border-primary pl-4">
                Primary Overview
              </h2>
              <p class="text-xl md:text-2xl font-serif leading-relaxed text-balance">
                {data.description ||
                  "No strategic overview provided for this documentation."}
              </p>
            </div>

            {/* Accordion Sections replacing soft boxes with rigid lines */}
            <div class="space-y-2">
              <h2 class="text-2xl font-black font-serif uppercase tracking-tighter mb-6 flex items-center justify-between border-b-4 border-foreground pb-2">
                <span>Legal Parameters</span>
                <IconHandshake class="w-6 h-6" />
              </h2>

              <Accordion
                title="Jurisdiction & Clearance"
                defaultOpen
              >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                  <div>
                    <strong class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                      Governing Law
                    </strong>
                    <p class="font-serif text-lg">
                      {data.governing_law || "Not specified."}
                    </p>
                  </div>
                  <div>
                    <strong class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                      Clearance Level
                    </strong>
                    <div class="mt-1">
                      {data.confidentiality
                        ? (
                          <span class="px-3 py-1 font-serif text-rose-500 border border-current">
                            Level: RESTRICTED
                          </span>
                        )
                        : (
                          <span class="px-3 py-1 font-serif text-emerald-500 border border-current">
                            Level: UNCLASSIFIED
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </Accordion>

              <Accordion title="Intellectual Property Distribution">
                <div class="py-4">
                  <p class="whitespace-pre-wrap font-serif text-lg leading-relaxed border-l-2 border-border pl-6">
                    {data.ip_terms ||
                      "Standard IP execution terms apply. Zero deviations authorized."}
                  </p>
                </div>
              </Accordion>

              <Accordion title="Termination Protocols">
                <div class="grid md:grid-cols-2 gap-8 py-4">
                  <div class="p-6 border-2 border-border">
                    <strong class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                      Renewal Conditions
                    </strong>
                    <p class="font-serif">
                      {data.renewal_terms || "Unspecified."}
                    </p>
                  </div>
                  <div class="p-6 border-2 border-rose-900 bg-rose-950/20">
                    <strong class="block text-[10px] font-black uppercase tracking-widest text-rose-500 mb-3">
                      Termination Trigger
                    </strong>
                    <p class="font-serif text-rose-200">
                      {data.termination_clause || "Unspecified."}
                    </p>
                  </div>
                </div>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
