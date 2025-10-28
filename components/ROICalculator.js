'use client';
import { useState } from 'react';
import { DollarSign, Plane, Users } from 'lucide-react';

// ROI Calculation Constants
const VENDOR_SAVINGS_RATE = 0.15; // 15% savings on software spend
const TRAVEL_SAVINGS_PER_FLIGHT = 250; // $250 saved per flight
const PRODUCTIVITY_GAIN_PER_PERSON = 5000; // $5K productivity gain per team member

export default function ROICalculator() {
  const [softwareSpend, setSoftwareSpend] = useState(10000);
  const [annualFlights, setAnnualFlights] = useState(24);
  const [teamSize, setTeamSize] = useState(10);

  // Calculations
  const vendorSavings = softwareSpend * VENDOR_SAVINGS_RATE;
  const travelSavings = annualFlights * TRAVEL_SAVINGS_PER_FLIGHT;
  const productivityGains = teamSize * PRODUCTIVITY_GAIN_PER_PERSON;
  
  const directSavings = vendorSavings + travelSavings;
  const totalValue = directSavings + productivityGains;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 md:p-10">
      <div className="space-y-8">
        {/* Monthly Software Spend */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-lg font-semibold">
              <DollarSign className="w-5 h-5 text-indigo-400" />
              Monthly Software Spend
            </label>
            <span className="text-xl font-bold text-indigo-400">{formatCurrency(softwareSpend)}</span>
          </div>
          <input
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={softwareSpend}
            onChange={(e) => setSoftwareSpend(Number(e.target.value))}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-indigo"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>$1K</span>
            <span>$100K</span>
          </div>
        </div>

        {/* Annual Flights */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-lg font-semibold">
              <Plane className="w-5 h-5 text-purple-400" />
              Annual Flights
            </label>
            <span className="text-xl font-bold text-purple-400">{annualFlights}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="2"
            value={annualFlights}
            onChange={(e) => setAnnualFlights(Number(e.target.value))}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-purple"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>0</span>
            <span>100+</span>
          </div>
        </div>

        {/* Team Size */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-lg font-semibold">
              <Users className="w-5 h-5 text-pink-400" />
              Team Size
            </label>
            <span className="text-xl font-bold text-pink-400">{teamSize}</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={teamSize}
            onChange={(e) => setTeamSize(Number(e.target.value))}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-pink"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>1</span>
            <span>100+</span>
          </div>
        </div>

        {/* Results */}
        <div className="bg-black border border-zinc-800 rounded-xl p-6 mt-8">
          <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Estimated Annual Value Unlocked
          </h3>

          {/* Breakdown */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <span className="text-white/70">Direct Savings</span>
              <span className="text-2xl font-bold text-emerald-400">{formatCurrency(directSavings)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <span className="text-white/70 flex items-center gap-2">
                Vendor Optimization
                <span className="text-xs text-white/40">({Math.round(VENDOR_SAVINGS_RATE * 100)}% of spend)</span>
              </span>
              <span className="text-lg text-white/80">{formatCurrency(vendorSavings)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <span className="text-white/70 flex items-center gap-2">
                Travel Optimization
                <span className="text-xs text-white/40">(${TRAVEL_SAVINGS_PER_FLIGHT}/flight)</span>
              </span>
              <span className="text-lg text-white/80">{formatCurrency(travelSavings)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <span className="text-white/70 flex items-center gap-2">
                Productivity Gains
                <span className="text-xs text-white/40">(${PRODUCTIVITY_GAIN_PER_PERSON.toLocaleString()}/person)</span>
              </span>
              <span className="text-2xl font-bold text-purple-400">{formatCurrency(productivityGains)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 rounded-lg p-6 text-center">
            <div className="text-sm text-white/60 mb-2">Total Annual Value</div>
            <div className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {formatCurrency(totalValue)}
            </div>
          </div>
        </div>

        {/* Fine print */}
        <p className="text-xs text-white/40 text-center">
          Estimates based on typical ARC™ performance. Individual results may vary.
        </p>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
        }

        .slider-indigo::-webkit-slider-thumb {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        .slider-purple::-webkit-slider-thumb {
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }

        .slider-pink::-webkit-slider-thumb {
          background: linear-gradient(135deg, #a855f7, #ec4899);
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.5);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
