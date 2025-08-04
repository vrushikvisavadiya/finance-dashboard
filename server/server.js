import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mainRoutes from "./routes/index.js";
import connectDB from "./config/database.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Personal Finance API is running!" });
});

app.use("/api", mainRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
