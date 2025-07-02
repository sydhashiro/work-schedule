import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const members = await prisma.teamMember.findMany();
  return NextResponse.json(members);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json();

  const created = await prisma.teamMember.create({
    data: {
      displayName: body.displayName,
      desiredHours: body.desiredHours,
    },
  });

  return NextResponse.json(created);
}
