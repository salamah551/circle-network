'use client';

/**
 * Base Dashboard Widget Component
 * A modular, animated widget container for the personalized dashboard
 */
export default function DashboardWidget({ 
  title, 
  icon: Icon, 
  children, 
  className = '',
  size = 'default', // 'small', 'default', 'large', 'hero'
  iconColor = 'text-amber-400',
  iconBg = 'bg-amber-500/10',
  actions
}) {
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    default: 'col-span-1 md:col-span-2 row-span-1',
    large: 'col-span-1 md:col-span-2 lg:col-span-3 row-span-2',
    hero: 'col-span-1 md:col-span-2 lg:col-span-4 row-span-2'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]}
        bg-gradient-to-br from-zinc-900 to-zinc-950 
        rounded-xl p-6 border border-zinc-800 
        hover:border-zinc-700 
        transition-all duration-300 
        hover:shadow-lg hover:shadow-black/20
        animate-fadeIn
        ${className}
      `}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
          )}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Widget Content */}
      <div className="text-zinc-300">
        {children}
      </div>
    </div>
  );
}
