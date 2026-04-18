# Brumus Wine Bible

Staff wine training guide and quiz platform for Brumus Bar & Restaurant, Haymarket Hotel (Firmdale Hotels).

**Stack:** React 18 + Vite 5 · Supabase · react-simple-maps · Netlify

---

## Quick Start

```bash
npm install
cp .env.example .env
# fill in your Supabase credentials and admin passphrase in .env
npm run dev
```

Visit `http://localhost:5173` for the public guide and `/admin` for the admin panel.

---

## Environment Variables

Create a `.env` file in the project root (never commit it):

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_ADMIN_PASSPHRASE` | Passphrase for the admin panel gate |
| `VITE_PROPERTY_ID` | UUID of the property row in the `properties` table |

---

## Supabase Schema (copy-paste SQL)

Run this in the Supabase SQL editor to create all required tables and enable RLS.

```sql
-- Properties table (multi-tenant root)
create table properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hotel text,
  group_name text,
  created_at timestamptz default now()
);

-- Seed the Brumus property
insert into properties (name, hotel, group_name)
values ('Brumus Bar & Restaurant', 'Haymarket Hotel', 'Firmdale Hotels');

-- Wines catalogue
create table wines (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade not null,
  name text not null,
  producer text,
  vintage integer,
  region text,
  country text,
  grape text,
  type text check (type in ('white','red','rosé','sparkling','orange')),
  body text check (body in ('light','medium','full')),
  bottle_price numeric(8,2) not null default 0,
  glass_price numeric(8,2),
  carafe_price numeric(8,2),
  by_the_glass boolean default false,
  coravin boolean default false,
  tasting_notes text,
  food_pairings text[],
  upsell_tip text,
  fix_tip text,
  active boolean default true,
  featured boolean default false,
  created_at timestamptz default now()
);

create index wines_property_id_idx on wines(property_id);
create index wines_type_idx on wines(type);

-- Quizzes
create table quizzes (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade not null,
  title text not null,
  description text,
  questions jsonb not null default '[]',
  active boolean default true,
  created_at timestamptz default now()
);

create index quizzes_property_id_idx on quizzes(property_id);

-- Quiz results
create table quiz_results (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade not null,
  quiz_id uuid references quizzes(id) on delete cascade not null,
  staff_name text not null,
  score integer not null,
  total_questions integer not null,
  answers jsonb,
  completed_at timestamptz default now()
);

create index quiz_results_property_id_idx on quiz_results(property_id);
create index quiz_results_quiz_id_idx on quiz_results(quiz_id);

-- Row Level Security
alter table properties enable row level security;
alter table wines enable row level security;
alter table quizzes enable row level security;
alter table quiz_results enable row level security;

-- Public read access (anon key can read everything)
create policy "Public read properties" on properties for select using (true);
create policy "Public read wines" on wines for select using (true);
create policy "Public read quizzes" on quizzes for select using (true);
create policy "Public read results" on quiz_results for select using (true);

-- Public write for quiz results (staff submit scores without login)
create policy "Public insert results" on quiz_results for insert with check (true);

-- Allow all operations via service role (used by admin panel via anon key with RLS disabled)
-- If you want stricter security, replace anon policies with authenticated policies
-- and use Supabase Auth in the admin panel.
create policy "Anon full access wines" on wines for all using (true) with check (true);
create policy "Anon full access quizzes" on quizzes for all using (true) with check (true);
create policy "Anon full access results" on quiz_results for all using (true) with check (true);
```

After running the SQL, copy the `id` of the inserted property row and set it as `VITE_PROPERTY_ID`.

```sql
select id from properties where name = 'Brumus Bar & Restaurant';
```

---

## Seeding Wine Data

The 82 Brumus wines are bundled in `src/lib/seedData.js`. To import them:

1. Open the admin panel at `/admin`
2. Go to **Wines** → **Seed from file**
3. Confirm the import

Or seed programmatically:

```js
import { seedDatabase } from './src/lib/seedData.js'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
await seedDatabase(supabase, PROPERTY_ID)
```

---

## Netlify Deploy

1. Push the repo to GitHub
2. Connect to Netlify → **Add new site** → **Import from Git**
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in **Site settings → Environment variables**
5. Deploy

The `netlify.toml` includes a redirect rule so React Router works on direct URL access (`/admin`).

---

## Features

### Public Guide (`/`)
- **Wine catalogue** — search, filter by type/body/pairing/special
- **Wine of the Week** banner — admin-pinned featured wine
- **By the Glass** — glass and Coravin wines
- **World Map** — interactive wine regions with country education panels
- **Pairing Suggester** — keyword-scored recommendations
- **Quiz** — multiple choice, scored, saved to Supabase
- **Leaderboard** — top scores per quiz
- **Dark mode** — toggle stored in localStorage

### Admin Panel (`/admin`)
- Passphrase gate (no login required, session stored in `sessionStorage`)
- **Wines** — add/edit/delete, activate/deactivate, pin Wine of the Week, bulk seed
- **Quizzes** — create with auto-generated questions from wine data
- **Results** — filter by quiz/date, CSV export
- **Leaderboard** — delete individual results, reset per quiz
- **Settings** — Wine of the Week picker, default theme, env var instructions

---

## Multi-Tenant Upgrade Path

The schema is already multi-tenant: every table has a `property_id` foreign key and all queries filter by `VITE_PROPERTY_ID`.

To add a second property:
1. Insert a new row in `properties`
2. Deploy a second Netlify site pointing at the same Supabase project
3. Set `VITE_PROPERTY_ID` to the new property's UUID on the second site

Each site will see only its own wines, quizzes, and results. No code changes required.

For a single-app multi-property dashboard, add Supabase Auth and replace the `VITE_PROPERTY_ID` env var with a property selector in the admin UI.
