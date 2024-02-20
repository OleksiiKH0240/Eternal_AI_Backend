import "dotenv/config";
import express from "express";
import cors from "cors";
import userRouter from "./routers/UserRouter";
import initialRep from "./database/repositories"
import errorHandlers from "middlewares/ErrorHandlers";


// TODO: write checks for env variables.
// TODO: write validations.
const app = express();

app.use(express.json());
app.use(cors());

app.use(userRouter);

app.use(errorHandlers.errorLogger);
app.use(errorHandlers.errorResponder);

const appPort = Number(process.env.APP_PORT) || 80;

app.listen({ port: appPort }, async () => {
    await initialRep.init();
    console.log(`app is listening on port: ${appPort}.`);
})
