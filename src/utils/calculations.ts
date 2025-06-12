import { CalculationEntry, CalculationSummary } from '../types';

export const calculateRow = (entry: CalculationEntry): CalculationEntry => {
  const materialCostWithMarkup = entry.kostMateriell * (1 + entry.paslagMateriell / 100);
  const laborCost = entry.timer * entry.timepris;
  
  const enhetspris = materialCostWithMarkup + laborCost;
  const sum = enhetspris * entry.antall;
  
  return {
    ...entry,
    enhetspris: parseFloat(enhetspris.toFixed(2)),
    sum: parseFloat(sum.toFixed(2))
  };
};

export const calculateSummary = (entries: CalculationEntry[]): CalculationSummary => {
  const totalSum = entries.reduce((acc, entry) => acc + entry.sum, 0);
  
  const timerTotalt = entries.reduce((acc, entry) => acc + (entry.timer * entry.antall), 0);
  
  const totalMaterialCost = entries.reduce((acc, entry) => 
    acc + (entry.kostMateriell * entry.antall), 0);
  
  const totalKostprisTimer = entries.reduce((acc, entry) => 
    acc + (entry.timer * entry.kostpris * entry.antall), 0);
  
  const totalMaterialWithMarkup = entries.reduce((acc, entry) => 
    acc + (entry.kostMateriell * (1 + entry.paslagMateriell / 100) * entry.antall), 0);
  
  const fortjeneste = totalSum - totalMaterialCost - totalKostprisTimer;
  
  const bidrag = totalSum > 0 ? (fortjeneste / totalSum) * 100 : 0;
  
  return {
    totalSum: parseFloat(totalSum.toFixed(2)),
    fortjeneste: parseFloat(fortjeneste.toFixed(2)),
    timerTotalt: parseFloat(timerTotalt.toFixed(2)),
    bidrag: parseFloat(bidrag.toFixed(2)),
    totalKostprisTimer: parseFloat(totalKostprisTimer.toFixed(2))
  };
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('nb-NO', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatPercent = (num: number): string => {
  return new Intl.NumberFormat('nb-NO', { 
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num / 100);
};