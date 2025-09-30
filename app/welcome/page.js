'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Users, MessageSquare, Calendar, Sparkles } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to The Circle! 
          </h1>
          <p className="text-xl text-zinc-400">
            You're now a founding member
          </p>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-500 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-amber-400 font-semibold mb-1">FOUNDING MEMBER</div>
              <div className="text-2xl font-bold">The Circle Network</div>
            </div>
            <div className="w-16 h-16">
              <svg viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#D4AF37" strokeWidth="2" fill="none"/>
                <circle cx="20" cy="20" r="12" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
                <circle cx="20" cy="20" r="6" fill="#D4AF37"/>
              </svg>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-zinc-500 mb-1">Member Since</div>
              <div className="font-semibold">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-500 mb-1">Monthly Rate</div>
              <div className="font-semibold text-amber-400">$199/mo</div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">What's Next?</h2>
          
          <div className="space-y-6">
            {[
              { icon: Users, title: 'Browse the Member Directory', desc: 'Discover 100+ vetted professionals across industries and start building connections.' },
              { icon: MessageSquare, title: 'Start Conversations', desc: 'Message members directly or post on the requests board to get help with your challenges.' },
              { icon: Calendar, title: 'Join Member Events', desc: 'Attend virtual roundtables and local meetups hosted by fellow members.' },
              { icon: Sparkles, title: 'Invite Your Network', desc: 'As a founding member, you can invite 5 people to skip the vetting process.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-8 py-4 rounded-lg transition-all shadow-lg shadow-amber-500/20"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-zinc-500 mt-4">
            Redirecting automatically in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}