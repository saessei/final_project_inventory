-- QueueTea demo seed data
-- Adds realistic menu, toppings, structured orders, payments, and status history.
-- Safe to rerun: menu rows are upserted; each run appends a new batch of orders.

begin;

insert into public.categories (name, description, display_order, is_active)
values
  ('Milk Tea', 'Creamy tea-based classics', 1, true),
  ('Fruit Tea', 'Bright fruit-forward teas', 2, true),
  ('Brown Sugar', 'Rich brown sugar favorites', 3, true),
  ('Matcha', 'Earthy matcha drinks', 4, true),
  ('Coffee Tea', 'Coffee and tea blends', 5, true),
  ('Specials', 'Limited and house signature drinks', 6, true)
on conflict (name) do update
set
  description = excluded.description,
  display_order = excluded.display_order,
  is_active = excluded.is_active;

insert into public.sugar_levels (label, percentage, price_addition, display_order, is_available)
values
  ('0% - No Sugar', 0, 0, 1, true),
  ('25% - Less Sweet', 25, 0, 2, true),
  ('50% - Half Sweet', 50, 0, 3, true),
  ('75% - Sweet', 75, 0, 4, true),
  ('100% - Full Sweet', 100, 5, 5, true)
on conflict (percentage) do update
set
  label = excluded.label,
  price_addition = excluded.price_addition,
  display_order = excluded.display_order,
  is_available = excluded.is_available;

insert into public.toppings (name, price, is_available)
values
  ('Pearl', 10, true),
  ('Mini Pearl', 10, true),
  ('Oreo', 10, true),
  ('Grass Jelly', 10, true),
  ('Coffee Jelly', 15, true),
  ('Cheesecake', 20, true),
  ('Cream Cheese', 20, true),
  ('Pudding', 15, true),
  ('Nata de Coco', 15, true),
  ('Aloe Vera', 15, true),
  ('Red Bean', 15, true),
  ('Crystal Boba', 20, true),
  ('Brown Sugar Pearls', 20, true),
  ('Mango Popping Boba', 20, true),
  ('Strawberry Popping Boba', 20, true)
on conflict (name) do update
set
  price = excluded.price,
  is_available = excluded.is_available;

