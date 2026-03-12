import { Handlers, PageProps } from "$fresh/server.ts";
import { getAllParties, Party } from "../db/models/party.ts";
import AppLayout from "../components/AppLayout.tsx";
import { IconHandshake } from "../components/Icons.tsx";

type PartiesData = {
  parties: Party[];
};

export const handler: Handlers<PartiesData> = {
  async GET(_, ctx) {
    try {
      const parties = await getAllParties();
      return ctx.render({ parties });
    } catch (err) {
      console.error("Failed to fetch parties:", err);
      return ctx.render({ parties: [] });
    }
  },
};

export default function Parties({ data, state }: PageProps<PartiesData>) {
  const { parties } = data;

  return (
    <AppLayout 
      user={state.user as { name: string; role: string } | undefined} 
      active="parties"
    >
      <div class="space-y-12 pb-20">
        <header class="animate-fade-in border-b-4 border-foreground pb-8">
          <h1 class="text-6xl md:text-8xl font-serif font-black tracking-tighter uppercase leading-none">
            Entity<br />Directory.
          </h1>
          <p class="text-xl md:text-2xl font-bold text-muted-foreground mt-6 uppercase tracking-widest">
            Registered Legal Nodes
          </p>
        </header>

        <section class="animate-slide-up">
          {parties.length === 0 ? (
            <div class="glass-card p-12 border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-center">
              <IconHandshake class="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
              <h3 class="font-bold uppercase tracking-widest text-lg">No Entities Found</h3>
              <p class="text-sm text-muted-foreground mt-2 max-w-sm">
                The protocol network is currently empty. Initialize new entities via the MOU wizard to populate this array.
              </p>
            </div>
          ) : (
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {parties.map((party) => (
                <div key={party.party_id} class="glass-card p-8 group border-l-8 border-l-primary hover:translate-x-2 transition-transform duration-300">
                  <div class="flex justify-between items-start mb-4">
                    <span class="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-secondary text-secondary-foreground">
                      {party.type || "External Entity"}
                    </span>
                    <span class="font-mono text-[10px] opacity-50">NODE_ID: {party.party_id}</span>
                  </div>
                  <h3 class="text-3xl font-serif font-black uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">
                    {party.name}
                  </h3>
                  <p class="text-sm text-muted-foreground font-medium line-clamp-2">
                    {party.address || "No secondary address coordinates provided."}
                  </p>
                  
                  <div class="mt-8 pt-6 border-t border-border flex justify-between items-center">
                    <button type="button" class="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">
                      View Protocol History {"->"}
                    </button>
                    <div class="flex gap-2">
                       <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                       <span class="text-[8px] font-bold uppercase tracking-tighter">Status: Verified</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
