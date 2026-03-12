// routes/index.tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import PublicLayout from "../components/PublicLayout.tsx";
import { IconAlert, IconDocument, IconTarget } from "../components/Icons.tsx";

export const handler: Handlers = {
  GET(_, ctx) {
    return ctx.render();
  },
};

export default function Home(_props: PageProps) {
  return (
    <PublicLayout>
      <div class="max-w-7xl mx-auto space-y-32 pb-32">
        {/* Brutalist Hero Section */}
        <section class="relative pt-12">
          <div class="relative z-10 space-y-8 animate-slide-up border-b-4 border-foreground pb-12">
            <h1 class="text-7xl md:text-[9rem] leading-[0.85] font-extrabold font-serif tracking-tighter uppercase">
              Strategic<br />
              <span class="[-webkit-text-stroke:2px_currentColor] text-transparent hover:text-primary transition-colors duration-500">
                Precision
              </span>
            </h1>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
              <p class="text-2xl font-serif text-muted-foreground leading-relaxed balance-text">
                The absolute standard for enterprise organizations to establish,
                enforce, and log Memoranda of Understanding with zero ambiguity.
              </p>
              <div class="flex flex-col sm:flex-row items-start md:justify-end gap-6 pt-2">
                <a
                  href="/signup"
                  class="btn text-xl px-12 py-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)]"
                >
                  Initialize
                </a>
                <a
                  href="/dashboard?guest=true"
                  class="btn-outline text-xl px-12 py-6"
                >
                  Demo
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Flow - No Safe Borders */}
        <section class="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-foreground bg-foreground text-background">
          {[
            {
              title: "Agreement Tracking",
              desc:
                "Centralize mapping of all MOU records with deterministic state changes and version control.",
              icon: <IconDocument class="w-12 h-12" />,
            },
            {
              title: "Milestone Alerts",
              desc:
                "Algorithmically calculated, timezone-aware directives for critical project expirations.",
              icon: <IconAlert class="w-12 h-12" />,
            },
            {
              title: "Hardened Audit",
              desc:
                "Cryptographic traceability of every protocol modification, signatory change, and asset injection.",
              icon: <IconTarget class="w-12 h-12" />,
            },
          ].map((feature, i) => (
            <div
              key={i}
              class={`p-10 space-y-6 hover:bg-background hover:text-foreground transition-colors duration-500 group ${
                i !== 2 ? "border-b-4 md:border-b-0 md:border-r-4" : ""
              } border-background`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div class="w-16 h-16 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:-translate-y-2 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 class="text-2xl font-serif font-black uppercase tracking-tighter">
                {feature.title}
              </h3>
              <p class="font-sans font-bold opacity-80 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </section>

        {/* Call to Action - Monolithic Slab */}
        <section class="p-16 md:p-24 text-center bg-primary text-primary-foreground border-4 border-foreground shadow-[16px_16px_0px_0px_currentColor]">
          <div class="space-y-8 max-w-4xl mx-auto">
            <h2 class="text-5xl md:text-7xl font-serif font-black uppercase tracking-tighter leading-none">
              Deploy <br /> Standard Protocols
            </h2>
            <p class="text-xl font-bold opacity-80 max-w-2xl mx-auto uppercase tracking-widest">
              Join infrastructure teams that have completely eliminated
              administrative drift across multi-party agreements.
            </p>
            <div class="pt-8 block">
              <a
                href="/signup"
                class="inline-block bg-background text-foreground border-4 border-background hover:bg-transparent hover:text-background font-black uppercase tracking-widest text-2xl px-16 py-6 transition-all duration-300 active:scale-95"
              >
                Execute
              </a>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
