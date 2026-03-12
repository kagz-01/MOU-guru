// routes/mou/init.tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import PublicLayout from "../../components/PublicLayout.tsx";
import PublicMouWizard from "../../islands/PublicMouWizard.tsx";

export const handler: Handlers = {
  GET(_req, ctx) {
    // If the user is already authenticated, redirect them straight to the full dashboard/wizard flow
    if (ctx.state.user) {
      return new Response("", {
        status: 302,
        headers: { Location: "/mou/new" },
      });
    }
    return ctx.render();
  },
};

export default function InitMOU(_props: PageProps) {
  return (
    <PublicLayout>
      <div class="max-w-7xl mx-auto py-12 md:py-20 px-8">
        <div class="text-center mb-16 animate-fade-in">
          <p class="text-xs font-black uppercase tracking-widest text-primary mb-4">
            Progressive Disclosure Initiation
          </p>
          <h1 class="text-5xl md:text-7xl font-serif font-black tracking-tighter uppercase text-balance max-w-4xl mx-auto">
            Establish Base Parameters
          </h1>
        </div>

        <PublicMouWizard />
      </div>
    </PublicLayout>
  );
}
