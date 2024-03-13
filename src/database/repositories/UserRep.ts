import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { db } from "../databaseConnection"
import users from "../schemas/users";
import { and, desc, eq } from "drizzle-orm";
import famousPeople from "../schemas/famousPeople";
import chats from "../schemas/chats";
import messages from "../schemas/messages";


class UserRep {
    dbClient: NodePgDatabase
    constructor(dbClient = db) {
        this.dbClient = dbClient;
    }

    init = async () => {
        await this.initFamousPeople();
        await this.initUsers();
        await this.initChats();
        await this.initMessages();
    }

    initFamousPeople = async () => {
        await this.dbClient.insert(famousPeople).values([
            { famousPersonId: -1, name: "DR. MARTIN LUTHER KING JR.", description: "POLITICAL ACTIVIST" },
            { famousPersonId: -2, name: "STEVE JOBS", description: "APPLE COMPUTER FOUNDER" },
            { famousPersonId: -3, name: "ELON MUSK", description: "SPACE NERD" },
            { famousPersonId: -4, name: "ALBERT EINSTEIN", description: "GENIUS" },
            { famousPersonId: -5, name: "MOTHER TERESA", description: "PHILANTHROPIST" },
            { famousPersonId: -6, name: "JESUS CHRIST", description: "LORD & SAVIOR" },
            { famousPersonId: -7, name: "LEONARDO DA VINCI", description: "ARTIST" },
            { famousPersonId: -8, name: "QUEEN ELIZABETH", description: "QUEEN OF ENGLAND" },
            { famousPersonId: -9, name: "WILLIAM SHAKESPEARE", description: "AUTHOR" },
            { famousPersonId: -10, name: "NELSON MANDELA", description: "PHILANTHROPIST" },
            { famousPersonId: -11, name: "BETSY ROSS", description: "AMERICAN HISTORY" },
            { famousPersonId: -12, name: "GANDHI", description: "PHILANTHROPIST" },
            { famousPersonId: -13, name: "ABRAHAM LINCOLN", description: "AMERICAN PRESIDENT" },
            { famousPersonId: -14, name: "RON SWANSON", description: "TV GOOFY GUY" },
        ]).onConflictDoNothing();
    }

    initUsers = async () => {
        await this.dbClient.insert(users).values([
            { userId: -1, email: "test1@gmail.com", password: "123456", name: "test1Name", phone: "test1Phone" },
            { userId: -2, email: "test2@gmail.com", password: "123456", name: "test2Name", phone: "test2Phone" }
        ]).onConflictDoNothing();
    }

    initChats = async () => {
        await this.dbClient.insert(chats).values([
            { chatId: -1, userId: -1, famousPersonId: -1 },
            { chatId: -2, userId: -1, famousPersonId: -2 },
        ]).onConflictDoNothing();
    }

    initMessages = async () => {
        await this.dbClient.insert(messages).values([
            { messageId: -1, chatId: -1, fromUser: true, content: "Lorem ipsum dolor sit amet?" },
            { messageId: -2, chatId: -1, fromUser: false, content: "consectetur adipiscing elit." },
            { messageId: -3, chatId: -1, fromUser: true, content: "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?" },
            { messageId: -4, chatId: -2, fromUser: true, content: "Ut enim ad minim veniam?" },
            { messageId: -5, chatId: -2, fromUser: false, content: "quis nostrud exercitation ullamco." },
            { messageId: -6, chatId: -2, fromUser: true, content: "laboris nisi ut aliquip?" },
            { messageId: -7, chatId: -2, fromUser: false, content: "ex ea commodo consequat." }
        ]).onConflictDoNothing();
    }

    getUserByEmail = async (email: string) => {
        const result = await this.dbClient.select().
            from(users).
            where(eq(users.email, email));

        return result[0];
    }

    getUserByUserId = async (userId: number) => {
        const result = await this.dbClient.select().
            from(users).
            where(eq(users.userId, userId));

        return result[0];
    }

    addUser = async (email: string, password: string, name?: string, phone?: string) => {
        const result = await this.dbClient.insert(users).values({
            email,
            password,
            phone,
            name
        }).returning({ userId: users.userId });

        return result[0];
    }

    changeUserById = async (userId: number, name?: string, phone?: string, email?: string, password?: string) => {
        const result = await this.dbClient.
            update(users).
            set({ name, phone, email, password }).
            where(eq(users.userId, userId)).
            returning({
                name: users.name,
                phone: users.phone,
                email: users.email
            });

        return result[0];
    }

