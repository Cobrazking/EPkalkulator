import React, { useMemo, useCallback, memo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { CalculationEntry, CalculationSummary } from '../types';
import CalculationRow from './CalculationRow';
import { formatNumber } from '../utils/calculations';

interface CalculationTableProps {
  entries: CalculationEntry[];
  onUpdateEntry: (id: string, field: keyof CalculationEntry, value: any) => void;
  onDeleteEntry: (id: string) => void;
  onAddEntry: () => void;
  onReorderEntries: (startIndex: number, endIndex: number) => void;
  onDuplicateEntry: (entry: CalculationEntry) => void;
}

const CalculationTable: React.FC<CalculationTableProps> = memo(({
  entries = [],
  onUpdateEntry,
  onDeleteEntry,
  onAddEntry,
  onReorderEntries,
  onDuplicateEntry
}) => {
  // Calculate totals using useMemo
  const totals = useMemo(() => ({
    sum: entries.reduce((acc, entry) => acc + entry.sum, 0),
    kostMateriell: entries.reduce((acc, entry) => acc + (entry.kostMateriell * entry.antall), 0),
    salgsprisRessurs: entries.reduce((acc, entry) => acc + (entry.timepris * entry.timer * entry.antall), 0),
    salgsprisMateriell: entries.reduce((acc, entry) => 
      acc + (entry.kostMateriell * entry.antall * (1 + entry.paslagMateriell / 100)), 0),
    timer: entries.reduce((acc, entry) => acc + (entry.timer * entry.antall), 0)
  }), [entries]);

  const handleMoveUp = useCallback((index: number) => {
    if (index > 0) {
      onReorderEntries(index, index - 1);
    }
  }, [onReorderEntries]);

  const handleMoveDown = useCallback((index: number) => {
    if (index < entries.length - 1) {
      onReorderEntries(index, index + 1);
    }
  }, [onReorderEntries, entries.length]);

  const handleReset = useCallback(() => {
    if (window.confirm('Er du sikker på at du vil tilbakestille alle poster? Dette kan ikke angres.')) {
      localStorage.clear();
      window.location.reload();
    }
  }, []);

  return (
    <div className="w-full card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background-darker text-sm">
            <tr>
              <th className="w-20 sticky left-0 bg-background-darker z-10 p-2 text-center">Flytt</th>
              <th className="w-20 p-2 text-left">Post</th>
              <th className="w-[180px] p-2 text-left">Beskrivelse</th>
              <th className="w-16 p-2 text-center">Antall</th>
              <th className="w-28 p-2 text-center">Kostpris materiell</th>
              <th className="w-28 p-2 text-center">Kost materiell tot.</th>
              <th className="w-16 p-2 text-center">Timer pr. antall</th>
              <th className="w-28 p-2 text-center">Timer totalt</th>
              <th className="w-20 p-2 text-center">Kostpris ressurs</th>
              <th className="w-20 p-2 text-center">Salgspris ressurs</th>
              <th className="w-20 p-2 text-center">Påslag</th>
              <th className="w-28 p-2 text-center">Salgspris materiell</th>
              <th className="w-28 p-2 text-center">Salgspris ressurs</th>
              <th className="w-28 p-2 text-center">Enhetspris</th>
              <th className="w-28 p-2 text-center">SUM</th>
              <th className="w-20 sticky right-0 bg-background-darker z-10 p-2 text-center">Handling</th>
            </tr>
          </thead>

          <tbody className="font-sans text-sm">
            {entries.map((entry, index) => (
              <CalculationRow
                key={`${entry.id}-${index}`}
                entry={entry}
                index={index}
                onUpdate={onUpdateEntry}
                onDelete={onDeleteEntry}
                onDuplicate={onDuplicateEntry}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                isFirst={index === 0}
                isLast={index === entries.length - 1}
              />
            ))}
            
            <tr className="bg-background-darker font-semibold">
              <td className="sticky left-0 bg-background-darker p-2"></td>
              <td className="text-text-muted p-2">SUMMER</td>
              <td className="p-2"></td>
              <td className="p-2"></td>
              <td className="p-2"></td>
              <td className="text-center p-2">{formatNumber(totals.kostMateriell)}</td>
              <td className="p-2"></td>
              <td className="text-center p-2">{formatNumber(totals.timer)}</td>
              <td className="p-2"></td>
              <td className="p-2"></td>
              <td className="p-2"></td>
              <td className="text-center p-2">{formatNumber(totals.salgsprisMateriell)}</td>
              <td className="text-center p-2">{formatNumber(totals.salgsprisRessurs)}</td>
              <td className="p-2"></td>
              <td className="text-center p-2">{formatNumber(totals.sum)}</td>
              <td className="sticky right-0 bg-background-darker p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="p-3 flex justify-center border-t border-border">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddEntry}
          className="btn-secondary flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Legg til rad</span>
        </motion.button>
      </div>

      <div className="px-3 pb-3 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="text-text-muted hover:text-red-400 text-sm flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors"
        >
          <Trash2 size={14} />
          <span>Tilbakestill</span>
        </motion.button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Deep comparison for entries array
  return JSON.stringify(prevProps.entries) === JSON.stringify(nextProps.entries);
});

export default CalculationTable;