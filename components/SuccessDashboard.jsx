'use client';
import { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, MessageSquare, Target, Sparkles,
  Award, CheckCircle, ArrowUpRight, Calendar, Zap
} from 'lucide-react';

export default function SuccessDashboard({ userId }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadSuccessMetrics();
    }
  }, [userId]);

  const loadSuccessMetrics = async () => {
    try {
      const response = await fetch(`/api/success-metrics?userId=${userId}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading success metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-zinc-800 rounded-xl" />
        <div className="h-32 bg-zinc-800 rounded-xl" />
      </div>
    );
  }

  const metrics = stats || {
    introsAccepted: 0,
    connectionsMade: 0,
    requestsHelped: 0,
    messagesExchanged: 0,
    eventsAttended: 0,
    memberSince: new Date().toISOString(),
    impactScore: 0
  };

  const daysSinceMember = Math.floor(
    (new Date() - new Date(metrics.memberSince)) / (1000 * 60 * 60 * 24)
  );

  const getImpactLevel = (score) => {
    if (score >= 80) return { label: 'Elite', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    if (score >= 60) return { label: 'Rising Star', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (score >= 40) return { label: 'Active', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    return { label: 'Getting Started', color: 'text-zinc-400', bg: 'bg-zinc-800' };
  };

  const impactLevel = getImpactLevel(metrics.impactScore);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10 border border-amber-500/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Your Circle Impact</h2>
            <p className="text-sm text-zinc-400">
              Member for {daysSinceMember} day{daysSinceMember !== 1 ? 's' : ''}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full ${impactLevel.bg} border border-current/20`}>
            <span className={`text-sm font-bold ${impactLevel.color}`}>
              {impactLevel.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Impact Score</span>
              <span className="text-lg font-bold">{metrics.impactScore}/100</span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${metrics.impactScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={Sparkles}
          label="Intros Accepted"
          value={metrics.introsAccepted}
          color="amber"
        />
        <MetricCard
          icon={Users}
          label="Connections Made"
          value={metrics.connectionsMade}
          color="blue"
        />
        <MetricCard
          icon={Target}
          label="Requests Helped"
          value={metrics.requestsHelped}
          color="emerald"
        />
        <MetricCard
          icon={MessageSquare}
          label="Messages"
          value={metrics.messagesExchanged}
          color="purple"
        />
        <MetricCard
          icon={Calendar}
          label="Events Attended"
          value={metrics.eventsAttended}
          color="pink"
        />
      </div>

      {/* Quick Actions */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Boost Your Impact Score
        </h3>
        <div className="space-y-3">
          <ActionItem
            title="Accept Strategic Intros"
            points="+15 points per intro"
            link="/intros"
          />
          <ActionItem
            title="Help With Member Requests"
            points="+10 points per helpful response"
            link="/requests"
          />
          <ActionItem
            title="Attend Upcoming Events"
            points="+20 points per event"
            link="/events"
          />
          <ActionItem
            title="Make Quality Connections"
            points="+5 points per meaningful conversation"
            link="/messages"
          />
        </div>
      </div>

      {/* Achievements */}
      {metrics.impactScore >= 20 && (
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Your Achievements
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {metrics.introsAccepted >= 1 && (
              <AchievementBadge title="First Connection" icon="🤝" />
            )}
            {metrics.requestsHelped >= 3 && (
              <AchievementBadge title="Helper" icon="🌟" />
            )}
            {metrics.connectionsMade >= 5 && (
              <AchievementBadge title="Networker" icon="🔗" />
            )}
            {metrics.impactScore >= 50 && (
              <AchievementBadge title="Top Contributor" icon="🏆" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    amber: 'text-amber-400 bg-amber-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    pink: 'text-pink-400 bg-pink-500/10'
  };

  return (
    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function ActionItem({ title, points, link }) {
  return (
    <a
      href={link}
      className="flex items-center justify-between p-3 rounded-lg bg-zinc-800 hover:bg-zinc-750 transition-all group"
    >
      <div>
        <div className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
          {title}
        </div>
        <div className="text-xs text-zinc-500">{points}</div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-colors" />
    </a>
  );
}

function AchievementBadge({ title, icon }) {
  return (
    <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs font-medium text-amber-400">{title}</div>
    </div>
  );
}
