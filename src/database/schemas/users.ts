import { integer, serial, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import mySchema from "./mySchema";


const users = mySchema.table("users", {
    userId: serial("user_id").primaryKey(),
    email: varchar("email", { length: 256 }).unique().notNull(),
    password: varchar("password", { length: 256 }).notNull(),
    name: varchar("name", { length: 256 }),
    phone: varchar("phone", { length: 256 }),
    subscriptionId: integer("subscription_id").default(0).notNull(),
    subscriptionExpireDate: timestamp("subscription_expire_date"),
    stripeCustomerId: varchar("stripe_customer_id", { length: 256 }),
    questionsCount: integer("questions_count").default(0).notNull(),
    hasShareBonus: boolean("has_share_bonus").default(true).notNull()
})

export default users;
