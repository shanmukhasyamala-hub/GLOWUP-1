# GLOWUP — Your Personal AI Beauty Assistant

Immersive cinematic 3D beauty intelligence platform built with React, TypeScript, Vite, Three.js / React Three Fiber, Framer Motion, GSAP ScrollTrigger, Lenis, Tailwind CSS, Firebase Authentication, and Cloud Firestore.

## Features Preserved & Included

- **Cinematic 3D Storytelling**: Fixed 6-clip portrait MP4 video stage (`public/assets/aistudio/`) synchronized with a lazy-loaded interactive Three.js scene across 9 scroll-driven sections.
- **Interactive Skincare Tools**: 6-step Skin Profile questionnaire, demonstration AI Skin Analysis interface, Smart Product Discovery catalog, AM/PM Routine Builder with compatibility notes and 7-day tracker, and Skin Journal.
- **Authentication & Private User Space**: Firebase Auth (Google Sign-In, Email/Password signup/sign-in, email verification, password reset, session persistence), **My Profile** beauty sanctuary, **Account Settings** (avatar upload, password change, JSON export, account deletion), and a private user-isolated **My Dashboard** backed by Cloud Firestore (`firestore.rules`).

## Local Development

```bash
# Install dependencies (Bun recommended via bun.lock, or npm)
bun install --frozen-lockfile
# or: npm install

# Start development server on port 3000
npm run dev

# TypeScript check
npm run lint

# Production build & preview
npm run build
npm run preview
```

## Firebase Setup Requirements

Public web client configuration is stored in `firebase-applet-config.json` (project `mesmerizing-medium-hv0ns`).

Before using Email/Password auth or deploying to a custom/Vercel URL:
1. **Enable Email/Password Sign-In**: In Firebase Console → **Authentication → Sign-in method**, enable **Email/Password**.
2. **Add Production Domain**: In Firebase Console → **Authentication → Settings → Authorized domains**, add your Vercel domain (for example `glowup-ai-beauty-platform.vercel.app`) so Google Sign-In popups and verification links work in production.
3. **Security Rules**: Review and maintain `firestore.rules` via Firebase Console or CLI.

## Vercel Deployment Settings

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `bun install --frozen-lockfile` (auto-detected from `bun.lock`) or `npm install`
- **Node.js Version**: `22.x`
- **Environment Variables**: None required for the current client build (optional `GEMINI_API_KEY` / `APP_URL` only if adding server-side API routes later).

## Media Assets Inventory

All six portrait MP4 assets (~1.5 MB – 2.2 MB each, ~13 MB total) live in `public/assets/aistudio/` and remain well under GitHub's 100 MB file-size limit and Vercel's static asset limits without requiring Git LFS.
