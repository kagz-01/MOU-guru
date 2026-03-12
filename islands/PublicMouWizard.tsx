// islands/PublicMouWizard.tsx
import { useState } from "preact/hooks";

type FormData = {
  reference_no: string;
  title: string;
  start_date: string;
  end_date: string;
};

const initialData: FormData = {
  reference_no: "",
  title: "",
  start_date: "",
  end_date: "",
};

export default function PublicMouWizard() {
  const [data, setData] = useState<FormData>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setData((prev) => ({ ...prev, [target.name]: target.value }));
  };

  const attemptNextStep = () => {
    if (
      !data.reference_no || !data.title || !data.start_date || !data.end_date
    ) {
      setError("Please complete all required fields to initialize.");
      return;
    }
    if (new Date(data.end_date) <= new Date(data.start_date)) {
      setError("Termination vector must occur after Initiation.");
      return;
    }
    setError(null);

    // In a real implementation, we would save this to sessionStorage or a cookie
    // so it can be recovered after login/signup.
    sessionStorage.setItem("mou_init_data", JSON.stringify(data));

    // Trigger Auth Gate
    setShowAuthGate(true);
  };

  return (
    <div class="relative">
      <div class="border-4 border-foreground bg-background max-w-4xl mx-auto overflow-hidden animate-slide-up shadow-[12px_12px_0px_0px_currentColor]">
        {/* Progress Header */}
        <div class="bg-foreground text-background px-8 md:px-12 py-8 border-b-4 border-foreground flex flex-col sm:flex-row sm:justify-between sm:items-end relative">
          <div class="absolute bottom-0 left-0 h-2 bg-primary w-1/3"></div>
          <div>
            <h2 class="text-4xl font-black font-serif uppercase tracking-tighter mb-2">
              Initialize Protocol
            </h2>
            <p class="text-xs font-bold uppercase tracking-widest opacity-70">
              Phase 1 // 3: Base Parameters
            </p>
          </div>
          <div class="hidden sm:flex gap-4 font-mono font-black text-2xl mt-4 sm:mt-0 opacity-50">
            [1/3]
          </div>
        </div>

        <div class="p-8 md:p-12">
          {error && (
            <div class="mb-8 p-6 bg-red-950/20 text-red-500 border-2 border-red-500 flex items-start gap-4 animate-fade-in shadow-[4px_4px_0px_0px_currentColor]">
              <span class="font-bold text-lg">!</span>
              <p class="text-xs font-bold uppercase tracking-widest pt-0.5">
                {error}
              </p>
            </div>
          )}

          {/* Core Details Form */}
          <div class="min-h-[300px] space-y-8 animate-fade-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-3">
                <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Protocol Reference [REF-NO] *
                </label>
                <input
                  type="text"
                  name="reference_no"
                  value={data.reference_no}
                  onChange={handleChange}
                  placeholder="e.g. MOU-2026-INIT"
                  class="w-full px-6 py-4 bg-transparent border-2 border-border focus:border-foreground focus:outline-none transition-colors font-mono text-lg"
                />
              </div>
              <div class="space-y-3">
                <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Strategic Designation *
                </label>
                <input
                  type="text"
                  name="title"
                  value={data.title}
                  onChange={handleChange}
                  placeholder="Exploratory Partnership..."
                  class="w-full px-6 py-4 bg-transparent border-2 border-border focus:border-foreground focus:outline-none transition-colors font-serif text-xl"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-3">
                <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Initiation Vector *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={data.start_date}
                  onChange={handleChange}
                  class="w-full px-6 py-4 bg-transparent border-2 border-border focus:border-foreground focus:outline-none transition-colors font-mono text-lg"
                />
              </div>
              <div class="space-y-3">
                <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Termination Vector *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={data.end_date}
                  onChange={handleChange}
                  class="w-full px-6 py-4 bg-transparent border-2 border-border focus:border-foreground focus:outline-none transition-colors font-mono text-lg"
                />
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div class="flex flex-col sm:flex-row justify-end items-stretch sm:items-center mt-12 pt-8 border-t-4 border-foreground gap-4">
            <button
              type="button"
              onClick={attemptNextStep}
              class="btn bg-foreground text-background border-foreground hover:bg-transparent hover:text-foreground shadow-[8px_8px_0px_0px_currentColor] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
            >
              Configure Logic Boundaries →
            </button>
          </div>
        </div>
      </div>

      {/* Auth Gate Modal */}
      {showAuthGate && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-fade-in">
          <div class="bg-background border-4 border-foreground w-full max-w-2xl shadow-[16px_16px_0px_0px_currentColor]">
            <div class="p-8 md:p-12">
              <h3 class="text-3xl md:text-5xl font-black font-serif uppercase tracking-tighter mb-4 text-primary">
                Protocol Security Required
              </h3>
              <p class="text-sm font-bold uppercase tracking-widest opacity-70 mb-8 border-l-4 border-primary pl-4">
                Base parameters validated. To define legal logic, set IP
                directives, and establish the execution matrix, you must secure
                your access node. Your progress has been cached.
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <a href="/login" class="btn-outline text-center py-4">
                  Existing Node Login
                </a>
                <a href="/signup" class="btn text-center py-4">
                  Create New Node
                </a>
              </div>
            </div>
            <div class="bg-muted px-8 py-4 border-t-2 border-border flex justify-end">
              <button
                type="button"
                onClick={() => setShowAuthGate(false)}
                class="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors"
              >
                Cancel // Return to Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
