import { Schema, model, models } from "mongoose";

const CategorySchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    order: { type: Number, default: 0 },
    createdAt: { type: String, required: true },
    createdBy: { type: String },
  },
  { timestamps: false }
);

const Category = models.Category || model("Category", CategorySchema);

export default Category;
