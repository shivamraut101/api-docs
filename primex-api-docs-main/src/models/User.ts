import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "viewer"], default: "viewer" },
    name: { type: String },
    companyName: { type: String },
    phoneNumber: { type: String },
    country: { type: String },
    website: { type: String },
    affiliateId: { type: String },
    status: { type: String, enum: ["active", "pending", "suspended"], default: "active" },

    // Auth Flow Control
    isTemporaryPassword: { type: Boolean, default: false },

    // Password Reset
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  {
    timestamps: true,
  }
);

const User = models.User || model("User", UserSchema);

export default User;
