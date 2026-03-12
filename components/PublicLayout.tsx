// components/PublicLayout.tsx
import { ComponentChildren } from "preact";
import ThemeToggle from "../islands/ThemeToggle.tsx";

type PublicLayoutProps = {
  children: ComponentChildren;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div class="flex flex-col min-h-screen selection:bg-primary selection:text-primary-foreground font-sans">
      {/* Brutalist Marketing Header */}
      <header class="flex justify-between items-center px-8 md:px-12 py-6 bg-background border-b-4 border-foreground sticky top-0 z-50">
        <div class="flex items-center gap-6">
          <div class="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center border-4 border-primary font-serif font-black text-2xl tracking-tighter">
            M//G
          </div>
          <a
            href="/"
            class="text-3xl font-serif tracking-tighter font-extrabold text-foreground"
          >
            MOU Guru
          </a>
        </div>

        <div class="hidden md:flex items-center gap-8">
          <a
            href="#features"
            class="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors"
          >
            Platform
          </a>
          <a
            href="#pricing"
            class="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors"
          >
            Scale
          </a>
          <div class="h-6 w-1 bg-border mx-2"></div>
          <a
            href="/login"
            class="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors cursor-pointer"
          >
            Portal Login
          </a>
          <div class="flex items-center gap-4">
            <ThemeToggle />
            <a href="/mou/init" class="btn">Initialize Flow</a>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden">
        {children}
      </main>

      {/* Massive Brutalist Footer */}
      <footer class="bg-foreground text-background py-20 px-8 md:px-12 border-t-8 border-primary">
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div class="space-y-6">
            <div class="flex items-center gap-6 mb-8">
              <div class="w-16 h-16 bg-background text-foreground flex items-center justify-center font-serif font-black text-3xl tracking-tighter">
                M//G
              </div>
              <span class="text-5xl font-serif tracking-tighter font-extrabold">
                MOU Guru
              </span>
            </div>
            <h3 class="text-3xl md:text-5xl font-serif font-black uppercase tracking-tighter text-primary">
              Strategic Agreements.<br />
              <span class="text-background">Zero Ambiguity.</span>
            </h3>
            <p class="text-sm font-bold uppercase tracking-widest opacity-70 max-w-sm mt-8">
              The deterministic protocol standard for multi-party execution.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-8 md:justify-end text-sm font-bold uppercase tracking-widest opacity-80">
            <div class="space-y-6 flex flex-col">
              <p class="opacity-50 mb-4 border-b-2 border-background/20 pb-2 inline-block">
                Infrastructure
              </p>
              <a href="#" class="hover:text-primary transition-colors">
                Signatory Platform
              </a>
              <a href="#" class="hover:text-primary transition-colors">
                Cryptographic Audit
              </a>
              <a href="#" class="hover:text-primary transition-colors">
                Directory API
              </a>
            </div>
            <div class="space-y-6 flex flex-col">
              <p class="opacity-50 mb-4 border-b-2 border-background/20 pb-2 inline-block">
                Legal Hub
              </p>
              <a href="#" class="hover:text-primary transition-colors">
                Terms of Protocol
              </a>
              <a href="#" class="hover:text-primary transition-colors">
                Privacy Standard
              </a>
              <a href="#" class="hover:text-primary transition-colors">
                Compliance Matrix
              </a>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto mt-20 pt-8 border-t-2 border-background/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-xs font-black uppercase tracking-widest opacity-50">
            &copy; {new Date().getFullYear()} Protocol Development LLC
          </p>
          <p class="text-xs font-black uppercase tracking-widest opacity-50">
            Global Hub // NYC
          </p>
        </div>
      </footer>
    </div>
  );
}
