// islands/MouWizard.tsx
import { useState } from "preact/hooks";

type FormData = {
  reference_no: string;
  title: string;
  start_date: string;
  end_date: string;
  description: string;
  governing_law: string;
  confidentiality: boolean;
  ip_terms: string;
  renewal_terms: string;
  termination_clause: string;
  owning_department_id: number;
};

const initialData: FormData = {
  reference_no: "",
  title: "",
  start_date: "",
  end_date: "",
  description: "",
  governing_law: "",
  confidentiality: false,
  ip_terms: "",
  renewal_terms: "",
  termination_clause: "",
  owning_department_id: 1, // Defaulting to 1 for simplicity, normally fetched
};

export default function MouWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 3;

  const handleChange = (e: Event) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const name = target.name;
    const value = target.type === "checkbox"
      ? (target as HTMLInputElement).checked
      : target.value;

    setData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (
        !data.reference_no || !data.title || !data.start_date || !data.end_date
      ) {
        setError("Please fill out all required fields in this step.");
        return;
      }
      if (new Date(data.end_date) <= new Date(data.start_date)) {
        setError("End Date must be after Start Date.");
        return;
      }
    }
    setError(null);
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (step !== totalSteps) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/mou/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to create MOU");
      }

      const result = await response.json();
      globalThis.location.href = `/mou/${result.mou_id}`;
    } catch (err) {
      const errMessage = err instanceof Error
        ? err.message
        : "Failed to create protocol";
      setError(errMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div class="border-4 border-foreground bg-background max-w-4xl mx-auto overflow-hidden animate-slide-up shadow-[12px_12px_0px_0px_currentColor]">
      {/* Progress Header */}
      <div class="bg-foreground text-background px-8 md:px-12 py-8 border-b-4 border-foreground flex flex-col sm:flex-row sm:justify-between sm:items-end relative">
        <div
          class="absolute bottom-0 left-0 h-2 bg-primary transition-all duration-500"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        >
        </div>
        <div>
          <h2 class="text-4xl font-black font-serif uppercase tracking-tighter mb-2">
            Establish Protocol
          </h2>
          <p class="text-xs font-bold uppercase tracking-widest opacity-70">
            Phase {step} // {totalSteps}: {step === 1
              ? "Base Parameters"
              : step === 2
              ? "Legal Boundaries"
              : "Termination Rules"}
          </p>
        </div>
        <div class="hidden sm:flex gap-4 font-mono font-black text-2xl mt-4 sm:mt-0 opacity-50">
          [{step}/{totalSteps}]
        </div>
      </div>

      <form onSubmit={handleSubmit} class="p-8 md:p-12">
        {error && (
          <div class="mb-8 p-6 bg-red-950/20 text-red-500 border-2 border-red-500 flex items-start gap-4 animate-fade-in shadow-[4px_4px_0px_0px_currentColor]">
            <span class="font-bold text-lg">!</span>
            <p class="text-xs font-bold uppercase tracking-widest pt-0.5">
              {error}
            </p>
          </div>
        )}

        {/* Form Steps */}
        <div class="min-h-[400px]">
          {/* Step 1: Core Details */}
          {step === 1 && (
            <div class="space-y-8 animate-fade-in">
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
                    placeholder="e.g. MOU-2026-001"
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
                    placeholder="Partnership with..."
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
          )}

          {/* Step 2: Legal Terms */}
          {step === 2 && (
            <div class="space-y-8 animate-fade-in">
              <div class="space-y-3">
                <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Strategic Overview & Intent
                </label>
                <textarea
                  name="description"
                  value={data.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Explicitly define the scope..."
                  class="w-full px-6 py-4 bg-transparent border-2 border-border focus:border-foreground focus:outline-none transition-colors font-serif text-lg resize-none"
                >
                </textarea>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-3">
                  <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Governing Law
                  </label>
                  <input
                    type="text"
                    name="governing_law"
                    value={data.governing_law}
                    onChange={handleChange}
                    placeholder="e.g. State of California"
                    class="w-full px-6 py-4 bg-transparent border-2 border-border focus:border-foreground focus:outline-none transition-colors font-serif text-lg"
                  />
                </div>
                <div class="flex items-end pb-2">
                  <div class="relative flex items-center p-4 border-2 border-border bg-transparent w-full hover:border-foreground cursor-pointer transition-colors group">
                    <input
                      type="checkbox"
                      id="confidentiality"
                      name="confidentiality"
                      checked={data.confidentiality}
                      onChange={handleChange}
                      class="w-6 h-6 outline-none bg-transparent border-2 border-foreground accent-primary cursor-pointer"
                    />
                    <label
                      htmlFor="confidentiality"
                      class="ml-4 block text-xs font-black uppercase tracking-widest flex-1 cursor-pointer group-hover:text-primary transition-colors"
                    >
                      Enforce Strict Confidentiality
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Lifecycle Rules */}
          {step === 3 && (
            <div class="space-y-8 animate-fade-in">
              <div class="space-y-3">
                <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  IP Directives
                </label>
                <textarea
                  name="ip_terms"
                  value={data.ip_terms}
                  onChange={handleChange}
                  rows={4}
                  class="w-full px-6 py-4 bg-transparent border-2 border-border focus:border-foreground focus:outline-none transition-colors font-serif text-lg resize-none"
                >
                </textarea>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-3">
                  <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Renewal Matrix
                  </label>
                  <input
                    type="text"
                    name="renewal_terms"
                    value={data.renewal_terms}
                    onChange={handleChange}
                    placeholder="e.g. Annual Auto-Renewal"
                    class="w-full px-6 py-4 bg-transparent border-2 border-border focus:border-foreground focus:outline-none transition-colors font-serif text-lg"
                  />
                </div>
                <div class="space-y-3">
                  <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Termination Clause
                  </label>
                  <input
                    type="text"
                    name="termination_clause"
                    value={data.termination_clause}
                    onChange={handleChange}
                    placeholder="e.g. 30 Days Zero-Fault"
                    class="w-full px-6 py-4 bg-transparent border-2 border-border focus:border-foreground focus:outline-none transition-colors font-serif text-lg"
                  />
                </div>
              </div>
              <div class="p-8 border-l-4 border-l-primary bg-primary/10">
                <h4 class="font-black font-serif text-2xl mb-4 tracking-tighter uppercase">
                  Execution Ready
                </h4>
                <p class="text-sm font-bold opacity-80 uppercase tracking-widest leading-relaxed">
                  Upon creation, this protocol is assigned Draft State.
                  Additional entities and cryptographic signatures must be
                  chained via the Hub.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div class="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center mt-12 pt-8 border-t-4 border-foreground gap-4">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1 || isSubmitting}
            class={`btn-outline ${
              step === 1 ? "opacity-0 pointer-events-none" : ""
            }`}
          >
            ← Retreat
          </button>

          {step < totalSteps
            ? (
              <button
                type="button"
                onClick={nextStep}
                class="btn"
              >
                Proceed Phase {step + 1} →
              </button>
            )
            : (
              <button
                type="submit"
                disabled={isSubmitting}
                class="btn bg-foreground text-background border-foreground hover:bg-transparent hover:text-foreground shadow-[8px_8px_0px_0px_currentColor] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
              >
                {isSubmitting ? "Executing..." : "Compile & Execute Protocol"}
              </button>
            )}
        </div>
      </form>
    </div>
  );
}
