#!/usr/bin/env bun
import { runIntensivePerformanceTest } from "./test-performance";

async function main() {
  const args = process.argv.slice(2);
  const shouldCleanup = !args.includes("--keep-data");
  const isQuick = args.includes("--quick");

  console.log("🎯 Performance Test CLI Runner");
  console.log("================================");

  if (isQuick) {
    console.log("🏃‍♂️ Running quick test...");
    // Temporarily modify the config for quick test
    const { TEST_CONFIG } = await import("./test-performance");
    const originalConfig = { ...TEST_CONFIG };

    (TEST_CONFIG as any).CUSTOMER_COUNT = 100;
    (TEST_CONFIG as any).ORDER_COUNT = 500;
    (TEST_CONFIG as any).DELIVERY_COUNT = 500;
    (TEST_CONFIG as any).BATCH_SIZE = 50;

    try {
      await runIntensivePerformanceTest(true); // Always cleanup for quick test
      console.log("\n🎉 Quick test completed successfully!");
    } finally {
      // Restore original config
      Object.assign(TEST_CONFIG as any, originalConfig);
    }
  } else {
    console.log(`🔥 Running full test (cleanup: ${shouldCleanup})`);
    await runIntensivePerformanceTest(shouldCleanup);
  }
}

// Handle process signals for graceful shutdown
process.on("SIGINT", () => {
  console.log(
    "\n\n⚠️  Test interrupted by user. Some test data may remain in database."
  );
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log(
    "\n\n⚠️  Test terminated. Some test data may remain in database."
  );
  process.exit(1);
});

// Run the test
main().catch((error) => {
  console.error("\n❌ Test failed:", error);
  process.exit(1);
});