with drink_seed(category_name, drink_name, description, image_url, display_order, regular, medium, large) as (
  values
    ('Milk Tea', 'Classic Milk Tea', 'Black tea with creamy milk and a smooth finish.', null, 1, 85, 105, 125),
    ('Milk Tea', 'Wintermelon Milk Tea', 'Sweet wintermelon blended with milk tea.', null, 2, 90, 110, 130),
    ('Milk Tea', 'Taro Milk Tea', 'Creamy taro milk tea with a mellow nutty note.', null, 3, 95, 115, 135),
    ('Milk Tea', 'Okinawa Milk Tea', 'Roasted brown sugar milk tea with deep caramel notes.', null, 4, 95, 115, 135),
    ('Milk Tea', 'Thai Milk Tea', 'Bold Thai tea with condensed milk sweetness.', null, 5, 95, 115, 135),
    ('Milk Tea', 'Hokkaido Milk Tea', 'Milky black tea with caramel-like richness.', null, 6, 100, 120, 140),

    ('Fruit Tea', 'Passion Fruit Tea', 'Tangy passion fruit tea with a crisp finish.', null, 1, 85, 105, 125),
    ('Fruit Tea', 'Mango Green Tea', 'Green tea with mango sweetness.', null, 2, 90, 110, 130),
    ('Fruit Tea', 'Lychee Fruit Tea', 'Floral lychee tea served bright and refreshing.', null, 3, 90, 110, 130),
    ('Fruit Tea', 'Strawberry Black Tea', 'Black tea with strawberry fruit notes.', null, 4, 90, 110, 130),
    ('Fruit Tea', 'Lemon Yakult Tea', 'Citrus tea with creamy Yakult tang.', null, 5, 95, 115, 135),
    ('Fruit Tea', 'Peach Oolong Tea', 'Oolong tea with soft peach flavor.', null, 6, 95, 115, 135),

    ('Brown Sugar', 'Brown Sugar Milk Tea', 'Milk tea swirled with brown sugar syrup.', null, 1, 105, 125, 145),
    ('Brown Sugar', 'Brown Sugar Boba Milk', 'Fresh milk with brown sugar pearls.', null, 2, 110, 130, 150),
    ('Brown Sugar', 'Brown Sugar Cocoa', 'Cocoa milk with brown sugar richness.', null, 3, 115, 135, 155),
    ('Brown Sugar', 'Brown Sugar Oat Milk Tea', 'Oat milk tea with brown sugar syrup.', null, 4, 120, 140, 160),

    ('Matcha', 'Matcha Milk Tea', 'Premium matcha blended with milk tea.', null, 1, 100, 120, 150),
    ('Matcha', 'Matcha Latte', 'Creamy matcha latte with a silky body.', null, 2, 110, 130, 155),
    ('Matcha', 'Strawberry Matcha', 'Layered strawberry and matcha milk.', null, 3, 125, 145, 165),
    ('Matcha', 'Brown Sugar Matcha', 'Matcha milk with brown sugar pearls.', null, 4, 125, 145, 165),

    ('Coffee Tea', 'Coffee Milk Tea', 'Coffee and milk tea in a bold blend.', null, 1, 95, 115, 135),
    ('Coffee Tea', 'Mocha Milk Tea', 'Chocolate coffee milk tea.', null, 2, 100, 120, 140),
    ('Coffee Tea', 'Caramel Macchiato Tea', 'Tea latte with caramel coffee notes.', null, 3, 115, 135, 155),
    ('Coffee Tea', 'Dirty Brown Sugar Coffee', 'Coffee milk with brown sugar syrup.', null, 4, 120, 140, 160),

    ('Specials', 'QueueTea Signature', 'House blend with pearls, cream cheese, and brown sugar.', null, 1, 130, 150, 175),
    ('Specials', 'Mango Cheesecake Tea', 'Mango tea topped with cheesecake cream.', null, 2, 125, 145, 165),
    ('Specials', 'Oreo Cream Milk Tea', 'Milk tea with Oreo and cream cheese.', null, 3, 120, 140, 160),
    ('Specials', 'Strawberry Cream Tea', 'Strawberry tea with smooth cream topping.', null, 4, 120, 140, 160),
    ('Specials', 'Ube Milk Cloud', 'Ube milk tea with creamy cloud topping.', null, 5, 125, 145, 165),
    ('Specials', 'Choco Hazelnut Milk Tea', 'Chocolate milk tea with hazelnut notes.', null, 6, 125, 145, 165)
),
upserted_drinks as (
  insert into public.drinks (
    category_id,
    name,
    description,
    image_url,
    is_available,
    display_order
  )
  select
    c.id,
    ds.drink_name,
    ds.description,
    ds.image_url,
    true,
    ds.display_order
  from drink_seed ds
  join public.categories c on c.name = ds.category_name
  on conflict (category_id, name) do update
  set
    description = excluded.description,
    image_url = excluded.image_url,
    is_available = excluded.is_available,
    display_order = excluded.display_order
  returning id, name
)
insert into public.drink_sizes (drink_id, size, price, is_available)
select d.id, size_price.size::public.drink_size, size_price.price, true
from drink_seed ds
join public.categories c on c.name = ds.category_name
join public.drinks d on d.category_id = c.id and d.name = ds.drink_name
cross join lateral (
  values
    ('regular', ds.regular),
    ('medium', ds.medium),
    ('large', ds.large)
) as size_price(size, price)
on conflict (drink_id, size) do update
set
  price = excluded.price,
  is_available = excluded.is_available;

