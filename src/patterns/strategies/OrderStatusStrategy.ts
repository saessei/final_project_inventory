import type { OrderStatus } from "@/patterns/factories/OrderFactory";

export type StatusUpdateOptions = {
  claim?: boolean;
  staffUserId?: string;
};

export type StatusPatch = Record<string, unknown>;

export interface OrderStatusStrategy {
  buildPatch(status: OrderStatus, options?: StatusUpdateOptions): StatusPatch;
}

export class QueueOrderStatusStrategy implements OrderStatusStrategy {
  buildPatch(status: OrderStatus, options?: StatusUpdateOptions): StatusPatch {
    const patch: StatusPatch = { status };

    if (status === "completed") patch.completed_at = new Date().toISOString();
    if (status === "cancelled") patch.cancelled_at = new Date().toISOString();

    if (options?.claim) {
      if (!options.staffUserId) {
        throw new Error("staffUserId is required when claim=true");
      }

      patch.claimed_by = options.staffUserId;
      patch.claimed_at = new Date().toISOString();
    }

    return patch;
  }
}

export const defaultOrderStatusStrategy = new QueueOrderStatusStrategy();
