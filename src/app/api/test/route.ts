import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    
    console.log("Received username:", username); // Logs in the server

    return NextResponse.json({ message: `Username received: ${username}` });
  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
