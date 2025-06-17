import { pgTable as table, pgEnum, boolean } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import cuid from "cuid";

// Timestamps
const timestamps = {
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  updatedAt: t.timestamp("updated_at"),
};

// Enums
export const lineItemStatusEnum = pgEnum("line_item_status", [
  "UNASSIGNED",
  "ASSIGNED",
  "COMPLETED",
  "STARTED",
  "CANCELLED",
  "BLACKMARK",
  "ASSIGNED_TO_REAL_LINE_ITEM",
  "ASSIGNMENT_FAILED",
]);

export const orderDeliveryStatusEnum = pgEnum("delivery_status", [
  "PENDING", // Initial order placement
  "PREPARING", // Florist is working on the order
  "PREPARED", // Order is ready for dispatch
  "IN_TRANSIT", // Order is en route to delivery
  "DELIVERED", // Successfully delivered to recipient
  "COMPLETED", // System completes/closes this order after few days
  "DELIVERY_FAILED", // Delivery attempt unsuccessful

  "RETURNING", // Return process initiated
  "RETURNED", // Order has been returned
  "REDELIVERY", // Preparing for another delivery attempt

  "BLACKMARK", // Order that has been blackmarked
]);

export const orderStatusV2Enum = pgEnum("order_status_v2", [
  "PENDING", // Initial order placement
  "PREPARING", // Florist is working on the order
  "PREPARED", // Order is ready for dispatch
  "IN_TRANSIT", // Order is en route to delivery
  "DELIVERED", // Successfully delivered to recipient
  "COMPLETED", // System completes/closes this order after few days
  "DELIVERY_FAILED", // Delivery attempt unsuccessful

  "RETURNING", // Return process initiated
  "RETURNED", // Order has been returned
  "REDELIVERY", // Preparing for another delivery attempt

  "BLACKMARK", // Order that has been blackmarked
  "CANCELLED",
]);

export const itemTypeEnum = pgEnum("item_type", [
  "FLOWER",
  "FOOD_BEVERAGE",
  "MATERIAL",
  "PRODUCT",
]);

export const unitEnum = pgEnum("unit", [
  "UNIT",
  "GRAM",
  "MILLILITER",
  "STK", // stalks for flowers
  "PCS", // pieces for wrapping materials
  "CM", // centimeter for ribbons and fabrics
  "BTL", // bottle for sprays and liquids
  "BDL", // bundle
  "PSI", // for gases
  "ML", // milliliter alternative
  "BRICK", // for oasis sponge
  "BUD", // for some flowers
  "BOX", // for boxed items
  "SET", // for sets of items
]);

export const productStatusEnum = pgEnum("product_status", [
  "ACTIVE",
  "ARCHIVED",
]);

export const variantSizeEnum = pgEnum("variant_size", [
  "MEDIUM",
  "LARGE",
  "SMALL",
  "STANDARD",
]);

export const recipeSizeEnum = pgEnum("recipe_size", [
  "MEDIUM",
  "LARGE",
  "SMALL",
  "STANDARD",
]);

export const itemSizeEnum = pgEnum("item_size", [
  "MEDIUM",
  "LARGE",
  "SMALL",
  "STANDARD",
]);

export const recipeTypeEnum = pgEnum("recipe_type", [
  "ARCHIVED",
  "DRAFT",
  "ACTIVE",
]);

export const recipeStatusEnum = pgEnum("recipe_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const userRole = pgEnum("user_role", ["FLORIST"]);

export const requestTypeEnum = pgEnum("request_type", [
  "ORDER_RELATED", // When requesting more items for specific order
  "STOCK_REQUEST", // When requesting items for general stock
]);

export const requestStatusEnum = pgEnum("request_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "FULFILLED",
]);

export const stockTransferStatusEnum = pgEnum("stock_transfer_status", [
  "PENDING", // initial state when ST is created (production)
  "PROCESSING", // when groundfloor starts processing (scm)

  // if fulfil all
  "DELIVERING", // sending up to production (scm)
  "RECEIVED_AT_CARGO", // new status: inventory team verifies at cargo
  "FULFILLED", // when all items have been received (production)

  // if not fulfil all
  "DELIVERING_PARTIAL", // sending up to production (scm) BUT with partially fulfilled items
  "RECEIVED_AT_CARGO_PARTIAL", // new status: inventory team verifies partial delivery at cargo
  "PARTIAL", // when only some items could be fulfilled

  "REJECTED", // when ST is rejected (scm)
  "CANCELLED", // when ST is cancelled (production)
]);

export const stockTransferTypeEnum = pgEnum("stock_transfer_type", [
  "START_OF_DAY",
  "STANDARD",
  "END_OF_DAY",
]);

export const customRecipeTypeEnum = pgEnum("custom_recipe_type", [
  "CUSTOMIZED",
  "EXISTING",
  "NEW",
]);

export const stateEnum = pgEnum("states", ["KUL", "SGR", "PNG", "JB", "SG"]);

export const deliverySessionEnum = pgEnum("delivery_session", [
  "AM",
  "PM",
  "EM",
  "EXPRESS",
]);

export const offlineOrderStatusEnum = pgEnum("offline_order_status", [
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
]);

export type Branch = typeof branches.$inferSelect;

export const branches = table("branches", {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  name: t.text("name"),
  code: t.text("code"),
});

export type User = typeof users.$inferSelect;

export type UserDetails = User & {
  branch: Branch;
  department: Department;
};

export const users = table("users", {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  employeeId: t.text("employee_id"),
  name: t.text("name"),
  email: t.text("email"),
  phoneNumber: t.text("phone_number"),
  jobTitle: t.text("job_title"),
  role: userRole("role"),
  departmentId: t.integer("department_id").references(() => departments.id),
  branchId: t.integer("branch_id").references(() => branches.id),
  oldId: t.integer("old_id"),
  deskNo: t.text("desk_no"),
  isActive: t.boolean("is_active").default(true),
  driverType: t.integer("driver_type").references(() => driverTypes.id),

  ...timestamps,
});

