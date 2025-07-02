/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { href: '/schedule',    label: 'Schedule' },  // ← renamed
  { href: '/team',        label: 'Team' },
  { href: '/departments', label: 'Departments' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        <span className="font-bold">Work Scheduler</span>

        <ul className="flex gap-4">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  'rounded px-3 py-1 hover:bg-gray-100',
                  pathname.startsWith(href) && 'bg-blue-600 text-white hover:bg-blue-600',
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
