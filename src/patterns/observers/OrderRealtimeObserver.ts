import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// EVENT PAYLOAD - What the database sends
// ============================================================
type OrderPayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";  // What happened
  new: Record<string, unknown>;               // New data (for INSERT/UPDATE)
  old: Record<string, unknown>;               // Old data (for UPDATE/DELETE)
};

// ============================================================
// OBSERVER HANDLERS - What to do when events occur
// ============================================================
export type OrderRealtimeHandlers = {
  onInsert: (orderId: string) => Promise<void> | void;   // Called when new order added
  onUpdate: (order: Record<string, unknown>) => void;    // Called when order changes
  onDelete: (orderId: string) => void;                   // Called when order deleted
};

// ============================================================
// OBSERVER CLASS (SUBJECT) - Listens to database changes
// ============================================================
export class OrderRealtimeObserver {
  private channel: RealtimeChannel | null = null;  // The database connection

  constructor(
    private readonly client: SupabaseClient,        // Database client
    private readonly channelName = "queue-tea-live", // Unique channel name
  ) {}

  // ============================================================
  // SUBSCRIBE METHOD - Register handlers to receive notifications
  // ============================================================
  subscribe(handlers: OrderRealtimeHandlers): void {
    this.channel = this.client
      .channel(this.channelName)                    // Create a real-time channel
      .on(
        "postgres_changes",                         // Listen to database changes
        { event: "*", schema: "public", table: "orders" }, // Any event on orders table
        async (payload) => {                        // When something changes...
          const orderPayload = payload as OrderPayload;

          // DETECT what happened and call the appropriate handler
          if (orderPayload.eventType === "INSERT") {
            await handlers.onInsert(String(orderPayload.new.id));  // New order!
            return;
          }

          if (orderPayload.eventType === "UPDATE") {
            handlers.onUpdate(orderPayload.new);     // Order status changed!
            return;
          }

          if (orderPayload.eventType === "DELETE") {
            handlers.onDelete(String(orderPayload.old.id)); // Order cancelled!
          }
        },
      )
      .subscribe();                                   // Start listening
  }

  // ============================================================
  // UNSUBSCRIBE METHOD - Stop listening to database changes
  // ============================================================
  unsubscribe(): void {
    if (!this.channel) return;
    this.client.removeChannel(this.channel);  // Close the connection
    this.channel = null;                      // Clean up
  }
}