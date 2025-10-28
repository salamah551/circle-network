'use client';
import { Briefcase, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import DashboardWidget from './DashboardWidget';

/**
 * My ARC™ Briefs Widget
 * Shows status of requests to the AI engine
 */
export default function ArcBriefsWidget() {
  const mockRequests = [
    {
      id: 1,
      title: 'Contract Analysis: Series A Term Sheet',
      status: 'completed',
      time: '2 hours ago',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Flight Upgrade Options: UA-567',
      status: 'processing',
      time: 'In progress',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Market Research: SaaS Competition',
      status: 'pending',
      time: 'Queued',
      priority: 'low'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-amber-400 animate-pulse" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-zinc-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400';
      case 'processing':
        return 'text-amber-400';
      case 'pending':
        return 'text-zinc-500';
      default:
        return 'text-zinc-400';
    }
  };

  return (
    <DashboardWidget
      title="My ARC™ Briefs"
      icon={Briefcase}
      size="large"
      iconColor="text-purple-400"
      iconBg="bg-purple-500/10"
    >
      <div className="space-y-3">
        {mockRequests.map((request) => (
          <div
            key={request.id}
            className="group bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 
                     rounded-lg p-4 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(request.status)}
                  <h4 className="font-medium text-white group-hover:text-amber-400 transition-colors">
                    {request.title}
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <span className={getStatusColor(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  <span>•</span>
                  <span>{request.time}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}

        {mockRequests.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No active requests</p>
            <p className="text-xs mt-1">Use the Action Center to make a new request</p>
          </div>
        )}
      </div>
    </DashboardWidget>
  );
}
