# 🎨 Color Palette Documentation (Dark Theme)

## Overview
This document defines the **official dark color palette** used across the application.  
The color system is **semantic**, meaning colors are named based on **purpose**, not appearance.

This ensures:
- Visual consistency
- Easy theming
- Accessibility compliance
- Scalable UI system

---

## 🌑 Theme Type
**Primary Theme:** Dark  
All components rely on **design tokens**, not hardcoded colors.

---

## 🎯 Primary Colors

| Token | Hex Value | Usage |
|-----|---------|------|
| `--primary` | `#3B82F6` | Primary actions, buttons, links |
| `--primary-foreground` | `#F8FAFC` | Text/icons on primary background |

Used for:
- Primary buttons
- Active states
- Call-to-action elements

---

## 🎨 Secondary Colors

| Token | Hex Value | Usage |
|-----|---------|------|
| `--secondary` | `#1E293B` | Secondary buttons, containers |
| `--secondary-foreground` | `#E5E7EB` | Text on secondary surfaces |

---

## ⚫ Background & Surface Colors

| Token | Hex Value | Usage |
|-----|---------|------|
| `--background` | `#020617` | App background |
| `--foreground` | `#F8FAFC` | Default text |
| `--card` | `#020617` | Cards, modals |
| `--card-foreground` | `#E5E7EB` | Text inside cards |
| `--popover` | `#020617` | Dropdowns, popovers |

---

## ⚪ Muted & Border Colors

| Token | Hex Value | Usage |
|-----|---------|------|
| `--muted` | `#0F172A` | Muted backgrounds |
| `--muted-foreground` | `#94A3B8` | Helper text |
| `--border` | `#1E293B` | Borders, dividers |
| `--input` | `#1E293B` | Input borders |

---

## ✅ Success Colors

| Token | Hex Value | Usage |
|-----|---------|------|
| `--success` | `#22C55E` | Success states |
| `--success-foreground` | `#052E16` | Text on success background |

Used in:
- Success toasts
- Confirmation messages

---

## ❌ Error / Destructive Colors

| Token | Hex Value | Usage |
|-----|---------|------|
| `--destructive` | `#EF4444` | Errors, delete actions |
| `--destructive-foreground` | `#7F1D1D` | Text on destructive background |

Used in:
- Delete buttons
- Error toasts
- Validation errors

---

## 🔔 Accent Colors

| Token | Hex Value | Usage |
|-----|---------|------|
| `--accent` | `#1E293B` | Hover states, subtle highlights |
| `--accent-foreground` | `#F8FAFC` | Text/icons on accent surfaces |

---

## 🧾 Text Colors

| Token | Hex Value | Usage |
|-----|---------|------|
| `--text-primary` | `#F8FAFC` | Headings, main content |
| `--text-secondary` | `#CBD5F5` | Secondary text |
| `--text-muted` | `#94A3B8` | Helper text |

---

## 🌈 Toast Colors

| Type | Background | Text |
|----|-----------|------|
| Success | `#22C55E` | `#052E16` |
| Error | `#EF4444` | `#7F1D1D` |
| Info | `#020617` | `#F8FAFC` |

---

## 🌙 Dark Mode CSS Tokens

```css
.dark {
  --background: #020617;
  --foreground: #F8FAFC;

  --card: #020617;
  --card-foreground: #E5E7EB;

  --primary: #3B82F6;
  --primary-foreground: #F8FAFC;

  --secondary: #1E293B;
  --secondary-foreground: #E5E7EB;

  --muted: #0F172A;
  --muted-foreground: #94A3B8;

  --accent: #1E293B;
  --accent-foreground: #F8FAFC;

  --border: #1E293B;
  --input: #1E293B;

  --destructive: #EF4444;
  --destructive-foreground: #7F1D1D;

  --success: #22C55E;
  --success-foreground: #052E16;
}
