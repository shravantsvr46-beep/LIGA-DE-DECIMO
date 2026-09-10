'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 space-y-4 text-white">
      <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400 font-bold text-lg font-mono">
        !
      </div>
      <h2 className="text-xl font-bold text-white font-mono uppercase tracking-tight">Unable to Load Page</h2>
      <p className="text-sm text-neutral-400 font-mono max-w-md">
        {error?.message || 'An unexpected error occurred while rendering this page.'}
      </p>
      <div className="flex items-center gap-3 pt-4">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-white text-black text-xs font-mono uppercase tracking-widest font-semibold rounded hover:bg-neutral-200 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-widest rounded bg-neutral-950 transition-colors"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}
