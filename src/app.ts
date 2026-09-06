import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import router from "./routes";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import rateLimiter from "./middlewares/rateLimiter";

const app: Application = express();

app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

app.get("/", (req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: "College Organization Management System API is running",
	});
});

app.use("/api/v1", router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
