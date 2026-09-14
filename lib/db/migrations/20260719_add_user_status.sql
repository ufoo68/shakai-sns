alter table "user"
  add column if not exists "status" text not null default 'active';