insert into public.drink_toppings (drink_id, topping_id, custom_price, is_available)
select d.id, t.id, null, true
from public.drinks d
join public.toppings t on true
where d.name in (
  'Classic Milk Tea',
  'Wintermelon Milk Tea',
  'Taro Milk Tea',
  'Okinawa Milk Tea',
  'Thai Milk Tea',
  'Hokkaido Milk Tea',
  'Brown Sugar Milk Tea',
  'Brown Sugar Boba Milk',
  'Matcha Milk Tea',
  'QueueTea Signature',
  'Oreo Cream Milk Tea'
)
or t.name in ('Pearl', 'Grass Jelly', 'Nata de Coco', 'Aloe Vera', 'Crystal Boba', 'Mango Popping Boba', 'Strawberry Popping Boba')
on conflict (drink_id, topping_id) do update
set is_available = excluded.is_available;

create temp table seed_orders on commit drop as
select
  gen_random_uuid() as id,
  customer_name,
  status::public.order_status as status,
  created_at
from (
  select
    gs,
    (array[
      'Mia', 'Liam', 'Sofia', 'Noah', 'Ava', 'Ethan', 'Isla', 'Lucas',
      'Zoe', 'Kai', 'Yuna', 'Miguel', 'Hana', 'Leo', 'Nina', 'Amara',
      'Rafa', 'Elise', 'Marco', 'Tala', 'Andre', 'Sam', 'Jade', 'Cole',
      'Iris', 'Nico', 'Bea', 'Theo', 'Luna', 'Alex'
    ])[1 + floor(random() * 30)::int] || ' ' ||
    (array['Santos', 'Reyes', 'Cruz', 'Garcia', 'Tan', 'Lim', 'Dela Cruz', 'Ramos', 'Torres', 'Yu'])[1 + floor(random() * 10)::int]
      as customer_name,
    case
      when random() < 0.12 then 'pending'
      when random() < 0.28 then 'preparing'
      when random() < 0.90 then 'completed'
      else 'cancelled'
    end as status,
    now()
      - ((floor(random() * 21)::int || ' days')::interval)
      - ((floor(random() * 13)::int || ' hours')::interval)
      - ((floor(random() * 60)::int || ' minutes')::interval)
      as created_at
  from generate_series(1, 180) gs
) generated;

insert into public.orders (
  id,
  customer_name,
  status,
  created_by,
  claimed_by,
  claimed_at,
  subtotal,
  tax_amount,
  service_charge,
  total_price,
  notes,
  created_at,
  updated_at,
  completed_at,
  cancelled_at
)
select
  id,
  customer_name,
  status,
  null,
  case when status in ('preparing', 'completed', 'cancelled') then null else null end,
  case when status in ('preparing', 'completed', 'cancelled') then created_at + interval '3 minutes' else null end,
  0,
  0,
  0,
  0,
  case when random() < 0.12 then 'Less ice' else null end,
  created_at,
  created_at,
  case when status = 'completed' then created_at + interval '12 minutes' else null end,
  case when status = 'cancelled' then created_at + interval '5 minutes' else null end
from seed_orders;

create temp table seed_order_items on commit drop as
select
  gen_random_uuid() as id,
  so.id as order_id,
  d.id as drink_id,
  d.name as drink_name,
  sz.size,
  sl.label as sugar_label,
  sl.percentage as sugar_percentage,
  qty.quantity,
  (ds.price + sl.price_addition) as unit_price,
  ((ds.price + sl.price_addition) * qty.quantity) as line_total
from seed_orders so
cross join lateral generate_series(1, (1 + floor(random() * 4)::int)) item_no
cross join lateral (
  select d_inner.id, d_inner.name
  from public.drinks d_inner
  where d_inner.is_available = true
  order by random()
  limit 1
) d
cross join lateral (
  select (array['regular', 'medium', 'large'])[1 + floor(random() * 3)::int]::public.drink_size as size
) sz
join public.drink_sizes ds on ds.drink_id = d.id and ds.size = sz.size
cross join lateral (
  select sl_inner.label, sl_inner.percentage, sl_inner.price_addition
  from public.sugar_levels sl_inner
  where sl_inner.is_available = true
  order by random()
  limit 1
) sl
cross join lateral (
  select 1 + floor(random() * 4)::int as quantity
) qty;

