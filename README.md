# Smartgoals 360

**Smartgoals 360** is an employee appraisal platform built with **React**, **TypeScript**, **Vite** and **Supabase**. It demonstrates how to implement onboarding flows, goal management, appraisals and administrative tools using modern frontend technologies and a Postgres backend. The interface leverages Tailwind CSS and components from the shadcn/ui library.

## Key Features

- Responsive landing page and marketing sections
- Authentication and data storage with Supabase
- Step‑by‑step onboarding flow:
  - Organization setup
  - Importing employees via CSV or manual entry
  - Mapping columns and assigning roles
  - Configuring appraisal cycles
- Dashboard with stats and quick actions
- Goal management and employee appraisals with digital sign‑off
- Admin view including interactive organizational chart and appraiser assignments
- Data fetching and caching via React Query
- Styled entirely with Tailwind CSS + shadcn components

## Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Start the development server**

```bash
npm run dev
```

3. **Build for production**

```bash
npm run build
```

4. **Lint the code**

```bash
npm run lint
```

5. **Run the test suite**

```bash
npm test
```

The repository includes a sample Supabase project with a pre-generated public key. You can see the default URL and key in `src/integrations/supabase/client.ts`:

```typescript
const SUPABASE_URL = "https://ckvyihkywcqqoewpohhl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
export const setSupabaseAuth = (token: string) => supabase.auth.setAuth(token);
```

When using Clerk for authentication, exchange the Clerk session for a Supabase token using `getToken()` and pass it to `setSupabaseAuth`. The `SupabaseTokenProvider` does this automatically.

For your own deployment, create a Supabase project and replace these credentials via environment variables.

## Project Structure

```
.
├── src/                # React source code
│   ├── components/     # Pages, UI widgets and admin/onboarding flows
│   ├── hooks/          # Custom React hooks
│   ├── assets/         # Images and other assets
│   └── integrations/   # Supabase client and generated types
├── public/             # Static files
├── supabase/           # Database schema and migrations
└── index.html          # Vite entry point
```

## Technical Stack

- **React 18** with React Router
- **Vite** build system
- **Supabase** (Auth & Postgres database with row-level security)
- **TypeScript**
- **Tailwind CSS** and shadcn/ui components
- **React Query** for server state management

## Usage Example

After starting the dev server, open `http://localhost:8080` in your browser. Create an account or log in, follow the onboarding milestones to set up the organization, and explore dashboards for goals and appraisals. The admin section provides an interactive org chart and tools to assign appraisers.

## Contributing

1. Fork the repository and create a feature branch.
2. Make your changes following the existing coding style.
3. Run `npm run lint` and ensure the project builds.
4. Submit a pull request describing your changes.

Bug reports and feature requests are welcome via GitHub issues.

## License

This repository is provided for demonstration purposes and does not contain an explicit license. Use at your own risk.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/joshua-sx/pjiae-360)
