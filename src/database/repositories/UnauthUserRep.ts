import { db } from "database/databaseConnection";
import unauthUsers from "database/schemas/unauthUsers";
import { and, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";


class UnauthUserRep {
    dbClient: NodePgDatabase
    constructor(dbClient = db) {
        this.dbClient = dbClient;
    }

    getUser = async (ipV4: string, userAgent: string) => {
        const user = (await this.dbClient.select().
            from(unauthUsers).
            where(
                and(
                    eq(unauthUsers.ipV4, ipV4),
                    eq(unauthUsers.userAgent, userAgent)
                )
            ))[0];

        return user;
    }

    addUser = async (ipV4: string, userAgent: string) => {
        const user = (await this.dbClient.insert(unauthUsers).
            values({ ipV4, userAgent }).
            returning().
            onConflictDoNothing())[0];

        return user;
    }

    changeQuestionsCount = async (ipV4: string, userAgent: string, questionsCount: number) => {
        await this.dbClient.update(unauthUsers).
            set({ questionsCount: questionsCount }).
            where(
                and(
                    eq(unauthUsers.ipV4, ipV4),
                    eq(unauthUsers.userAgent, userAgent)
                )
            );
    }
}

export default new UnauthUserRep();
