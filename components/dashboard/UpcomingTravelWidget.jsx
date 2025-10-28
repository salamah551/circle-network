'use client';
import { Plane, MapPin, Calendar, Clock } from 'lucide-react';
import DashboardWidget from './DashboardWidget';

/**
 * Upcoming Travel Widget
 * Shows upcoming trips and travel optimization opportunities
 */
export default function UpcomingTravelWidget() {
  const mockTrips = [
    {
      id: 1,
      destination: 'San Francisco',
      dates: 'Nov 15-18, 2025',
      airline: 'United Airlines',
      flightNumber: 'UA-567',
      upgradeAvailable: true
    },
    {
      id: 2,
      destination: 'New York City',
      dates: 'Dec 3-5, 2025',
      airline: 'Delta',
      flightNumber: 'DL-234',
      upgradeAvailable: false
    }
  ];

  return (
    <DashboardWidget
      title="Upcoming Travel"
      icon={Plane}
      size="default"
      iconColor="text-blue-400"
      iconBg="bg-blue-500/10"
    >
      <div className="space-y-3">
        {mockTrips.map((trip) => (
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
                  <span>{trip.dates}</span>
                </div>
              </div>
              {trip.upgradeAvailable && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded">
                  Upgrade Available
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-500">
              {trip.airline} • {trip.flightNumber}
            </div>
          </div>
        ))}

        {mockTrips.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <Plane className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No upcoming trips</p>
          </div>
        )}
      </div>
    </DashboardWidget>
  );
}
