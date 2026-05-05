# Design Patterns Audit

Generated: 2026-05-06

## 1) Factory Pattern

### A) DrinkFactory
- Pattern role: Centralized object creation and data normalization for drinks, categories, toppings, sugar levels, and size maps.
- Module/class:
  - [src/patterns/factories/DrinkFactory.ts](src/patterns/factories/DrinkFactory.ts)
  - `DrinkFactory`
- Definitions:
  - Class: [src/patterns/factories/DrinkFactory.ts#L67](src/patterns/factories/DrinkFactory.ts#L67)
  - createCategory: [src/patterns/factories/DrinkFactory.ts#L72](src/patterns/factories/DrinkFactory.ts#L72)
  - createTopping: [src/patterns/factories/DrinkFactory.ts#L84](src/patterns/factories/DrinkFactory.ts#L84)
  - createSugarLevel: [src/patterns/factories/DrinkFactory.ts#L93](src/patterns/factories/DrinkFactory.ts#L93)
  - createSizeMap: [src/patterns/factories/DrinkFactory.ts#L102](src/patterns/factories/DrinkFactory.ts#L102)
  - createDrink: [src/patterns/factories/DrinkFactory.ts#L115](src/patterns/factories/DrinkFactory.ts#L115)
- Usage locations:
  - Categories mapped: [src/services/drinkService.ts#L95](src/services/drinkService.ts#L95)
  - Toppings mapped: [src/services/drinkService.ts#L134](src/services/drinkService.ts#L134)
  - Sugar levels mapped: [src/services/drinkService.ts#L198](src/services/drinkService.ts#L198)
  - Drinks mapped: [src/services/drinkService.ts#L245](src/services/drinkService.ts#L245)
  - Empty size fallback: [src/services/drinkService.ts#L259](src/services/drinkService.ts#L259)
  - Size map from rows: [src/services/drinkService.ts#L262](src/services/drinkService.ts#L262)
  - Nested topping conversion: [src/services/drinkService.ts#L292](src/services/drinkService.ts#L292)
- Purpose in this codebase: Keeps DB row shapes and UI/domain model shapes decoupled, so services can return consistent typed models.

### B) OrderFactory
- Pattern role: Creates queue-safe order models and formats order item details.
- Module/class:
  - [src/patterns/factories/OrderFactory.ts](src/patterns/factories/OrderFactory.ts)
  - `OrderFactory`
- Definitions:
  - Class: [src/patterns/factories/OrderFactory.ts#L33](src/patterns/factories/OrderFactory.ts#L33)
  - formatOrderDetails: [src/patterns/factories/OrderFactory.ts#L34](src/patterns/factories/OrderFactory.ts#L34)
  - createQueueOrder: [src/patterns/factories/OrderFactory.ts#L54](src/patterns/factories/OrderFactory.ts#L54)
- Usage locations:
  - formatOrderDetails wrapper: [src/services/orderService.ts#L14](src/services/orderService.ts#L14)
  - Queue mapping on fetch: [src/hooks/useOrders.ts#L27](src/hooks/useOrders.ts#L27)
  - Queue mapping in effect: [src/hooks/useOrders.ts#L53](src/hooks/useOrders.ts#L53)
  - Queue mapping on realtime insert: [src/hooks/useOrders.ts#L79](src/hooks/useOrders.ts#L79)
- Purpose in this codebase: Normalizes order display and shields UI/hooks from raw nested query payload details.

## 2) Strategy Pattern

### A) PricingStrategy
- Pattern role: Encapsulates cart total computation behind interchangeable strategy interface.
- Module/class:
  - [src/patterns/strategies/PricingStrategy.ts](src/patterns/strategies/PricingStrategy.ts)
  - `PricingStrategy`
  - `SizeAndToppingPricingStrategy`
  - `defaultPricingStrategy`
- Definitions:
  - Interface: [src/patterns/strategies/PricingStrategy.ts#L7](src/patterns/strategies/PricingStrategy.ts#L7)
  - Concrete strategy: [src/patterns/strategies/PricingStrategy.ts#L11](src/patterns/strategies/PricingStrategy.ts#L11)
  - Default instance: [src/patterns/strategies/PricingStrategy.ts#L25](src/patterns/strategies/PricingStrategy.ts#L25)
- Usage locations:
  - Import into cart hook: [src/hooks/useCart.ts#L2](src/hooks/useCart.ts#L2)
  - Applied for computed total: [src/hooks/useCart.ts#L97](src/hooks/useCart.ts#L97)
- Purpose in this codebase: Makes pricing logic replaceable without changing cart state management.

### B) OrderStatusStrategy
- Pattern role: Encapsulates order status transition patch creation rules.
- Module/class:
  - [src/patterns/strategies/OrderStatusStrategy.ts](src/patterns/strategies/OrderStatusStrategy.ts)
  - `OrderStatusStrategy`
  - `QueueOrderStatusStrategy`
  - `defaultOrderStatusStrategy`
- Definitions:
  - Interface: [src/patterns/strategies/OrderStatusStrategy.ts#L10](src/patterns/strategies/OrderStatusStrategy.ts#L10)
  - buildPatch contract: [src/patterns/strategies/OrderStatusStrategy.ts#L11](src/patterns/strategies/OrderStatusStrategy.ts#L11)
  - Concrete strategy: [src/patterns/strategies/OrderStatusStrategy.ts#L14](src/patterns/strategies/OrderStatusStrategy.ts#L14)
  - buildPatch implementation: [src/patterns/strategies/OrderStatusStrategy.ts#L15](src/patterns/strategies/OrderStatusStrategy.ts#L15)
  - Default instance: [src/patterns/strategies/OrderStatusStrategy.ts#L34](src/patterns/strategies/OrderStatusStrategy.ts#L34)
- Usage locations:
  - Patch generation before update: [src/services/orderService.ts#L117](src/services/orderService.ts#L117)
- Purpose in this codebase: Centralizes business rules for status timestamps and claim behavior.

### C) ReportMetricsStrategy
- Pattern role: Encapsulates report KPI computation from orders.
- Module/class:
  - [src/patterns/strategies/ReportMetricsStrategy.ts](src/patterns/strategies/ReportMetricsStrategy.ts)
  - `ReportMetricsStrategy`
  - `SalesReportMetricsStrategy`
  - `defaultReportMetricsStrategy`
- Definitions:
  - Interface: [src/patterns/strategies/ReportMetricsStrategy.ts#L13](src/patterns/strategies/ReportMetricsStrategy.ts#L13)
  - calculate contract: [src/patterns/strategies/ReportMetricsStrategy.ts#L14](src/patterns/strategies/ReportMetricsStrategy.ts#L14)
  - Concrete strategy: [src/patterns/strategies/ReportMetricsStrategy.ts#L17](src/patterns/strategies/ReportMetricsStrategy.ts#L17)
  - calculate implementation: [src/patterns/strategies/ReportMetricsStrategy.ts#L18](src/patterns/strategies/ReportMetricsStrategy.ts#L18)
  - Default instance: [src/patterns/strategies/ReportMetricsStrategy.ts#L87](src/patterns/strategies/ReportMetricsStrategy.ts#L87)
- Usage locations:
  - Hook import: [src/hooks/useReportMetrics.ts#L2](src/hooks/useReportMetrics.ts#L2)
  - Hook call: [src/hooks/useReportMetrics.ts#L5](src/hooks/useReportMetrics.ts#L5)
  - Reports page consumption of hook output: [src/pages/Reports.tsx#L60](src/pages/Reports.tsx#L60)
- Purpose in this codebase: Keeps analytics logic isolated from rendering and data-fetching concerns.

## 3) Observer Pattern

### OrderRealtimeObserver
- Pattern role: Observer over Supabase realtime events with callback handlers for insert/update/delete.
- Module/class:
  - [src/patterns/observers/OrderRealtimeObserver.ts](src/patterns/observers/OrderRealtimeObserver.ts)
  - `OrderRealtimeObserver`
- Definitions:
  - Class: [src/patterns/observers/OrderRealtimeObserver.ts#L15](src/patterns/observers/OrderRealtimeObserver.ts#L15)
  - subscribe API: [src/patterns/observers/OrderRealtimeObserver.ts#L23](src/patterns/observers/OrderRealtimeObserver.ts#L23)
  - unsubscribe API: [src/patterns/observers/OrderRealtimeObserver.ts#L50](src/patterns/observers/OrderRealtimeObserver.ts#L50)
- Usage locations:
  - Instantiation: [src/hooks/useOrders.ts#L60](src/hooks/useOrders.ts#L60)
  - Attach handlers: [src/hooks/useOrders.ts#L61](src/hooks/useOrders.ts#L61)
  - Detach on cleanup: [src/hooks/useOrders.ts#L103](src/hooks/useOrders.ts#L103)
- Purpose in this codebase: Isolates realtime subscription mechanics from hook state logic and improves cleanup/reusability.

## 4) Singleton Pattern

### A) DrinkService singleton
- Pattern role: One shared service instance with private constructor and static accessor.
- Module/class:
  - [src/services/drinkService.ts](src/services/drinkService.ts)
  - `DrinkService`
  - `drinkService`
- Definitions:
  - Class: [src/services/drinkService.ts#L18](src/services/drinkService.ts#L18)
  - Singleton holder: [src/services/drinkService.ts#L19](src/services/drinkService.ts#L19)
  - Accessor: [src/services/drinkService.ts#L24](src/services/drinkService.ts#L24)
  - Exported instance: [src/services/drinkService.ts#L429](src/services/drinkService.ts#L429)
- Usage locations:
  - Kiosk page data loading calls shared instance methods: [src/pages/Kiosk.tsx#L66](src/pages/Kiosk.tsx#L66)
- Purpose in this codebase: Ensures one shared drinks service and shared listener set across consumers.

### B) Supabase client module singleton
- Pattern role: Single initialized DB client exported once per module graph.
- Module:
  - [src/lib/supabaseClient.ts](src/lib/supabaseClient.ts)
  - `supabase`
- Definitions:
  - Client creation: [src/lib/supabaseClient.ts#L10](src/lib/supabaseClient.ts#L10)
  - Default export: [src/lib/supabaseClient.ts#L19](src/lib/supabaseClient.ts#L19)
- Usage locations:
  - Used as default in drink service client fallback: [src/services/drinkService.ts#L2](src/services/drinkService.ts#L2)
  - Used as default in order service function params: [src/services/orderService.ts#L1](src/services/orderService.ts#L1)
  - Used as default in orders hook dependency: [src/hooks/useOrders.ts#L2](src/hooks/useOrders.ts#L2)
- Purpose in this codebase: Centralizes Supabase connection setup and configuration in one reusable instance.

## 5) Context + Provider Pattern (React)

### A) Auth context
- Pattern role: Shared auth/session state via context provider and hook accessor.
- Module:
  - [src/components/auth/AuthContext.tsx](src/components/auth/AuthContext.tsx)
  - `AuthContext`, `AuthContextProvider`, `useAuth`, `UserAuth`
- Definitions:
  - Context creation: [src/components/auth/AuthContext.tsx#L26](src/components/auth/AuthContext.tsx#L26)
  - Provider: [src/components/auth/AuthContext.tsx#L28](src/components/auth/AuthContext.tsx#L28)
  - Hook accessor: [src/components/auth/AuthContext.tsx#L121](src/components/auth/AuthContext.tsx#L121)
  - Alias export: [src/components/auth/AuthContext.tsx#L131](src/components/auth/AuthContext.tsx#L131)
- Usage locations:
  - Root composition: [src/main.tsx#L11](src/main.tsx#L11)
  - Guarded routing access: [src/pages/AppProtectedRoute.tsx#L16](src/pages/AppProtectedRoute.tsx#L16)
  - Kiosk session access: [src/pages/Kiosk.tsx#L25](src/pages/Kiosk.tsx#L25)
  - Queue session access: [src/pages/QueuedOrders.tsx#L22](src/pages/QueuedOrders.tsx#L22)
- Purpose in this codebase: Provides globally consistent auth state and API (sign in/out/session refresh).

### B) DashboardMode context
- Pattern role: Shared UI mode state (admin/staff) across pages.
- Module:
  - [src/components/contexts/DashboardModeContext.tsx](src/components/contexts/DashboardModeContext.tsx)
  - `DashboardModeContext`, `DashboardModeProvider`, `useDashboardMode`
- Definitions:
  - Context creation: [src/components/contexts/DashboardModeContext.tsx#L15](src/components/contexts/DashboardModeContext.tsx#L15)
  - Provider: [src/components/contexts/DashboardModeContext.tsx#L29](src/components/contexts/DashboardModeContext.tsx#L29)
  - Hook accessor: [src/components/contexts/DashboardModeContext.tsx#L79](src/components/contexts/DashboardModeContext.tsx#L79)
- Usage locations:
  - Root composition: [src/main.tsx#L12](src/main.tsx#L12)
  - Route mode enforcement: [src/pages/AppProtectedRoute.tsx#L17](src/pages/AppProtectedRoute.tsx#L17)
- Purpose in this codebase: Keeps mode decisions centralized and persistent in sessionStorage.

### C) AdminPin context
- Pattern role: Shared modal coordination state for admin PIN flow.
- Module:
  - [src/components/contexts/AdminPinContext.tsx](src/components/contexts/AdminPinContext.tsx)
  - `AdminPinContext`, `AdminPinProvider`, `useAdminPin`
- Definitions:
  - Context creation: [src/components/contexts/AdminPinContext.tsx#L11](src/components/contexts/AdminPinContext.tsx#L11)
  - Hook accessor: [src/components/contexts/AdminPinContext.tsx#L13](src/components/contexts/AdminPinContext.tsx#L13)
  - Provider: [src/components/contexts/AdminPinContext.tsx#L21](src/components/contexts/AdminPinContext.tsx#L21)
- Usage locations:
  - Root composition: [src/main.tsx#L13](src/main.tsx#L13)
- Purpose in this codebase: Centralizes open/close and callback handling for admin PIN modal interactions.

## 6) Module Aggregator (Barrel) Pattern

### patterns index barrel
- Pattern role: Re-export facade for pattern modules to simplify imports.
- Module:
  - [src/patterns/index.ts](src/patterns/index.ts)
- Definitions:
  - Re-export list: [src/patterns/index.ts#L1](src/patterns/index.ts#L1), [src/patterns/index.ts#L2](src/patterns/index.ts#L2), [src/patterns/index.ts#L3](src/patterns/index.ts#L3), [src/patterns/index.ts#L4](src/patterns/index.ts#L4), [src/patterns/index.ts#L5](src/patterns/index.ts#L5), [src/patterns/index.ts#L6](src/patterns/index.ts#L6)
- Usage locations:
  - Service imports: [src/services/drinkService.ts#L11](src/services/drinkService.ts#L11), [src/services/orderService.ts#L9](src/services/orderService.ts#L9)
  - Hook imports: [src/hooks/useOrders.ts#L9](src/hooks/useOrders.ts#L9), [src/hooks/useCart.ts#L2](src/hooks/useCart.ts#L2), [src/hooks/useReportMetrics.ts#L2](src/hooks/useReportMetrics.ts#L2)
- Purpose in this codebase: Reduces import path noise and creates a single public entrypoint for pattern-related modules.

## Quick Summary
- Explicit classic patterns implemented in code: Factory, Strategy, Observer, Singleton.
- Architectural patterns heavily used: React Context/Provider and Barrel module aggregation.
- Most pattern implementations are concentrated in [src/patterns](src/patterns), then consumed by hooks/services/pages.