export const customers = table("customers", {
  id: t.bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  email: t.text("email").notNull().unique(),
  firstName: t.text("first_name"),
  lastName: t.text("last_name"),
  state: t.text("state"),
  verifiedEmail: t.boolean("verified_email"),
  phone: t.text("phone"),
  tags: t.text("tags"),
  currency: t.text("currency"),

  ...timestamps,
});

export const addresses = table("addresses", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  customerId: t.bigint({ mode: "number" }).references(() => customers.id),
  firstName: t.text("first_name"),
  lastName: t.text("last_name"),
  company: t.text("company"),
  address1: t.text("address1"),
  address2: t.text("address2"),
  city: t.text("city"),
  province: t.text("province"),
  provinceCode: t.text("province_code"),
  country: t.text("country"),
  countryCode: t.text("country_code"),
  zip: t.text("zip"),
  phone: t.text("phone"),
  latitude: t.decimal("latitude", { precision: 10, scale: 7 }),
  longitude: t.decimal("longitude", { precision: 10, scale: 7 }),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export const ORDER_TYPES = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
} as const;

export const DELIVERY_TYPES = {
  SELF_PICKUP: "SELF_PICKUP",
  DELIVERY: "STANDARD_DELIVERY",
} as const;

export type OrderType = (typeof ORDER_TYPES)[keyof typeof ORDER_TYPES];
export type DeliveryType = (typeof DELIVERY_TYPES)[keyof typeof DELIVERY_TYPES];

export const orders = table("orders", {
  id: t.bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(), // Shopify order ID
  shopifyOrderId: t.bigint({ mode: "number" }),

  orderNumber: t.integer("order_number").unique().notNull(),
  customerId: t.bigint({ mode: "number" }).references(() => customers.id),

  fulfillmentStatus: t.text("fulfillment_status").default("NULL"),
  cancelReason: t.text("cancel_reason"),

  deliveryDate: t.text("delivery_date"),
  transformedDeliveryDate: t.timestamp("transformed_delivery_date"),
  deliverySession: t.text("delivery_session"),

  statusNew: orderStatusV2Enum("status_new").default("PENDING").notNull(),

  currentTotalPrice: t.decimal("current_total_price", {
    precision: 10,
    scale: 2,
  }),
  currentSubtotalPrice: t.decimal("current_subtotal_price", {
    precision: 10,
    scale: 2,
  }),
  currentTotalDiscounts: t.decimal("current_total_discounts", {
    precision: 10,
    scale: 2,
  }),
  currentTotalTax: t.decimal("current_total_tax", {
    precision: 10,
    scale: 2,
  }),

  shippingAddressId: t
    .integer("shipping_address_id")
    .references(() => addresses.id),
  billingAddressId: t
    .integer("billing_address_id")
    .references(() => addresses.id),
  note: t.text("note"),
  messageCard: t.text("message_card"),
  tags: t.text("tags"),
  confirmed: t.boolean("confirmed"),
  contactEmail: t.text("contact_email"),
  rawBody: t.json("raw_body"),

  statusUpdatedAt: t.timestamp("status_updated_at").defaultNow().notNull(),
  statusUpdatedBy: t.text("status_updated_by"),

  processed_at: t.timestamp("processed_at"),
  preparedAt: t.timestamp("prepared_at"),
  completedAt: t.timestamp("completed_at"),

  orderType: t.text("order_type").$type<OrderType>(),
  deliveryType: t.text("delivery_type").$type<DeliveryType>(),

  // Delivery
  deliveryTime: t.text("delivery_time"),

  specialOrderNumber: t.text("special_order_number").unique(),
  approvalStatus: t.text("approval_status"),
  approvedBy: t.integer("approved_by").references(() => users.id),
  approvedAt: t.timestamp("approved_at"),
  createdBy: t.integer("created_by").references(() => users.id),

  referenceNumber: t.text("reference_number"),
  remarks: t.text("remarks"),
  ...timestamps,
});

//resource table for images and docs
export const resources = table("resources", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: t.text("type").notNull(), // 'REFERENCE_PHOTO' or 'ORDER_PROOF'
  url: t.text("url").notNull(),
  ...timestamps,
});

// Add relation to offline orders
export const ordersToResources = table(
  "orders_to_resources",
  {
    orderId: t.text("order_id").notNull(),

    resourceId: t
      .integer("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    type: t.text("type").notNull(), // 'REFERENCE_PHOTO' or 'ORDER_PROOF'
  },
  (table) => ({
    primaryKey: t.primaryKey({ columns: [table.orderId, table.resourceId] }),
  })
);

export const orderComment = table("order_comment", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  text: t.text("text"),
  commentedBy: t.text("commented_by"),
  orderId: t.integer("order_id"),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
});

export const orderCommentsRelations = relations(orderComment, ({ one }) => ({
  order: one(orders, {
    fields: [orderComment.orderId],
    references: [orders.id],
  }),
}));
export type StockTransfer = typeof stockTransfers.$inferSelect;
export type NewStockTransfer = typeof stockTransfers.$inferInsert;

export type StockTransfersTable = StockTransfer & {
  branch: Branch;
  pendingUser: User | null;
  processingUser: User | null;
  fulfilledUser: User | null;
  rejectedUser: User | null;
};

