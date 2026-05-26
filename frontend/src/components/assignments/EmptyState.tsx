import Link from 'next/link';

export const EmptyState = (): JSX.Element => {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-[#E5E5E5] bg-white px-6 py-14 text-center shadow-soft">
      <svg viewBox="0 0 180 180" className="mb-8 h-28 w-28" aria-hidden="true">
        <defs>
          <linearGradient id="veda-search-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C0350A" />
            <stop offset="100%" stopColor="#FF7950" />
          </linearGradient>
        </defs>
        <circle cx="72" cy="72" r="44" fill="#F8F4EE" stroke="#C0350A" strokeWidth="6" />
        <circle cx="72" cy="72" r="24" fill="none" stroke="#5E6268" strokeDasharray="4 8" strokeWidth="3" />
        <line x1="103" y1="103" x2="145" y2="145" stroke="url(#veda-search-gradient)" strokeLinecap="round" strokeWidth="12" />
        <line x1="138" y1="48" x2="152" y2="34" stroke="#C0350A" strokeLinecap="round" strokeWidth="8" />
        <line x1="152" y1="48" x2="138" y2="34" stroke="#C0350A" strokeLinecap="round" strokeWidth="8" />
      </svg>
      <h2 className="text-2xl font-semibold text-veda-dark">No assignments yet</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-veda-label">
        Create your first assignment to start collecting and grading student submissions...
      </p>
      <Link
        href="/assignments/create"
        className="mt-8 inline-flex items-center rounded-full bg-veda-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-[linear-gradient(135deg,#C0350A_0%,#FF7950_100%)]"
      >
        + Create Your First Assignment
      </Link>
    </div>
  );
};
