import { NextRequest, NextResponse } from 'next/server';
import { IUserInfo } from '~/models/model';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, profile } = body as { username: string; profile: IUserInfo };

    if (!username || !profile) {
      return NextResponse.json({ error: 'Missing username or profile' }, { status: 400 });
    }

    // TODO: Add logic here to validate and update the user profile to the api
    console.log('Received profile update for:', username);
    console.log(profile);

    return NextResponse.json({ message: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    const mockProfile: IUserInfo = {
      age: 24,
      height: 1.8,
      physical_activity: 'daily',
      avg_sleep_hours: 8,
      avg_working_hours: 6,
      body_fat: 15,
      smoking: 'never',
      alcohol_consumption: 'occasionally',
      diseases: ['Hypertension'],
      medication: ['Lisinopril'],
      allergies: ['Peanuts'],
      diet: ['High protein'],
    };
  
    return NextResponse.json({ profile: mockProfile }, { status: 200 });
  }