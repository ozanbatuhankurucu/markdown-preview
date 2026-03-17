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
    return <div className="flex h-9 w-[108px] rounded-lg" />;
  }

  return (
    <div
      className="flex items-center rounded-lg p-0.5 gap-0.5"
      style={{ background: "var(--bg-tertiary)" }}
    >
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={`Switch to ${label} theme`}
          className="relative rounded-md p-1.5 transition-all duration-200 cursor-pointer"
          style={{
            background: theme === value ? "var(--bg-primary)" : "transparent",
            color: theme === value ? "var(--accent)" : "var(--fg-muted)",
            boxShadow:
              theme === value
                ? "0 1px 3px rgba(0,0,0,0.1)"
                : "none",
          }}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
