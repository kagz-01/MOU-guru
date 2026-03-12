// db/connection.ts
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const MOCK_DB = Deno.env.get("MOCK_DB") === "true";
let connectionPool: Pool | null = null;

const getPool = () => {
  if (!connectionPool) {
    const POOL_CONNECTIONS = 20;
    connectionPool = new Pool({
      hostname: Deno.env.get("DB_HOST") || "localhost",
      database: Deno.env.get("DB_NAME") || "MOU-Records",
      user: Deno.env.get("DB_USER") || "postgres",
      password: Deno.env.get("DB_PASSWORD") || "pgAdmin1234",
      port: Number(Deno.env.get("DB_PORT")) || 5432,
    }, POOL_CONNECTIONS);
  }
  return connectionPool;
};

export const getConnection = async () => {
  if (MOCK_DB) {
    console.log("⚠️ Using Mock Database Connection");
    return {
      queryObject: (query: any, ...args: any[]) => {
        console.log("Mock Query:", query, args);
        return Promise.resolve({ rows: [] });
      },
      release: () => {},
    } as any;
  }
  return await getPool().connect();
};