insert into public.order_items (
  id,
  order_id,
  drink_id,
  drink_name,
  size,
  sugar_label,
  sugar_percentage,
  quantity,
  unit_price,
  line_total,
  created_at
)
select
  id,
  order_id,
  drink_id,
  drink_name,
  size,
  sugar_label,
  sugar_percentage,
  quantity,
  unit_price,
  line_total,
  now()
from seed_order_items;

insert into public.order_item_toppings (
  order_item_id,
  topping_id,
  topping_name,
  price,
  created_at
)
select
  soi.id,
  t.id,
  t.name,
  coalesce(dt.custom_price, t.price),
  now()
from seed_order_items soi
join lateral (
  select dt_inner.topping_id, dt_inner.custom_price
  from public.drink_toppings dt_inner
  where dt_inner.drink_id = soi.drink_id
    and dt_inner.is_available = true
  order by random()
  limit floor(random() * 4)::int
) dt on true
join public.toppings t on t.id = dt.topping_id;

update public.order_items oi
set
  unit_price = oi.unit_price + topping_totals.topping_total,
  line_total = (oi.unit_price + topping_totals.topping_total) * oi.quantity
from (
  select
    oit.order_item_id,
    coalesce(sum(oit.price), 0) as topping_total
  from public.order_item_toppings oit
  group by oit.order_item_id
) topping_totals
where oi.id = topping_totals.order_item_id;

update public.orders o
set
  subtotal = totals.subtotal,
  total_price = totals.subtotal,
  updated_at = o.created_at + interval '1 minute'
from (
  select order_id, sum(line_total) as subtotal
  from public.order_items
  where order_id in (select id from seed_orders)
  group by order_id
) totals
where o.id = totals.order_id;

insert into public.payments (
  order_id,
  method,
  status,
  amount_due,
  amount_paid,
  change_amount,
  reference_number,
  paid_at,
  created_by,
  created_at,
  updated_at
)
select
  o.id,
  (array['cash', 'gcash', 'card', 'other'])[1 + floor(random() * 4)::int]::public.payment_method,
  case
    when o.status = 'cancelled' then 'voided'
    when o.status = 'pending' and random() < 0.35 then 'unpaid'
    else 'paid'
  end::public.payment_status,
  o.total_price,
  case
    when o.status = 'cancelled' then 0
    when o.status = 'pending' and random() < 0.35 then 0
    else o.total_price
  end,
  0,
  case when random() < 0.45 then 'QT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)) else null end,
  case when o.status <> 'cancelled' then o.created_at + interval '2 minutes' else null end,
  null,
  o.created_at,
  o.created_at + interval '2 minutes'
from public.orders o
where o.id in (select id from seed_orders);

insert into public.order_status_history (order_id, old_status, new_status, changed_by, note, created_at)
select id, null, 'pending'::public.order_status, null, 'Order created', created_at
from seed_orders;

insert into public.order_status_history (order_id, old_status, new_status, changed_by, note, created_at)
select id, 'pending'::public.order_status, 'preparing'::public.order_status, null, 'Staff started preparing order', created_at + interval '3 minutes'
from seed_orders
where status in ('preparing', 'completed');

insert into public.order_status_history (order_id, old_status, new_status, changed_by, note, created_at)
select id, 'preparing'::public.order_status, 'completed'::public.order_status, null, 'Order completed', created_at + interval '12 minutes'
from seed_orders
where status = 'completed';

insert into public.order_status_history (order_id, old_status, new_status, changed_by, note, created_at)
select id, 'pending'::public.order_status, 'cancelled'::public.order_status, null, 'Customer cancelled order', created_at + interval '5 minutes'
from seed_orders
where status = 'cancelled';

commit;

select
  'QueueTea demo seed complete' as message,
  (select count(*) from public.categories) as categories,
  (select count(*) from public.drinks) as drinks,
  (select count(*) from public.toppings) as toppings,
  (select count(*) from public.orders) as orders,
  (select count(*) from public.order_items) as order_items,
  (select count(*) from public.order_item_toppings) as order_item_toppings,
  (select count(*) from public.payments) as payments,
  (select count(*) from public.order_status_history) as status_history;
