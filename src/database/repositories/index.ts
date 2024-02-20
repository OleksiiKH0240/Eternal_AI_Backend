import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "../databaseConnection";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import userRep from "./UserRep";


class InitialRep {
    dbClient: NodePgDatabase

    constructor(dbClient = db) {
        this.dbClient = dbClient;
    }

    init = async () => {
        await this.migrate();
        await userRep.init();
    }

    migrate = async () => {
        await migrate(this.dbClient, {
            migrationsFolder: "./drizzle"
        });
    }
}

export default new InitialRep();
