import { Hono } from "hono";
import { db } from "./db";
import { deliveries, deliveryGroups } from "./db/schema";
import { eq } from "drizzle-orm";
import { runIntensivePerformanceTest } from "./test-performance";
import { insertOrder } from "./handlers";

const app = new Hono();

app.post("/assign-order", async (c) => {
  const { orderId } = await c.req.json();
  const result = await db.transaction(async (tx) => {
    return c.json({
      result,
    });
  });
});

app.get("/get-deliveries", async (c) => {
  const result = await db.transaction(async (tx) => {
    return await tx.query.deliveries.findMany({
      with: {
        order: {},
        status: {},
        address: {},
        deliveryGroup: {},
        dispute: {},
      },
      where: eq(deliveries.orderId, 1),
    });
  });

  return c.json({
    result,
  });
});

app.post("/mock-shopify-order", async (c) => {
  const order = await c.req.json();
  const result = await insertOrder(order);
  return c.json({
    result,
  });
});

export default app;
