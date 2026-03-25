import { fetchCommitteeDetails } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await fetchCommitteeDetails(id);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
