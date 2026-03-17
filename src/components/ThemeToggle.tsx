"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const themes = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-8 w-[180px]" />;
  }

  return (
    <div
      className="flex items-center rounded-md p-0.5"
      style={{ background: "var(--bg-tertiary)" }}
    >
      {themes.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            aria-label={`Switch to ${label} theme`}
            className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: isActive ? "var(--bg-primary)" : "transparent",
              color: isActive ? "var(--fg-primary)" : "var(--fg-muted)",
              boxShadow: isActive
                ? "0 1px 2px rgba(0,0,0,0.05)"
                : "none",
            }}
          >
            <Icon size={12} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
