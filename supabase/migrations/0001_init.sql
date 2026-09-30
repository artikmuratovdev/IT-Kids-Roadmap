-- IT Kids platformasi: boshlang'ich sxema
-- Supabase → SQL Editor ga nusxa ko'chirib ishga tushiring.

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null,
  role text not null check (role in ('student', 'teacher')),
  group_id uuid references public.groups(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.group_lessons (
  group_id uuid not null references public.groups(id) on delete cascade,
  lesson_id text not null,
  is_current boolean not null default false,
  test_open boolean not null default false,
  opened_at timestamptz not null default now(),
  primary key (group_id, lesson_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  lesson_id text not null,
  answers jsonb not null,
  score int not null,
  total int not null,
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_group_idx on public.quiz_attempts(group_id, lesson_id);
create index if not exists quiz_attempts_student_idx on public.quiz_attempts(student_id);

-- Yordamchi funksiyalar (security definer: RLS ichida rekursiyani oldini oladi)
create or replace function public.my_group_id() returns uuid
language sql stable security definer set search_path = public as $$
  select group_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_group_teacher(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.groups where id = g and teacher_id = auth.uid())
$$;

alter table public.groups enable row level security;
alter table public.profiles enable row level security;
alter table public.group_lessons enable row level security;
alter table public.quiz_attempts enable row level security;

-- groups
drop policy if exists "groups: teacher all" on public.groups;
create policy "groups: teacher all" on public.groups
  for all using (teacher_id = auth.uid()) with check (
    teacher_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
  );
drop policy if exists "groups: member read" on public.groups;
create policy "groups: member read" on public.groups
  for select using (id = public.my_group_id());

-- profiles (yaratish faqat server orqali — service role)
drop policy if exists "profiles: self read" on public.profiles;
create policy "profiles: self read" on public.profiles
  for select using (id = auth.uid());
drop policy if exists "profiles: teacher reads group" on public.profiles;
create policy "profiles: teacher reads group" on public.profiles
  for select using (group_id is not null and public.is_group_teacher(group_id));

-- group_lessons
drop policy if exists "group_lessons: member read" on public.group_lessons;
create policy "group_lessons: member read" on public.group_lessons
  for select using (group_id = public.my_group_id() or public.is_group_teacher(group_id));
drop policy if exists "group_lessons: teacher write" on public.group_lessons;
create policy "group_lessons: teacher write" on public.group_lessons
  for all using (public.is_group_teacher(group_id)) with check (public.is_group_teacher(group_id));

-- quiz_attempts (yozish faqat server action orqali — ball serverda hisoblanadi)
drop policy if exists "attempts: self read" on public.quiz_attempts;
create policy "attempts: self read" on public.quiz_attempts
  for select using (student_id = auth.uid());
drop policy if exists "attempts: teacher read" on public.quiz_attempts;
create policy "attempts: teacher read" on public.quiz_attempts
  for select using (group_id is not null and public.is_group_teacher(group_id));
