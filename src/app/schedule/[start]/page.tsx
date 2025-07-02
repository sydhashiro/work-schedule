/* eslint-disable react/jsx-no-bind */

'use client';

import dayjs from 'dayjs';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { SchedulerGrid } from '@/components/SchedulerGrid';
import { HoursSidebar } from '@/components/HoursSidebar';

/* ---------- Minimal local types ---------- */
interface Department {
  id: string;
  name: string;
}
interface ScheduleEntry {
  id: string;
  departmentId: string;
  teamMemberId: string;
  dayOfWeek: number;
  startMinutes: number;
  endMinutes: number;
  weekStart: Date;
  TeamMember: { displayName: string; desiredHours: number };
}

interface PageProps {
  params: { start: string };
  searchParams: Record<string, string | string[]>;
}

export default async function Schedule4WeekPage({ params, searchParams }: PageProps) {
  /* ---------- Auth ---------- */
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  /* ---------- Date helpers ---------- */
  const firstMonday = dayjs(params.start).startOf('week').add(1, 'day');
  const weekStarts = Array.from({ length: 4 }, (_, i) =>
    firstMonday.add(i, 'week').toDate(),
  );

  /* ---------- Departments ---------- */
  const departments: Department[] = await prisma.department.findMany();
  if (departments.length === 0) notFound();

  const activeDeptId =
    (Array.isArray(searchParams.dept) ? searchParams.dept[0] : searchParams.dept) ??
    departments[0].id;
  const activeDept = departments.find((d) => d.id === activeDeptId)!;

  /* ---------- Shifts ---------- */
  const shifts: ScheduleEntry[] = await prisma.scheduleEntry.findMany({
    where: { departmentId: activeDeptId, weekStart: { in: weekStarts } },
    include: { TeamMember: true },
  });

  const weeks = weekStarts.map((ws) => {
    const byMember: Record<
      string,
      {
        id: string;
        name: string;
        desired: number;
        entries: { start: number; end: number }[];
      }
    > = {};

    shifts
      .filter((s) => +s.weekStart === +ws)
      .forEach((s) => {
        if (!byMember[s.teamMemberId]) {
          byMember[s.teamMemberId] = {
            id: s.teamMemberId,
            name: s.TeamMember.displayName,
            desired: s.TeamMember.desiredHours,
            entries: Array.from({ length: 7 }, () => ({ start: 0, end: 0 })),
          };
        }
        byMember[s.teamMemberId].entries[s.dayOfWeek] = {
          start: s.startMinutes,
          end: s.endMinutes,
        };
      });

    return { weekStart: ws, rows: Object.values(byMember) };
  });

  const scheduledHours = shifts.reduce(
    (acc, s) => acc + (s.endMinutes - s.startMinutes) / 60,
    0,
  );

  const budget = await prisma.weekBudget.findUnique({
    where: {
      departmentId_weekStart: {
        departmentId: activeDeptId,
        weekStart: weekStarts[0],
      },
    },
  });
  const allowedHours = budget?.allowedHours ?? 0;

  /* ---------- Render ---------- */
  return (
    <main className="space-y-8 p-6">
      <WeekNav firstMonday={firstMonday} />

      <DepartmentPicker
        departments={departments}
        activeId={activeDept.id}
        start={params.start}
        search={searchParams}
      />

      <CopyPrevWeekButton deptId={activeDept.id} firstMonday={firstMonday} />

      {weeks.map((w, idx) => (
        <section key={w.weekStart.toISOString()} className="flex gap-4">
          <div className="flex-1">
            <h2 className="mb-2 font-semibold">
              {dayjs(w.weekStart).format('MMM D')} –{' '}
              {dayjs(w.weekStart).add(6, 'day').format('MMM D')}
            </h2>
            <SchedulerGrid data={w.rows} weekStart={w.weekStart.toISOString()} />
          </div>

          {idx === 0 && (
            <div>
              <HoursSidebar scheduled={scheduledHours} allowed={allowedHours} />
              <BudgetForm
                deptId={activeDept.id}
                weekStart={weekStarts[0]}
                allowedHours={allowedHours}
              />
            </div>
          )}
        </section>
      ))}
    </main>
  );
}

/* ---------- Helper Components (unchanged) ---------- */

function WeekNav({ firstMonday }: { firstMonday: dayjs.Dayjs }) {
  const prev = firstMonday.subtract(4, 'week').format('YYYY-MM-DD');
  const next = firstMonday.add(4, 'week').format('YYYY-MM-DD');

  return (
    <div className="mb-4 flex items-center gap-4">
      <a href={`/schedule/${prev}`} className="rounded border px-3 py-1 hover:bg-gray-50">
        ‹ Prev 4 wks
      </a>
      <span className="flex-1 text-center font-medium">
        {firstMonday.format('MMM D, YYYY')} –{' '}
        {firstMonday.add(27, 'day').format('MMM D, YYYY')}
      </span>
      <a href={`/schedule/${next}`} className="rounded border px-3 py-1 hover:bg-gray-50">
        Next 4 wks ›
      </a>
    </div>
  );
}

function DepartmentPicker({
  departments,
  activeId,
  start,
  search,
}: {
  departments: Department[];
  activeId: string;
  start: string;
  search: Record<string, string | string[]>;
}) {
  return (
    <form>
      <label className="mr-2 font-medium">Department:</label>
      <select
        defaultValue={activeId}
        className="rounded border px-2 py-1"
        onChange={(e) => {
          const next = new URLSearchParams(search as Record<string, string>);
          next.set('dept', e.target.value);
          window.location.href = `/schedule/${start}?${next.toString()}`;
        }}
      >
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
    </form>
  );
}

function BudgetForm({
  deptId,
  weekStart,
  allowedHours,
}: {
  deptId: string;
  weekStart: Date;
  allowedHours: number;
}) {
  return (
    <form
      className="mt-4 text-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        const allowed = (e.currentTarget.allowedHours as HTMLInputElement).value;
        await fetch('/api/weekbudget', {
          method: 'POST',
          body: JSON.stringify({
            departmentId: deptId,
            weekStart: weekStart.toISOString(),
            allowedHours: Number(allowed),
          }),
        });
        window.location.reload();
      }}
    >
      <label className="mr-2">Set hours allowed:</label>
      <input
        name="allowedHours"
        type="number"
        min={0}
        defaultValue={allowedHours}
        className="w-20 rounded border p-1"
      />
      <button type="submit" className="ml-2 rounded bg-green-600 px-2 py-1 text-white">
        Save
      </button>
    </form>
  );
}

function CopyPrevWeekButton({
  deptId,
  firstMonday,
}: {
  deptId: string;
  firstMonday: dayjs.Dayjs;
}) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await fetch('/api/schedule/copy', {
          method: 'POST',
          body: JSON.stringify({
            departmentId: deptId,
            from: firstMonday.subtract(1, 'week').toISOString(),
            to: firstMonday.toISOString(),
          }),
        });
        window.location.reload();
      }}
    >
      <button className="mb-4 text-sm text-blue-700 underline hover:text-blue-900">
        Copy shifts from previous week
      </button>
    </form>
  );
}
