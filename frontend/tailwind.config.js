/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary:   "#6366F1",
        "primary-dark": "#4F46E5",
        secondary: "#8B5CF6",
        navy:      "#0F172A",
        "navy-800":"#1E293B",
        "navy-700":"#334155",
        surface:   "#F8FAFC",
        card:      "#FFFFFF",
        elevated:  "#F1F5F9",
        border:    "#E2E8F0",
        "text-primary":   "#0F172A",
        "text-secondary": "#64748B",
        "text-muted":     "#94A3B8",
        success:  "#10B981",
        warning:  "#F59E0B",
        danger:   "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card:    "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        elevated:"0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)",
        primary: "0 4px 14px 0 rgb(99 102 241 / 0.35)",
        secondary:"0 4px 14px 0 rgb(139 92 246 / 0.35)",
      },
    },
  },
  plugins: [],
};

