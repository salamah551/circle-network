import { Suspense } from 'react';
import ApplyForm from './apply-form';

// Force dynamic rendering (required for useSearchParams)
export const dynamic = 'force-dynamic';

export default function ApplyPage() {
  return (
    <Suspense fallback={<ApplyPageSkeleton />}>
      <ApplyForm />
    </Suspense>
  );
}

function ApplyPageSkeleton() {
  return (
    <main className="min-h-screen bg-black text-white grid place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-8 animate-pulse">
        <div className="h-8 bg-white/10 rounded w-3/4 mb-4" />
        <div className="h-4 bg-white/10 rounded w-full mb-6" />
        <div className="space-y-4">
          <div className="h-12 bg-white/10 rounded" />
          <div className="h-12 bg-white/10 rounded" />
          <div className="h-12 bg-white/10 rounded" />
        </div>
      </div>
    </main>
  );
}
