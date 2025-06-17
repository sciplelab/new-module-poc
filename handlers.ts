import { z } from "zod";
import { db } from "./db";
import { parse } from "date-fns";
import {
  addresses,
  customers,
  lineItemProperties,
  lineItems,
  lineItemStatusAudit,
  orders,
  orderStatusAudit,
  shippingLines,
} from "./db/schema";
import { eq } from "drizzle-orm";

export function transformDeliveryDate(date?: string | null) {
  if (!date) return null;
  return parse(date, "dd-MM-yyyy", new Date());
}

export function transformDeliveryDateTime(
  date: string | null,
  session: string | null,
  orderId?: string,
  orderNumber?: string | number
): Date | null {
  if (!date) return null;

  try {
    // Parse the date string (DD-MM-YYYY format)
    const transformedDate = parse(date, "dd-MM-yyyy", new Date());

    // Set time based on session
    if (session) {
      const sessionType = session.toLowerCase();

      switch (sessionType) {
        case "morning":
        case "am": // 9:00 AM - 2:00 PM
          transformedDate.setHours(9, 0, 0, 0);
          break;
        case "standard":
        case "pm": // 12:00 PM - 6:00 PM
          transformedDate.setHours(12, 0, 0, 0);
          break;
        case "evening":
        case "em": // 4:00 PM - 8:00 PM
          transformedDate.setHours(16, 0, 0, 0);
          break;
        default:
          // Default to standard delivery time if session is unknown
          transformedDate.setHours(12, 0, 0, 0);
      }
    } else {
      // Default to standard delivery time if no session specified
      transformedDate.setHours(12, 0, 0, 0);
    }

    return transformedDate;
  } catch (error) {
    console.error(`Error transforming delivery date: ${date}`, error);
    console.log({
      message: `🚨 Failed to transform delivery date: ${date} with session: ${session} for order ${
        orderNumber ? `#${orderNumber}` : ""
      } ${orderId ? `(ID: ${orderId})` : ""}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
      groupChat: {
        name: "GOOGLE_CHAT_MISSING_DATE_V2",
      },
    });

    return null;
  }
}

const addressSchema = z
  .object({
    first_name: z.string().optional().nullable(),
    last_name: z.string().optional().nullable(),
    company: z.string().nullable(),
    address1: z.string().optional().nullable(),
    address2: z.string().nullable().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    province_code: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    country_code: z.string().optional().nullable(),
    zip: z.string().optional().nullable(),
    phone: z.string().nullable(),
    latitude: z
      .union([z.number(), z.string(), z.null()])
      .transform((val) => {
        const result = val === null ? "0" : val.toString();
        return result;
      })
      .optional(),
    longitude: z
      .union([z.number(), z.string(), z.null()])
      .transform((val) => {
        const result = val === null ? "0" : val.toString();
        return result;
      })
      .optional(),
  })
  .nullable();

// Simplified customer schema with only used fields
const customerSchema = z.object({
  email: z.string().optional().nullable(),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  verified_email: z.boolean().optional().nullable(),
  phone: z.string().nullable().optional().nullable(),
  tags: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
});

// Simplified line item property schema
const lineItemPropertySchema = z.object({
  name: z.string().optional().nullable(),
  value: z.string().optional().nullable(),
});

// Simplified line item schema with only used fields
const lineItemSchema = z.object({
  id: z.number().optional().nullable(),
  product_id: z.number().optional().nullable(),
  variant_id: z.number().optional().nullable(),
  title: z.string().optional().nullable(),
  variant_title: z.string().optional().nullable(),
  sku: z.string().nullable().optional().nullable(),
  quantity: z.number().optional().nullable(),
  price: z.string().optional().nullable(),
  total_discount: z.string().optional().nullable(),
  fulfillable_quantity: z.number().optional().nullable(),
  fulfillment_status: z.string().nullable().optional().nullable(),
  vendor: z.string().optional().nullable(),
  requires_shipping: z.boolean().optional().nullable(),
  taxable: z.boolean().optional().nullable(),
  properties: z.array(lineItemPropertySchema).optional().nullable(),
});

// Simplified shipping line schema with only used fields
const shippingLineSchema = z.object({
  id: z.number().optional().nullable(),
  code: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  discounted_price: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  carrier_identifier: z.string().nullable(),
});

