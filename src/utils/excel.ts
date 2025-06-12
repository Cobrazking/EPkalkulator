import { utils, writeFile } from 'xlsx';
import { CalculationEntry, CalculationSummary } from '../types';
import { formatNumber, formatPercent } from './calculations';

export const exportToExcel = (entries: CalculationEntry[], summary: CalculationSummary) => {
  // Calculate totals for the summary row
  const totalKostMateriell = entries.reduce((acc, entry) => acc + (entry.kostMateriell * entry.antall), 0);
  const totalTimer = entries.reduce((acc, entry) => acc + (entry.timer * entry.antall), 0);
  const totalSalgsprisMateriell = entries.reduce((acc, entry) => 
    acc + (entry.kostMateriell * entry.antall * (1 + entry.paslagMateriell / 100)), 0);
  const totalSalgsprisRessurs = entries.reduce((acc, entry) => 
    acc + (entry.timepris * entry.timer * entry.antall), 0);

  const worksheetData = entries.map(entry => ({
    'Post': entry.post,
    'Beskrivelse': entry.beskrivelse,
    'Antall': entry.antall,
    'Kost materiell': entry.kostMateriell,
    'Kost materiell tot.': entry.kostMateriell * entry.antall,
    'Timer': entry.timer,
    'Kostpris': entry.kostpris,
    'Timepris': entry.timepris,
    'Påslag materiell': `${entry.paslagMateriell}%`,
    'Salgspris materiell': entry.kostMateriell * (1 + entry.paslagMateriell / 100),
    'Salgspris ressurs': entry.timepris * entry.timer,
    'Enhetspris': entry.enhetspris,
    'SUM': entry.sum,
    'Kommentar': entry.kommentar
  }));

  // Add summary row
  worksheetData.push({
    'Post': 'SUMMER',
    'Beskrivelse': '',
    'Antall': '',
    'Kost materiell': '',
    'Kost materiell tot.': totalKostMateriell,
    'Timer': totalTimer,
    'Kostpris': '',
    'Timepris': '',
    'Påslag materiell': '',
    'Salgspris materiell': totalSalgsprisMateriell,
    'Salgspris ressurs': totalSalgsprisRessurs,
    'Enhetspris': '',
    'SUM': summary.totalSum,
    'Kommentar': ''
  });

  // Add summary section
  worksheetData.push(
    {},  // Empty row for spacing
    {
      'Post': 'Oppsummering',
      'Beskrivelse': '',
      'SUM': ''
    },
    {
      'Post': 'Total sum',
      'Beskrivelse': formatNumber(summary.totalSum),
      'SUM': ''
    },
    {
      'Post': 'Fortjeneste',
      'Beskrivelse': formatNumber(summary.fortjeneste),
      'SUM': ''
    },
    {
      'Post': 'Timer totalt',
      'Beskrivelse': formatNumber(summary.timerTotalt),
      'SUM': ''
    },
    {
      'Post': 'Bidrag',
      'Beskrivelse': formatPercent(summary.bidrag),
      'SUM': ''
    }
  );

  const worksheet = utils.json_to_sheet(worksheetData);

  // Set column widths
  const colWidths = [
    { wch: 10 },  // Post
    { wch: 30 },  // Beskrivelse
    { wch: 8 },   // Antall
    { wch: 12 },  // Kost materiell
    { wch: 12 },  // Kost materiell tot.
    { wch: 8 },   // Timer
    { wch: 10 },  // Kostpris
    { wch: 10 },  // Timepris
    { wch: 12 },  // Påslag materiell
    { wch: 15 },  // Salgspris materiell
    { wch: 15 },  // Salgspris ressurs
    { wch: 12 },  // Enhetspris
    { wch: 12 },  // SUM
    { wch: 30 },  // Kommentar
  ];
  worksheet['!cols'] = colWidths;

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Kalkyle');

  writeFile(workbook, `kalkyle-${new Date().toISOString().slice(0, 10)}.xlsx`);
};