export const stockTransfers = table("stock_transfers", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  stNumber: t.text("st_number").notNull(),
  parentStId: t
    .integer("parent_st_id")
    .references((): t.AnyPgColumn => stockTransfers.id), // cara self reference

  status: stockTransferStatusEnum("status").default("PENDING"),
  type: stockTransferTypeEnum("type"),

  requestNotes: t.text("request_notes"),
  transferAt: t.timestamp("transfer_at"),

  // timeline
  pendingAt: t.timestamp("pending_at").defaultNow().notNull(), // PENDING
  pendingBy: t
    .integer("pending_by")
    .references(() => users.id)
    .notNull(),
  branchId: t
    .integer("branch_id")
    .references(() => branches.id)
    .notNull(),

  processingAt: t.timestamp("processing_at"), // PROCESSING
  processingBy: t.integer("processing_by").references(() => users.id),

  deliveringAt: t.timestamp("delivering_at"), // DELIVERING
  deliveringBy: t.integer("delivering_by").references(() => users.id),

  fulfilledAt: t.timestamp("fulfilled_at"), // FULFILLED
  fulfilledBy: t.integer("fulfilled_by").references(() => users.id),

  deliveringPartialAt: t.timestamp("delivering_partial_at"), // DELIVERING_PARTIAL
  deliveringPartialBy: t
    .integer("delivering_partial_by")
    .references(() => users.id),

  partialAt: t.timestamp("partial_at"), // PARTIAL
  partialBy: t.integer("partial_by").references(() => users.id),

  rejectedAt: t.timestamp("rejected_at"), // REJECTED
  rejectedBy: t.integer("rejected_by").references(() => users.id),
  rejectionReason: t.text("rejection_reason"),

  cancelledAt: t.timestamp("cancelled_at"), // CANCELLED
  cancelledBy: t.integer("cancelled_by").references(() => users.id),
  cancellationReason: t.text("cancellation_reason"),

  // add new fields for cargo verification
  receivedAtCargoAt: t.timestamp("received_at_cargo_at"), // RECEIVED_AT_CARGO
  receivedAtCargoBy: t
    .integer("received_at_cargo_by")
    .references(() => users.id),
  cargoVerificationNotes: t.text("cargo_verification_notes"),

  ...timestamps,
});

export type StockTransferDetails = typeof stockTransferDetails.$inferSelect;
export type NewStockTransferDetails = typeof stockTransferDetails.$inferInsert;

export const stockTransferDetails = table("stock_transfer_details", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  stockTransferId: t
    .integer("stock_transfer_id")
    .references(() => stockTransfers.id, { onDelete: "cascade" })
    .notNull(),
  itemId: t
    .integer("item_id")
    .references(() => items.id)
    .notNull(),

  // for requesters (cold room staff) - they will input bundle. we need to multiply it with factor in items table
  baseQuantity: t
    .decimal("base_quantity", { precision: 10, scale: 2 })
    .notNull(),

  bufferEnabled: t.boolean("buffer_enabled").default(false),
  bufferPercentage: t
    .decimal("buffer_percentage", { precision: 5, scale: 2 })
    .default("0.00"),
  bufferReason: t.text("buffer_reason"), // eg: "extra for backup"

  // after adding buffer with requiredQuantity
  adjustedQuantity: t.decimal("adjusted_quantity", { precision: 10, scale: 2 }),

  // for scm input when processing st
  fulfilledQuantity: t.decimal("fulfilled_quantity", {
    precision: 10,
    scale: 2,
  }),
});

// pivot table
// export const stockTransfersToOrders = table(
//   "stock_transfers_to_orders",
//   {
//     stockTransferId: t.integer("stock_transfer_id")
//       .references(() => stockTransfers.id)
//       .notNull(),
//     orderId: t.bigint({ mode: "number" })
//       .references(() => orders.id)
//       .notNull(),
//     includedAt: t.timestamp("included_at").defaultNow().notNull(),
//     allocatedQuantity: t.decimal("allocated_quantity", {
//       precision: 10,
//       scale: 2
//     }) // Optional: Track quantity allocated from this ST
//   },
//   (t) => ({
//     pk: primaryKey({ columns: [t.stockTransferId, t.orderId] })
//   })
// );

export const lineItems = table("line_items", {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  lineItemId: t.bigint("line_item_id", { mode: "bigint" }),
  orderId: t.bigint({ mode: "number" }).references(() => orders.id),
  productId: t.text("product_id"),
  variantId: t.bigint("variant_id", { mode: "bigint" }),
  title: t.text("title").notNull(),
  variantTitle: t.text("variant_title"),
  sku: t.text("sku"),
  quantity: t.integer("quantity").notNull(),
  price: t.decimal("price", { precision: 10, scale: 2 }).notNull(),
  totalDiscount: t.decimal("total_discount", { precision: 10, scale: 2 }),
  fulfillableQuantity: t.integer("fulfillable_quantity"),
  fulfillmentStatus: t.text("fulfillment_status"),
  vendor: t.text("vendor"),
  requiresShipping: t.boolean("requires_shipping"),
  taxable: t.boolean("taxable"),
  productRemark: t.text("product_remark"),

  status: lineItemStatusEnum("status").default("UNASSIGNED").notNull(),
  statusUpdatedAt: t.timestamp("status_updated_at").defaultNow().notNull(),
  statusUpdatedBy: t.text("status_updated_by"),

  assignedTo: t.integer("assigned_to").references(() => users.id),
  assignedAt: t.timestamp("assigned_at"),

  unassignedAt: t.timestamp("unassigned_at"),

  undoneAt: t.timestamp("undone_at"),

  startedAt: t.timestamp("started_at"),
  cancelledAt: t.timestamp("cancelled_at"),
  completedAt: t.timestamp("completed_at"),

  specialOrderNumber: t.text("special_order_number"),
  ...timestamps,
});

