'use client';
import { useState, useEffect } from 'react';
import { Plane, MapPin, Calendar, Clock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import DashboardWidget from './DashboardWidget';
import { formatDateRange } from '@/lib/date-utils';

/**
 * Upcoming Travel Widget
 * Shows upcoming trips and travel optimization opportunities
 * Fetches data from /api/travel/upcoming endpoint
 */
export default function UpcomingTravelWidget() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch('/api/travel/upcoming');
        if (!response.ok) {
          throw new Error('Failed to fetch travel data');
        }
        const data = await response.json();
        setTrips(data);
      } catch (err) {
        console.error('Error fetching travel:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  return (
    <DashboardWidget
      title="Upcoming Travel"
      icon={Plane}
      size="default"
      iconColor="text-blue-400"
      iconBg="bg-blue-500/10"
    >
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Failed to load travel data. Please try again later.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 
                       hover:border-blue-500/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <h4 className="font-medium text-white">{trip.destination}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
                  </div>
                </div>
                {trip.upgrade_available && (
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded">
                    Upgrade Available
                  </span>
                )}
              </div>
              <div className="text-xs text-zinc-500">
                {trip.airline} • {trip.flight_number}
              </div>
            </div>
          ))}

          {trips.length === 0 && (
            <div className="text-center py-8">
              <Plane className="w-12 h-12 mx-auto mb-3 text-blue-400/50" />
              <p className="text-white font-medium mb-2">No trips scheduled</p>
              <p className="text-sm text-zinc-400 mb-4">
                Forward your next itinerary and ARC™ will watch for upgrades.
              </p>
              <a
                href="/help/forward-trips"
                className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                How to forward trips
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}
    </DashboardWidget>
  );
}
