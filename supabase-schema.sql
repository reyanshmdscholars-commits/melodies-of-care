-- ============================================================
-- Melodies of Care — Full Schema (re-runnable)
-- Paste into Supabase SQL Editor and click Run.
-- ============================================================

-- ── 1. VOLUNTEERS ────────────────────────────────────────────
create table if not exists public.volunteers (
  id            uuid    primary key default gen_random_uuid(),
  name          text    not null,
  email         text    not null default '',
  password_hash text    not null default '',
  instrument    text    not null default '',
  status        text    not null default 'pending' check (status in ('pending','approved')),
  hours         integer not null default 0,
  media_consent boolean not null default false
);
alter table public.volunteers add column if not exists email         text    not null default '';
alter table public.volunteers add column if not exists password_hash text    not null default '';
alter table public.volunteers add column if not exists media_consent boolean not null default false;

-- Remove old seed rows that have no email (they can't satisfy the unique constraint)
delete from public.volunteers where email = '';

-- Now safely add the unique constraint
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'volunteers_email_key') then
    alter table public.volunteers add constraint volunteers_email_key unique (email);
  end if;
end $$;

-- ── 2. EVENTS ────────────────────────────────────────────────
create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  facility_name text not null,
  date          date not null,
  time          time not null,
  status        text not null default 'open' check (status in ('open','filled')),
  volunteer_id  uuid references public.volunteers(id) on delete set null,
  notes         text not null default ''
);
alter table public.events add column if not exists notes text not null default '';
alter table public.events drop column if exists instrument_required;

-- ── 3. EVENT SIGNUPS (multi-slot, max 10 per event) ──────────
create table if not exists public.event_signups (
  id             uuid        primary key default gen_random_uuid(),
  event_id       uuid        not null references public.events(id)    on delete cascade,
  volunteer_id   uuid        not null references public.volunteers(id) on delete cascade,
  volunteer_name text        not null,
  claimed_at     timestamptz not null default now(),
  songs          integer     not null default 1,
  hours_approved boolean     not null default false,
  song_details   jsonb,
  unique (event_id, volunteer_id)
);
-- Add columns if table already exists (safe to re-run)
alter table public.event_signups add column if not exists songs          integer not null default 1;
alter table public.event_signups add column if not exists hours_approved boolean not null default false;
alter table public.event_signups add column if not exists song_details   jsonb;

-- ── 4. ROW LEVEL SECURITY ────────────────────────────────────
alter table public.events        enable row level security;
alter table public.volunteers    enable row level security;
alter table public.event_signups enable row level security;

drop policy if exists "Public can read events"    on public.events;
drop policy if exists "Public can insert events"  on public.events;
drop policy if exists "Public can update events"  on public.events;
drop policy if exists "Public can delete events"  on public.events;
create policy "Public can read events"    on public.events for select using (true);
create policy "Public can insert events"  on public.events for insert with check (true);
create policy "Public can update events"  on public.events for update using (true);
create policy "Public can delete events"  on public.events for delete using (true);

drop policy if exists "Public can insert volunteers" on public.volunteers;
drop policy if exists "Public can read volunteers"   on public.volunteers;
drop policy if exists "Public can update volunteers" on public.volunteers;
create policy "Public can insert volunteers" on public.volunteers for insert with check (true);
create policy "Public can read volunteers"   on public.volunteers for select using (true);
create policy "Public can update volunteers" on public.volunteers for update using (true);

drop policy if exists "Public can read signups"   on public.event_signups;
drop policy if exists "Public can insert signups" on public.event_signups;
drop policy if exists "Public can delete signups" on public.event_signups;
drop policy if exists "Public can update signups" on public.event_signups;
create policy "Public can read signups"   on public.event_signups for select using (true);
create policy "Public can insert signups" on public.event_signups for insert with check (true);
create policy "Public can delete signups" on public.event_signups for delete using (true);
create policy "Public can update signups" on public.event_signups for update using (true);

-- ── 5. RPC: claim_event ──────────────────────────────────────
create or replace function public.claim_event(event_id uuid, v_id uuid)
returns void language plpgsql security definer as $$
declare
  signup_count int;
  vol_name     text;