export const virtualLineItems = table("virtual_line_items", {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  lineItemId: t
    .bigint("line_item_id", { mode: "number" })
    .references(() => lineItems.id),
  productId: t.text("product_id"),
  variantId: t.bigint("variant_id", { mode: "bigint" }),
  title: t.text("title").notNull(),
  variantTitle: t.text("variant_title"),
  sku: t.text("sku"),
  quantity: t.integer("quantity").notNull(),
  virtualLineItemId: t.text("virtual_line_item_id"),

  status: lineItemStatusEnum("status").default("UNASSIGNED").notNull(),
  statusUpdatedAt: t.timestamp("status_updated_at").defaultNow().notNull(),
  statusUpdatedBy: t.text("status_updated_by"),

  assignedTo: t.integer("assigned_to").references(() => users.id),
  assignedAt: t.timestamp("assigned_at"),

  unassignedAt: t.timestamp("unassigned_at"),

  undoneAt: t.timestamp("undone_at"),

  startedAt: t.timestamp("started_at"),
  cancelledAt: t.timestamp("cancelled_at"),
  completedAt: t.timestamp("completed_at"),

  deliveryDate: t.timestamp("delivery_date"),

  ...timestamps,
});

export const lineItemProperties = table("line_item_properties", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  lineItemId: t.integer("line_item_id").references(() => lineItems.id),
  name: t.text("name").notNull(),
  value: t.text("value"),
});

export const shippingLines = table("shipping_lines", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  existingShippingId: t.text("existing_shipping_id"),
  orderId: t.bigint({ mode: "number" }).references(() => orders.id),
  code: t.text("code"),
  title: t.text("title"),
  price: t.decimal("price", { precision: 10, scale: 2 }),
  discountedPrice: t.decimal("discounted_price", { precision: 10, scale: 2 }),
  source: t.text("source"),
  carrierIdentifier: t.text("carrier_identifier"),
});

export const lineItemStatusAudit = table("line_item_status_audit", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  lineItemId: t
    .integer("line_item_id")
    .references(() => lineItems.id)
    .notNull(),
  orderId: t
    .bigint({ mode: "number" })
    .references(() => orders.id)
    .notNull(),
  status: lineItemStatusEnum("status").notNull(),
  actor: t.text("actor"),
  notes: t.text("notes"),
  metadata: t.jsonb("metadata"),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
});

export const orderStatusAudit = table("order_status_audit", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: t
    .integer("orderId")
    .references(() => orders.id)
    .notNull(),
  status: orderStatusV2Enum("status").notNull(),
  statusFreeText: t.text("status_free_text"),
  actor: t.text("actor"),
  notes: t.text("notes"),
  metadata: t.jsonb("metadata"),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
});

export const items = table("items", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: t.text("name").notNull(),
  type: itemTypeEnum("type").notNull(),

  image: t.text("image"),

  cost: t.decimal("cost", { precision: 10, scale: 2 }),
  size: itemSizeEnum("item_size"),

  unit: unitEnum("unit").notNull(),
  factor: t.decimal("factor", { precision: 10, scale: 2 }),

  // this is pulling from v1's item safety level for production floor
  // TODO: in the future, pull live balance in c5 / pull item balance from scm's EOD ST
  coldroomBalance: t
    .decimal("coldroom_balance", { precision: 10, scale: 2 })
    .default("0"),

  v1ItemId: t.integer("v1_item_id"),

  ...timestamps,
});

export type BalanceLog = typeof updateItemBalanceLogs.$inferSelect;
export type NewBalanceLog = typeof updateItemBalanceLogs.$inferInsert;

export const updateItemBalanceLogs = table("update_item_balance_logs", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),

  itemName: t.text("item_name"),
  branchName: t.text("branch_name"),

  quantity: t.decimal("quantity", { precision: 10, scale: 2 }),

  oldBalance: t.decimal("old_balance", { precision: 10, scale: 2 }),
  newBalance: t.decimal("new_balance", { precision: 10, scale: 2 }),

  status: t.text("status", { enum: ["success", "failed"] }),

  apiResponse: t.jsonb("api_response"),
  errorMessage: t.text("error_message"),

  stockTransferId: t
    .integer("stock_transfer_id")
    .references(() => stockTransfers.id), // optional

  ...timestamps,
});

export const itemCostHistory = table("item_cost_history", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
});

export const newItems = table("new_items", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: t.text("name").notNull(),
  type: itemTypeEnum("type").notNull(),
  unit: unitEnum("unit").notNull(),
  image: t.text("image"),
  price: t.decimal("price", { precision: 10, scale: 2 }),

  ...timestamps,
});

export type Product = InferSelectModel<typeof products>;
export type ProductWithCountry = Product & {
  productsToCountries: (ProductToCountry & {
    country: Country;
  })[];
};

export const products = table("products", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: t.text("title"),
  type: t.text("type"),
  status: productStatusEnum("status").default("ACTIVE").notNull(),
  shopifyProductId: t.bigint("shopify_product_id", { mode: "number" }),
  country: t.varchar({ length: 30 }),

  ...timestamps,
});

export type Country = typeof countries.$inferSelect;

export const countries = table("countries", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: t.text("code").notNull().unique(), // e.g., 'MY', 'SG'
  name: t.text("name").notNull(), // e.g., 'Malaysia', 'Singapore'

  ...timestamps,
});

export type ProductToCountry = typeof productsToCountries.$inferSelect;

export const productsToCountries = table(
  "products_to_countries",
  {
    productId: t
      .integer("product_id")
      .notNull()
      .references(() => products.id),
    countryId: t
      .integer("country_id")
      .notNull()
      .references(() => countries.id),
  },
  (table) => ({
    pk: t.primaryKey({ columns: [table.productId, table.countryId] }),
  })
);

export const variants = table("variants", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  shopifyVariantId: t.bigint("shopify_variant_id", { mode: "bigint" }),
  shopifyProductId: t.bigint("shopify_product_id", { mode: "bigint" }),
  productId: t
    .integer("product_id")
    .references(() => products.id)
    .notNull(),
  displayName: t.text("display_name"),
  cleanName: t.text("clean_name"),
  image: t.text("image"),
  size: variantSizeEnum("size").default("STANDARD").notNull(),
  recipeId: t
    .integer("recipe_id")
    .references(() => recipes.id, { onDelete: "set null" }),
  ...timestamps,
});

