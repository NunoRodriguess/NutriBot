import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { IConversation } from "../../../models/Conversation";

// Typing for mock purposes — avoids full Mongoose Document methods
type MockConversation = Omit<IConversation, keyof mongoose.Document> & {
  _id: mongoose.Types.ObjectId; // Add _id to the type
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const mockConversations: MockConversation[] = [
    {
      _id: new mongoose.Types.ObjectId(), // Generate a MongoDB-like ID
      _username: username,
      messages: [
        { role: "user", text: "Hello" },
        { role: "bot", text: "Hi! How can I help?" },
      ],
      thumbnail: "Test thumbnail",
      created_at: new Date(),
    },
    {
      _id: new mongoose.Types.ObjectId(), // Generate a MongoDB-like ID
      _username: username,
      messages: [
        { role: "user", text: "Tell me a joke" },
        { role: "bot", text: "Why don't skeletons fight each other? Because they don't have the guts!" },
      ],
      thumbnail: "Joke time",
      created_at: new Date(),
    },
  ];

  return NextResponse.json(mockConversations, { status: 200 });
}