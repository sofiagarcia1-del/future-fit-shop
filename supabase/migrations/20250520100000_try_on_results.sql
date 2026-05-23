-- Virtual Try-On results (FASHN AI)

insert into status (name) values
  ('completed'),
  ('failed')
on conflict (name) do nothing;

create table try_on_result (
  id bigint generated always as identity primary key,
  id_user bigint not null references users (id) on delete cascade,
  id_product bigint not null references product (id) on delete restrict,
  original_user_image text,
  garment_image varchar(3000) not null,
  generated_image varchar(3000),
  fashn_prediction_id varchar(200),
  id_status bigint not null references status (id),
  error_message varchar(500),
  saved boolean not null default false,
  created_at timestamptz not null default now()
);

create index try_on_result_user_idx on try_on_result (id_user);
create index try_on_result_product_idx on try_on_result (id_product);
create index try_on_result_created_idx on try_on_result (created_at desc);

comment on table try_on_result is 'Resultados de Virtual Try-On (FASHN AI) por usuario y producto';

alter table try_on_result enable row level security;

create policy "try_on_select_own" on try_on_result for select to authenticated
  using (id_user = public.current_app_user_id() or public.is_admin());

create policy "try_on_insert_own" on try_on_result for insert to authenticated
  with check (id_user = public.current_app_user_id());

create policy "try_on_update_own" on try_on_result for update to authenticated
  using (id_user = public.current_app_user_id())
  with check (id_user = public.current_app_user_id());

create policy "try_on_delete_own" on try_on_result for delete to authenticated
  using (id_user = public.current_app_user_id() or public.is_admin());