export type Curation = typeof curations.$inferSelect;
export type NewCuration = typeof curations.$inferInsert;

export type CurationWithRelations = Curation & {
  recipe: {
    id: number;
    name: string | null;
    size: (typeof recipeSizeEnum.enumValues)[number];
  } | null;
  validator: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
};

export const curations = table("curations", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),

  recipeId: t.integer("recipe_id").references(() => recipes.id),
  minutes: t.integer("minutes").default(0),

  validatedMinutes: t.integer("validated_minutes").default(0),
  validatedBy: t.integer("validated_by").references(() => users.id),
  validatedAt: t.timestamp("validated_at"),

  ...timestamps,
});

// add the relations
export const curationsRelations = relations(curations, ({ one }) => ({
  recipe: one(recipes, {
    fields: [curations.recipeId],
    references: [recipes.id],
  }),
  validator: one(users, {
    fields: [curations.validatedBy],
    references: [users.id],
  }),
}));

export const preparationGroups = table("preparation_groups", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: t.text(),
  description: t.text(),
  dateSwitchedAt: t.timestamp("date_switched_at"),
  groupDate: t.timestamp("group_date"),

  ...timestamps,
});

export const preparationGroupsToVariants = table(
  "preparation_groups_to_variants",
  {
    preparationGroupId: t
      .integer("preparation_group_id")
      .notNull()
      .references(() => preparationGroups.id, {
        onDelete: "cascade",
      }),
    variantId: t
      .integer("variant_id")
      .notNull()
      .references(() => variants.id, {
        onDelete: "cascade",
      }),
    forecast: t.integer("forecast"),
  },
  (s) => ({
    pk: t.primaryKey({ columns: [s.preparationGroupId, s.variantId] }),
  })
);

export const recipes = table("recipes", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: t.text("name"),
  size: recipeSizeEnum("size"),
  type: recipeTypeEnum("type"),
  status: recipeStatusEnum("status"),

  createdBy: t.integer("created_by").references(() => users.id),

  approvedBy: t.integer("approved_by").references(() => users.id),
  approvedAt: t.timestamp("approved_at"),

  rejectedBy: t.integer("rejected_by").references(() => users.id),
  rejectedAt: t.timestamp("rejected_at"),

  approvalNotes: t.text("approval_notes"),
  rejectionReason: t.text("rejection_reason"),

  isSyncToShopify: boolean("is_sync_to_shopify"),

  ...timestamps,
});

// recipe audit log table for tracking create/update activities
export const recipeAuditLogs = table("recipe_audit_logs", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  recipeId: t
    .integer("recipe_id")
    .references(() => recipes.id)
    .notNull(),
  action: t.text("action").notNull(), // CREATE, UPDATE
  userId: t.integer("user_id").references(() => users.id),
  changes: t.jsonb("changes"), // store the changes made

  ...timestamps,
});

export const itemsToRecipes = table(
  "items_to_recipes",
  {
    recipeId: t
      .integer("recipe_id")
      .notNull()
      .references(() => recipes.id, {
        onDelete: "cascade",
      }),
    itemId: t
      .integer("item_id")
      .notNull()
      .references(() => items.id, {
        onDelete: "cascade",
      }),
    quantity: t.text("quantity"),
    requestMore: t.boolean("request_more"),
    requestMoreQuantity: t.integer("request_more_quantity"),
  },
  (s) => ({
    pk: t.primaryKey({ columns: [s.itemId, s.recipeId] }),
  })
);

export const overtime = table("overtime", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: t.text("user_id"),
  category: t.text("category"),
  leadId: t.text("lead_id"),
  startTime: t.timestamp({ precision: 6, withTimezone: true }),
  endTime: t.timestamp({ precision: 6, withTimezone: true }),
  status: t.text("status").default("PENDING").notNull(),
  requestorRemarks: t.text("requestor_remarks"),
  rejectionRemarks: t.text("rejection_remarks"),

  ...timestamps,
});

export type Overtime = InferSelectModel<typeof overtime>;

// Simplified item requests table that handles both cases
export const itemRequests = table("item_requests", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),

  // Basic request info
  userId: t
    .integer("user_id")
    .references(() => users.id)
    .notNull(),
  branchId: t
    .integer("branch_id")
    .references(() => branches.id)
    .notNull(),
  requestType: requestTypeEnum("request_type").notNull(),
  status: requestStatusEnum("status").default("PENDING").notNull(),

  // Item details
  itemId: t
    .integer("item_id")
    .references(() => items.id)
    .notNull(),
  currentStock: t.decimal("current_stock", { precision: 10, scale: 2 }),
  requestedQuantity: t.text("requested_quantity"),
  unit: unitEnum("unit").notNull(),

  // Optional order-related fields
  orderId: t.bigint({ mode: "number" }).references(() => orders.id),
  lineItemId: t.integer("line_item_id").references(() => lineItems.id),

  // Metadata
  priority: t.integer("priority").default(0),
  notes: t.text("notes"),
  requestedAt: t.timestamp("requested_at").defaultNow().notNull(),
  respondedAt: t.timestamp("responded_at"),
  respondedBy: t.integer("responded_by").references(() => users.id),
});

export const WHATSAPP_TEMPLATE_TYPES = {
  MISSING_DELIVERY_DATE: "bt_notify_missing_delivery_date_to_customer",
  EMPTY_MESSAGE_CARD: "bt_empty_message_card_or_photo",
  GPS_LOCATION: "bt_gps_location",
  SENDER_CONSENT: "bt_sender_consent",
  KYC_VERIFICATION: "bt_kyc_verification",
  AFTER_4PM_CUTOFF: "bt_after_4_pm_cutoff_time",
  AFTER_330PM_CUTOFF: "bt_after_330_pm_cutoff_time",
  RETURN_ORDER: "bt_return_order_or_failed_delivery",
  DELAY_DELIVERY: "bt_delay_delivery",
  OOS_PRODUCT_SUBSTITUTION_NOTIFICATION:
    "oos_product_substitution_notification",
  OOS_PRODUCT_SUBSTITUTION_INQUIRY: "oos_product_substitution_inquiry",
  SG_MISSING_DELIVERY_DATE: "btsg_notify_missing_delivery_date_to_customer",
  UNCOLLECTED_ORDER: "bt_uncollected_order",
  CHANGE_OF_DELIVERY_SLOT: "bt_change_of_delivery_slot",
} as const;

