'use client';

interface PaperErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PaperError({ error, reset }: PaperErrorProps): JSX.Element {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-[#E5E5E5] bg-white p-8 text-center shadow-soft">
      <p className="text-lg font-semibold text-veda-dark">Unable to load paper</p>
      <p className="mt-2 text-sm text-veda-label">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-veda-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-[linear-gradient(135deg,#C0350A_0%,#FF7950_100%)]"
      >
        Retry
      </button>
    </div>
  );
}
