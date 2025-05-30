import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const payload = await req.json();
  const headerPayload = await headers();

  const svix_id = headerPayload.get("svix-id")!;
  const svix_timestamp = headerPayload.get("svix-timestamp")!;
  const svix_signature = headerPayload.get("svix-signature")!;
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
  const gatewayUrl = process.env.GATEWAY_URL || "http://localhost:4000";

  const wh = new Webhook(webhookSecret);

  let evt: any;

  try {
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const user = evt.data;

    const username = user.username || user.id;
    const email = user.email_addresses?.[0]?.email_address;

    if (!email) {
      console.warn("No email found for new user");
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Send the user data to your profile service
    console.log(`${gatewayUrl}/profile`)
    try {
      await fetch(`${gatewayUrl}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
        }),
      });
      console.log("User profile sent to gateway:", { username, email });
    } catch (error) {
      console.error("Failed to send user profile to gateway:", error);
      return NextResponse.json({ error: "Gateway request failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
