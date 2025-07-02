'use client';

import { useEffect, useState } from 'react';

interface Department {
  id: string;
  name: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState('');

  const fetchDepartments = async () => {
    const res = await fetch('/api/departments');
    const data = await res.json();
    setDepartments(data);
  };

  const handleAdd = async () => {
    if (!name) return;

    await fetch('/api/departments', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });

    setName('');
    fetchDepartments();
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-xl font-bold">Departments</h1>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="New department name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Department
        </button>
      </div>

      <table className="min-w-full text-sm border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Name</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((d) => (
            <tr key={d.id}>
              <td className="border px-2 py-1">{d.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
