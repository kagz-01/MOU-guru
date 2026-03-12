// routes/mou/new.tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import AppLayout from "../../components/AppLayout.tsx";
import MouWizard from "../../islands/MouWizard.tsx";

export const handler: Handlers = {
  GET(_, ctx) {
    return ctx.render();
  },
};

export default function NewMOU({ state }: PageProps) {
  return (
    <AppLayout
      user={state.user as { name: string; role: string } | undefined}
      active="mous"
    >
      <div class="max-w-5xl mx-auto py-8">
        <div class="mb-8">
          <a
            href="/dashboard"
            class="text-sm text-primary hover:underline flex items-center gap-2 font-medium"
          >
            <span>←</span> Back to Dashboard
          </a>
        </div>

        <MouWizard />
      </div>
    </AppLayout>
  );
}
