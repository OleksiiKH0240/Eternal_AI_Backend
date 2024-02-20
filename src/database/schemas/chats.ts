import { integer, serial, index } from "drizzle-orm/pg-core";
import mySchema from "./mySchema";


const chats = mySchema.table("chats", {
    chatId: serial("chat_id").primaryKey(),
    userId: integer("user_id").notNull(),
    famousPersonId: integer("famous_person_id").notNull(),
}, (table) => ({
    chatsUserIdIdx: index("chats_user_id_idx").on(table.userId),
    chatsFamousPersonIdIdx: index("chats_famous_person_id_idx").on(table.famousPersonId)
}));

export default chats;
