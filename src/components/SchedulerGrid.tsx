'use client';

import { useState } from 'react';
import { Slider } from 'antd';
import dayjs from 'dayjs';

interface ShiftEntry {
  start: number;
  end: number;
}

export interface RowData {
  id: string;
  name: string;
  desired: number;
  entries: ShiftEntry[]; // length === 7 (Sun–Sat)
}

interface Props {
  data: RowData[];
  weekStart: string; // ISO date string (Monday)
}

/* ---------- Helper ---------- */
const formatMinutes = (minutes?: number): string => {
  if (typeof minutes !== 'number') return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
};

export function SchedulerGrid({ data, weekStart }: Props) {
  const [gridData, setGridData] = useState<RowData[]>(data);

  async function handleChange(
    memberId: string,
    dayIdx: number,
    start: number,
    end: number,
  ) {
    // Update UI first
    setGridData((old) =>
      old.map((row) =>
        row.id === memberId
          ? {
              ...row,
              entries: row.entries.map((e, i) =>
                i === dayIdx ? { start, end } : e,
              ),
            }
          : row,
      ),
    );

    // Persist to backend
    await fetch('/api/schedule', {
      method: 'POST',
      body: JSON.stringify({
        teamMemberId: memberId,
        dayOfWeek: dayIdx,
        startMinutes: start,
        endMinutes: end,
        departmentId: 'replace-with-real-dept', // TODO: supply actual dept
        weekStart,
      }),
    });
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1">Team Member</th>
            <th className="border px-2 py-1">Desired</th>
            {days.map((d) => (
              <th key={d} className="border px-2 py-1">
                {d}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {gridData.map((row) => (
            <tr key={row.id}>
              <td className="border px-2 py-1">{row.name}</td>
              <td className="border px-2 py-1 text-center">{row.desired}</td>

              {row.entries.map((entry, idx) => (
                <td key={idx} className="border px-1 py-1 w-48">
                  <Slider
                    range
                    min={0}
                    max={1440}
                    step={15}
                    value={[entry.start, entry.end]}
                    tooltip={{ formatter: formatMinutes }}
                    onChange={([s, e]) =>
                      handleChange(row.id, idx, s as number, e as number)
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
