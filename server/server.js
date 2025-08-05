import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mainRoutes from "./routes/index.js";
import connectDB from "./config/database.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

/* ----------------------  CORS CONFIG ---------------------- */

const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "https://your-frontend.app", // production URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: ${origin} is not allowed`), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // allow cookies / Authorization headers
  })
);

/* ---------------------------------------------------------- */

app.use(express.json());

// Health check
app.get("/", (_, res) =>
  res.json({ message: "Personal Finance API is running!" })
);

// API routes
app.use("/api", mainRoutes);

// Global error handler for CORS rejections (optional)
app.use((err, _req, res, next) => {
  if (err.message?.startsWith("CORS:")) {
    return res.status(403).json({ error: err.message });
  }
  next(err);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
