-- Run this in Supabase SQL Editor

create table if not exists transactions (
  id text primary key,
  hash text,
  type text,
  amount text,
  amount_inr text,
  from_address text,
  to_address text,
  status text default 'pending',
  block_number bigint,
  gas_used text,
  fees_inr text,
  network text default 'Sepolia Testnet',
  note text,
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  role text default 'user',
  wallet_address text,
  created_at timestamptz default now()
);

-- Seed demo users
insert into users (email, name, role) values
  ('demo@nexus.in', 'Arjun Sharma', 'user'),
  ('admin@nexus.in', 'Priya Mehta', 'admin')
on conflict (email) do nothing;
