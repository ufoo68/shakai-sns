alter table "books"
  add column if not exists "translator" text not null default '';
