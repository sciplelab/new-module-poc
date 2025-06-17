import {
  pgTable as table,
  boolean,
  integer,
  text,
  decimal,
  json,
  timestamp,
  primaryKey,
  bigint,
  AnyPgColumn,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { timestamps } from "./schema/helpers";
import {
  lineItemStatusEnum,
  orderStatusV2Enum,
  stockTransferStatusEnum,
  stockTransferTypeEnum,
  itemTypeEnum,
  itemSizeEnum,
  recipeSizeEnum,
  recipeTypeEnum,
  recipeStatusEnum,
  requestTypeEnum,
  productStatusEnum,
  variantSizeEnum,
  unitEnum,
  userRole,
  requestStatusEnum,
} from "./schema/enums";

// ... existing code ...
// The table/type definitions for branches, users, departments, customers, addresses, and orders have been moved to db/schema/*.ts
// ... existing code ...
