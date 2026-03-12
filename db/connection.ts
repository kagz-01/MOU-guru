// db/connection.ts
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const POOL_CONNECTIONS = 20;
const connectionPool = new Pool({
  hostname: Deno.env.get("DB_HOST") || "localhost",
  database: Deno.env.get("DB_NAME") || "MOU-Records",
  user: Deno.env.get("DB_USER") || "postgres",
  password: Deno.env.get("DB_PASSWORD") || "pgAdmin1234",
  port: Number(Deno.env.get("DB_PORT")) || 5432,
}, POOL_CONNECTIONS);

export const getConnection = async () => {
  return await connectionPool.connect();
};
