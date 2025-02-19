import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IMessage {
  role: "user" | "bot";
  text: string;
}

export interface IConversation extends Document {
  _username: string;
  messages: IMessage[];
  thumbnail?: string;
  created_at: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, required: true, enum: ["user", "bot"] },
  text: { type: String, required: true },
});

const ConversationSchema = new Schema<IConversation>({
  _username: { type: String, required: true },
  messages: [MessageSchema],
  thumbnail: { type: String },
  created_at: { type: Date, default: Date.now },
});


export default models.Conversation || model<IConversation>("Conversation", ConversationSchema);
