import { pgEnum } from "drizzle-orm/pg-core";

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
