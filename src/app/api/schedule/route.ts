import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const weekStart = searchParams.get('week');
  if (!weekStart) {
    return new NextResponse('Missing weekStart param', { status: 400 });
  }

  const shifts = await prisma.scheduleEntry.findMany({
    where: { weekStart: new Date(weekStart) },
    include: { TeamMember: true, Department: true },
  });

  return NextResponse.json(shifts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json();

  await prisma.scheduleEntry.upsert({
    where: {
      teamMemberId_dayOfWeek_weekStart: {
        teamMemberId: body.teamMemberId,
        dayOfWeek: body.dayOfWeek,
        weekStart: new Date(body.weekStart),
      },
    },
    update: {
      startMinutes: body.startMinutes,
      endMinutes: body.endMinutes,
      departmentId: body.departmentId,
    },
    create: {
      teamMemberId: body.teamMemberId,
      dayOfWeek: body.dayOfWeek,
      weekStart: new Date(body.weekStart),
      startMinutes: body.startMinutes,
      endMinutes: body.endMinutes,
      departmentId: body.departmentId,
    },
  });

  return new NextResponse('Saved', { status: 200 });
}