export type WhatsappTemplateType =
  (typeof WHATSAPP_TEMPLATE_TYPES)[keyof typeof WHATSAPP_TEMPLATE_TYPES];

export const whatsappTemplates = table("whatsapp_templates", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  templateId: t.text("template_id").notNull().unique(), // the meta template id
  name: t.text("name").notNull(), // human-readable name
  description: t.text("description"),
  templateType: t.text("template_type").$type<WhatsappTemplateType>().notNull(),
  parameters: t.jsonb("parameters"), // array of parameter names required by this template
  isActive: t.boolean("is_active").default(true),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  updatedAt: t.timestamp("updated_at").defaultNow().notNull(),
});

export type WhatsappTemplate = typeof whatsappTemplates.$inferSelect;
export type NewWhatsappTemplate = typeof whatsappTemplates.$inferInsert;

export const whatsappNotifications = table("whatsapp_notifications", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderNumber: t.integer("order_number"),
  notificationType: t.text("notification_type").$type<WhatsappTemplateType>(),
  phone: t.text("phone"),
  phoneType: t.text("phone_type").default("billing"),
  customerName: t.text("customer_name"),
  success: t.boolean("success").default(false),
  apiResponse: t.jsonb("api_response"),
  errorMessage: t.text("error_message"),
  notifiedBy: t.text("notified_by"),
  parameters: t.jsonb("parameters"), // store the parameters sent with the template
  notificationCount: t.integer("notification_count").default(1), // track how many times this notification has been sent
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  updatedAt: t.timestamp("updated_at").defaultNow().notNull(),
});

export type WhatsappNotification = typeof whatsappNotifications.$inferSelect;
export type NewWhatsappNotification = typeof whatsappNotifications.$inferInsert;

export type Department = typeof departments.$inferSelect;

export const departments = table("departments", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: t.text("name").notNull().unique(),
  ...timestamps,
});

export const peakSeasonGroups = table("peak_season_groups", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: t.text("name"),
  size: t.text("size"),
  state: t.text("state"),
  limit: t.integer("limit").notNull(),
  season: t.text("season"),
  variantId: t.bigint("variant_id", { mode: "bigint" }),
  ...timestamps,
});

export const peakseasonForecasts = table("peak_season_forecasts", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  season: t.text("season"),
  limit: t.integer("limit"),
  startdate: t.timestamp("startdate"),
  enddate: t.timestamp("enddate"),
  variantId: t.integer("variant_id").references(() => variants.id),
  ...timestamps,
});

// offline order audit log table for tracking changes
export const offlineOrderAuditLogs = table("offline_order_audit_logs", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: t
    .integer("order_id")
    .references(() => orders.id)
    .notNull(),
  action: t.text("action").notNull(), // CREATE, UPDATE, APPROVE, REJECT
  userId: t.integer("user_id").references(() => users.id),
  changes: t.jsonb("changes"), // store the changes made

  ...timestamps,
});

export const offlineOrderAuditLogsRelations = relations(
  offlineOrderAuditLogs,
  ({ one }) => ({
    order: one(orders, {
      fields: [offlineOrderAuditLogs.orderId],
      references: [orders.id],
    }),
    user: one(users, {
      fields: [offlineOrderAuditLogs.userId],
      references: [users.id],
    }),
  })
);

export type OfflineOrderAuditLogInsert = InferInsertModel<
  typeof offlineOrderAuditLogs
>;
export type OfflineOrderAuditLog = InferSelectModel<
  typeof offlineOrderAuditLogs
>;

export type Peakseasonforecast = typeof peakseasonForecasts.$inferSelect;
export type NewPeakseasonforecast = typeof peakseasonForecasts.$inferInsert;

// relations

export const orderStatusAuditRelations = relations(
  orderStatusAudit,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderStatusAudit.orderId],
      references: [orders.id],
    }),
  })
);

export const preparationGroupsRelations = relations(
  preparationGroups,
  ({ many }) => ({
    preparationGroupToVariant: many(preparationGroupsToVariants),
  })
);

export const lineItemStatusAuditRelations = relations(
  lineItemStatusAudit,
  ({ one }) => ({
    lineItem: one(lineItems, {
      fields: [lineItemStatusAudit.lineItemId],
      references: [lineItems.id],
    }),
    order: one(orders, {
      fields: [lineItemStatusAudit.orderId],
      references: [orders.id],
    }),
  })
);

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  addresses: many(addresses),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  customer: one(customers, {
    fields: [addresses.customerId],
    references: [customers.id],
  }),
  orderAsBilling: one(orders, {
    fields: [addresses.id],
    references: [orders.billingAddressId],
  }),
  orderAsShipping: one(orders, {
    fields: [addresses.id],
    references: [orders.shippingAddressId],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id],
  }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
  }),
  lineItems: many(lineItems),
  shippingLines: many(shippingLines),
  lineItemStatusAudit: many(lineItemStatusAudit),
  orderStatusAudit: many(orderStatusAudit),
  orderComment: many(orderComment),
  ordersToResources: many(ordersToResources),
}));

export const ordersToResourcesRelations = relations(
  ordersToResources,
  ({ one }) => ({
    order: one(orders, {
      fields: [ordersToResources.orderId],
      references: [orders.specialOrderNumber],
    }),
    resource: one(resources, {
      fields: [ordersToResources.resourceId],
      references: [resources.id],
    }),
  })
);

