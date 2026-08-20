import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type * as schema from "./schema.js";

export type Db = NeonHttpDatabase<typeof schema>;
