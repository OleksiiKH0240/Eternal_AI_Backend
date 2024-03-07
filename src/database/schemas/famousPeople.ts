import { serial, varchar, index } from "drizzle-orm/pg-core";
import mySchema from "./mySchema";


const famousPeople = mySchema.table("famous_people", {
    famousPersonId: serial("famous_person_id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    description: varchar("description", { length: 256 }).default("").notNull()
}, (table) => ({
    famousPeopleNameIdx: index("famous_people_name_idx").on(table.name)
}))

export default famousPeople;