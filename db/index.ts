import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const db = drizzle(process.env.DB_URL!, {
  schema,
  logger: {
    logQuery: (query, params) => {
      console.log(query, params);
    },
  },
});
