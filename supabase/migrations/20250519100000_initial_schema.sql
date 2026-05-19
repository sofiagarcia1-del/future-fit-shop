-- Tryfit — Modelo relacional (draw.io)
-- PostgreSQL / Supabase

-- ---------------------------------------------------------------------------
-- Lookup & sistema
-- ---------------------------------------------------------------------------

create table status (
  id bigint generated always as identity primary key,
  name varchar(50) not null unique
);

create table gender (
  id bigint generated always as identity primary key,
  name varchar(50) not null unique
);

create table rol (
  id bigint generated always as identity primary key,
  name varchar(50) not null unique
);

create table notification_type (
  id bigint generated always as identity primary key,
  name varchar(50) not null unique
);

create table payment_method (
  id bigint generated always as identity primary key,
  name varchar(50) not null unique
);

-- ---------------------------------------------------------------------------
-- Usuarios (vinculado a auth.users de Supabase)
-- ---------------------------------------------------------------------------

create table users (
  id bigint generated always as identity primary key,
  auth_user_id uuid unique references auth.users (id) on delete cascade,
  id_status bigint not null references status (id),
  id_gender bigint references gender (id),
  first_name varchar(200) not null default '',
  last_name varchar(200) not null default '',
  birth_date date,
  email varchar(300) not null,
  phone varchar(20),
  created_at timestamptz not null default now(),
  height numeric(4, 1),
  weight numeric(4, 1),
  chest numeric(4, 1),
  waist numeric(4, 1),
  hips numeric(4, 1)
);

create index users_auth_user_id_idx on users (auth_user_id);
create index users_email_idx on users (email);

create table rol_x_user (
  id bigint generated always as identity primary key,
  id_user bigint not null references users (id) on delete cascade,
  id_rol bigint not null references rol (id) on delete cascade,
  unique (id_user, id_rol)
);

create table user_photo (
  id bigint generated always as identity primary key,
  id_user bigint not null references users (id) on delete cascade,
  photofront_url varchar(3000),
  photoback_url varchar(3000),
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index user_photo_user_idx on user_photo (id_user);

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------

create table brand (
  id bigint generated always as identity primary key,
  name varchar(200) not null,
  created_at timestamptz not null default now()
);

create table color (
  id bigint generated always as identity primary key,
  name varchar(50) not null,
  hex_code varchar(7)
);

create table size (
  id bigint generated always as identity primary key,
  name varchar(200) not null
);

create table category (
  id bigint generated always as identity primary key,
  name varchar(100) not null unique
);

create table supplier (
  id bigint generated always as identity primary key,
  name varchar(200) not null,
  email varchar(200),
  phone_number varchar(100),
  address varchar(500)
);

create table product (
  id bigint generated always as identity primary key,
  id_brand bigint not null references brand (id),
  id_status bigint not null references status (id),
  id_color bigint references color (id),
  id_size bigint references size (id),
  id_suppliers bigint references supplier (id),
  name varchar(200) not null,
  description varchar(500),
  created_at timestamptz not null default now(),
  unit_price numeric(10, 2) not null check (unit_price >= 0)
);

create index product_brand_idx on product (id_brand);
create index product_status_idx on product (id_status);

create table product_x_category (
  id bigint generated always as identity primary key,
  id_product bigint not null references product (id) on delete cascade,
  id_category bigint not null references category (id) on delete cascade,
  unique (id_product, id_category)
);

create table photos_x_product (
  id bigint generated always as identity primary key,
  id_product bigint not null references product (id) on delete cascade,
  image_url varchar(3000) not null,
  id_fotos_x_producto_padre bigint references photos_x_product (id) on delete set null,
  fabric_type varchar(100),
  created_at timestamptz not null default now(),
  is_front boolean not null default true
);

create index photos_x_product_product_idx on photos_x_product (id_product);

-- ---------------------------------------------------------------------------
-- Pedidos
-- ---------------------------------------------------------------------------

create table orders (
  id bigint generated always as identity primary key,
  id_user bigint not null references users (id) on delete restrict,
  id_status bigint not null references status (id),
  id_payment_method bigint references payment_method (id),
  total_amount numeric(10, 2) not null default 0 check (total_amount >= 0),
  address varchar(100) not null,
  created_at timestamptz not null default now()
);

create index orders_user_idx on orders (id_user);

create table product_x_order (
  id bigint generated always as identity primary key,
  id_order bigint not null references orders (id) on delete cascade,
  id_product bigint not null references product (id) on delete restrict,
  quantity int not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  subtotal numeric(10, 2) not null check (subtotal >= 0)
);

create index product_x_order_order_idx on product_x_order (id_order);

-- ---------------------------------------------------------------------------
-- Notificaciones
-- ---------------------------------------------------------------------------

create table notification (
  id bigint generated always as identity primary key,
  id_user bigint not null references users (id) on delete cascade,
  id_status bigint not null references status (id),
  id_notification_type bigint not null references notification_type (id),
  message varchar(1000) not null,
  sent_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Vista catálogo (frontend)
-- ---------------------------------------------------------------------------

create or replace view product_catalog as
select
  p.id,
  p.name,
  p.description,
  p.unit_price,
  p.created_at,
  b.name as brand,
  coalesce(
    (
      select c.name
      from product_x_category pxc
      join category c on c.id = pxc.id_category
      where pxc.id_product = p.id
      order by c.name
      limit 1
    ),
    'General'
  ) as category,
  coalesce(
    (
      select pxp.image_url
      from photos_x_product pxp
      where pxp.id_product = p.id
      order by pxp.is_front desc, pxp.id
      limit 1
    ),
    ''
  ) as image_url,
  col.name as color_name,
  col.hex_code as color_hex,
  s.name as size_name
from product p
join brand b on b.id = p.id_brand
join status st on st.id = p.id_status
left join color col on col.id = p.id_color
left join size s on s.id = p.id_size
where st.name = 'active';

comment on view product_catalog is 'Productos activos con marca, categoría principal e imagen destacada';
