# QueueTea

QueueTea is a web-based milk tea ordering and queue management system built with React, TypeScript, Vite, Tailwind CSS, and Supabase. It supports two dashboard modes: a staff flow for taking customer orders and managing the live queue, and an admin flow for maintaining the menu and reviewing sales reports.

## Project Overview

This project is designed for a small milk tea shop workflow:

- Staff sign in, choose Staff mode, build customized drink orders, and send them to the queue.
- Staff can track active orders through `pending`, `preparing`, `ready`, and `completed` states.
- Admin users can manage drinks, categories, toppings, prices, and availability.
- Admin users can view report metrics such as revenue, top drinks, top toppings, busy hours, and recent orders.
- Supabase handles authentication, database storage, and real-time order updates.

## Main Features

- Supabase email/password authentication
- Role selection after login: Admin or Staff
- Staff-protected kiosk for order taking
- Cart with item quantity controls, editing, toppings, sugar levels, sizes, notes, and payment method
- Live order queue with real-time Supabase updates
- Order claiming when staff starts preparing an order
- Menu manager for drinks, categories, toppings, sizes, and availability
- Admin PIN modal for returning from Staff mode to Admin mode
- Reports dashboard with date presets, CSV export, revenue metrics, item rankings, busy-hour analysis, and recent orders
- Reusable UI components documented in Storybook
- Integration tests with Vitest and end-to-end tests with Playwright

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Supabase
- Lucide React icons
- Vitest
- Playwright
- Storybook

## Requirements

- Node.js 18 or newer
- npm
- A Supabase project with the required QueueTea tables and seed data

## Environment Variables

Create a `.env` file for local development:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For integration and end-to-end tests, create `.env.test`:

```env
VITE_SUPABASE_URL=your_test_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_test_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_test_service_role_key
TEST_USER_EMAIL=test_user_email
TEST_USER_PASSWORD=test_user_password
```

The app reads Supabase values in `src/lib/supabaseClient.ts`. Vitest and Playwright load `.env.test`.

## Supabase Data

The app expects these main tables to exist:

- `profiles`
- `admin_settings`
- `categories`
- `drinks`
- `drink_sizes`
- `toppings`
- `drink_toppings`
- `sugar_levels`
- `orders`
- `order_items`
- `order_item_toppings`
- `payments`
- `order_status_history`

Demo data is available in:

```bash
supabase/seed_queue_tea_demo.sql
```

The seed file adds menu categories, drinks, toppings, sugar levels, demo orders, payments, and order status history. It is safe to rerun for menu data, but each run appends a new batch of demo orders.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the app in the browser:

```text
http://localhost:5173
```

The app uses hash-based routes, so pages look like:

```text
/#/signin
/#/role-select
/#/kiosk
/#/queued-orders
/#/admin/menu
/#/reports
/#/settings
```

## Available Scripts

- `npm run dev` - start the Vite development server
- `npm run dev:test` - start Vite in test mode
- `npm run build` - run TypeScript build checks and create a production build
- `npm run preview` - preview the production build
- `npm run lint` - run ESLint
- `npm run test` - run Vitest in watch mode
- `npm run test:ui` - run the Vitest UI
- `npm run test:run` - run Vitest once
- `npm run e2e` - run Playwright end-to-end tests
- `npm run e2e:ui` - run Playwright in UI mode
- `npm run e2e:report` - open the Playwright HTML report
- `npm run storybook` - start Storybook on port 6006
- `npm run build-storybook` - build the static Storybook site

## App Flow

1. Users sign in at `/#/signin`.
2. After login, users choose a dashboard mode at `/#/role-select`.
3. Staff mode opens the kiosk at `/#/kiosk`, where staff can build and submit customer orders.
4. Staff can move to `/#/queued-orders` to manage active and completed orders.
5. Admin mode opens `/#/admin/menu`, where admins can manage drinks and toppings.
6. Admin-only pages include `/#/reports` and `/#/settings`.
7. If the session is in Staff mode, admin-only pages redirect back to the kiosk unless the admin PIN is verified.

## Testing

Run integration tests:

```bash
npm run test:run
```

Run end-to-end tests:

```bash
npm run e2e
```

The Playwright configuration starts the app with `npm run dev:test` and uses:

```text
http://localhost:5173
```

Current E2E coverage includes:

- Staff flow: sign in, choose Staff mode, place an order, move it through the queue, and verify history
- Admin flow: sign in, choose Admin mode, add a topping, add a drink, and open reports

## Storybook

Start Storybook:

```bash
npm run storybook
```

Storybook contains examples for reusable UI and feature components such as buttons, alerts, modals, text fields, select inputs, kiosk cards, admin cards, sidebar, and sign-in screens.

## Project Structure

```text
src/
  components/
    admin/       Admin PIN, menu manager tabs, cards, and modals
    auth/        Auth context and auth route helpers
    contexts/    Dashboard mode and admin PIN state
    kiosk/       Drink grid, cart sidebar, checkout, and customization UI
    reports/     Report panels, stats cards, and order tables
    ui/          Shared UI components
  hooks/         Cart, orders, and report metric hooks
  lib/           Supabase client
  pages/         Sign-in, role select, kiosk, queue, reports, and settings pages
  patterns/      Drink factory and strategy pattern examples
  routes/        Hash router configuration
  services/      Supabase data operations for drinks, orders, and profiles
  stories/       Storybook stories
  __tests__/     Vitest integration tests and setup

e2e/             Playwright end-to-end tests
supabase/        Demo seed SQL
public/          Static assets
```

## Notes

- The cart is currently held in local React state through `useCart`.
- Orders are stored in Supabase and displayed in real time through the `orders` table subscription.
- The admin PIN is stored in the `admin_settings` table.
- The app uses `@` as an alias for `src`.
