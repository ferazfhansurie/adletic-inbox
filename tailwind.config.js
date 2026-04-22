import plugin from "tailwindcss/plugin";
import colors from "tailwindcss/colors";
import { parseColor } from "tailwindcss/lib/util/color.js";
import forms from "@tailwindcss/forms";

/** Converts HEX color to RGB */
const toRGB = (value) => {
  return parseColor(value).color.join(" ");
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        theme: {
          1: "rgb(var(--color-theme-1) / <alpha-value>)",
          2: "rgb(var(--color-theme-2) / <alpha-value>)",
        },
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        info: "rgb(var(--color-info) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        pending: "rgb(var(--color-pending) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        light: "rgb(var(--color-light) / <alpha-value>)",
        dark: "rgb(var(--color-dark) / <alpha-value>)",
        darkmode: {
          50: "rgb(var(--color-darkmode-50) / <alpha-value>)",
          100: "rgb(var(--color-darkmode-100) / <alpha-value>)",
          200: "rgb(var(--color-darkmode-200) / <alpha-value>)",
          300: "rgb(var(--color-darkmode-300) / <alpha-value>)",
          400: "rgb(var(--color-darkmode-400) / <alpha-value>)",
          500: "rgb(var(--color-darkmode-500) / <alpha-value>)",
          600: "rgb(var(--color-darkmode-600) / <alpha-value>)",
          700: "rgb(var(--color-darkmode-700) / <alpha-value>)",
          800: "rgb(var(--color-darkmode-800) / <alpha-value>)",
          900: "rgb(var(--color-darkmode-900) / <alpha-value>)",
        },
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        "card-foreground": "rgb(var(--card-foreground) / <alpha-value>)",
        popover: "rgb(var(--popover) / <alpha-value>)",
        "popover-foreground": "rgb(var(--popover-foreground) / <alpha-value>)",
        "primary-foreground": "rgb(var(--primary-foreground) / <alpha-value>)",
        "secondary-foreground": "rgb(var(--secondary-foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        "muted-foreground": "rgb(var(--muted-foreground) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-foreground": "rgb(var(--accent-foreground) / <alpha-value>)",
        destructive: "rgb(var(--destructive) / <alpha-value>)",
        "destructive-foreground": "rgb(var(--destructive-foreground) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        'custom-gray': '#E4E4E4',
        'adletic-orange': '#f26522',
        'adletic-white': '#FFFFFF',
      },
      borderRadius: {
        xs: "calc(var(--radius) * 0.4)",
        sm: "calc(var(--radius) * 0.6)",
        md: "calc(var(--radius) * 0.8)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) * 1.4)",
        "2xl": "calc(var(--radius) * 1.8)",
      },
      boxShadow: {
        'elevation-1': "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        'elevation-2': "0 2px 4px 0 rgb(0 0 0 / 0.06), 0 1px 2px 0 rgb(0 0 0 / 0.04)",
        'elevation-3': "0 8px 24px -4px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.04)",
      },
      fontFamily: {
        roboto: ["Roboto"],
      },
      container: {
        center: true,
      },
      maxWidth: {
        "1/4": "25%",
        "1/2": "50%",
        "3/4": "75%",
      },
      strokeWidth: {
        0.5: 0.5,
        1.5: 1.5,
        2.5: 2.5,
      },
      backgroundImage: {
        "chevron-white":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff95' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
        "chevron-black":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2300000095' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
        "file-icon-empty-directory":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='786' height='786' viewBox='0 0 786 786'%3E%3Cdefs%3E%3ClinearGradient id='linear-gradient' x1='0.5' x2='0.5' y2='1' gradientUnits='objectBoundingBox'%3E%3Cstop offset='0' stop-color='%238a97ac'/%3E%3Cstop offset='1' stop-color='%235d6c83'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id='Group_2' data-name='Group 2' transform='translate(-567 -93)'%3E%3Crect id='Rectangle_4' data-name='Rectangle 4' width='418' height='681' rx='40' transform='translate(896 109)' fill='%2395a5b9'/%3E%3Crect id='Rectangle_3' data-name='Rectangle 3' width='433' height='681' rx='40' transform='translate(606 93)' fill='%23a0aec0'/%3E%3Crect id='Rectangle_2' data-name='Rectangle 2' width='786' height='721' rx='40' transform='translate(567 158)' fill='url(%23linear-gradient)'/%3E%3C/g%3E%3C/svg%3E\n\")",
        "file-icon-directory":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='786' height='786' viewBox='0 0 786 786'%3E%3Cdefs%3E%3ClinearGradient id='linear-gradient' x1='0.5' x2='0.5' y2='1' gradientUnits='objectBoundingBox'%3E%3Cstop offset='0' stop-color='%238a97ac'/%3E%3Cstop offset='1' stop-color='%235d6c83'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id='Group_3' data-name='Group 3' transform='translate(-567 -93)'%3E%3Crect id='Rectangle_4' data-name='Rectangle 4' width='418' height='681' rx='40' transform='translate(896 109)' fill='%2395a5b9'/%3E%3Crect id='Rectangle_3' data-name='Rectangle 3' width='433' height='681' rx='40' transform='translate(606 93)' fill='%23a0aec0'/%3E%3Crect id='Rectangle_2' data-name='Rectangle 2' width='742' height='734' rx='40' transform='translate(590 145)' fill='%23bec8d9'/%3E%3Crect id='Rectangle_5' data-name='Rectangle 5' width='786' height='692' rx='40' transform='translate(567 187)' fill='url(%23linear-gradient)'/%3E%3C/g%3E%3C/svg%3E\n\")",
        "file-icon-file":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='628.027' height='786.012' viewBox='0 0 628.027 786.012'%3E%3Cdefs%3E%3ClinearGradient id='linear-gradient' x1='0.5' x2='0.5' y2='1' gradientUnits='objectBoundingBox'%3E%3Cstop offset='0' stop-color='%238a97ac'/%3E%3Cstop offset='1' stop-color='%235d6c83'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id='Group_5' data-name='Group 5' transform='translate(-646 -92.988)'%3E%3Cpath id='Union_2' data-name='Union 2' d='M40,786A40,40,0,0,1,0,746V40A40,40,0,0,1,40,0H501V103h29v24h98V746a40,40,0,0,1-40,40Z' transform='translate(646 93)' fill='url(%23linear-gradient)'/%3E%3Cpath id='Intersection_2' data-name='Intersection 2' d='M.409,162.042l.058-109.9c31.605,29.739,125.37,125.377,125.37,125.377l-109.976.049A20.025,20.025.0,0,1,.409,162.042Z' transform='translate(1147 42)' fill='%23bec8d9' stroke='%23bec8d9' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E\n\")",
      },
    },
  },
  plugins: [
    forms,
    plugin(function ({ addBase, matchUtilities }) {
      addBase({
        // Default colors - Adletic Theme (aligned with motionboards token system)
        ":root": {
          // Legacy tokens (kept for backwards compatibility)
          "--color-theme-1": "255 255 255", // White
          "--color-theme-2": "242 101 34", // Orange #f26522
          "--color-primary": "255 255 255", // White
          "--color-secondary": "242 101 34", // Orange #f26522
          "--color-success": toRGB(colors.emerald["600"]),
          "--color-info": toRGB(colors.blue["500"]),
          "--color-warning": toRGB(colors.amber["500"]),
          "--color-pending": toRGB(colors.orange["500"]),
          "--color-danger": toRGB(colors.red["600"]),
          "--color-light": toRGB(colors.gray["100"]),
          "--color-dark": "75 75 75", // #4b4b4b

          // Modern shadcn-style tokens (motionboards parity)
          "--background": "255 255 255",        // white
          "--foreground": "37 37 37",           // oklch(0.145) ~ near-black
          "--card": "255 255 255",
          "--card-foreground": "37 37 37",
          "--popover": "255 255 255",
          "--popover-foreground": "37 37 37",
          "--primary-foreground": "255 255 255", // white on orange
          "--secondary-foreground": "37 37 37",
          "--muted": "247 247 247",             // oklch(0.97) ~ light gray
          "--muted-foreground": "142 142 142",  // oklch(0.556) ~ medium gray
          "--accent": "247 247 247",
          "--accent-foreground": "37 37 37",
          "--destructive": "220 53 53",         // oklch(0.577 0.245 27.325) ~ red
          "--destructive-foreground": "255 255 255",
          "--border": "235 235 235",            // oklch(0.922) ~ very light gray
          "--input": "235 235 235",
          "--ring": "180 180 180",              // oklch(0.708) ~ medium-dark gray
          "--radius": "0.625rem",
        },
        // Default dark-mode colors
        ".dark": {
          "--color-primary": "242 101 34", // Orange #f26522

          // Modernised dark neutrals (oklch-inspired, warmer than the old slate palette)
          "--color-darkmode-50":  "140 140 148",
          "--color-darkmode-100": "120 120 128",
          "--color-darkmode-200": "100 100 108",
          "--color-darkmode-300": "82 82 90",
          "--color-darkmode-400": "68 68 76",
          "--color-darkmode-500": "54 54 62",
          "--color-darkmode-600": "46 46 54",
          "--color-darkmode-700": "38 38 46",
          "--color-darkmode-800": "30 30 38",
          "--color-darkmode-900": "22 22 28",

          // Modern shadcn-style tokens (dark variant)
          "--background": "22 22 28",           // oklch(0.13 0.005 270) ~ warm dark
          "--foreground": "251 251 251",         // oklch(0.985) ~ near-white
          "--card": "30 30 38",                  // oklch(0.18 0.008 270)
          "--card-foreground": "251 251 251",
          "--popover": "30 30 38",
          "--popover-foreground": "251 251 251",
          "--primary-foreground": "255 255 255", // white on orange
          "--secondary-foreground": "251 251 251",
          "--muted": "38 38 46",
          "--muted-foreground": "163 163 168",
          "--accent": "38 38 46",
          "--accent-foreground": "251 251 251",
          "--destructive": "238 106 89",         // oklch(0.704 0.191 22.216) ~ lighter red
          "--destructive-foreground": "255 255 255",
          "--border": "255 255 255",             // used at opacity — same value, alpha applied via class
          "--input": "255 255 255",
          "--ring": "242 101 34",                // orange accent for focus rings in dark
        },
        // Theme 1 colors
        ".theme-1": {
          "--color-theme-1": toRGB(colors.emerald["800"]),
          "--color-theme-2": toRGB(colors.emerald["900"]),
          "--color-primary": toRGB(colors.emerald["900"]),
          "--color-secondary": toRGB(colors.slate["200"]),
          "--color-success": toRGB(colors.emerald["600"]),
          "--color-info": toRGB(colors.cyan["500"]),
          "--color-warning": toRGB(colors.yellow["400"]),
          "--color-pending": toRGB(colors.amber["500"]),
          "--color-danger": toRGB(colors.rose["600"]),
          "--color-light": toRGB(colors.slate["100"]),
          "--color-dark": toRGB(colors.slate["800"]),
          "&.dark": {
            "--color-primary": toRGB(colors.emerald["800"]),
          },
        },
        // Theme 2 colors
        ".theme-2": {
          "--color-theme-1": toRGB(colors.blue["900"]),
          "--color-theme-2": toRGB(colors.blue["950"]),
          "--color-primary": toRGB(colors.blue["950"]),
          "--color-secondary": toRGB(colors.slate["200"]),
          "--color-success": toRGB(colors.teal["600"]),
          "--color-info": toRGB(colors.cyan["500"]),
          "--color-warning": toRGB(colors.amber["500"]),
          "--color-pending": toRGB(colors.orange["500"]),
          "--color-danger": toRGB(colors.red["700"]),
          "--color-light": toRGB(colors.slate["100"]),
          "--color-dark": toRGB(colors.slate["800"]),
          "&.dark": {
            "--color-primary": toRGB(colors.blue["800"]),
          },
        },
        // Theme 3 colors
        ".theme-3": {
          "--color-theme-1": toRGB(colors.cyan["800"]),
          "--color-theme-2": toRGB(colors.cyan["900"]),
          "--color-primary": toRGB(colors.cyan["900"]),
          "--color-secondary": toRGB(colors.slate["200"]),
          "--color-success": toRGB(colors.teal["600"]),
          "--color-info": toRGB(colors.cyan["500"]),
          "--color-warning": toRGB(colors.amber["500"]),
          "--color-pending": toRGB(colors.amber["600"]),
          "--color-danger": toRGB(colors.red["700"]),
          "--color-light": toRGB(colors.slate["100"]),
          "--color-dark": toRGB(colors.slate["800"]),
          "&.dark": {
            "--color-primary": toRGB(colors.cyan["800"]),
          },
        },
        // Theme 4 colors
        ".theme-4": {
          "--color-theme-1": toRGB(colors.indigo["800"]),
          "--color-theme-2": toRGB(colors.indigo["900"]),
          "--color-primary": toRGB(colors.indigo["900"]),
          "--color-secondary": toRGB(colors.slate["200"]),
          "--color-success": toRGB(colors.emerald["600"]),
          "--color-info": toRGB(colors.cyan["500"]),
          "--color-warning": toRGB(colors.yellow["500"]),
          "--color-pending": toRGB(colors.orange["600"]),
          "--color-danger": toRGB(colors.red["700"]),
          "--color-light": toRGB(colors.slate["100"]),
          "--color-dark": toRGB(colors.slate["800"]),
          "&.dark": {
            "--color-primary": toRGB(colors.indigo["700"]),
          },
        },
      });
    }),
  ],
};