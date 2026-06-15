"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  delay?: number;
}

export function Tooltip({
  label,
  children,
  side = "top",
  delay = 300,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [clearTimer, delay]);

  const hide = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  const positionClass =
    side === "top"
      ? "bottom-full mb-1 left-1/2 -translate-x-1/2"
      : "top-full mt-1 left-1/2 -translate-x-1/2";

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium shadow ${positionClass}`}
          style={{
            background: "var(--fg-primary)",
            color: "var(--bg-primary)",
            zIndex: 60,
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
