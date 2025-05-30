import { NextRequest, NextResponse } from "next/server"
import { IConversation, IMessage } from "~/models/model"
const GATEWAY_URL = process.env.GATEWAY_URL

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get("username")
    const conversationId = searchParams.get("conversationId")

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

   
    if (conversationId) {
      const gatewayRes = await fetch(`${GATEWAY_URL}/chat/${username}/${conversationId}`)

      if (!gatewayRes.ok) {
        const errorText = await gatewayRes.text()
        console.error("Gateway error:", errorText)
        return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 502 })
      }

      const data = await gatewayRes.json()
      const conRet: IConversation = ({
      _id: data.id,
      thumbnail: data.thumbnail ?? "New Conversation",
      created_at: new Date(data.created_at),
      messages: Array.isArray(data.messages)
        ? data.messages.map((msg: { role: any; text: any }): IMessage => ({
            role: msg.role,
            text: msg.text,
          }))
        : [],
    })

      return NextResponse.json({ conversation: conRet}, { status: 200 })
    }
    const res = await fetch(`${GATEWAY_URL}/chat/${username}`)
    if (!res.ok) {
      throw new Error(`Gateway response failed: ${res.status}`)
    }

    const apiConversationsRes = await res.json()
    const apiConversations = apiConversationsRes.conversations

    const conversations: IConversation[] = Array.isArray(apiConversations)
      ? apiConversations.map((conv) => ({
          _id: conv.id,
          thumbnail: conv.thumbnail ?? "New Conversation",
          created_at: new Date(conv.created_at),
          messages: Array.isArray(conv.messages)
            ? conv.messages.map((msg: { role: any; text: any }): IMessage => ({
                role: msg.role,
                text: msg.text,
              }))
            : [],
        }))
      : []

    return NextResponse.json(conversations, { status: 200 })
  } catch (error) {
    console.error("Error fetching conversation(s):", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const gatewayResponse = await fetch(`${GATEWAY_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!gatewayResponse.ok) {
      const errorText = await gatewayResponse.text();
      console.error("Gateway error:", errorText);
      return NextResponse.json({ error: "Failed to create conversation at gateway." }, { status: gatewayResponse.status });
    }

    const gatewayData = await gatewayResponse.json();
    return NextResponse.json(gatewayData.conversation , { status: 201 });

  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversationId, username, message } = body

    if (!conversationId || !username || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const gatewayRes = await fetch(`${GATEWAY_URL}/chat/${username}/${conversationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: message.role,
        message: message.text,
      }),
    })

    if (!gatewayRes.ok) {
      const errorText = await gatewayRes.text()
      console.error("Gateway error:", errorText)
      return NextResponse.json({ error: "Gateway error" }, { status: 502 })
    }
    return NextResponse.json({ status: 200 })
  } catch (error) {
    console.error("Error in PUT /api/conversations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}