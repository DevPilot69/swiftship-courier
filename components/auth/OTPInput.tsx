"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  id?: string;
};

export function OTPInput({ value, onChange, disabled, id }: Props) {
  const inputs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.replace(/\D/g, "").slice(0, 6);
  const chars = digits.split("");
  while (chars.length < 6) chars.push("");

  const setAt = (idx: number, digit: string) => {
    const base = digits.padEnd(6, " ").slice(0, 6).split("");
    base[idx] = digit;
    onChange(base.join("").replace(/\s/g, ""));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(t);
    const focusIdx = Math.min(t.length, 5);
    inputs.current[focusIdx]?.focus();
  };

  return (
    <div id={id} className="flex gap-2 justify-center" onPaste={handlePaste}>
      {chars.map((ch, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          value={ch}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(-1);
            setAt(i, d);
            if (d && i < 5) inputs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              if (!ch && i > 0) {
                inputs.current[i - 1]?.focus();
              } else {
                setAt(i, "");
              }
            }
            if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
            if (e.key === "ArrowRight" && i < 5) inputs.current[i + 1]?.focus();
          }}
          className={cn(
            "h-12 w-10 rounded-md border border-[#E5E7EB] bg-white text-center font-mono text-lg font-semibold text-[#1A1A1A] shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CC2027]/40",
            disabled && "opacity-50",
          )}
        />
      ))}
    </div>
  );
}
