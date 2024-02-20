import { Config } from "drizzle-kit";


export default {
    schema: "./src/database/schemas/",
    out: "./drizzle",
    driver: "pg"
} satisfies Config;
