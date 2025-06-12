import React, { memo } from 'react';
import { CalculationSummary } from '../types';
import { formatNumber, formatPercent } from '../utils/calculations';
import { CircleDollarSign, TrendingUp, Clock, PieChart } from 'lucide-react';

interface SummaryCardProps {
  summary: CalculationSummary;
}

const SummaryCard: React.FC<SummaryCardProps> = memo(({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="card p-4 bg-gradient-to-br from-emerald-600/20 via-teal-600/15 to-cyan-600/20 border-emerald-500/30 hover:from-emerald-600/30 hover:via-teal-600/25 hover:to-cyan-600/30 transition-all duration-300">
        <div className="flex items-center gap-3">
          <CircleDollarSign className="w-5 h-5 text-emerald-200/90" />
          <h3 className="text-sm font-medium text-emerald-200/90">Total sum</h3>
        </div>
        <p className="text-2xl font-semibold text-text-primary mt-2">{formatNumber(summary.totalSum)}</p>
      </div>
      
      <div className="card p-4 bg-gradient-to-br from-green-600/20 via-emerald-600/15 to-teal-600/20 border-green-500/30 hover:from-green-600/30 hover:via-emerald-600/25 hover:to-teal-600/30 transition-all duration-300">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-green-200/90" />
          <h3 className="text-sm font-medium text-green-200/90">Fortjeneste</h3>
        </div>
        <p className="text-2xl font-semibold text-text-primary mt-2">{formatNumber(summary.fortjeneste)}</p>
      </div>
      
      <div className="card p-4 bg-gradient-to-br from-violet-600/20 via-purple-600/15 to-fuchsia-600/20 border-violet-500/30 hover:from-violet-600/30 hover:via-purple-600/25 hover:to-fuchsia-600/30 transition-all duration-300">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-violet-200/90" />
          <h3 className="text-sm font-medium text-violet-200/90">Timer totalt</h3>
        </div>
        <p className="text-2xl font-semibold text-text-primary mt-2">{formatNumber(summary.timerTotalt)}</p>
      </div>
      
      <div className="card p-4 bg-gradient-to-br from-amber-600/20 via-orange-600/15 to-yellow-600/20 border-amber-500/30 hover:from-amber-600/30 hover:via-orange-600/25 hover:to-yellow-600/30 transition-all duration-300">
        <div className="flex items-center gap-3">
          <PieChart className="w-5 h-5 text-amber-200/90" />
          <h3 className="text-sm font-medium text-amber-200/90">Bidrag</h3>
        </div>
        <div className="flex items-end mt-2">
          <p className="text-2xl font-semibold text-text-primary">{formatPercent(summary.bidrag)}</p>
          <div className="h-1.5 ml-2 flex-grow bg-background-darker/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${summary.bidrag}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.summary) === JSON.stringify(nextProps.summary);
});

export default SummaryCard;