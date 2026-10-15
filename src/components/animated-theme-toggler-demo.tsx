"use client";

import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "@/registry/magicui/animated-theme-toggler";

export function AnimatedThemeTogglerNextThemesDemo() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex justify-center p-6">
      <AnimatedThemeToggler
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        onThemeChange={setTheme}
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md ${
          resolvedTheme === "dark"
            ? "bg-[#1C1C1C] border-amber-400/30 text-amber-400 hover:border-amber-400 hover:bg-[#252525] hover:shadow-[0_0_16px_rgba(251,191,36,0.25)]"
            : "bg-white border-indigo-400/30 text-indigo-600 hover:border-indigo-500 hover:bg-neutral-50 hover:shadow-[0_0_16px_rgba(99,102,241,0.25)]"
        }`}
      />
    </div>
  );
}
