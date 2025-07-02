'use client';

import { useEffect, useState } from 'react';

interface TeamMember {
  id: string;
  displayName: string;
  desiredHours: number;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [name, setName] = useState('');
  const [hours, setHours] = useState(20);

  const fetchMembers = async () => {
    const res = await fetch('/api/team');
    const data = await res.json();
    setMembers(data);
  };

  const handleAdd = async () => {
    if (!name) return;

    await fetch('/api/team', {
      method: 'POST',
      body: JSON.stringify({ displayName: name, desiredHours: hours }),
    });

    setName('');
    setHours(20);
    fetchMembers();
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-xl font-bold">Team Members</h1>

      <div className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Team member name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className="border p-2 rounded w-24 ml-4"
          min={0}
        />
        <button
          onClick={handleAdd}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Member
        </button>
      </div>

      <table className="min-w-full text-sm border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Desired Hours</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td className="border px-2 py-1">{m.displayName}</td>
              <td className="border px-2 py-1 text-center">{m.desiredHours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
