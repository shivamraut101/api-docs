import { Schema, model, models } from "mongoose";

const DocumentSchema = new Schema(
  {
    metadata: {
      id: { type: String, required: true, index: true },
      title: { type: String, required: true },
      description: { type: String },
      slug: { type: String, required: true },
      category: { type: String, required: true },
      status: {
        type: String,
        enum: ["draft", "in_review", "published", "deprecated"],
        default: "draft",
      },
      apiStatus: {
        type: String,
        enum: ["stable", "beta", "deprecated"],
        default: "stable",
      },
      version: { type: String, default: "v1" },
      order: { type: Number, default: 999 },
      createdAt: { type: String, required: true },
      updatedAt: { type: String, required: true },
      createdBy: { type: String, required: true },
      lastEditedBy: { type: String, required: true },
      isDefault: { type: Boolean, default: false },
    },
    generatedMdx: { type: String }, // Stores the compiled MDX for faster reading
    blocks: { type: Schema.Types.Mixed, default: [] },
  },
  {
    timestamps: false, // We use our own ISO strings for consistency
    minimize: false, // Ensure empty objects/arrays are preserved
  }
);

// Optimize for common queries
DocumentSchema.index({ "metadata.category": 1, "metadata.slug": 1 }, { unique: true });
DocumentSchema.index({ "metadata.status": 1, "metadata.createdBy": 1 });
DocumentSchema.index({ "metadata.category": 1, "metadata.order": 1 });

const Document = models.Document || model("Document", DocumentSchema);

export default Document;
