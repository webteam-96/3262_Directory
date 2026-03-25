import { NextResponse } from 'next/server';
import { fetchClubFromDirectory } from '@/lib/api';

export async function GET(_req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  try {
    const data = await fetchClubFromDirectory(groupId);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
