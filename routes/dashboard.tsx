// routes/dashboard.tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import { getConnection } from "../db/connection.ts";
import AppLayout from "../components/AppLayout.tsx";
import {
  IconAlert,
  IconDocument,
  IconHandshake,
  IconTarget,
} from "../components/Icons.tsx";

type MOUStatus = {
  status: string;
  count: number;
};

type ExpiringMOU = {
  mou_id: number;
  title: string;
  reference_no: string;
  end_date: Date;
  days_remaining: number;
};

type UpcomingMilestone = {
  milestone_id: number;
  mou_id: number;
  mou_title: string;
  title: string;
  due_date: Date;
  days_remaining: number;
};

type DashboardData = {
  statusCounts: MOUStatus[];
  expiringMOUs: ExpiringMOU[];
  upcomingMilestones: UpcomingMilestone[];
  totalMOUs: number;
  totalParties: number;
  isGuest?: boolean;
};

export const handler: Handlers<DashboardData> = {
  async GET(req, ctx) {
    const conn = await getConnection();
    try {
      const statusResult = await conn.queryObject<MOUStatus>`
        SELECT status, COUNT(*) as count FROM mous GROUP BY status ORDER BY count DESC
      `;
      const expiringResult = await conn.queryObject<ExpiringMOU>`
        SELECT mou_id, title, reference_no, end_date, (end_date - CURRENT_DATE) as days_remaining
        FROM mous WHERE status = 'Active' AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
        ORDER BY end_date ASC
      `;
      const milestonesResult = await conn.queryObject<UpcomingMilestone>`
        SELECT m.milestone_id, m.mou_id, mou.title as mou_title, m.title, m.due_date, (m.due_date - CURRENT_DATE) as days_remaining
        FROM milestones m JOIN mous mou ON m.mou_id = mou.mou_id
        WHERE m.status IN ('Pending', 'In Progress') AND m.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
        ORDER BY m.due_date ASC
      `;
      const totalResult = await conn.queryObject<
        { total_mous: number; total_parties: number }
      >`
        SELECT (SELECT COUNT(*) FROM mous) as total_mous, (SELECT COUNT(*) FROM parties) as total_parties
      `;

      return ctx.render({
        statusCounts: statusResult.rows,
        expiringMOUs: expiringResult.rows,
        upcomingMilestones: milestonesResult.rows,
        totalMOUs: totalResult.rows[0]?.total_mous || 0,
        totalParties: totalResult.rows[0]?.total_parties || 0,
        isGuest: req.url.includes("guest=true"),
      });
    } finally {
      conn.release();
    }
  },
};

