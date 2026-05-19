-- Row Level Security — Tryfit

alter table status enable row level security;
alter table gender enable row level security;
alter table rol enable row level security;
alter table notification_type enable row level security;
alter table payment_method enable row level security;
alter table users enable row level security;
alter table rol_x_user enable row level security;
alter table user_photo enable row level security;
alter table brand enable row level security;
alter table color enable row level security;
alter table size enable row level security;
alter table category enable row level security;
alter table supplier enable row level security;
alter table product enable row level security;
alter table product_x_category enable row level security;
alter table photos_x_product enable row level security;
alter table orders enable row level security;
alter table product_x_order enable row level security;
alter table notification enable row level security;

-- Helper: perfil interno del usuario autenticado
create or replace function public.current_app_user_id()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select id from users where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from rol_x_user rxu
    join rol r on r.id = rxu.id_rol
    join users u on u.id = rxu.id_user
    where u.auth_user_id = auth.uid()
      and r.name = 'admin'
  );
$$;

-- Lectura pública de catálogo y lookups
create policy "status_read_all" on status for select to anon, authenticated using (true);
create policy "gender_read_all" on gender for select to anon, authenticated using (true);
create policy "rol_read_auth" on rol for select to authenticated using (true);
create policy "notification_type_read_auth" on notification_type for select to authenticated using (true);
create policy "payment_method_read_all" on payment_method for select to anon, authenticated using (true);

create policy "brand_read_all" on brand for select to anon, authenticated using (true);
create policy "color_read_all" on color for select to anon, authenticated using (true);
create policy "size_read_all" on size for select to anon, authenticated using (true);
create policy "category_read_all" on category for select to anon, authenticated using (true);
create policy "supplier_read_auth" on supplier for select to authenticated using (true);

create policy "product_read_active" on product for select to anon, authenticated
  using (
    exists (select 1 from status s where s.id = product.id_status and s.name = 'active')
  );

create policy "product_admin_all" on product for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_x_category_read" on product_x_category for select to anon, authenticated using (true);
create policy "photos_x_product_read" on photos_x_product for select to anon, authenticated using (true);

-- Usuarios
create policy "users_select_own" on users for select to authenticated
  using (auth_user_id = auth.uid() or public.is_admin());

create policy "users_update_own" on users for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

create policy "rol_x_user_select_own" on rol_x_user for select to authenticated
  using (id_user = public.current_app_user_id() or public.is_admin());

create policy "user_photo_own" on user_photo for all to authenticated
  using (id_user = public.current_app_user_id())
  with check (id_user = public.current_app_user_id());

-- Pedidos
create policy "orders_select_own" on orders for select to authenticated
  using (id_user = public.current_app_user_id() or public.is_admin());

create policy "orders_insert_own" on orders for insert to authenticated
  with check (id_user = public.current_app_user_id());

create policy "orders_admin_update" on orders for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_x_order_select" on product_x_order for select to authenticated
  using (
    exists (
      select 1 from orders o
      where o.id = product_x_order.id_order
        and (o.id_user = public.current_app_user_id() or public.is_admin())
    )
  );

create policy "product_x_order_insert" on product_x_order for insert to authenticated
  with check (
    exists (
      select 1 from orders o
      where o.id = product_x_order.id_order
        and o.id_user = public.current_app_user_id()
    )
  );

-- Notificaciones
create policy "notification_own" on notification for select to authenticated
  using (id_user = public.current_app_user_id());

create policy "notification_insert_system" on notification for insert to authenticated
  with check (id_user = public.current_app_user_id() or public.is_admin());

-- Vista catálogo (hereda permisos de tablas base; grant explícito)
grant select on product_catalog to anon, authenticated;
