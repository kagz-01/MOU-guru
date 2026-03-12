// components/AppLayout.tsx
import { ComponentChildren } from "preact";
import ThemeToggle from "../islands/ThemeToggle.tsx";
import {
  IconDashboard,
  IconDocument,
  IconHandshake,
  IconUsers,
} from "./Icons.tsx";

type AppLayoutProps = {
  children: ComponentChildren;
  user?: {
    name: string;
    role: string;
  };
  active?: string;
};

export default function AppLayout(
  { children, user, active = "dashboard" }: AppLayoutProps,
) {
  const navItems = [
    {
      label: "Command Center",
      href: "/dashboard",
      id: "dashboard",
      icon: <IconDashboard class="w-6 h-6" />,
    },
    {
      label: "Active Protocols",
      href: "/dashboard",
      id: "mous",
      icon: <IconDocument class="w-6 h-6" />,
    },
    {
      label: "Entity Directory",
      href: "/parties",
      id: "parties",
      icon: <IconHandshake class="w-6 h-6" />,
    },
  ];

  if (user?.role === "admin") {
    navItems.push({
      label: "System Access",
      href: "/admin/users",
      id: "users",
      icon: <IconUsers class="w-6 h-6" />,
    });
  }

  return (
    <div class="flex flex-col min-h-screen selection:bg-primary selection:text-primary-foreground bg-secondary/10 font-sans">
      {/* Minimal Top Bar for App */}
      <header class="flex justify-between items-center px-6 py-3 bg-background border-b-2 border-border sticky top-0 z-50 shadow-sm">
        <div class="flex items-center gap-4">
          <a
            href="/dashboard"
            class="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center border-2 border-primary font-serif font-black text-xl hover:bg-transparent hover:text-primary transition-colors"
          >
            M//G
          </a>
          <span class="text-xs font-black uppercase tracking-widest text-muted-foreground border-l-2 border-border pl-4 hidden md:block">
            Secure Node Array
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-6">
          <div class="flex flex-col items-end">
            <span class="font-bold text-sm leading-none">{user?.name}</span>
            <span class="text-[10px] uppercase tracking-widest text-primary font-black mt-1">
              [ {user?.role} ]
            </span>
          </div>
          <div class="h-8 w-[2px] bg-border mx-2"></div>
          <ThemeToggle />
          <div class="h-8 w-[2px] bg-border mx-2"></div>
          <a
            href="/logout"
            class="text-xs border-2 border-border px-4 py-2 font-bold uppercase tracking-wider text-muted-foreground hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors"
          >
            Disconnect
          </a>
        </div>
      </header>

      <div class="flex flex-1 overflow-hidden">
        {/* Typographically Dense Sidebar */}
        <nav class="w-[280px] bg-background border-r-2 border-border py-8 px-6 hidden md:block overflow-y-auto">
          <h2 class="text-[10px] font-black font-mono uppercase tracking-widest text-muted-foreground mb-6 opacity-60">
            // Core Navigation
          </h2>
          <ul class="space-y-4">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  class={`flex items-center gap-4 px-4 py-4 border-2 transition-all duration-300 cursor-pointer group ${
                    active === item.id
                      ? "bg-foreground text-background border-foreground shadow-[4px_4px_0px_0px_currentColor] translate-y-[-2px] translate-x-[-2px]"
                      : "bg-transparent text-muted-foreground border-transparent hover:border-border hover:text-foreground"
                  }`}
                >
                  <span
                    class={`opacity-70 ${
                      active === item.id
                        ? "text-background"
                        : "group-hover:text-foreground"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span class="font-bold uppercase tracking-wider text-sm">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content Area */}
        <main class="flex-1 p-6 md:p-10 lg:p-12 animate-fade-in overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