begin
  select name into vol_name from public.volunteers where id = v_id;
  if vol_name is null then raise exception 'Volunteer not found.'; end if;

  select count(*) into signup_count
  from public.event_signups where event_signups.event_id = claim_event.event_id;

  if signup_count >= 10 then raise exception 'Event is full (10/10 slots).'; end if;

  insert into public.event_signups (event_id, volunteer_id, volunteer_name)
  values (claim_event.event_id, v_id, vol_name);

  if signup_count + 1 >= 10 then
    update public.events set status = 'filled' where id = claim_event.event_id;
  end if;
end;
$$;

-- ── 6. RPC: unclaim_event ────────────────────────────────────
create or replace function public.unclaim_event(event_id uuid, v_id uuid)
returns void language plpgsql security definer as $$
declare
  waitlisted_id   uuid;
  waitlisted_name text;
  new_count       int;
begin
  -- Remove the signup
  delete from public.event_signups
  where event_signups.event_id = unclaim_event.event_id
    and volunteer_id = v_id;

  -- Reopen the event
  update public.events set status = 'open' where id = unclaim_event.event_id;

  -- Promote first person on waitlist if any
  select wl.volunteer_id, wl.volunteer_name
  into waitlisted_id, waitlisted_name
  from public.event_waitlist wl
  where wl.event_id = unclaim_event.event_id
  order by wl.position asc
  limit 1;

  if waitlisted_id is not null then
    -- Move them from waitlist to signups
    insert into public.event_signups (event_id, volunteer_id, volunteer_name)
    values (unclaim_event.event_id, waitlisted_id, waitlisted_name)
    on conflict do nothing;

    delete from public.event_waitlist
    where event_waitlist.event_id = unclaim_event.event_id
      and volunteer_id = waitlisted_id;

    -- Renumber remaining waitlist positions
    update public.event_waitlist
    set position = position - 1
    where event_waitlist.event_id = unclaim_event.event_id;

    -- Check if still full after promotion
    select count(*) into new_count from public.event_signups
    where event_signups.event_id = unclaim_event.event_id;
    if new_count >= 10 then
      update public.events set status = 'filled' where id = unclaim_event.event_id;
    end if;
  end if;
end;
$$;

-- ── 7. ANNOUNCEMENTS ─────────────────────────────────────────
create table if not exists public.announcements (
  id         uuid        primary key default gen_random_uuid(),
  message    text        not null,
  is_active  boolean     not null default true,
  created_at timestamptz not null default now()
);
drop policy if exists "Public can read announcements"   on public.announcements;
drop policy if exists "Public can insert announcements" on public.announcements;
drop policy if exists "Public can update announcements" on public.announcements;
drop policy if exists "Public can delete announcements" on public.announcements;
alter table public.announcements enable row level security;
create policy "Public can read announcements"   on public.announcements for select using (true);
create policy "Public can insert announcements" on public.announcements for insert with check (true);
create policy "Public can update announcements" on public.announcements for update using (true);
create policy "Public can delete announcements" on public.announcements for delete using (true);

-- ── 8. WAITLIST ───────────────────────────────────────────────
create table if not exists public.event_waitlist (
  id             uuid        primary key default gen_random_uuid(),
  event_id       uuid        not null references public.events(id)    on delete cascade,
  volunteer_id   uuid        not null references public.volunteers(id) on delete cascade,
  volunteer_name text        not null,
  position       integer     not null default 1,
  joined_at      timestamptz not null default now(),
  unique (event_id, volunteer_id)
);
drop policy if exists "Public can read waitlist"   on public.event_waitlist;
drop policy if exists "Public can insert waitlist" on public.event_waitlist;
drop policy if exists "Public can delete waitlist" on public.event_waitlist;
drop policy if exists "Public can update waitlist" on public.event_waitlist;
alter table public.event_waitlist enable row level security;
create policy "Public can read waitlist"   on public.event_waitlist for select using (true);
create policy "Public can insert waitlist" on public.event_waitlist for insert with check (true);
create policy "Public can delete waitlist" on public.event_waitlist for delete using (true);
create policy "Public can update waitlist" on public.event_waitlist for update using (true);

