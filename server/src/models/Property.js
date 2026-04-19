import mongoose from "mongoose";

const mediaFileSchema = new mongoose.Schema(
  {
    fileId: { type: String, required: true },
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    webViewLink: { type: String, default: "" },
    directUrl: { type: String, default: "" },
    thumbnailLink: { type: String, default: "" },
    sizeBytes: { type: Number, default: 0 },
    createdTime: { type: Date },
    modifiedTime: { type: Date },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    price: { type: Number, default: 0 },
    driveFolderUrl: { type: String, required: true },
    mediaFiles: { type: [mediaFileSchema], default: [] },
    generatedReadme: { type: String, default: "" },
    importedAt: { type: Date },
  },
  { timestamps: true }
);

export const Property = mongoose.model("Property", propertySchema);