    changeNameByUserId = async (userId: number, name: string) => {
        await this.dbClient.
            update(users).
            set({ name }).
            where(eq(users.userId, userId)).
            returning({ name: users.name });
    }

    changePhoneByUserId = async (userId: number, phone: string) => {
        await this.dbClient.
            update(users).
            set({ phone }).
            where(eq(users.userId, userId)).
            returning({ phone: users.phone });
    }

    changeEmailByUserId = async (userId: number, email: string) => {
        await this.dbClient.
            update(users).
            set({ email }).
            where(eq(users.userId, userId)).
            returning({ email: users.email });
    }

    changeStripeCustomerIdByUserId = async (userId: number, stripeCustomerId: string) => {
        await this.dbClient.update(users).set({ stripeCustomerId }).where(eq(users.userId, userId));
    }

    changePasswordByUserId = async (userId: number, password: string) => {
        await this.dbClient.update(users).set({ password }).where(eq(users.userId, userId));
    }

    changeSubscriptionByUserId = async (userId: number, subscriptionId: number) => {
        await this.dbClient.update(users).set({ subscriptionId }).where(eq(users.userId, userId));
    }

    changeSubscriptionExpireDateByUserId = async (userId: number, subscriptionExpireDate: Date) => {
        await this.dbClient.update(users).set({ subscriptionExpireDate }).where(eq(users.userId, userId));
    }

    changeQuestionsCountByUserId = async (userId: number, questionsCount: number) => {
        await this.dbClient.update(users).set({ questionsCount }).where(eq(users.userId, userId));
    }

    changeHasShareBonusByUserId = async (userId: number, hasShareBonus: boolean) => {
        await this.dbClient.update(users).set({ hasShareBonus }).where(eq(users.userId, userId));
    }


    getMessagesByFamousPerson = async (famousPersonName: string, userId: number, offset?: number, limit?: number) => {
        const filteredChats = this.dbClient.select({
            chatId: chats.chatId,
            famousPersonId: chats.famousPersonId,
            famousPersonName: famousPeople.name,
            famousPersonDescription: famousPeople.description,
            userId: chats.userId
        }).
            from(chats).
            innerJoin(famousPeople, eq(famousPeople.famousPersonId, chats.famousPersonId)).
            where(and(
                eq(famousPeople.name, famousPersonName),
                eq(chats.userId, userId)
            )).as("filtered_chats");

        const resultQuery = this.dbClient.select({
            messageId: messages.messageId,
            fromUser: messages.fromUser,
            userId: filteredChats.userId,
            famousPersonId: filteredChats.famousPersonId,
            famousPersonName: filteredChats.famousPersonName,
            famousPersonDescription: filteredChats.famousPersonDescription,
            content: messages.content
        }).
            from(messages).
            innerJoin(filteredChats, eq(filteredChats.chatId, messages.chatId)).
            innerJoin(users, eq(users.userId, filteredChats.userId)).
            orderBy(desc(messages.messageId));
        // innerJoin(famousPeople, eq(famousPeople.famousPersonId, filteredChats.famousPersonId));

        const result = (offset !== undefined && limit !== undefined) ?
            await resultQuery.offset(offset).limit(limit) :
            await resultQuery;

        return result;
    }

    addMessageByFamousPersonId = async (famousPersonId: number, userId: number, fromUser: boolean, content: string) => {
        const chat = await this.getChatByFamousPersonId(famousPersonId, userId);

        let chatId = chat?.chatId;
        if (chat === undefined) {
            ({ chatId } = (await this.addChatByFamousPersonId(famousPersonId, userId))[0]);
        }
        await this.dbClient.insert(messages).values({ chatId, fromUser, content });

    }

    getChatByFamousPersonId = async (famousPersonId: number, userId: number) => {
        const chat = (await this.dbClient.select().from(chats).where(
            and(
                eq(chats.famousPersonId, famousPersonId),
                eq(chats.userId, userId)
            )))[0];
        return chat;
    }

    addChatByFamousPersonId = async (famousPersonId: number, userId: number) => {
        return await this.dbClient.insert(chats).
            values({ userId, famousPersonId }).
            onConflictDoNothing().returning({ chatId: chats.chatId });
    }

    getFamousPersonByName = async (famousPersonName: string) => {
        const result = await this.dbClient.select().from(famousPeople).where(eq(famousPeople.name, famousPersonName.toUpperCase()));
        return result[0];
    }
}

export default new UserRep();