export default function Dashboard({ data, state }: PageProps<DashboardData>) {
  const {
    statusCounts,
    expiringMOUs,
    upcomingMilestones,
    totalMOUs,
    totalParties,
    isGuest,
  } = data;

  return (
    <AppLayout
      user={state.user as { name: string; role: string } | undefined}
      active="dashboard"
    >
      <div class="space-y-16 pb-20">
        {isGuest || !state.user
          ? (
            <div class="glass-card bg-rose-500/10 border-rose-500 p-6 flex items-start gap-4 text-rose-500 animate-fade-in">
              <IconAlert class="w-6 h-6 mt-0.5 shrink-0" />
              <div>
                <h3 class="font-bold uppercase tracking-widest mb-1 text-sm">
                  Guest Mode
                </h3>
                <p class="text-sm font-medium">
                  Actions are restricted. Sign up for full cryptographic and
                  creation access.
                </p>
              </div>
            </div>
          )
          : null}

        {/* Typographical Brutalism Hero */}
        <header class="animate-fade-in border-b-4 border-foreground pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 class="text-6xl md:text-8xl font-serif font-black tracking-tighter uppercase leading-none">
              Command<br />Center.
            </h1>
            <p class="text-xl md:text-2xl font-bold text-muted-foreground mt-6 uppercase tracking-widest max-w-2xl">
              Strategic Protocol Oversight
            </p>
          </div>
          <div class="shrink-0 flex items-center justify-end">
            <a
              href="/mou/new"
              class="btn text-lg py-4 px-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)]"
            >
              + Initialize Protocol
            </a>
          </div>
        </header>

        {/* Full-width Stacked Layout instead of Bento Grid */}
        <div class="space-y-12">
          {/* Aggregate Data Flow */}
          <section class="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h2 class="text-3xl font-serif font-bold uppercase tracking-tighter border-l-4 border-primary pl-4 mb-8">
              Protocol Statistics
            </h2>
            <div class="flex flex-col lg:flex-row gap-6">
              <div class="glass-card flex-1 p-8 border-t-8 border-t-primary relative overflow-hidden group">
                <IconDocument class="w-32 h-32 absolute -right-4 -bottom-4 text-primary opacity-10 group-hover:opacity-20 transition-opacity" />
                <h3 class="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Total Agreements
                </h3>
                <div class="text-7xl font-sans font-black mt-4">
                  {totalMOUs}
                </div>
              </div>
              <div class="glass-card flex-1 p-8 border-t-8 border-t-secondary relative overflow-hidden group">
                <IconHandshake class="w-32 h-32 absolute -right-4 -bottom-4 text-secondary opacity-10 group-hover:opacity-20 transition-opacity" />
                <h3 class="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Active Entities
                </h3>
                <div class="text-7xl font-sans font-black mt-4">
                  {totalParties}
                </div>
              </div>
            </div>

            <div class="mt-6 glass-card p-8">
              <h3 class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
                Status Distribution Flow
              </h3>
              <div class="flex flex-col gap-4">
                {statusCounts.map((status) => {
                  const percentage = Math.max(
                    2,
                    (status.count / totalMOUs) * 100,
                  );
                  return (
                    <div
                      key={status.status}
                      class="relative w-full h-16 bg-muted flex border-2 border-border overflow-hidden group"
                    >
                      <div
                        class={`h-full transition-all duration-1000 ease-out flex items-center bg-primary border-r-2 border-border`}
                        style={{ width: `${percentage}%` }}
                      >
                      </div>
                      <div class="absolute inset-0 flex justify-between items-center px-6 pointer-events-none mix-blend-difference text-white">
                        <span class={`font-bold uppercase tracking-widest`}>
                          {status.status}
                        </span>
                        <span class="font-black text-2xl">{status.count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Extreme Asymmetry Timeline Track */}
          <section
            class="animate-slide-up bg-foreground text-background p-8 md:p-12 -mx-8 md:-mx-12 border-y-2 border-border"
            style={{ animationDelay: "200ms" }}
          >
            <div class="flex flex-col md:flex-row gap-12 max-w-7xl mx-auto">
              {/* Massive 30% Column */}
              <div class="w-full md:w-1/3 shrink-0 space-y-4">
                <IconTarget class="w-16 h-16 text-background mb-6" />
                <h2 class="text-4xl font-serif font-black uppercase tracking-tighter leading-tight">
                  Critical <br /> Deadlines
                </h2>
                <p class="text-sm font-bold uppercase tracking-widest opacity-70">
                  Immediate attention required for the following protocol
                  operations.
                </p>
              </div>

              {/* 70% Horizontal/Vertical Flow List */}
              <div class="w-full md:w-2/3 flex flex-col gap-6">
                {expiringMOUs.length === 0 && upcomingMilestones.length === 0
                  ? (
                    <div class="border-2 border-background/20 p-8 flex items-center justify-center">
                      <p class="font-bold uppercase tracking-widest opacity-50">
                        Zero active alerts in queue.
                      </p>
                    </div>
                  )
                  : (
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Expiring MOUs */}
                      {expiringMOUs.map((mou) => (
                        <a
                          key={mou.mou_id}
                          href={`/mou/${mou.mou_id}`}
                          class="border-2 border-background p-6 hover:bg-background hover:text-foreground transition-colors group block"
                        >
                          <div class="flex justify-between items-start mb-6">
                            <span class="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-rose-500 text-white border-2 border-transparent group-hover:border-foreground">
                              Expiring
                            </span>
                            <span class="text-3xl font-black">
                              {mou.days_remaining}D
                            </span>
                          </div>
                          <h4
                            class="font-bold text-lg mb-2 truncate"
                            title={mou.title}
                          >
                            {mou.title}
                          </h4>
                          <span class="font-mono text-xs opacity-70">
                            {mou.reference_no}
                          </span>
                        </a>
                      ))}

                      {/* Milestones */}
                      {upcomingMilestones.map((milestone) => (
                        <div
                          key={milestone.milestone_id}
                          class="border-2 border-background/50 p-6 opacity-80 hover:opacity-100 transition-opacity"
                        >
                          <div class="flex justify-between items-start mb-6">
                            <span class="text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-background">
                              Milestone
                            </span>
                            <span class="text-3xl font-black">
                              {milestone.days_remaining}D
                            </span>
                          </div>
                          <h4 class="font-bold text-lg mb-2">
                            {milestone.title}
                          </h4>
                          <span
                            class="font-mono text-xs opacity-70 uppercase truncate block"
                            title={milestone.mou_title}
                          >
                            {milestone.mou_title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
