const { randomUUID } = require("crypto");
const { Schema, model } = require("mongoose");

const VideoSchema = new Schema(
    {
      id: {
        type: String,
        immutable: true,
        // Random Unique Identifier
        default: () => randomUUID(),
      },
      title: { type: String, required: true },
      description: { type: String, required: true },
      genre: { type: String, required: true },
      likes: { type: Integer, default: 0 },
      available: { type: Boolean, default: true },
    },
    {
      toJSON: {
        transform(doc, ret) {
          delete ret._id;   // Oculta _id
          delete ret.__v;   // Oculta __v
        },
      },
    }
  );
  
  const Video = model("Video", VideoSchema);
  
  module.exports = Video;