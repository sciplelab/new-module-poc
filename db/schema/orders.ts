import { pgTable as table, bigint, text, integer, boolean, decimal, json, timestamp } from "drizzle-orm/pg-core";
import { orderStatusV2Enum } from "./enums";
import { customers } from "./customers";
import { addresses } from "./addresses";
import { users } from "./users";

export const ORDER_TYPES = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
} as const;

export const DELIVERY_TYPES = {
  SELF_PICKUP: "SELF_PICKUP",
  DELIVERY: "STANDARD_DELIVERY",
} as const;

export const ORDER_SOURCES = {
  WEB: "WEB",
  GRABMART: "GRABMART",
  POS: "POS",
  B2B: "B2B",
  TIKTOK: "TIKTOK",
  CRD: "CRD",
  BRAND: "BRAND",
  RETAIL: "RETAIL",
  HR: "HR",
  CEO: "CEO",
  CS: "CS",
  VIRTUAL: "VIRTUAL",
} as const;

export const ORIGIN = {
  MY: "MY",
  SG: "SG",
} as const;

export type OrderType = (typeof ORDER_TYPES)[keyof typeof ORDER_TYPES];
export type DeliveryType = (typeof DELIVERY_TYPES)[keyof typeof DELIVERY_TYPES];
export type OrderSource = (typeof ORDER_SOURCES)[keyof typeof ORDER_SOURCES];
export type Origin = (typeof ORIGIN)[keyof typeof ORIGIN];

export const orders = table("orders", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  shopifyOrderId: bigint({ mode: "number" }),
  orderNumber: text("order_number").notNull(),
  customerId: bigint({ mode: "number" }).references(() => customers.id),
  fulfillmentStatus: text("fulfillment_status").default("NULL"),
  cancelReason: text("cancel_reason"),
  deliveryDate: text("delivery_date"),
  transformedDeliveryDate: timestamp("transformed_delivery_date"),
  deliverySession: text("delivery_session"),
  statusNew: orderStatusV2Enum("status_new").default("PENDING").notNull(),
  currentTotalPrice: decimal("current_total_price", { precision: 10, scale: 2 }),
  currentSubtotalPrice: decimal("current_subtotal_price", { precision: 10, scale: 2 }),
  currentTotalDiscounts: decimal("current_total_discounts", { precision: 10, scale: 2 }),
  currentTotalTax: decimal("current_total_tax", { precision: 10, scale: 2 }),
  shippingAddressId: integer("shipping_address_id").references(() => addresses.id),
  billingAddressId: integer("billing_address_id").references(() => addresses.id),
  note: text("note"),
  messageCard: text("message_card"),
  tags: text("tags"),
  confirmed: boolean("confirmed"),
  contactEmail: text("contact_email"),
  rawBody: json("raw_body"),
  statusUpdatedAt: timestamp("status_updated_at").defaultNow().notNull(),
  statusUpdatedBy: text("status_updated_by"),
  processed_at: timestamp("processed_at"),
  preparedAt: timestamp("prepared_at"),
  completedAt: timestamp("completed_at"),
  orderType: text("order_type").$type<OrderType>(),
  deliveryType: text("delivery_type").$type<DeliveryType>(),
  origin: text("origin").$type<Origin>(),
  orderSource: text("order_source").$type<OrderSource>(),
  deliveryTime: text("delivery_time"),
  specialOrderNumber: text("special_order_number").unique(),
  approvalStatus: text("approval_status"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdBy: integer("created_by").references(() => users.id),
  referenceNumber: text("reference_number"),
  remarks: text("remarks"),
  // ...timestamps (add if needed)
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert; 