import express from "express";
import dotenv from "dotenv";

dotenv.config();

import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import connectDB from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);

connectDB();

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));