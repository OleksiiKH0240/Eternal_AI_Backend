import { integer, serial, boolean, text, index } from "drizzle-orm/pg-core";
import mySchema from "./mySchema";
import chats from "./chats";


const messages = mySchema.table("messages", {
    messageId: serial("message_id").primaryKey(),
    chatId: integer("chat_id").references(() => chats.chatId).notNull(),
    fromUser: boolean("from_user").notNull(),
    content: text("content").notNull()
}, (table) => ({
    messagesChatIdIdx: index("messages_chat_id_idx").on(table.chatId)
}));

export default messages;