export const lineItemsRelations = relations(lineItems, ({ one, many }) => ({
  // A line item belongs to one order
  order: one(orders, {
    fields: [lineItems.orderId],
    references: [orders.id],
  }),
  // A line item is assigned to one user (florist)
  user: one(users, {
    fields: [lineItems.assignedTo],
    references: [users.id],
  }),
  variant: one(variants, {
    fields: [lineItems.variantId],
    references: [variants.shopifyVariantId],
  }),
  // A line item has many properties (key-value pairs)
  properties: many(lineItemProperties),
  // A line item has many status audit records
  statusAudit: many(lineItemStatusAudit),

  virtualLineItems: many(virtualLineItems),
}));

export const virtualLineItemsRelations = relations(
  virtualLineItems,
  ({ one, many }) => ({
    variant: one(variants, {
      fields: [virtualLineItems.variantId],
      references: [variants.shopifyVariantId],
    }),
    lineItem: one(lineItems, {
      fields: [virtualLineItems.lineItemId],
      references: [lineItems.id],
    }),
    user: one(users, {
      fields: [virtualLineItems.assignedTo],
      references: [users.id],
    }),
  })
);

export const lineItemPropertiesRelations = relations(
  lineItemProperties,
  ({ one }) => ({
    lineItem: one(lineItems, {
      fields: [lineItemProperties.lineItemId],
      references: [lineItems.id],
    }),
  })
);

export const shippingLinesRelations = relations(shippingLines, ({ one }) => ({
  order: one(orders, {
    fields: [shippingLines.orderId],
    references: [orders.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(variants),
  productsToCountries: many(productsToCountries),
}));

export const countriesRelations = relations(countries, ({ many }) => ({
  productsToCountries: many(productsToCountries),
}));

export const productsToCountriesRelations = relations(
  productsToCountries,
  ({ one }) => ({
    product: one(products, {
      fields: [productsToCountries.productId],
      references: [products.id],
    }),
    country: one(countries, {
      fields: [productsToCountries.countryId],
      references: [countries.id],
    }),
  })
);

export const variantsRelations = relations(variants, ({ one, many }) => ({
  product: one(products, {
    fields: [variants.productId],
    references: [products.id],
  }),
  recipe: one(recipes, {
    fields: [variants.recipeId],
    references: [recipes.id],
  }),
  preparationGroupToVariant: many(preparationGroupsToVariants),
  peakseasonForecasts: many(peakseasonForecasts),
}));

export const recipesRelations = relations(recipes, ({ many }) => ({
  recipesToItems: many(itemsToRecipes),
  variants: many(variants),
  auditLogs: many(recipeAuditLogs),
}));

export const recipeAuditLogsRelations = relations(
  recipeAuditLogs,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeAuditLogs.recipeId],
      references: [recipes.id],
    }),
    user: one(users, {
      fields: [recipeAuditLogs.userId],
      references: [users.id],
    }),
  })
);

export const itemsToRecipesRelations = relations(itemsToRecipes, ({ one }) => ({
  item: one(items, {
    fields: [itemsToRecipes.itemId],
    references: [items.id],
  }),
  recipe: one(recipes, {
    fields: [itemsToRecipes.recipeId],
    references: [recipes.id],
  }),
}));

export const preparationGroupsToVariantsRelations = relations(
  preparationGroupsToVariants,
  ({ one }) => ({
    preparationGroup: one(preparationGroups, {
      fields: [preparationGroupsToVariants.preparationGroupId],
      references: [preparationGroups.id],
    }),
    variant: one(variants, {
      fields: [preparationGroupsToVariants.variantId],
      references: [variants.id],
    }),
  })
);

export const branchesRelations = relations(branches, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  lineItems: many(lineItems),
  virtualLineItems: many(virtualLineItems),
}));

export const itemRequestsRelations = relations(itemRequests, ({ one }) => ({
  user: one(users, {
    fields: [itemRequests.userId],
    references: [users.id],
  }),
  item: one(items, {
    fields: [itemRequests.itemId],
    references: [items.id],
  }),
  order: one(orders, {
    fields: [itemRequests.orderId],
    references: [orders.id],
  }),
  lineItem: one(lineItems, {
    fields: [itemRequests.lineItemId],
    references: [lineItems.id],
  }),
  branch: one(branches, {
    fields: [itemRequests.branchId],
    references: [branches.id],
  }),
}));

export const stockTransfersRelations = relations(
  stockTransfers,
  ({ one, many }) => ({
    branch: one(branches, {
      fields: [stockTransfers.branchId],
      references: [branches.id],
    }),
    pendingUser: one(users, {
      fields: [stockTransfers.pendingBy],
      references: [users.id],
    }),
    processingUser: one(users, {
      fields: [stockTransfers.processingBy],
      references: [users.id],
    }),
    deliveringUser: one(users, {
      fields: [stockTransfers.deliveringBy],
      references: [users.id],
    }),
    fulfilledUser: one(users, {
      fields: [stockTransfers.fulfilledBy],
      references: [users.id],
    }),
    partialUser: one(users, {
      fields: [stockTransfers.partialBy],
      references: [users.id],
    }),
    deliveringPartialUser: one(users, {
      fields: [stockTransfers.deliveringPartialBy],
      references: [users.id],
    }),
    rejectedUser: one(users, {
      fields: [stockTransfers.rejectedBy],
      references: [users.id],
    }),
    cancelledUser: one(users, {
      fields: [stockTransfers.cancelledBy],
      references: [users.id],
    }),
    details: many(stockTransferDetails),
    receivedAtCargoUser: one(users, {
      fields: [stockTransfers.receivedAtCargoBy],
      references: [users.id],
    }),
  })
);