-- ── 9. FACILITY INQUIRIES ─────────────────────────────────────
create table if not exists public.facility_inquiries (
  id            uuid        primary key default gen_random_uuid(),
  facility_name text        not null,
  contact_name  text        not null,
  email         text        not null,
  phone         text        not null default '',
  city          text        not null default '',
  message       text        not null default '',
  created_at    timestamptz not null default now()
);
drop policy if exists "Public can insert inquiries" on public.facility_inquiries;
drop policy if exists "Public can read inquiries"   on public.facility_inquiries;
alter table public.facility_inquiries enable row level security;
create policy "Public can insert inquiries" on public.facility_inquiries for insert with check (true);
create policy "Public can read inquiries"   on public.facility_inquiries for select using (true);

-- ── RPC: approve_hours ───────────────────────────────────────
-- Called by admin to approve hours for a specific signup.
-- hours: 1 song → 2 hrs, 2 songs → 5 hrs (max 2 songs)
create or replace function public.approve_hours(signup_id uuid)
returns void language plpgsql security definer as $$
declare
  rec record;
  hrs integer;
begin
  select * into rec from public.event_signups where id = signup_id;
  if rec is null then raise exception 'Signup not found.'; end if;
  if rec.hours_approved then raise exception 'Hours already approved.'; end if;

  hrs := case when rec.songs = 1 then 2 else 5 end;

  update public.event_signups set hours_approved = true where id = signup_id;
  update public.volunteers    set hours = hours + hrs where id = rec.volunteer_id;
end;
$$;

-- ── 6. RPC: get_event_signup_counts ──────────────────────────
create or replace function public.get_event_signup_counts()
returns table (event_id uuid, signup_count bigint)
language sql security definer as $$
  select event_id, count(*) as signup_count
  from public.event_signups group by event_id;
$$;

-- ── 7. SEED DATA ─────────────────────────────────────────────
insert into public.events (facility_name, date, time, status)
values
  ('Sunrise Manor',              current_date + 3,  '14:00', 'open'),
  ('Oakridge Senior Living',     current_date + 5,  '10:30', 'open'),
  ('The Meadows Memory Care',    current_date + 7,  '15:00', 'open'),
  ('Brookhaven Assisted Living', current_date + 10, '11:00', 'open'),
  ('Heritage Place',             current_date + 12, '13:30', 'open'),
  ('Willow Creek Gardens',       current_date + 14, '14:30', 'open')
on conflict do nothing;

-- ── 10. GALLERY ITEMS ─────────────────────────────────────────
create table if not exists public.gallery_items (
  id         uuid        primary key default gen_random_uuid(),
  title      text        not null,
  date       text        not null default '',
  category   text        not null default 'Concerts',
  image_url  text        not null default '',
  color      text        not null default 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  sort_order integer     not null default 0,
  created_at timestamptz not null default now()
);
alter table public.gallery_items enable row level security;
drop policy if exists "Public can read gallery"   on public.gallery_items;
drop policy if exists "Public can insert gallery" on public.gallery_items;
drop policy if exists "Public can update gallery" on public.gallery_items;
drop policy if exists "Public can delete gallery" on public.gallery_items;
create policy "Public can read gallery"   on public.gallery_items for select using (true);
create policy "Public can insert gallery" on public.gallery_items for insert with check (true);
create policy "Public can update gallery" on public.gallery_items for update using (true);
create policy "Public can delete gallery" on public.gallery_items for delete using (true);

