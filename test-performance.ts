import { db } from "./db";
import {
  orders,
  deliveries,
  customers,
  addresses,
  deliveryGroups,
  users,
  branches,
  departments,
  status,
  type NewOrder,
} from "./db/schema";
import { eq, sql, and, desc, asc } from "drizzle-orm";

// Performance test configuration
const TEST_CONFIG = {
  CUSTOMER_COUNT: 1000,
  ORDER_COUNT: 10000,
  DELIVERY_COUNT: 10000,
  BATCH_SIZE: 100,
} as const;

interface PerformanceMetrics {
  operation: string;
  duration: number;
  recordsProcessed: number;
  recordsPerSecond: number;
}

// Add database connection check
async function checkDatabaseConnection() {
  if (!process.env.DB_URL) {
    throw new Error(
      "❌ DB_URL environment variable is not set. Please configure your database connection."
    );
  }

  try {
    // Test basic database connectivity
    await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Database connection successful");
  } catch (error) {
    throw new Error(
      `❌ Database connection failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }\n` +
        "Please check your database URL and ensure the database is running."
    );
  }
}

class PerformanceTracker {
  private metrics: PerformanceMetrics[] = [];

  async measure<T>(
    operation: string,
    recordCount: number,
    fn: () => Promise<T>
  ): Promise<T> {
    console.log(`\n🚀 Starting: ${operation} (${recordCount} records)`);
    const startTime = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      const recordsPerSecond = Math.round((recordCount / duration) * 1000);

      const metric: PerformanceMetrics = {
        operation,
        duration,
        recordsProcessed: recordCount,
        recordsPerSecond,
      };

      this.metrics.push(metric);

      console.log(`✅ Completed: ${operation}`);
      console.log(`   Duration: ${duration}ms`);
      console.log(`   Records: ${recordCount}`);
      console.log(`   Rate: ${recordsPerSecond} records/sec`);

      return result;
    } catch (error) {
      console.error(`❌ Failed: ${operation}`, error);
      throw error;
    }
  }

  printSummary() {
    console.log("\n📊 PERFORMANCE SUMMARY");
    console.log("=".repeat(80));
    console.log(
      "Operation".padEnd(40) +
        "Duration".padEnd(12) +
        "Records".padEnd(12) +
        "Rate/sec"
    );
    console.log("-".repeat(80));

    this.metrics.forEach((metric) => {
      console.log(
        metric.operation.padEnd(40) +
          `${metric.duration}ms`.padEnd(12) +
          metric.recordsProcessed.toString().padEnd(12) +
          metric.recordsPerSecond.toString()
      );
    });

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const totalRecords = this.metrics.reduce(
      (sum, m) => sum + m.recordsProcessed,
      0
    );

    console.log("-".repeat(80));
    console.log(
      "TOTAL".padEnd(40) +
        `${totalDuration}ms`.padEnd(12) +
        totalRecords.toString().padEnd(12) +
        Math.round((totalRecords / totalDuration) * 1000).toString()
    );
    console.log("=".repeat(80));
  }
}

// Helper functions to generate test data
function generateCustomerData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    email: `customer-${i + 1}@test.com`,
    firstName: `Customer`,
    lastName: `${i + 1}`,
    state: ["KUL", "SGR", "PNG", "JB", "SG"][i % 5],
    verifiedEmail: true,
    phone: `+6012345${String(i).padStart(4, "0")}`,
    currency: "MYR",
  }));
}

function generateAddressData(customers: any[], count: number) {
  return Array.from({ length: count }, (_, i) => {
    const customer = customers[i % customers.length];
    return {
      customerId: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      address1: `${i + 1} Test Street`,
      address2: `Unit ${(i % 50) + 1}`,
      city: ["Kuala Lumpur", "Selangor", "Penang", "Johor Bahru", "Singapore"][
        i % 5
      ],
      province: ["Kuala Lumpur", "Selangor", "Penang", "Johor", "Singapore"][
        i % 5
      ],
      country: "Malaysia",
      countryCode: "MY",
      zip: `${50000 + (i % 50000)}`,
      phone: customer.phone,
      latitude: "3.1390",
      longitude: "101.6869",
    };
  });
}

