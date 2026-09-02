-- OpenSpec change: supabase-prisma-setup
-- Row Level Security policies implementing the `database-access-control` spec.
--
-- Precondition (see design.md, Decision 4): when a Supabase Auth admin user
-- is created, the corresponding public."User" row MUST reuse the same UUID
-- as auth.users.id. is_admin() relies on that invariant and fails closed
-- (returns false) if the ids were never linked.

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from "User" u
    where u.id = auth.uid()::text
      and u.role = 'ADMIN'
  );
$$;

-- 3.1 Enable RLS on every table
alter table "User" enable row level security;
alter table "ProfileConfig" enable row level security;
alter table "FeaturedVideo" enable row level security;
alter table "SheetMusic" enable row level security;
alter table "ServicePackage" enable row level security;
alter table "Order" enable row level security;
alter table "OrderItem" enable row level security;
alter table "Commission" enable row level security;

-- 3.2 Anonymous / general users can read only published content
create policy "public read published sheet music"
  on "SheetMusic" for select
  to anon, authenticated
  using ("isPublished" = true);

create policy "public read published featured videos"
  on "FeaturedVideo" for select
  to anon, authenticated
  using ("isPublished" = true);

create policy "public read published service packages"
  on "ServicePackage" for select
  to anon, authenticated
  using ("isPublished" = true);

create policy "public read profile config"
  on "ProfileConfig" for select
  to anon, authenticated
  using (true);

-- 3.3 Users can create orders/commissions, but cannot read anyone's rows
-- (guest checkout is email-based, not tied to a Supabase Auth session, so
-- there is no reliable ownership column to key a SELECT policy on; the
-- absence of a SELECT policy denies all anon/authenticated reads by default
-- once RLS is enabled).
create policy "anyone can create an order"
  on "Order" for insert
  to anon, authenticated
  with check (true);

create policy "anyone can create order items"
  on "OrderItem" for insert
  to anon, authenticated
  with check (true);

create policy "anyone can submit a commission"
  on "Commission" for insert
  to anon, authenticated
  with check (true);

-- 3.4 Admins can fully read/write every table
create policy "admin full access to user"
  on "User" for all
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "admin full access to profile config"
  on "ProfileConfig" for all
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "admin full access to featured video"
  on "FeaturedVideo" for all
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "admin full access to sheet music"
  on "SheetMusic" for all
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "admin full access to service package"
  on "ServicePackage" for all
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "admin full access to order"
  on "Order" for all
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "admin full access to order item"
  on "OrderItem" for all
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "admin full access to commission"
  on "Commission" for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- Note: the Postgres role Prisma connects as (via DATABASE_URL/DIRECT_URL)
-- and Supabase's service_role both bypass RLS entirely by design. This is
-- how the ECPay webhook (server-side, no end-user session) is able to flip
-- an Order to SUCCESS per the `database-access-control` spec's "服務端金流
-- 與交付流程使用特權存取" requirement - it never needs its own policy here.
