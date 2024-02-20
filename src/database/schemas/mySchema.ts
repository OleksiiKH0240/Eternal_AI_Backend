import { PgSchema } from "drizzle-orm/pg-core";
import { PG_DATABASE } from "../databaseConnection";


const mySchema = new PgSchema(PG_DATABASE!);
export default mySchema;
