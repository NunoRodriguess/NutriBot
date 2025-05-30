import { NextRequest, NextResponse } from 'next/server';
import { IUserInfo } from '~/models/model';

const GATEWAY_URL = process.env.GATEWAY_URL;

export async function PUT(req: NextRequest) {
  try {

    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    
    // Get profile from request body
    const body = await req.json();
    const { profile } = body as { profile: IUserInfo };

    if (!username) {
      return NextResponse.json({ error: 'Missing username in query parameters' }, { status: 400 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Missing profile data' }, { status: 400 });
    }

    const response = await fetch(`${GATEWAY_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        ...profile,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: response.status });
    }

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }

    const response = await fetch(`${GATEWAY_URL}/profile/${username}`);

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ profile: data }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}