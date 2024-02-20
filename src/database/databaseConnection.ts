import { Pool } from "pg";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";


const { PG_HOST, PG_PORT, PG_DATABASE, PG_USER, PG_PASSWORD } = process.env;
export { PG_DATABASE };

const pool = new Pool({
    host: PG_HOST,
    port: Number(PG_PORT) || 5432,
    database: PG_DATABASE,
    user: PG_USER,
    password: PG_PASSWORD,
    ssl: true
});

export const db = drizzle(pool);
// db.execute(sql`select now();`);
console.log("database connection was established successfully.")
