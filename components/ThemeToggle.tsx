"use client";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-lg transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      <Sun size={13} className="text-amber-400 dark:text-gray-500" />
      {/* pill track */}
      <div className={`relative h-4 w-8 rounded-full transition-colors ${dark ? "bg-cyan-500" : "bg-gray-300"}`}>
        {/* thumb */}
        <div
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${
            dark ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
      <Moon size={13} className="text-gray-400 dark:text-cyan-400" />
    </button>
  );
}
