import { NextRequest, NextResponse } from "next/server";
import { IConversation,IMessage } from "../../../models/model";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const mockConversations: IConversation[] = [
    {
      _id: "1",
      messages: [
        { role: "user", text: "Hello" },
        { role: "bot", text: "Hi! How can I help?" },
      ],
      thumbnail: "Test thumbnail",
      created_at: new Date(),
    },
    {
      _id: "2",
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // 🧪 Mock new conversation
    const newConversation: IConversation = {
      _id: '3',
      messages: [],
      created_at: new Date(),
      thumbnail: "undefined",
    };

    // 🔧 TODO: Save conversation to DB associated with `username`
    console.log(`Creating new conversation for user: ${username}`);
    
    return NextResponse.json({ conversation: newConversation }, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}