import { integer, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import mySchema from "./mySchema";
import { sql } from "drizzle-orm";


const users = mySchema.table("users", {
    userId: serial("user_id").primaryKey(),
    email: varchar("email").unique().notNull(),
    password: varchar("password").notNull(),
    name: varchar("name"),
    phone: varchar("phone"),
    subscriptionId: integer("subscription_id").default(0).notNull(),
    subscriptionExpireDate: timestamp("subscription_expire_date").default(sql`localtimestamp`).notNull(),
    questionsCount: integer("questions_count").default(0).notNull()
})

export default users;
