import { integer, serial, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import mySchema from "./mySchema";


const users = mySchema.table("users", {
    userId: serial("user_id").primaryKey(),
    email: varchar("email").unique().notNull(),
    password: varchar("password").notNull(),
    name: varchar("name"),
    phone: varchar("phone"),
    subscriptionId: integer("subscription_id").default(0).notNull(),
    subscriptionExpireDate: timestamp("subscription_expire_date"),
    questionsCount: integer("questions_count").default(0).notNull(),
    hasShareBonus: boolean("has_share_bonus").default(true).notNull()
})

export default users;
