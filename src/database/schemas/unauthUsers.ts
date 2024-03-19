import { integer, serial, timestamp, varchar, boolean, unique } from "drizzle-orm/pg-core";
import mySchema from "./mySchema";


const unauthUsers = mySchema.table("unauth_users", {
    ipV4: varchar("ip_v4", { length: 256 }).notNull(),
    userAgent: varchar("user_agent", { length: 256 }).notNull(),
    questionsCount: integer("question_count").default(0).notNull()
}, (table) => ({
    uniqueConstraint: unique("unique_constraint").on(table.ipV4, table.userAgent)
}))

export default unauthUsers;