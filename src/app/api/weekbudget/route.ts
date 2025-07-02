import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get('departmentId');
  const weekStart = searchParams.get('weekStart');

  if (!departmentId || !weekStart)
    return new NextResponse('Missing params', { status: 400 });

  const record = await prisma.weekBudget.findUnique({
    where: {
      departmentId_weekStart: {
        departmentId,
        weekStart: new Date(weekStart),
      },
    },
  });

  return NextResponse.json(record);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json();

  const saved = await prisma.weekBudget.upsert({
    where: {
      departmentId_weekStart: {
        departmentId: body.departmentId,
        weekStart: new Date(body.weekStart),
      },
    },
    update: { allowedHours: body.allowedHours },
    create: {
      departmentId: body.departmentId,
      weekStart: new Date(body.weekStart),
      allowedHours: body.allowedHours,
    },
  });

  return NextResponse.json(saved);
}
