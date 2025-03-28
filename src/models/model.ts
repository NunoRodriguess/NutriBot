import mongoose, { Document, Schema, model, models } from 'mongoose';

//----------------------------------

export interface IMessage {
    role: "user" | "bot";
    text: string;
}

export interface IConversation {
    messages: IMessage[];
    thumbnail?: string;
    created_at: Date; 
}

export interface IUser extends Document {
    _username: string;
    conversations: IConversation[];
    user_info?: any;
}

//----------------------------------

const MessageSchema = new Schema<IMessage>({
    role: { type: String, required: true, enum: ["user", "bot"] },
    text: { type: String, required: true },
});

const ConversationSchema = new Schema<IConversation>({
    messages: [MessageSchema],
    thumbnail: { type: String },
    created_at: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>({
    _username: { type: String, required: true, unique: true },
    conversations: [ConversationSchema],
    user_info: { type: Schema.Types.Mixed },
});

const User = models.User || model<IUser>('User', UserSchema);

export default User;