export const stockTransferDetailsRelations = relations(
  stockTransferDetails,
  ({ one }) => ({
    stockTransfer: one(stockTransfers, {
      fields: [stockTransferDetails.stockTransferId],
      references: [stockTransfers.id],
    }),
    item: one(items, {
      fields: [stockTransferDetails.itemId],
      references: [items.id],
    }),
  })
);

export const itemsRelations = relations(items, ({ many }) => ({
  recipesToItems: many(itemsToRecipes),
}));

// Resources table relation
export const resourcesRelations = relations(resources, ({ many }) => ({
  orders: many(orders),
}));

// Types
export type Customer = typeof customers.$inferSelect;
export type Address = typeof addresses.$inferSelect;

// TODO: update type in florist app
export type FloristWithLineItems = InferSelectModel<typeof users> & {
  lineItems: InferSelectModel<typeof lineItems>[];
};

export type Florist = InferSelectModel<typeof users>;

// Select Types
export type Variant = InferSelectModel<typeof variants>;
export type Recipe = typeof recipes.$inferSelect;
export type RecipeWithItems = Recipe & {
  items: ItemToRecipe[];
  variants: Variant[];
  curation?: Curation | null;
};
export type Item = InferSelectModel<typeof items>;
export type ItemToRecipe = InferSelectModel<typeof itemsToRecipes>;

export type OrderWithDetails = Order & {
  customer: Customer;
  shippingAddress: Address;
  billingAddress: Address;
};

export type ProductsWithVariants = Product & {
  variants: Variant[];
};

export type SingleProductWithVariants = Product & {
  variants: Variant[];
};

export type VariantWithRecipe = Variant & {
  recipe: Recipe;
};

export type RecipesWithItems = Recipe & {
  recipesToItems: ItemToRecipe[];
};

export type RecipeWithVariants = Recipe & {
  variants: Variant[];
};

export type RecipeWithCuration = Recipe & {
  variantImage: string | null;
  variants: Variant[];
  curation:
    | (Curation & {
        validator: {
          id: number;
          name: string | null;
          email: string | null;
        } | null;
      })
    | null;
};

// Insert Types
export type RecipeInsert = InferInsertModel<typeof recipes>;
export type ItemToRecipeInsert = InferInsertModel<typeof itemsToRecipes>;

export type RecipePayload = RecipeInsert & {
  items: ItemToRecipeInsert[];
  createdBy?: number;
  updatedBy?: number;
};

export type RecipeAuditLogInsert = InferInsertModel<typeof recipeAuditLogs>;
export type RecipeAuditLog = InferSelectModel<typeof recipeAuditLogs>;

export type VirtualOrder = InferSelectModel<typeof virtualLineItems>;

export type LineItem = InferSelectModel<typeof lineItems>;

// Add relation for peakseasonForecasts
export const peakseasonForecastsRelations = relations(
  peakseasonForecasts,
  ({ one }) => ({
    variant: one(variants, {
      fields: [peakseasonForecasts.variantId],
      references: [variants.id],
    }),
  })
);
export const deliveryGroups = table("delivery_groups", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  groupKey: t
    .text("group_key")
    .unique()
    .$defaultFn(() => cuid()),
  driverId: t.integer("driver_id").references(() => users.id),
  totalDistance: t.integer("total_distance"),
  totalFees: t.integer("total_fees"),
  ordersPickupTime: t.timestamp("orders_pickup_time"),
  statusId: t.integer("status_id").references(() => status.id),
  arrivedAt: t.timestamp("arrived_at"),
  arrivalProofPhotos: t.jsonb("arrival_proof_photos"),
  departedAt: t.timestamp("departed_at"),
  ...timestamps,
});

export const disputes = table("disputes", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  deliveryId: t.integer("delivery_id").references(() => deliveries.id),
  distance: t.integer("distance"),
  disputeReason: t.text("dispute_reason"),
  disputeProofPhotos: t.jsonb("dispute_proof_photos"),
  statusId: t.integer("status_id").references(() => status.id),
  reviewerNote: t.text("reviewer_note"),
  reviewerId: t.integer("reviewer_id").references(() => users.id),
  approverNote: t.text("approver_note"),
  approverId: t.integer("approver_id").references(() => users.id),
  ...timestamps,
});

export const deliveries = table("deliveries", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  statusId: t
    .integer("status_id")
    .references(() => status.id)
    .notNull(),
  orderId: t.integer("order_id").references(() => orders.id),
  waypointSort: t.integer("waypoint_sort"),
  deliveryGroupId: t
    .integer("delivery_group_id")
    .references(() => deliveryGroups.id),
  deliverySlot: t.text("delivery_slot"),
  deliveredAt: t.timestamp("delivered_at"),
  returnedAt: t.timestamp("returned_at"),
  returnReason: t.text("return_reason"),
  addressId: t.integer("address_id").references(() => addresses.id),
  deliveryRemarks: t.text("delivery_remarks"),
  distanceFromLastWaypoint: t.integer("distance_from_last_waypoint"),
  ...timestamps,
});

export const status = table("status", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  status: t.text("status"),
  statusType: t.text("status_type"),
  statusDescription: t.text("status_description"),
});

export const driverTypes = table("driver_types", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: t.text("type"),
  perDropRate: t.integer("per_drop_rate"),
  distanceRate: t.integer("distance_rate"),
});

export const delveriesRelations = relations(deliveries, ({ one }) => ({
  order: one(orders, {
    fields: [deliveries.orderId],
    references: [orders.id],
  }),
  status: one(status, {
    fields: [deliveries.statusId],
    references: [status.id],
  }),
  deliveryGroup: one(deliveryGroups, {
    fields: [deliveries.deliveryGroupId],
    references: [deliveryGroups.id],
  }),
  address: one(addresses, {
    fields: [deliveries.addressId],
    references: [addresses.id],
  }),
  dispute: one(disputes, {
    fields: [deliveries.id],
    references: [disputes.deliveryId],
  }),
}));
