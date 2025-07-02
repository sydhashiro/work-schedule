interface Totals {
    scheduled: number;
    allowed: number;
  }
  
  export function HoursSidebar({ scheduled, allowed }: Totals) {
    const color = scheduled > allowed ? 'text-red-600' : 'text-green-600';
  
    return (
      <aside className="w-56 shrink-0 rounded border p-4 text-sm">
        <p>Total allowed: {allowed} h</p>
        <p className={color}>Scheduled: {scheduled} h</p>
      </aside>
    );
  }
  