import "dotenv/config";
import "utils/checks";
import express from "express";
import cors from "cors";
import userRouter from "./routers/UserRouter";
import stripeRouter from "routers/StripeRouter";
import initialRep from "./database/repositories"
import errorHandlers from "middlewares/ErrorHandlers";
import UserService from "services/UserService";


const app = express();

const allowedOrigins = ["http://localhost:80", "https://eternal-ai-fullstack.vercel.app", "http://localhost:3000"]
const corsOptions: cors.CorsOptions = {
    origin: allowedOrigins
}
app.use(cors(corsOptions));

app.use(stripeRouter);
app.use(express.json());
app.use(userRouter);

app.use(errorHandlers.errorLogger);
app.use(errorHandlers.errorResponder);

const port = Number(process.env.PORT) || 80;

app.get("/", async ({ req, res }: { req: express.Request, res: express.Response }) => {
    console.log(req);
    res.status(200).send("healthy");
})

app.listen(port, "0.0.0.0", async () => {
    await initialRep.init();
    await UserService.init();
    console.log(`app is listening on port: ${port}.`);
})
