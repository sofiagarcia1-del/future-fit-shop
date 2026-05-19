-- Sincroniza auth.users (Google OAuth) → public.users + rol customer

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status_id bigint;
  v_rol_id bigint;
  v_user_id bigint;
  v_full_name text;
  v_first text;
  v_last text;
begin
  select id into v_status_id from status where name = 'active' limit 1;
  select id into v_rol_id from rol where name = 'customer' limit 1;

  v_full_name := coalesce(new.raw_user_meta_data ->> 'full_name', '');
  v_first := coalesce(
    nullif(split_part(v_full_name, ' ', 1), ''),
    split_part(coalesce(new.email, 'usuario'), '@', 1)
  );
  v_last := coalesce(
    nullif(trim(substring(v_full_name from position(' ' in v_full_name))), ''),
    ''
  );

  insert into users (auth_user_id, id_status, email, first_name, last_name, created_at)
  values (new.id, v_status_id, coalesce(new.email, ''), v_first, v_last, now())
  on conflict (auth_user_id) do update
    set email = excluded.email,
        first_name = excluded.first_name,
        last_name = excluded.last_name
  returning id into v_user_id;

  if v_rol_id is not null then
    insert into rol_x_user (id_user, id_rol)
    values (v_user_id, v_rol_id)
    on conflict (id_user, id_rol) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- Sincronizar usuarios OAuth ya existentes (ejecutar una vez tras migrar)
create or replace function public.sync_existing_auth_users()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  for r in select id, email, raw_user_meta_data from auth.users loop
    perform public.handle_new_auth_user_manual(r.id, r.email, r.raw_user_meta_data);
  end loop;
end;
$$;

create or replace function public.handle_new_auth_user_manual(
  p_auth_id uuid,
  p_email text,
  p_meta jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status_id bigint;
  v_rol_id bigint;
  v_user_id bigint;
  v_full_name text;
  v_first text;
  v_last text;
begin
  if exists (select 1 from users where auth_user_id = p_auth_id) then
    return;
  end if;

  select id into v_status_id from status where name = 'active' limit 1;
  select id into v_rol_id from rol where name = 'customer' limit 1;

  v_full_name := coalesce(p_meta ->> 'full_name', '');
  v_first := coalesce(nullif(split_part(v_full_name, ' ', 1), ''), split_part(coalesce(p_email, 'usuario'), '@', 1));
  v_last := coalesce(nullif(trim(substring(v_full_name from position(' ' in v_full_name))), ''), '');

  insert into users (auth_user_id, id_status, email, first_name, last_name, created_at)
  values (p_auth_id, v_status_id, coalesce(p_email, ''), v_first, v_last, now())
  returning id into v_user_id;

  if v_rol_id is not null then
    insert into rol_x_user (id_user, id_rol)
    values (v_user_id, v_rol_id)
    on conflict (id_user, id_rol) do nothing;
  end if;
end;
$$;

grant execute on function public.handle_new_auth_user_manual(uuid, text, jsonb) to authenticated;
grant execute on function public.current_app_user_id() to authenticated, anon;
grant execute on function public.is_admin() to authenticated;