insert into public.gallery_items (title, date, category, color, sort_order) values
  ('String Quartet at Sunrise Manor',       'March 2025',    'Concerts',     'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 1),
  ('Piano Recital — Memory Care Unit',      'February 2025', 'Memory Care',  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 2),
  ('Volunteer Orientation Day',             'January 2025',  'Community',    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 3),
  ('Holiday Concert — Oakridge Senior',     'December 2024', 'Concerts',     'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 4),
  ('Guitar & Stories — Brookhaven',         'November 2024', 'Memory Care',  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 5),
  ('Orchestra Night at Heritage Place',     'October 2024',  'Concerts',     'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', 6),
  ('Music & Movement Therapy Session',      'September 2024','Therapy',      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', 7),
  ('Volunteer Spotlight — Emily & Cello',   'August 2024',   'Community',    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', 8),
  ('Jazz Afternoon at Willow Creek',        'July 2024',     'Concerts',     'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', 9),
  ('Resident Singalong — The Meadows',      'June 2024',     'Memory Care',  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', 10),
  ('Summer Gala Fundraiser',                'May 2024',      'Events',       'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', 11),
  ('Flute & Harp Duet — Sunrise Gardens',  'April 2024',    'Concerts',     'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', 12)
on conflict do nothing;

-- ── 11. TEAM MEMBERS ──────────────────────────────────────────
create table if not exists public.team_members (
  id         uuid    primary key default gen_random_uuid(),
  name       text    not null,
  role       text    not null default '',
  instrument text    not null default '',
  bio        text    not null default '',
  initials   text    not null default '',
  hue        text    not null default '210',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.team_members enable row level security;
drop policy if exists "Public can read team"   on public.team_members;
drop policy if exists "Public can insert team" on public.team_members;
drop policy if exists "Public can update team" on public.team_members;
drop policy if exists "Public can delete team" on public.team_members;
create policy "Public can read team"   on public.team_members for select using (true);
create policy "Public can insert team" on public.team_members for insert with check (true);
create policy "Public can update team" on public.team_members for update using (true);
create policy "Public can delete team" on public.team_members for delete using (true);

insert into public.team_members (name, role, instrument, bio, initials, hue, sort_order) values
  ('Sophia Vela',   'Executive Director & Co-Founder',  'Piano',   'A classically trained pianist with a Master''s in Music Therapy, Sophia built Melodies of Care after volunteering at her grandmother''s memory care unit during college.', 'SV', '210', 1),
  ('Marcus Reid',   'Director of Volunteer Programs',   'Guitar',  'Marcus spent a decade touring as a jazz guitarist before channeling that energy into training the next generation of care musicians. He leads all volunteer onboarding.', 'MR', '20',  2),
  ('Lily Chen',     'Community Partnerships Manager',   'Violin',  'Lily forged relationships with over 40 facilities across the Dallas-Fort Worth area. Her background in social work gives her a unique lens on elder care.', 'LC', '170', 3),
  ('James Okafor',  'Head of Music Programming',        'Cello',   'James curates the repertoire for all our visits, tailoring setlists to the era and preferences of each community. He holds degrees from Juilliard and UT Austin.', 'JO', '280', 4),
  ('Amara Singh',   'Volunteer Coordinator',            'Flute',   'Amara manages day-to-day scheduling for 500+ volunteers, ensuring every facility visit is staffed and every musician feels supported and appreciated.', 'AS', '340', 5),
  ('Derek Monroe',  'Development & Fundraising',        'Trumpet', 'Derek brings 12 years of nonprofit development experience and a lifelong love of jazz. He secures the grants and donor relationships that keep our work free for facilities.', 'DM', '45',  6),
  ('Priya Nair',    'Volunteer Training Lead',          'Harp',    'Priya developed our 8-week volunteer certification program and leads every cohort personally. She believes preparation is what turns good musicians into great care givers.', 'PN', '90',  7),
  ('Tom Harlow',    'Operations Manager',               'Drums',   'Tom keeps the engine running — coordinating logistics for 200+ annual concerts, managing equipment loans, and making sure every visit happens without a hitch.', 'TH', '190', 8)
on conflict do nothing;

-- ── 12. STORAGE BUCKET (Gallery Images) ───────────────────────
insert into storage.buckets (id, name, public)
  values ('gallery', 'gallery', true)
  on conflict (id) do nothing;

drop policy if exists "Public can view gallery images"   on storage.objects;
drop policy if exists "Public can upload gallery images" on storage.objects;
drop policy if exists "Public can delete gallery images" on storage.objects;

create policy "Public can view gallery images"
  on storage.objects for select using (bucket_id = 'gallery');

create policy "Public can upload gallery images"
  on storage.objects for insert with check (bucket_id = 'gallery');

create policy "Public can delete gallery images"
  on storage.objects for delete using (bucket_id = 'gallery');
