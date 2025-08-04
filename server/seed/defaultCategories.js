import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/Category.js";

dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);

const defaults = [
  { name: "Food", type: "expense" },
  { name: "Transport", type: "expense" },
  { name: "Entertainment", type: "expense" },
  { name: "Rent", type: "expense" },
  { name: "Salary", type: "income" },
  { name: "Freelance", type: "income" },
];

for (const item of defaults) {
  const exists = await Category.findOne({ name: item.name, isDefault: true });
  if (!exists) await Category.create({ ...item, isDefault: true });
}

console.log("✅  Default categories seeded");
process.exit(0);
