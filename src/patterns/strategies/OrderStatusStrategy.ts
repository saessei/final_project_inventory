import type { OrderStatus } from "@/patterns/factories/OrderFactory";

// ============================================================
// OPTIONS - Extra data passed to the strategy
// ============================================================
export type StatusUpdateOptions = {
  claim?: boolean;        // Whether to claim the order
  staffUserId?: string;   // Who is claiming it
};

// ============================================================
// OUTPUT - What the strategy returns
// ============================================================
export type StatusPatch = Record<string, unknown>;

// ============================================================
// STRATEGY INTERFACE - Defines what all strategies must do
// ============================================================
export interface OrderStatusStrategy {
  buildPatch(status: OrderStatus, options?: StatusUpdateOptions): StatusPatch;
}

// ============================================================
// CONCRETE STRATEGY - The actual logic for each status
// ============================================================
export class QueueOrderStatusStrategy implements OrderStatusStrategy {
  buildPatch(status: OrderStatus, options?: StatusUpdateOptions): StatusPatch {
    const patch: StatusPatch = { status };  // ← Always include new status

    // Different rules for different statuses
    if (status === "completed") patch.completed_at = new Date().toISOString();
    if (status === "cancelled") patch.cancelled_at = new Date().toISOString();

    // Special rule for claiming orders
    if (options?.claim) {
      patch.claimed_by = options.staffUserId;
      patch.claimed_at = new Date().toISOString();
    }

    return patch;
  }
}

// ============================================================
// DEFAULT STRATEGY - Ready-to-use instance
// ============================================================
export const defaultOrderStatusStrategy = new QueueOrderStatusStrategy();