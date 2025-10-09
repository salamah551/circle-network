'use client';
import { Shield, Check, X } from 'lucide-react';

export default function MoneyBackGuarantee() {
  return (
    <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border-2 border-emerald-500/30 rounded-2xl p-8">
      <div className="flex items-start gap-4">
        <div className="bg-emerald-500/20 p-4 rounded-full">
          <Shield className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-3">30-Day Money-Back Guarantee</h3>
          <p className="text-zinc-400 mb-6">
            If The Circle doesn't deliver at least one meaningful connection or valuable insight in your first 30 days, we'll refund every penny. No questions asked.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">Full refund if not satisfied</span>
              </div>
              <p className="text-sm text-zinc-500 ml-7">100% of your payment back, no hassle</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">Keep all connections made</span>
              </div>
              <p className="text-sm text-zinc-500 ml-7">Any relationships formed are yours</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">No awkward questions</span>
              </div>
              <p className="text-sm text-zinc-500 ml-7">Simple email to support@thecirclenetwork.org</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">Refund in 2-3 business days</span>
              </div>
              <p className="text-sm text-zinc-500 ml-7">Fast processing, back to your account</p>
            </div>
          </div>

          <div className="bg-black border border-zinc-800 rounded-lg p-4">
            <p className="text-sm text-zinc-400">
              <strong className="text-white">Why we offer this:</strong> We're confident The Circle will be the most valuable professional network you've ever joined. But if it's not right for you within 30 days, you shouldn't pay for it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
