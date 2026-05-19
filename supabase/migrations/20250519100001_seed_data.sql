-- Datos iniciales Tryfit (lookup + catálogo demo alineado con el frontend)

insert into status (name) values
  ('active'),
  ('inactive'),
  ('pending'),
  ('processing'),
  ('shipped'),
  ('delivered'),
  ('cancelled');

insert into gender (name) values
  ('Femenino'),
  ('Masculino'),
  ('No binario'),
  ('Prefiero no decir');

insert into rol (name) values
  ('admin'),
  ('customer');

insert into notification_type (name) values
  ('order_update'),
  ('promotion'),
  ('system');

insert into payment_method (name) values
  ('card'),
  ('paypal'),
  ('transfer');

insert into brand (name) values
  ('Maison Lou'),
  ('Norra Studio'),
  ('Atelier 6'),
  ('Form&Co');

insert into category (name) values
  ('Chaquetas'),
  ('Camisas'),
  ('Hoodies'),
  ('Pantalones'),
  ('Vestidos'),
  ('Zapatos'),
  ('Accesorios');

insert into color (name, hex_code) values
  ('Olive', '#6F6C43'),
  ('Chamomile', '#D2BF81'),
  ('Sage', '#99ABA6'),
  ('Almond', '#F0EAD8');

insert into size (name) values
  ('XS'), ('S'), ('M'), ('L'), ('XL');

insert into supplier (name, email) values
  ('Tryfit Logistics', 'supply@tryfit.com');

-- Productos (IDs explícitos 1–8 para compatibilidad con seeds del frontend)
insert into product (id, id_brand, id_status, id_color, id_size, id_suppliers, name, description, unit_price)
overriding system value
values
  (1, 1, 1, 1, 4, 1, 'Trench de Lino Esencial', 'Trench arquitectónico en mezcla técnica de lino. Silueta oversize con costuras invisibles.', 289),
  (2, 2, 1, 3, 4, 1, 'Camisa Sage Oversize', 'Camisa fluida de algodón orgánico en tono sage. Corte relajado.', 149),
  (3, 3, 1, 4, 4, 1, 'Knit de Lana Crema', 'Punto pesado de merino mono-tono. Hombro caído relajado.', 159),
  (4, 4, 1, 1, 4, 1, 'Pantalón Wide Olive', 'Pantalón wide-leg con bolsillos utility y bajo ajustable.', 199),
  (5, 1, 1, 4, 4, 1, 'Vestido Cami Almond', 'Vestido midi en satén almond con tirantes ajustables.', 219),
  (6, 2, 1, 4, 4, 1, 'Hoodie Cashmere Mist', 'Sudadera de cashmere brushed con bordado tonal.', 189),
  (7, 3, 1, 2, 4, 1, 'Chaqueta Suede Chamomile', 'Chaqueta premium en ante. Corte cropped con cierre asimétrico.', 549),
  (8, 4, 1, 1, 4, 1, 'Pantalón Plisado Sand', 'Pantalón ancho a medida con pliegues marcados.', 169);

select setval(pg_get_serial_sequence('product', 'id'), (select max(id) from product));

insert into product_x_category (id_product, id_category) values
  (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 3), (7, 1), (8, 4);

insert into photos_x_product (id_product, image_url, is_front) values
  (1, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=80', true),
  (2, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&q=80', true),
  (3, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=80', true),
  (4, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&q=80', true),
  (5, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&q=80', true),
  (6, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=80', true),
  (7, 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=900&q=80', true),
  (8, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&q=80', true);
