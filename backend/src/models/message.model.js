import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "model"],
      default: "user",
      required: true,
    },
    editCount: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

// HIGH-PERFORMANCE INDEXING:
messageSchema.index({ chat: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;