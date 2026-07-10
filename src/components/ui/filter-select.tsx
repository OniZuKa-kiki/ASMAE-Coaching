"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { dropdownMenu } from "@/lib/motion";

export type FilterSelectOption = {
  value: string;
  label: string;
};

export function FilterSelect({
  name,
  value,
  options,
  placeholder,
  className,
  onChange,
}: {
  name: string;
  value: string;
  options: FilterSelectOption[];
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(value);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setSelected(value);
  }, [value]);

  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const selectedLabel =
    options.find((o) => o.value === selected)?.label ?? placeholder ?? "—";

  return (
    <div
      ref={rootRef}
      className={className ?? "relative"}
      suppressHydrationWarning
    >
      {/* Hidden input so GET forms still work with server searchParams */}
      <input type="hidden" name={name} value={selected} />

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
          if (e.key === "Escape") setOpen(false);
        }}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-left flex items-center justify-between gap-3 transition-colors hover:border-primary/30"
      >
        <span className="text-text">{selectedLabel}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-text/70" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-card shadow-soft overflow-hidden origin-top"
            variants={dropdownMenu}
            initial="initial"
            animate="animate"
            exit="exit"
          >
          <div className="max-h-60 overflow-y-auto">
            {options.map((opt) => {
              const isActive = opt.value === selected;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setSelected(opt.value);
                    onChange?.(opt.value);
                    setOpen(false);
                  }}
                  className={[
                    "w-full px-4 py-2.5 text-sm text-left transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text hover:bg-primary/5",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

