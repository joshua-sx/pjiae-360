# Smartgoals 360

Smartgoals 360 is a sample digital employee appraisal platform built with **React**, **TypeScript** and **Vite**. The project demonstrates an onboarding flow, dashboards and management screens for goals and appraisals using Tailwind CSS and components from the shadcn UI library.

## Features

- Responsive landing page and marketing sections
- Authentication powered by [Clerk](https://clerk.com)
- Step‑by‑step onboarding flow
- Dashboard with stats and quick actions
- Goal and appraisal management pages
- React Query for data fetching and caching
- Styled with Tailwind CSS and shadcn UI

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```
2. Start the development server
   ```bash
   npm run dev
   ```
3. Build for production
   ```bash
   npm run build
   ```
4. Lint the codebase
   ```bash
   npm run lint
   ```

The app uses a test Clerk publishable key by default. In a real deployment you should provide your own `CLERK_PUBLISHABLE_KEY`.

## Project Structure

- `src/` &ndash; application source code
  - `components/` &ndash; reusable UI and page components
  - `pages/` &ndash; top level routes
  - `hooks/`, `contexts/` &ndash; React hooks and context providers
- `public/` &ndash; static assets
- `index.html` &ndash; entry point used by Vite

## Scripts

- `npm run dev` &ndash; start the dev server with hot reload
- `npm run build` &ndash; create a production build in `dist/`
- `npm run lint` &ndash; run eslint over the project
- `npm run preview` &ndash; preview the production build locally

This repository does not include a license and is intended for demonstration purposes.
