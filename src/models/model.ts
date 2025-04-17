import mongoose, { Document, Schema, model, models } from 'mongoose';

//----------------------------------

export const categorieEnumValues = [
    "never",         
    "rarely",         // (1 time a month or less)
    "occasionally",   // (2-4 times a month)
    "often",          // (2-3 times a week)
    "daily",
] as const;

export type Categorie = typeof categorieEnumValues[number];


export interface IMessage {
    role: "user" | "bot";
    text: string;
}

export interface IConversation {
    _id: string; // ObjectId
    messages: IMessage[];
    thumbnail?: string;
    created_at: Date; 
}

export interface IUserInfo {
    age?: number;
    weight?: number;
    height?: number;
    imc?: number;
    sex?: string;
    body_fat?: number; //%
    avg_working_hours?: number;
    avg_sleep_hours?: number;
    physical_activity?: Categorie;
    smoking?: Categorie;
    alcohol_consumption?: Categorie;
    diseases?: string[];
    medication?: string[];
    allergies?: string[];
    diet?: string[];
    other?: string;
}

export interface IUser extends Document {
    _username: string;
    conversations: IConversation[];
    user_info: IUserInfo;
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


const UserInfoSchema = new Schema<IUserInfo>({
    age: { type: Number },
    weight: { type: Number },
    height: { type: Number },
    imc: { type: Number },
    sex: { type: String },
    body_fat: { type: Number },
    avg_working_hours: { type: Number },
    avg_sleep_hours: { type: Number },
    physical_activity: {
        type: String,
        enum: categorieEnumValues,
    },
    smoking: {
        type: String,
        enum: categorieEnumValues,
    },
    alcohol_consumption: {
        type: String,
        enum: categorieEnumValues,
    },
    diseases: [String],
    medication: [String],
    allergies: [String],
    diet: [String],
    other: { type: String },
});

const UserSchema = new Schema<IUser>({
    _username: { type: String, required: true, unique: true },
    conversations: [ConversationSchema],
    user_info: UserInfoSchema,
});