// new schema based on observed payloads
// const noteAttributesSchema = z.object({
//   deliveryDate: z.string().optional().nullable(),
//   deliverySession: z.string().optional().nullable(),
// });

const noteAttributeSchema = z.object({
  name: z.string(),
  value: z.string(),
});

// old schema
const noteAttributesSchema = z
  .array(noteAttributeSchema)
  .transform((attributes) => {
    // Convert array to an object with only delivery information
    const result: Record<string, string> = {};

    attributes.forEach((attr) => {
      if (attr.name === "Delivery Date" || attr.name === "Delivery Session") {
        result[attr.name] = attr.value;
      }
    });

    return {
      deliveryDate: result["Delivery Date"] || null,
      deliverySession: result["Delivery Session"] || null,
    };
  });

// Main order schema with only used fields
export const shopifyOrderSchema = z.object({
  id: z.number(),
  order_number: z.number(),
  fulfillment_status: z.string().nullable(),
  cancel_reason: z.string().nullable(),
  current_total_price: z.string().optional().nullable(),
  current_subtotal_price: z.string().optional().nullable(),
  current_total_discounts: z.string().optional().nullable(),
  current_total_tax: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  confirmed: z.boolean().optional().nullable(),
  contact_email: z.string().optional().nullable(),
  processed_at: z.string().optional().nullable(),
  billing_address: addressSchema,
  shipping_address: addressSchema,
  customer: customerSchema,
  line_items: z.array(lineItemSchema).optional().nullable(),
  shipping_lines: z.array(shippingLineSchema).optional().nullable(),
  note_attributes: noteAttributesSchema,
});

export type ShopifyOrder = z.infer<typeof shopifyOrderSchema>;

