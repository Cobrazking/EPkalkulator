import React, { memo, useState } from 'react';
import { Trash2, Copy, ArrowUp, ArrowDown, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

import { CalculationEntry } from '../types';
import EditableCell from './EditableCell';
import CommentModal from './CommentModal';
import { formatNumber, formatPercent } from '../utils/calculations';

interface CalculationRowProps {
  entry: CalculationEntry;
  index: number;
  onUpdate: (id: string, field: keyof CalculationEntry, value: any) => void;
  onDelete: (id: string) => void;
  onDuplicate: (entry: CalculationEntry) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const CalculationRow: React.FC<CalculationRowProps> = memo(({
  entry,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}) => {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCellUpdate = (field: keyof CalculationEntry, value: any) => {
    onUpdate(entry.id, field, value);
  };

  const kostMateriellTotal = entry.kostMateriell * entry.antall;
  const salgsprisMateriell = kostMateriellTotal * (1 + entry.paslagMateriell / 100);
  const salgsprisRessurs = entry.timepris * entry.timer * entry.antall;
  const timerTotal = entry.antall * entry.timer;

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-lighter rounded-lg border border-border p-4 space-y-4"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-3">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Post</label>
              <EditableCell
                value={entry.post}
                onChange={(value) => handleCellUpdate('post', value)}
                placeholder="Post ID"
                className="text-left flex justify-start"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Beskrivelse</label>
              <EditableCell
                value={entry.beskrivelse}
                onChange={(value) => handleCellUpdate('beskrivelse', value)}
                placeholder="Beskrivelse"
                className="text-left flex justify-start"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMoveUp}
                disabled={isFirst}
                className={`p-2 rounded-md ${isFirst ? 'text-text-muted cursor-not-allowed bg-background' : 'text-text-muted hover:text-primary-400 bg-background hover:bg-background-darker'}`}
                title="Flytt opp"
              >
                <ArrowUp size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMoveDown}
                disabled={isLast}
                className={`p-2 rounded-md ${isLast ? 'text-text-muted cursor-not-allowed bg-background' : 'text-text-muted hover:text-primary-400 bg-background hover:bg-background-darker'}`}
                title="Flytt ned"
              >
                <ArrowDown size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">Antall</label>
            <EditableCell
              value={entry.antall}
              onChange={(value) => handleCellUpdate('antall', value)}
              type="number"
              placeholder="0"
              className="text-center flex justify-center items-center"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Timer pr. antall</label>
            <EditableCell
              value={entry.timer}
              onChange={(value) => handleCellUpdate('timer', value)}
              type="number"
              placeholder="0"
              className="text-center flex justify-center items-center"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Kostpris materiell</label>
            <EditableCell
              value={formatNumber(entry.kostMateriell)}
              onChange={(value) => handleCellUpdate('kostMateriell', value)}
              type="number"
              placeholder="0"
              className="text-center flex justify-center items-center"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Påslag %</label>
            <EditableCell
              value={entry.paslagMateriell}
              onChange={(value) => handleCellUpdate('paslagMateriell', value)}
              type="percent"
              placeholder="0"
              className="text-center flex justify-center items-center"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Kostpris ressurs</label>
            <EditableCell
              value={formatNumber(entry.kostpris)}
              onChange={(value) => handleCellUpdate('kostpris', value)}
              type="number"
              placeholder="0"
              className="text-center flex justify-center items-center"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Salgspris ressurs</label>
            <EditableCell
              value={formatNumber(entry.timepris)}
              onChange={(value) => handleCellUpdate('timepris', value)}
              type="number"
              placeholder="0"
              className="text-center flex justify-center items-center"
            />
          </div>
        </div>

        <div className="bg-primary-400/5 rounded-lg p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-text-muted text-xs">Kost materiell tot:</p>
              <p className="font-semibold text-primary-200">{formatNumber(kostMateriellTotal)}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Timer totalt:</p>
              <p className="font-semibold text-primary-200">{formatNumber(timerTotal)}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Salgspris materiell:</p>
              <p className="font-semibold text-primary-200">{formatNumber(salgsprisMateriell)}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Salgspris ressurs:</p>
              <p className="font-semibold text-primary-200">{formatNumber(salgsprisRessurs)}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Enhetspris:</p>
              <p className="font-semibold text-primary-200">{formatNumber(entry.enhetspris)}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Sum:</p>
              <p className="font-bold text-primary-300">{formatNumber(entry.sum)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCommentModalOpen(true)}
            className={`flex-1 py-2 px-3 rounded-md text-sm transition-colors ${entry.kommentar ? 'bg-primary-400/20 text-primary-400 border border-primary-400/50' : 'bg-background text-text-muted hover:text-primary-400 border border-border'}`}
          >
            <MessageSquare size={16} className="inline mr-2" />
            {entry.kommentar ? 'Vis kommentar' : 'Legg til kommentar'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDuplicate(entry)}
            className="py-2 px-3 rounded-md text-sm bg-background text-text-muted hover:text-primary-400 border border-border transition-colors"
            title="Dupliser"
          >
            <Copy size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(entry.id)}
            className="py-2 px-3 rounded-md text-sm bg-background text-text-muted hover:text-red-400 border border-border transition-colors"
            title="Slett"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>

        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
          comment={entry.kommentar}
          onSave={(comment) => handleCellUpdate('kommentar', comment)}
        />
      </motion.div>
    );
  }

  return (
    <tr className="transition-colors duration-200 hover:bg-background-lighter">
      <td className="w-20 sticky left-0 bg-background z-20 p-2">
        <div className="flex gap-1 justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMoveUp}
            disabled={isFirst}
            className={`p-1 transition-colors ${isFirst ? 'text-text-muted cursor-not-allowed' : 'text-text-muted hover:text-primary-400'}`}
            title="Flytt opp"
          >
            <ArrowUp size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMoveDown}
            disabled={isLast}
            className={`p-1 transition-colors ${isLast ? 'text-text-muted cursor-not-allowed' : 'text-text-muted hover:text-primary-400'}`}
            title="Flytt ned"
          >
            <ArrowDown size={16} />
          </motion.button>
        </div>
      </td>

      <td className="w-20 p-2">
        <EditableCell
          value={entry.post}
          onChange={(value) => handleCellUpdate('post', value)}
          placeholder="Post ID"
          className="text-left flex justify-start"
        />
      </td>

      <td className="w-[180px] p-2">
        <EditableCell
          value={entry.beskrivelse}
          onChange={(value) => handleCellUpdate('beskrivelse', value)}
          placeholder="Beskrivelse"
          className="text-left flex justify-start"
        />
      </td>

      <td className="w-16 p-2 text-center">
        <EditableCell
          value={entry.antall}
          onChange={(value) => handleCellUpdate('antall', value)}
          type="number"
          placeholder="0"
          className="text-center flex justify-center items-center"
        />
      </td>

      <td className="w-28 p-2 text-center">
        <EditableCell
          value={formatNumber(entry.kostMateriell)}
          onChange={(value) => handleCellUpdate('kostMateriell', value)}
          type="number"
          placeholder="0"
          className="text-center flex justify-center items-center"
        />
      </td>

      <td className="w-28 p-2 bg-primary-400/5">
        <div className="font-sans text-center text-primary-200">
          {formatNumber(kostMateriellTotal)}
        </div>
      </td>

      <td className="w-16 p-2 text-center">
        <EditableCell
          value={entry.timer}
          onChange={(value) => handleCellUpdate('timer', value)}
          type="number"
          placeholder="0"
          className="text-center flex justify-center items-center"
        />
      </td>

      <td className="w-28 p-2 bg-primary-400/5">
        <div className="font-sans text-center text-primary-200">
          {formatNumber(timerTotal)}
        </div>
      </td>

      <td className="w-20 p-2 text-center">
        <EditableCell
          value={formatNumber(entry.kostpris)}
          onChange={(value) => handleCellUpdate('kostpris', value)}
          type="number"
          placeholder="0"
          className="text-center flex justify-center items-center"
        />
      </td>

      <td className="w-20 p-2 text-center">
        <EditableCell
          value={formatNumber(entry.timepris)}
          onChange={(value) => handleCellUpdate('timepris', value)}
          type="number"
          placeholder="0"
          className="text-center flex justify-center items-center"
        />
      </td>

      <td className="w-20 p-2 text-center">
        <EditableCell
          value={entry.paslagMateriell}
          onChange={(value) => handleCellUpdate('paslagMateriell', value)}
          type="percent"
          placeholder="0"
          className="text-center flex justify-center items-center"
        />
      </td>

      <td className="w-28 p-2 bg-primary-400/5">
        <div className="font-sans text-center text-primary-200">
          {formatNumber(salgsprisMateriell)}
        </div>
      </td>

      <td className="w-28 p-2 bg-primary-400/5">
        <div className="font-sans text-center text-primary-200">
          {formatNumber(salgsprisRessurs)}
        </div>
      </td>

      <td className="w-28 p-2 bg-primary-400/5">
        <div className="font-sans text-center text-primary-200">
          {formatNumber(entry.enhetspris)}
        </div>
      </td>

      <td className="w-28 p-2 bg-primary-400/5">
        <div className="font-sans text-center font-semibold text-primary-200">
          {formatNumber(entry.sum)}
        </div>
      </td>

      <td className="w-20 sticky right-0 bg-background z-20 p-2">
        <div className="flex gap-1 justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCommentModalOpen(true)}
            className={`p-1 transition-colors ${entry.kommentar ? 'text-primary-400' : 'text-text-muted hover:text-primary-400'}`}
            title={entry.kommentar || 'Legg til kommentar'}
          >
            <MessageSquare size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDuplicate(entry)}
            className="p-1 text-text-muted hover:text-primary-400 transition-colors"
            title="Dupliser rad"
          >
            <Copy size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(entry.id)}
            className="p-1 text-text-muted hover:text-red-400 transition-colors"
            title="Slett rad"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>

        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
          comment={entry.kommentar}
          onSave={(comment) => handleCellUpdate('kommentar', comment)}
        />
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  // Deep comparison of all relevant props
  return prevProps.entry.id === nextProps.entry.id &&
         prevProps.index === nextProps.index &&
         prevProps.isFirst === nextProps.isFirst &&
         prevProps.isLast === nextProps.isLast &&
         JSON.stringify(prevProps.entry) === JSON.stringify(nextProps.entry);
});

export default CalculationRow;