import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    /*  ⬇ userId now OPTIONAL.
        A document with userId === null and isDefault === true
        is treated as a “global” category visible to everyone. */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    name: { type: String, required: true },
    type: { type: String, enum: ["income", "expense"], default: "expense" },

    isDefault: { type: Boolean, default: false }, // ← NEW FLAG
  },
  { timestamps: true }
);

export default mongoose.model("Category", CategorySchema);
