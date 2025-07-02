import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const { departmentId, from, to } = await req.json();

  const previous = await prisma.scheduleEntry.findMany({
    where: { departmentId, weekStart: new Date(from) },
  });

  for (const entry of previous) {
    await prisma.scheduleEntry.upsert({
      where: {
        teamMemberId_dayOfWeek_weekStart: {
          teamMemberId: entry.teamMemberId,
          dayOfWeek: entry.dayOfWeek,
          weekStart: new Date(to),
        },
      },
      update: {
        startMinutes: entry.startMinutes,
        endMinutes: entry.endMinutes,
      },
      create: {
        teamMemberId: entry.teamMemberId,
        departmentId,
        dayOfWeek: entry.dayOfWeek,
        weekStart: new Date(to),
        startMinutes: entry.startMinutes,
        endMinutes: entry.endMinutes,
      },
    });
  }

  return new NextResponse('Copied', { status: 200 });
}
