import { Head } from "$fresh/runtime.ts";

export default function Error404() {
  return (
    <>
      <Head>
        <title>PROTOCOL BREACH - 404</title>
      </Head>
      <div class="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
        <div class="max-w-4xl w-full text-center space-y-12">
          {/* Brutalist Warning Header */}
          <div class="animate-fade-in">
             <div class="inline-block border-4 border-foreground p-4 mb-8">
               <span class="text-4xl md:text-6xl font-serif font-black tracking-tighter uppercase">ERROR: 0x404</span>
             </div>
             <h1 class="text-6xl md:text-9xl font-serif font-black tracking-tighter uppercase leading-none border-b-8 border-foreground pb-4">
               Protocol<br />Breached.
             </h1>
          </div>

          <div class="flex flex-col md:flex-row items-center justify-center gap-12 animate-slide-up" style={{ animationDelay: "200ms" }}>
            {/* The Creative Element: A glitchy looking protocol document */}
            <div class="relative w-64 h-80 bg-muted/20 border-2 border-border p-6 shadow-[16px_16px_0px_0px_currentColor] group overflow-hidden">
               <div class="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
               <div class="space-y-4 opacity-40">
                 <div class="h-4 bg-foreground/20 w-3/4"></div>
                 <div class="h-4 bg-foreground/10 w-full"></div>
                 <div class="h-4 bg-foreground/20 w-1/2"></div>
                 <div class="h-4 bg-foreground/10 w-full"></div>
                 <div class="h-32 border-2 border-dashed border-foreground/20 flex items-center justify-center font-mono text-[10px]">
                   [ NULL_SEQUENCE_ERROR ]
                 </div>
                 <div class="h-4 bg-rose-500/20 w-full animate-pulse"></div>
               </div>
               <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] font-black text-rose-500 border-4 border-rose-500 p-2 text-2xl uppercase tracking-widest whitespace-nowrap bg-background">
                 Non-Existent
               </div>
            </div>

            <div class="text-left space-y-6 max-w-md">
              <p class="text-xl md:text-2xl font-bold uppercase tracking-widest">
                Resource Node Not Found in the Strategic Registry.
              </p>
              <p class="text-muted-foreground font-medium leading-relaxed">
                The cryptographic path you followed has decoupled from the root manifest. This operation has been logged as a "Null Point Exception" in the audit trail.
              </p>
              <div class="pt-8">
                <a 
                  href="/dashboard" 
                  class="btn inline-block text-lg py-4 px-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)]"
                >
                  Return to Command Center
                </a>
              </div>
            </div>
          </div>

          {/* Glitch Footer */}
          <footer class="pt-12 border-t-2 border-border/30 opacity-40">
             <p class="font-mono text-[10px] uppercase tracking-widest">
               // System Log: Critical Navigation Failure // Session_ID: {Math.random().toString(36).substring(7).toUpperCase()}
             </p>
          </footer>
        </div>
      </div>
    </>
  );
}
