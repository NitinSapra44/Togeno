# TRODEC - Trust-Based Commerce Platform

TRODEC is a high-performance, trust-protocol commerce platform built for the modern social era. It connects consumers with products validated by experts and verified by communities.

## 🚀 Frontend 1: Milestone Accomplished
The foundational architecture and core UI systems have been successfully initialized and pushed.

### 🛠️ Key Setup Tasks
- **Project Engine**: Initialized with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**.
- **Dev Configuration**:
  - Configured **Path Aliases** (`@/*`) in `tsconfig.json` for clean, modular imports.
  - Implemented **Environment Schema**: Created `.env.local.example` for secure collaborator onboarding.
  - **Git Protocol**: Repository initialized and synced with the main origin.
- **Dependency Stack**:
  - `axios` & `@tanstack/react-query`: For robust, cached data fetching.
  - `zustand`: Lightweight global state management.
  - `lucide-react`: High-quality iconography.
  - `shadcn/ui`: Foundations for Bento grids and glassmorphism.

### 🎨 UI & Design Systems
The UI follows a **"Trust Protocol"** aesthetic: Deep black backgrounds, glassmorphism, and neon-accented gradients (Blue, Purple, Emerald).

#### 🏠 Homepage Structure
- **Bento Grid Hero**: A modern, high-impact layout featuring community stats and expert validation tiers.
- **Interactive Layers**: Global glassmorphism effects and animated background glows.
- **Footer**: included footer links.
- **Navbar**: included navbar links.

#### 🔐 Authentication UI
- **Route Grouping**: All auth logic contained within `(auth)` for clean URL mapping.
- **The AuthForm**: 
  - **Role-Based Tabs**: Dynamic switching between Consumer, Expert, and Brand modes.
  - **Premium UI**: Gradient-backed active tabs with white-on-black high-contrast input fields.
  - **Functional Logic**: Included password visibility toggles, "Remember Me" persistence states, and Google Identity hooks.

