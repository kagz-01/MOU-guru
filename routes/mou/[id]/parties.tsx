// routes/mou/[id]/parties.tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import { getMOUById, MOU } from "../../../db/models/mou.ts";
import AppLayout from "../../../components/AppLayout.tsx";
import PartyManager from "../../../islands/PartyManager.tsx";

export const handler: Handlers<MOU | null> = {
  async GET(_, ctx) {
    const { id } = ctx.params;
    const mou = await getMOUById(Number(id));
    if (!mou) return ctx.renderNotFound();
    return ctx.render(mou);
  },
};

export default function MOUPartiesView({ data, state }: PageProps<MOU>) {
  if (!data) return <div>MOU Not found</div>;

  return (
    <AppLayout
      user={state.user as { name: string; role: string } | undefined}
      active="mous"
    >
      <div class="max-w-4xl mx-auto py-8">
        {/* Navigation & Actions Header */}
        <div class="mb-8">
          <a
            href={`/mou/${data.mou_id}`}
            class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 w-fit bg-secondary py-2 px-4 rounded-full"
          >
            <span>←</span> Back to Hub Center
          </a>
        </div>

        <div class="mb-10 animate-slide-up">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest bg-secondary px-2 py-1 rounded-md">
              {data.reference_no}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border text-emerald-600 bg-emerald-50 border-emerald-200">
              Editing Parties
            </span>
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Manage Organizations
          </h1>
          <p class="text-muted-foreground mt-2 text-lg">
            Attach internal divisions, parent companies, or third-party vendors
            to <strong class="text-foreground">{data.title}</strong>.
          </p>
        </div>

        {/* Client-side Manager Component */}
        <PartyManager mouId={data.mou_id} />
      </div>
    </AppLayout>
  );
}
