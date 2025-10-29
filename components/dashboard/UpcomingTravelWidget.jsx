'use client';
import { useState, useEffect } from 'react';
import { Plane, MapPin, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';
import DashboardWidget from './DashboardWidget';
import { formatDateRange } from '@/lib/dateUtils';

/**
 * Upcoming Travel Widget
 * Shows upcoming trips and travel optimization opportunities
 */
export default function UpcomingTravelWidget() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/travel/upcoming');
      if (!response.ok) throw new Error('Failed to load trips');
      const data = await response.json();
      setTrips(data.trips || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardWidget
      title="Upcoming Travel"
      icon={Plane}
      size="default"
      iconColor="text-blue-400"
      iconBg="bg-blue-500/10"
    >
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-1/2" />
                <div className="h-3 bg-zinc-800 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-400 mb-3">Failed to load trips</p>
          <button
            onClick={fetchTrips}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 
                     rounded-lg text-sm text-red-300 transition-colors"
          >
            Retry
          </button>
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
            <div className="text-center py-8 text-zinc-500">
              <Plane className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No upcoming trips</p>
            </div>
          )}
        </div>
      )}
    </DashboardWidget>
  );
}
