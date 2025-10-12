// Reusable skeleton loader components for better loading UX

export function CardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-zinc-800 rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
    </div>
  );
}

export function MemberCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-zinc-800 rounded-full"></div>
        <div className="flex-1">
          <div className="h-5 bg-zinc-800 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-zinc-800 rounded w-3/4"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-full"></div>
        <div className="h-3 bg-zinc-800 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 p-4 animate-pulse">
      <div className="w-10 h-10 bg-zinc-800 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-zinc-800 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-zinc-800 rounded w-full mb-1"></div>
        <div className="h-3 bg-zinc-800 rounded w-3/4"></div>
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-zinc-800 rounded w-24"></div>
        <div className="h-6 bg-zinc-800 rounded w-16"></div>
      </div>
      <div className="h-6 bg-zinc-800 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-zinc-800 rounded w-1/2 mb-4"></div>
      <div className="flex items-center gap-4">
        <div className="h-3 bg-zinc-800 rounded w-24"></div>
        <div className="h-3 bg-zinc-800 rounded w-24"></div>
      </div>
    </div>
  );
}

export function RequestCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-5 bg-zinc-800 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-zinc-800 rounded w-20"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-zinc-800 rounded w-full"></div>
        <div className="h-3 bg-zinc-800 rounded w-5/6"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-zinc-800 rounded-full"></div>
        <div className="h-3 bg-zinc-800 rounded w-32"></div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-zinc-800 rounded-lg"></div>
        <div className="h-3 bg-zinc-800 rounded w-20"></div>
      </div>
      <div className="h-8 bg-zinc-800 rounded w-16 mb-2"></div>
      <div className="h-3 bg-zinc-800 rounded w-24"></div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-t border-zinc-800 animate-pulse">
      <td className="py-4 px-4">
        <div className="h-4 bg-zinc-800 rounded w-32"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-zinc-800 rounded w-24"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-zinc-800 rounded w-20"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-zinc-800 rounded w-28"></div>
      </td>
    </tr>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="h-8 bg-zinc-800 rounded w-64"></div>
      
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-6 bg-zinc-800 rounded w-40"></div>
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-zinc-800 rounded w-40"></div>
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md', color = 'amber' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    white: 'text-white'
  };

  return (
    <svg
      className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" color="amber" />
        <p className="text-zinc-400 mt-4">Loading...</p>
      </div>
    </div>
  );
}
