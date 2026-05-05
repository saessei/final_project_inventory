import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

type OrderPayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

export type OrderRealtimeHandlers = {
  onInsert: (orderId: string) => Promise<void> | void;
  onUpdate: (order: Record<string, unknown>) => void;
  onDelete: (orderId: string) => void;
};

export class OrderRealtimeObserver {
  private channel: RealtimeChannel | null = null;

  constructor(
    private readonly client: SupabaseClient,
    private readonly channelName = "queue-tea-live",
  ) {}

  subscribe(handlers: OrderRealtimeHandlers): void {
    this.channel = this.client
      .channel(this.channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        async (payload) => {
          const orderPayload = payload as OrderPayload;

          if (orderPayload.eventType === "INSERT") {
            await handlers.onInsert(String(orderPayload.new.id));
            return;
          }

          if (orderPayload.eventType === "UPDATE") {
            handlers.onUpdate(orderPayload.new);
            return;
          }

          if (orderPayload.eventType === "DELETE") {
            handlers.onDelete(String(orderPayload.old.id));
          }
        },
      )
      .subscribe();
  }

  unsubscribe(): void {
    if (!this.channel) return;
    this.client.removeChannel(this.channel);
    this.channel = null;
  }
}
