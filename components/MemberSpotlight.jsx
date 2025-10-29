'use client';
import { useState, useEffect } from 'react';
import { Star, Sparkles, MapPin, Briefcase, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function MemberSpotlight() {
  const [spotlight, setSpotlight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSpotlight();
  }, []);

  const loadSpotlight = async () => {
    try {
      const response = await fetch('/api/member-spotlight');
      const data = await response.json();
      setSpotlight(data);
    } catch (error) {
      console.error('Error loading spotlight:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-zinc-800 rounded-xl" />
      </div>
    );
  }

  if (!spotlight) return null;

  const getInitials = (name) => {
    if (!name) return 'M';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-zinc-900 to-emerald-500/10 border border-amber-500/20 p-8">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10" />

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6">
        <Star className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-semibold text-amber-400">Member Spotlight</span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Image/Avatar */}
        <div className="flex-shrink-0">
         {spotlight.photo_url ? (
  <img
    src={spotlight.photo_url}
              alt={spotlight.full_name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-2 border-amber-500/30"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-bold text-4xl border-2 border-amber-500/30">
              {getInitials(spotlight.full_name)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {spotlight.full_name}
              </h3>
              {spotlight.title && (
                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm">
                    {spotlight.title}
                    {spotlight.company && ` at ${spotlight.company}`}
                  </span>
                </div>
              )}
              {spotlight.location && (
                <div className="flex items-center gap-2 text-zinc-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{spotlight.location}</span>
                </div>
              )}
            </div>
            {spotlight.is_founding_member && (
              <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
                <span className="text-xs font-bold text-amber-400">Founding Member</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {spotlight.bio && (
            <p className="text-zinc-300 mb-4 leading-relaxed line-clamp-3">
              {spotlight.bio}
            </p>
          )}

          {/* Expertise Tags */}
          {spotlight.expertise && spotlight.expertise.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {spotlight.expertise.slice(0, 4).map((exp, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-medium"
                  >
                    {exp}
                  </span>
                ))}
                {spotlight.expertise.length > 4 && (
                  <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-500">
                    +{spotlight.expertise.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Highlight/Achievement */}
          {spotlight.spotlight_reason && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/5 to-emerald-500/5 border border-amber-500/10 mb-4">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
                    Why They're Featured
                  </p>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {spotlight.spotlight_reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <Link
            href={`/members/${spotlight.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-all group"
          >
            <span>View Full Profile</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-6 pt-6 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 text-center">
          Member Spotlight updates weekly • Want to be featured?{' '}
          <Link href="/settings" className="text-amber-400 hover:text-amber-300">
            Update your profile
          </Link>
        </p>
      </div>
    </div>
  );
}
