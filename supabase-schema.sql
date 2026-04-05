-- Run this in Supabase → SQL Editor → New Query
-- If you already ran the previous schema, just run the NEW section below

-- Table 1: Daily tracking data
create table if not exists days (
  id         bigint generated always as identity primary key,
  user_id    text not null,
  date       date not null,
  data       jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, date)
);

-- Table 2: Weekly weight entries
create table if not exists weights (
  id         bigint generated always as identity primary key,
  user_id    text not null,
  date       date not null,
  weight     numeric(5,1) not null,
  note       text default '',
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- ── NEW: Table 3: Weekly body measurements ────────────────────────
create table if not exists measurements (
  id         bigint generated always as identity primary key,
  user_id    text not null,
  date       date not null,
  height     numeric(4,1) default 71,
  waist      numeric(4,1),
  hips       numeric(4,1),
  neck       numeric(4,1),
  chest      numeric(4,1),
  arm        numeric(4,1),
  thigh      numeric(4,1),
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- RLS
alter table days         enable row level security;
alter table weights      enable row level security;
alter table measurements enable row level security;

create policy "days_anon"         on days         for all using (true) with check (true);
create policy "weights_anon"      on weights      for all using (true) with check (true);
create policy "measurements_anon" on measurements for all using (true) with check (true);

-- Indexes
create index if not exists days_user_date         on days         (user_id, date);
create index if not exists weights_user_date      on weights      (user_id, date);
create index if not exists measurements_user_date on measurements (user_id, date);