function generateOrderData(customers: any[], addresses: any[], count: number) {
  return Array.from({ length: count }, (_, i) => {
    const customer = customers[i % customers.length];
    const address = addresses[i % addresses.length];

    return {
      orderNumber: 100000 + i,
      customerId: customer.id,
      shippingAddressId: address.id,
      billingAddressId: address.id,
      statusNew: ["PENDING", "PREPARING", "PREPARED", "IN_TRANSIT"][
        i % 4
      ] as any,
      currentTotalPrice: "199.99",
      currentSubtotalPrice: "179.99",
      currentTotalDiscounts: "0.00",
      currentTotalTax: "20.00",
      deliveryDate: new Date(Date.now() + (i % 7) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      deliverySession: ["AM", "PM", "EM"][i % 3],
      orderType: ["ONLINE", "OFFLINE"][i % 2] as any,
      deliveryType: "STANDARD_DELIVERY" as any,
      contactEmail: customer.email,
      note: `Test order ${i + 1}`,
      messageCard: `Happy Birthday! Order #${i + 1}`,
      confirmed: true,
    };
  });
}

async function createTestData(tracker: PerformanceTracker) {
  console.log("\n🏗️  Creating test data...");

  // Check if we need initial setup data
  const existingBranches = await db.select().from(branches).limit(1);
  if (existingBranches.length === 0) {
    await tracker.measure("Creating initial setup data", 3, async () => {
      // Create branch
      const [branch] = await db
        .insert(branches)
        .values({
          name: "Test Branch",
          code: "TB001",
        })
        .returning();

      // Create department
      const [department] = await db
        .insert(departments)
        .values({
          name: "Logistics",
        })
        .returning();

      // Create status entries
      const statusEntries = [
        {
          status: "PENDING",
          statusType: "DELIVERY",
          statusDescription: "Pending delivery",
        },
        {
          status: "IN_TRANSIT",
          statusType: "DELIVERY",
          statusDescription: "In transit",
        },
        {
          status: "DELIVERED",
          statusType: "DELIVERY",
          statusDescription: "Successfully delivered",
        },
        {
          status: "FAILED",
          statusType: "DELIVERY",
          statusDescription: "Delivery failed",
        },
      ];

      await db.insert(status).values(statusEntries);

      return { branch, department };
    });
  }

  // Create customers in batches
  const customerData = generateCustomerData(TEST_CONFIG.CUSTOMER_COUNT);
  const customersCreated: any[] = [];

  for (let i = 0; i < customerData.length; i += TEST_CONFIG.BATCH_SIZE) {
    const batch = customerData.slice(i, i + TEST_CONFIG.BATCH_SIZE);
    const result = await tracker.measure(
      `Inserting customers batch ${Math.floor(i / TEST_CONFIG.BATCH_SIZE) + 1}`,
      batch.length,
      () => db.insert(customers).values(batch).returning()
    );
    customersCreated.push(...result);
  }

  // Create addresses in batches
  const addressData = generateAddressData(
    customersCreated,
    TEST_CONFIG.CUSTOMER_COUNT * 2
  );
  const addressesCreated: any[] = [];

  for (let i = 0; i < addressData.length; i += TEST_CONFIG.BATCH_SIZE) {
    const batch = addressData.slice(i, i + TEST_CONFIG.BATCH_SIZE);
    const result = await tracker.measure(
      `Inserting addresses batch ${Math.floor(i / TEST_CONFIG.BATCH_SIZE) + 1}`,
      batch.length,
      () => db.insert(addresses).values(batch).returning()
    );
    addressesCreated.push(...result);
  }

  // Create orders in batches
  const orderData = generateOrderData(
    customersCreated,
    addressesCreated,
    TEST_CONFIG.ORDER_COUNT
  );
  const createdOrders: any[] = [];

  for (let i = 0; i < orderData.length; i += TEST_CONFIG.BATCH_SIZE) {
    const batch = orderData.slice(i, i + TEST_CONFIG.BATCH_SIZE);
    const result = await tracker.measure(
      `Inserting orders batch ${Math.floor(i / TEST_CONFIG.BATCH_SIZE) + 1}`,
      batch.length,
      () =>
        db
          .insert(orders)
          .values(batch as NewOrder[])
          .returning()
    );
    createdOrders.push(...result);
  }

  // Get status IDs
  const statusRecords = await db.select().from(status);
  const pendingStatusId =
    statusRecords.find((s) => s.status === "PENDING")?.id || 1;
  const inTransitStatusId =
    statusRecords.find((s) => s.status === "IN_TRANSIT")?.id || 2;

  // Create delivery groups in batches
  const deliveryGroupData = Array.from(
    { length: Math.ceil(TEST_CONFIG.DELIVERY_COUNT / 10) },
    (_, i) => ({
      totalDistance: Math.floor(Math.random() * 50) + 10,
      totalFees: Math.floor(Math.random() * 100) + 50,
      ordersPickupTime: new Date(Date.now() + i * 30 * 60 * 1000), // 30 mins apart
    })
  );

  const deliveryGroupsCreated: any[] = [];
  for (let i = 0; i < deliveryGroupData.length; i += TEST_CONFIG.BATCH_SIZE) {
    const batch = deliveryGroupData.slice(i, i + TEST_CONFIG.BATCH_SIZE);
    const result = await tracker.measure(
      `Inserting delivery groups batch ${
        Math.floor(i / TEST_CONFIG.BATCH_SIZE) + 1
      }`,
      batch.length,
      () => db.insert(deliveryGroups).values(batch).returning()
    );
    deliveryGroupsCreated.push(...result);
  }

  // Create deliveries in batches
  const deliveryData = Array.from(
    { length: TEST_CONFIG.DELIVERY_COUNT },
    (_, i) => {
      const order = createdOrders[i % createdOrders.length];
      const deliveryGroup =
        deliveryGroupsCreated[i % deliveryGroupsCreated.length];

      return {
        statusId: i % 3 === 0 ? pendingStatusId : inTransitStatusId,
        orderId: order.id,
        waypointSort: (i % 10) + 1,
        deliveryGroupId: deliveryGroup.id,
        deliverySlot: ["9:00-12:00", "14:00-17:00", "19:00-21:00"][i % 3],
        addressId: order.shippingAddressId,
        deliveryRemarks: `Delivery ${i + 1} - Handle with care`,
        distanceFromLastWaypoint: Math.floor(Math.random() * 10) + 1,
      };
    }
  );

  for (let i = 0; i < deliveryData.length; i += TEST_CONFIG.BATCH_SIZE) {
    const batch = deliveryData.slice(i, i + TEST_CONFIG.BATCH_SIZE);
    await tracker.measure(
      `Inserting deliveries batch ${
        Math.floor(i / TEST_CONFIG.BATCH_SIZE) + 1
      }`,
      batch.length,
      () => db.insert(deliveries).values(batch).returning()
    );
  }

  return {
    customers: customersCreated,
    addresses: addressesCreated,
    orders: createdOrders,
  };
}

async function testJoinPerformance(tracker: PerformanceTracker) {
  console.log("\n🔍 Testing join performance...");

  // Test 1: Simple join between orders and customers
  await tracker.measure("Orders with customers join", 1, async () => {
    const result = await db
      .select({
        orderId: orders.id,
        orderNumber: orders.orderNumber,
        customerEmail: customers.email,
        customerName: sql`${customers.firstName} || ' ' || ${customers.lastName}`,
        orderStatus: orders.statusNew,
        totalPrice: orders.currentTotalPrice,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .limit(1000);

    console.log(`   Found ${result.length} order-customer records`);
    return result;
  });

  // Test 2: Complex join with orders, customers, addresses, and deliveries
  await tracker.measure("Complex 4-table join", 1, async () => {
    const result = await db
      .select({
        orderId: orders.id,
        orderNumber: orders.orderNumber,
        customerEmail: customers.email,
        customerName: sql`${customers.firstName} || ' ' || ${customers.lastName}`,
        shippingAddress: sql`${addresses.address1} || ', ' || ${addresses.city}`,
        deliveryStatus: deliveries.statusId,
        deliverySlot: deliveries.deliverySlot,
        deliveryGroupId: deliveries.deliveryGroupId,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .innerJoin(addresses, eq(orders.shippingAddressId, addresses.id))
      .innerJoin(deliveries, eq(orders.id, deliveries.orderId))
      .limit(1000);

    console.log(`   Found ${result.length} complex join records`);
    return result;
  });

  // Test 3: Aggregated query - orders per customer
  await tracker.measure("Aggregated orders per customer", 1, async () => {
    const result = await db
      .select({
        customerId: customers.id,
        customerEmail: customers.email,
        customerName: sql`${customers.firstName} || ' ' || ${customers.lastName}`,
        orderCount: sql<number>`count(${orders.id})`,
        totalSpent: sql<string>`sum(${orders.currentTotalPrice})`,
        avgOrderValue: sql<string>`avg(${orders.currentTotalPrice})`,
      })
      .from(customers)
      .leftJoin(orders, eq(customers.id, orders.customerId))
      .groupBy(
        customers.id,
        customers.email,
        customers.firstName,
        customers.lastName
      )
      .having(sql`count(${orders.id}) > 0`)
      .orderBy(desc(sql`count(${orders.id})`))
      .limit(100);

    console.log(`   Found ${result.length} customer analytics records`);
    return result;
  });

  // Test 4: Delivery performance by group
  await tracker.measure("Delivery group performance", 1, async () => {
    const result = await db
      .select({
        groupId: deliveryGroups.id,
        groupKey: deliveryGroups.groupKey,
        totalDistance: deliveryGroups.totalDistance,
        totalFees: deliveryGroups.totalFees,
        deliveryCount: sql<number>`count(${deliveries.id})`,
        avgDistance: sql<string>`avg(${deliveries.distanceFromLastWaypoint})`,
        pendingDeliveries: sql<number>`count(case when ${deliveries.statusId} = 1 then 1 end)`,
        completedDeliveries: sql<number>`count(case when ${deliveries.statusId} = 2 then 1 end)`,
      })
      .from(deliveryGroups)
      .leftJoin(deliveries, eq(deliveryGroups.id, deliveries.deliveryGroupId))
      .groupBy(
        deliveryGroups.id,
        deliveryGroups.groupKey,
        deliveryGroups.totalDistance,
        deliveryGroups.totalFees
      )
      .having(sql`count(${deliveries.id}) > 0`)
      .orderBy(desc(sql`count(${deliveries.id})`))
      .limit(100);

    console.log(`   Found ${result.length} delivery group analytics records`);
    return result;
  });

  // Test 5: Time-based performance - orders by date
  await tracker.measure("Time-based order analysis", 1, async () => {
    const result = await db
      .select({
        deliveryDate: orders.deliveryDate,
        orderCount: sql<number>`count(${orders.id})`,
        totalRevenue: sql<string>`sum(${orders.currentTotalPrice})`,
        avgOrderValue: sql<string>`avg(${orders.currentTotalPrice})`,
        pendingOrders: sql<number>`count(case when ${orders.statusNew} = 'PENDING' then 1 end)`,
        preparingOrders: sql<number>`count(case when ${orders.statusNew} = 'PREPARING' then 1 end)`,
        deliveryCount: sql<number>`count(${deliveries.id})`,
      })
      .from(orders)
      .leftJoin(deliveries, eq(orders.id, deliveries.orderId))
      .groupBy(orders.deliveryDate)
      .having(sql`count(${orders.id}) > 0`)
      .orderBy(asc(orders.deliveryDate))
      .limit(50);

    console.log(`   Found ${result.length} daily analytics records`);
    return result;
  });
}

async function testIndexPerformance(tracker: PerformanceTracker) {
  console.log("\n📊 Testing index performance...");

  // Test individual lookups that should use indexes
  await tracker.measure("Customer email lookup", 100, async () => {
    const promises = Array.from({ length: 100 }, (_, i) =>
      db
        .select()
        .from(customers)
        .where(eq(customers.email, `customer-${i + 1}@test.com`))
        .limit(1)
    );
    await Promise.all(promises);
  });

  await tracker.measure("Order number lookup", 100, async () => {
    const promises = Array.from({ length: 100 }, (_, i) =>
      db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, 100000 + i))
        .limit(1)
    );
    await Promise.all(promises);
  });

  await tracker.measure("Order status filtering", 10, async () => {
    const promises = Array.from({ length: 10 }, (_, i) => {
      const status = ["PENDING", "PREPARING", "PREPARED", "IN_TRANSIT"][i % 4];
      return db
        .select()
        .from(orders)
        .where(eq(orders.statusNew, status as any))
        .limit(100);
    });
    await Promise.all(promises);
  });
}

async function testOrderInsertionAndDeliveryViewing(
  tracker: PerformanceTracker
) {
  console.log("\n📦 Testing Order Insertion and Delivery Viewing...");

  // Test data configuration
  const TEST_ORDERS = 100;
  const TEST_DELIVERIES = 20;

  // Generate test orders
  const testOrders: NewOrder[] = Array.from(
    { length: TEST_ORDERS },
    (_, i) => ({
      orderNumber: 1000000 + i,
      customerId: 1, // Assuming customer ID 1 exists
      shippingAddressId: 1, // Assuming address ID 1 exists
      billingAddressId: 1,
      statusNew: "PENDING" as const,
      currentTotalPrice: "199.99",
      currentSubtotalPrice: "179.99",
      currentTotalDiscounts: "0.00",
      currentTotalTax: "20.00",
      deliveryDate: new Date(Date.now() + (i % 7) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      deliverySession: "AM" as const,
      orderType: "ONLINE" as const,
      deliveryType: "STANDARD_DELIVERY" as const,
      contactEmail: `test${i}@example.com`,
      note: `Test order ${i + 1}`,
      messageCard: `Happy Birthday! Order #${i + 1}`,
      confirmed: true,
    })
  );

  // Insert orders and measure performance
  const insertedOrders = await tracker.measure(
    "Inserting test orders",
    TEST_ORDERS,
    async () => {
      return await db.transaction(async (tx) => {
        const results = [];
        for (const order of testOrders) {
          const result = await tx.insert(orders).values(order).returning();
          results.push(result[0]);
        }
        return results;
      });
    }
  );

  // Create delivery groups (use driverId, statusId)
  const insertedDeliveryGroups = await tracker.measure(
    "Creating delivery groups",
    TEST_DELIVERIES,
    async () => {
      return await db.transaction(async (tx) => {
        const groups = [];
        for (let i = 0; i < TEST_DELIVERIES; i++) {
          const group = await tx
            .insert(deliveryGroups)
            .values({
              statusId: 9, // ASSIGNED status
              driverId: 1, // Assuming driver ID 1 exists
            })
            .returning();
          groups.push(group[0]);
        }
        return groups;
      });
    }
  );

  // Create deliveries and assign orders to delivery groups
  await tracker.measure(
    "Creating deliveries and assigning orders",
    TEST_ORDERS,
    async () => {
      return await db.transaction(async (tx) => {
        const deliveriesResults = [];
        for (let i = 0; i < TEST_ORDERS; i++) {
          const order = insertedOrders[i];
          const groupIndex = Math.floor(i / (TEST_ORDERS / TEST_DELIVERIES));
          const delivery = await tx
            .insert(deliveries)
            .values({
              orderId: order.id,
              deliveryGroupId: insertedDeliveryGroups[groupIndex].id,
              statusId: 9, // ASSIGNED status
            })
            .returning();
          deliveriesResults.push(delivery[0]);
        }
        return deliveriesResults;
      });
    }
  );

  // Test viewing deliveries by orderId
  await tracker.measure(
    "Viewing deliveries by orderId",
    TEST_ORDERS,
    async () => {
      const results = [];
      for (const order of insertedOrders) {
        const delivery = await db.query.deliveries.findFirst({
          where: eq(deliveries.orderId, order.id),
          with: {
            order: {
              columns: {
                orderNumber: true,
              },
            },
          },
        });
        results.push(delivery);
      }
      return results;
    }
  );

  // Test viewing deliveries by orderNumber (join with orders)
  await tracker.measure(
    "Viewing deliveries by orderNumber",
    TEST_ORDERS,
    async () => {
      const results = [];
      for (const order of insertedOrders) {
        const delivery = await db.query.deliveries.findFirst({
          where: eq(deliveries.orderId, order.id),
          with: {
            order: {
              columns: {
                orderNumber: true,
              },
            },
          },
        });
        results.push(delivery);
      }
      return results;
    }
  );
}

async function cleanupTestData(tracker: PerformanceTracker) {
  console.log("\n🧹 Cleaning up test data...");

  await tracker.measure("Cleanup deliveries", 1, async () => {
    const result = await db.delete(deliveries);
    console.log(`   Deleted deliveries`);
    return result;
  });

  await tracker.measure("Cleanup delivery groups", 1, async () => {
    const result = await db.delete(deliveryGroups);
    console.log(`   Deleted delivery groups`);
    return result;
  });

  await tracker.measure("Cleanup orders", 1, async () => {
    const result = await db.delete(orders);
    console.log(`   Deleted orders`);
    return result;
  });

  await tracker.measure("Cleanup addresses", 1, async () => {
    const result = await db.delete(addresses);
    console.log(`   Deleted addresses`);
    return result;
  });

  await tracker.measure("Cleanup customers", 1, async () => {
    const result = await db.delete(customers);
    console.log(`   Deleted customers`);
    return result;
  });
}

// Main test function
export async function runIntensivePerformanceTest(cleanup = true) {
  const tracker = new PerformanceTracker();

  console.log("🚀 STARTING INTENSIVE ORDER & DELIVERY PERFORMANCE TEST");
  console.log("=".repeat(80));
  console.log(`Configuration:`);
  console.log(`- Customers: ${TEST_CONFIG.CUSTOMER_COUNT.toLocaleString()}`);
  console.log(`- Orders: ${TEST_CONFIG.ORDER_COUNT.toLocaleString()}`);
  console.log(`- Deliveries: ${TEST_CONFIG.DELIVERY_COUNT.toLocaleString()}`);
  console.log(`- Batch Size: ${TEST_CONFIG.BATCH_SIZE}`);

  try {
    // Check database connection first
    await checkDatabaseConnection();

    // Create test data
    await createTestData(tracker);

    // Test join performance
    await testJoinPerformance(tracker);

    // Test index performance
    await testIndexPerformance(tracker);

    // Test order insertion and delivery viewing
    await testOrderInsertionAndDeliveryViewing(tracker);

    // Show summary
    tracker.printSummary();

    if (cleanup) {
      await cleanupTestData(tracker);
      console.log("\n✅ Test completed and cleanup finished!");
    } else {
      console.log("\n✅ Test completed! Data preserved for further analysis.");
    }
  } catch (error) {
    console.error("\n❌ Test failed:", error);

    // Provide helpful error messages
    if (error instanceof Error) {
      if (
        error.message.includes("relation") &&
        error.message.includes("does not exist")
      ) {
        console.error("\n💡 Hint: Run database migrations first:");
        console.error("   bun run db:migrate");
      } else if (error.message.includes("connection")) {
        console.error("\n💡 Hint: Check your database connection:");
        console.error("   - Ensure DB_URL environment variable is set");
        console.error("   - Verify database server is running");
        console.error("   - Check database credentials and permissions");
      }
    }

    throw error;
  }
}

// Export for use in other files
export { PerformanceTracker, TEST_CONFIG };
