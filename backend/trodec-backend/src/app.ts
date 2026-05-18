import express from "express";
import cors from "cors";
import helmet from "helmet";
import "@/types"; // Load Express type augmentation (req.user, req.profile)
import { corsOptions } from "./config";
import { errorHandler } from "./middleware";
// import {
//   healthRouter,
//   authRouter,
//   userRouter,
//   communityRouter,
// } from "./routes";
import router from "./routes";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hostinger health check probe
app.get("/", (_req, res) => res.status(200).send("OK"));

// Routes
app.use("/api", router);
// app.use("/api/health", healthRouter);
// app.use("/api/auth", authRouter);
// app.use("/api/users", userRouter);
// app.use("/api/communities", communityRouter);

// Error handling middleware
app.use(errorHandler);

export default app;
