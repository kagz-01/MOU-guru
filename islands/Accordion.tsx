// islands/Accordion.tsx
import { useState } from "preact/hooks";
import { ComponentChildren } from "preact";

interface AccordionProps {
  title: string;
  children: ComponentChildren;
  defaultOpen?: boolean;
}

export default function Accordion(
  { title, children, defaultOpen = false }: AccordionProps,
) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div class="border-2 border-border bg-background mb-4 transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        class="w-full flex justify-between items-center p-6 text-left hover:bg-foreground hover:text-background transition-colors group"
      >
        <span class="font-bold uppercase tracking-widest text-sm">{title}</span>
        <span
          class={`transform transition-transform duration-300 font-bold font-mono text-lg ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      <div
        class={`overflow-hidden transition-all duration-300 ease-in-out bg-secondary/10 ${
          isOpen
            ? "max-h-[1000px] opacity-100 border-t-2 border-border"
            : "max-h-0 opacity-0"
        }`}
      >
        <div class="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
