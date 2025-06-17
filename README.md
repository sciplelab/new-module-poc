# Order & Delivery Performance Test Suite 🚀

This project contains an intensive performance testing suite for order and delivery management systems. It tests bulk data insertion, complex joins, and database performance under high load.

## Features

### 🔥 Intensive Performance Testing
- **Bulk Data Creation**: Creates thousands of customers, orders, and deliveries
- **Join Performance**: Tests complex multi-table joins
- **Index Performance**: Validates database index effectiveness
- **Real-time Metrics**: Tracks insertion rates, query performance, and throughput

### 📊 Test Scenarios
1. **Customer Management**: 1,000 customers with realistic data
2. **Order Processing**: 10,000 orders with full relationship mapping
3. **Delivery Logistics**: 10,000 deliveries with grouping and routing
4. **Complex Analytics**: Multi-table joins and aggregations
5. **Index Validation**: Email lookups, order number searches, status filtering

## Quick Start

### Prerequisites
- [Bun](https://bun.sh/) runtime
- PostgreSQL database
- Environment variable `DB_URL` configured

### Installation
```bash
# Install dependencies
bun install

# Generate database migrations (if needed)
bun run db:generate

# Run migrations
bun run db:migrate
```

### Running Tests

#### 🖥️ Web Interface
```bash
# Start the web server
bun run dev

# Open http://localhost:3000 in your browser
```

#### 🚀 Command Line Interface

**Full Performance Test (10,000+ records)**
```bash
# Run full test with automatic cleanup
bun run test:performance

# Run full test and keep data for analysis
bun run test:performance:keep
```

**Quick Test (500 records)**
```bash
# Run quick test for development
bun run test:performance:quick
```

**Direct CLI**
```bash
# Full test with cleanup
bun run run-test.ts

# Quick test
bun run run-test.ts --quick

# Keep test data
bun run run-test.ts --keep-data
```

## Test Configuration

### Default Settings
```typescript
const TEST_CONFIG = {
  CUSTOMER_COUNT: 1000,      // Number of customers to create
  ORDER_COUNT: 10000,        // Number of orders to create
  DELIVERY_COUNT: 10000,     // Number of deliveries to create
  BATCH_SIZE: 100,           // Records per batch insert
}
```

### Quick Test Settings
- Customers: 100
- Orders: 500
- Deliveries: 500
- Batch Size: 50

## Performance Metrics

The test suite tracks and reports:

### 📈 Insertion Performance
- **Records per second** for bulk inserts
- **Batch processing** efficiency
- **Memory usage** during operations
- **Database connection** handling

### 🔍 Query Performance
- **Simple joins** (orders + customers)
- **Complex joins** (4+ tables)
- **Aggregated queries** (GROUP BY, COUNT, SUM)
- **Index lookups** (email, order number, status)

### 📊 Sample Output
```
📊 PERFORMANCE SUMMARY
================================================================================
Operation                               Duration    Records     Rate/sec
--------------------------------------------------------------------------------
Inserting customers batch 1             127ms       100         787
Inserting orders batch 1                234ms       100         427
Complex 4-table join                     45ms        1000        22222
Aggregated orders per customer           89ms        100         1123
--------------------------------------------------------------------------------
TOTAL                                    2847ms      21203       7448
================================================================================
```

## Database Schema

### Core Tables
- **customers**: Customer information and contact details
- **addresses**: Shipping and billing addresses
- **orders**: Order management with status tracking
- **deliveries**: Delivery logistics and routing
- **delivery_groups**: Batched delivery optimization
- **status**: Delivery status tracking

### Key Relationships
```
customers 1:N addresses
customers 1:N orders
orders 1:1 addresses (shipping)
orders 1:1 addresses (billing)
orders 1:N deliveries
delivery_groups 1:N deliveries
```

## API Endpoints

### Web Interface
- `GET /` - Performance test dashboard
- `POST /test/run` - Execute full performance test
- `GET /test/quick` - Run quick performance test
- `GET /health` - Service health check

## Test Types

### 🏗️ Data Creation Tests
1. **Bulk Customer Creation** - Tests customer table insertions
2. **Address Management** - Tests address relationship creation
3. **Order Processing** - Tests order creation with relationships
4. **Delivery Scheduling** - Tests delivery and grouping logic

### 🔍 Join Performance Tests
1. **Simple Join** - Orders with customer information
2. **Complex Join** - Orders + customers + addresses + deliveries
3. **Aggregated Analytics** - Customer order statistics
4. **Delivery Analytics** - Delivery group performance metrics
5. **Time-based Analysis** - Daily order and delivery trends

### 📊 Index Performance Tests
1. **Email Lookups** - Customer email uniqueness
2. **Order Number Searches** - Order identification
3. **Status Filtering** - Order and delivery status queries

## Performance Optimization Tips

### Database Indexes
Ensure these indexes exist for optimal performance:
```sql
-- Customer lookups
CREATE INDEX idx_customers_email ON customers(email);

-- Order lookups
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status_new);
CREATE INDEX idx_orders_customer ON orders(customer_id);

-- Delivery lookups
CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_deliveries_group ON deliveries(delivery_group_id);
CREATE INDEX idx_deliveries_status ON deliveries(status_id);
```

### Connection Pooling
Configure your database connection pool:
```typescript
// Example with drizzle-orm
export const db = drizzle(process.env.DB_URL!, {
  schema,
  // Add connection pooling configuration
});
```

## Troubleshooting

### Common Issues

**Test Fails with "relation does not exist"**
```bash
# Run database migrations
bun run db:migrate
```

**Out of memory during large tests**
- Reduce `TEST_CONFIG.BATCH_SIZE`
- Use the quick test option
- Ensure adequate system RAM

**Slow performance**
- Check database indexes
- Verify database connection pool settings
- Monitor system resources during test

### Cleanup Commands
```bash
# If test data remains after interrupted test
psql $DB_URL -c "
  DELETE FROM deliveries;
  DELETE FROM delivery_groups;
  DELETE FROM orders;
  DELETE FROM addresses;
  DELETE FROM customers;
"
```

## Contributing

### Adding New Test Scenarios
1. Extend the `testJoinPerformance()` function
2. Add new test cases to `PerformanceTracker`
3. Update the web interface with new endpoints

### Modifying Test Data
1. Edit generator functions in `test-performance.ts`
2. Adjust `TEST_CONFIG` constants
3. Update batch processing logic if needed

## License

ISC License - See package.json for details.

---

**Happy Performance Testing! 🎯** 