export async function insertOrder(orderData: ShopifyOrder) {
  let shippingAddressId = "";
  let billingAddressId = "";

  if (
    orderData.note_attributes.deliveryDate === null ||
    orderData.note_attributes.deliveryDate === undefined ||
    orderData.note_attributes.deliverySession === null ||
    orderData.note_attributes.deliverySession === undefined
  ) {
    const missingFields: string[] = [];
    if (
      orderData.note_attributes.deliveryDate === null ||
      orderData.note_attributes.deliveryDate === undefined
    ) {
      missingFields.push("Delivery Date");
    }
    if (
      orderData.note_attributes.deliverySession === null ||
      orderData.note_attributes.deliverySession === undefined
    ) {
      missingFields.push("Delivery Session");
    }
  }

  const result = await db.transaction(async (tx) => {
    const [customer] = await tx
      .insert(customers)
      .values({
        email: orderData.customer.email ?? "",
        firstName: orderData.customer.first_name,
        lastName: orderData.customer.last_name,
        state: orderData.customer.state,
        verifiedEmail: orderData.customer.verified_email,
        phone: orderData.customer.phone,
        tags: orderData.customer.tags,
        currency: orderData.customer.currency,
      })
      .onConflictDoUpdate({
        target: customers.email,
        set: {
          email: orderData.customer.email ?? "",
          firstName: orderData.customer.first_name,
          lastName: orderData.customer.last_name,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (orderData.shipping_address && orderData.billing_address) {
      const [shippingAddress] = await tx
        .insert(addresses)
        .values({
          customerId: customer.id,
          firstName: orderData.shipping_address.first_name,
          lastName: orderData.shipping_address.last_name,
          company: orderData.shipping_address.company,
          address1: orderData.shipping_address.address1,
          address2: orderData.shipping_address.address2,
          city: orderData.shipping_address.city,
          province: orderData.shipping_address.province,
          provinceCode: orderData.shipping_address.province_code,
          country: orderData.shipping_address.country,
          countryCode: orderData.shipping_address.country_code,
          zip: orderData.shipping_address.zip,
          phone: orderData.shipping_address.phone,
          latitude: String(orderData.shipping_address.latitude),
          longitude: String(orderData.shipping_address.longitude),
        })
        .returning();

      const [billingAddress] = await tx
        .insert(addresses)
        .values({
          customerId: customer.id,
          firstName: orderData.billing_address.first_name,
          lastName: orderData.billing_address.last_name,
          company: orderData.billing_address.company,
          address1: orderData.billing_address.address1,
          address2: orderData.billing_address.address2,
          city: orderData.billing_address.city,
          province: orderData.billing_address.province,
          provinceCode: orderData.billing_address.province_code,
          country: orderData.billing_address.country,
          countryCode: orderData.billing_address.country_code,
          zip: orderData.billing_address.zip,
          phone: orderData.billing_address.phone,
        })
        .returning();

      shippingAddressId = shippingAddress.id.toString();
      billingAddressId = billingAddress.id.toString();
    }

    const [order] = await tx
      .insert(orders)
      .values({
        shopifyOrderId: orderData.id,
        orderNumber: orderData.order_number,
        customerId: customer.id,
        fulfillmentStatus: orderData.fulfillment_status,
        cancelReason: orderData.cancel_reason,
        currentTotalPrice: orderData.current_total_price,
        currentSubtotalPrice: orderData.current_subtotal_price,
        currentTotalDiscounts: orderData.current_total_discounts,
        currentTotalTax: orderData.current_total_tax,
        shippingAddressId:
          shippingAddressId !== "" ? Number(shippingAddressId) : null,
        billingAddressId:
          billingAddressId !== "" ? Number(billingAddressId) : null,
        note: orderData.note,
        tags: orderData.tags,
        confirmed: orderData.confirmed,
        contactEmail: orderData.contact_email,
        processed_at: new Date(orderData.processed_at ?? ""),
        rawBody: orderData as unknown as string,
        deliveryDate: orderData.note_attributes.deliveryDate ?? "",
        deliverySession: orderData.note_attributes.deliverySession ?? "",
        transformedDeliveryDate: transformDeliveryDateTime(
          orderData.note_attributes.deliveryDate ?? null,
          orderData.note_attributes.deliverySession ?? null,
          orderData.id.toString(),
          orderData.order_number
        ),
      })
      .returning();

    const lineItemsPromises = orderData.line_items?.map(async (item) => {
      const [lineItem] = await tx
        .insert(lineItems)
        .values({
          // @ts-expect-error i dont know
          lineItemId: item.id,
          orderId: order.id,
          productId: String(item.product_id),
          variantId: String(item.variant_id),
          title: item.title,
          variantTitle: item.variant_title,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price,
          totalDiscount: item.total_discount,
          fulfillableQuantity: item.fulfillable_quantity,
          fulfillmentStatus: item.fulfillment_status,
          vendor: item.vendor,
          requiresShipping: item.requires_shipping,
          taxable: item.taxable,
        })
        .returning();

      await tx.insert(lineItemStatusAudit).values({
        status: "UNASSIGNED",
        lineItemId: lineItem.id,
        orderId: order.id,
        actor: "tech@bloomthis.co",
        notes: "Line item received from Shopify Webhook",
      });

      if (item.properties && item.properties.length > 0) {
        await tx.insert(lineItemProperties).values(
          // @ts-expect-error i dont know
          item.properties.map((prop) => ({
            lineItemId: lineItem.id,
            name: prop.name,
            value: prop.value,
          }))
        );

        const deliveryDate = item.properties.find(
          (prop) => prop.name === "Delivery Date"
        )?.value;

        const updateOrderRes = await tx
          .update(orders)
          .set({
            transformedDeliveryDate: transformDeliveryDate(deliveryDate),
          })
          .where(eq(orders.id, order.id))
          .returning();
      }

      if (item.variant_id !== null && item.variant_id !== undefined) {
        // startPeakSeasonCheckBasedOnPeriod(item.variant_id, EventType.NEW_ORDER); // TypeScript now knows `value` is a number
        // checkVariantIdQuantity(BigInt(item.variant_id)); // Convert number to bigint
        // peakSeasonCheckFarhan(item.variant_id);
      }

      return lineItem;
    });

    // @ts-expect-error i dont know
    await Promise.all(lineItemsPromises);

    // 5. Create shipping lines
    if (orderData.shipping_lines && orderData.shipping_lines.length > 0) {
      await tx.insert(shippingLines).values(
        orderData.shipping_lines.map((shipping) => ({
          existingShippingId: String(shipping.id),
          orderId: order.id,
          code: shipping.code,
          title: shipping.title,
          price: shipping.price,
          discountedPrice: shipping.discounted_price,
          source: shipping.source,
          carrierIdentifier: shipping.carrier_identifier,
        }))
      );
    }

    await tx.insert(orderStatusAudit).values({
      status: "PENDING",
      orderId: order.id,
      actor: "tech@bloomthis.co",
      notes: "Order received from Shopify Webhook",
    });

    return order;
  });
  return result;
}
