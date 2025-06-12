import { CalculationEntry, CalculationSummary } from '../types';

export interface CalculationEntry {
  id: string;
  post: string;
  beskrivelse: string;
  antall: number;
  kostMateriell: number;
  timer: number;
  kostpris: number;
  timepris: number;
  paslagMateriell: number;
  enhetspris: number;
  sum: number;
  kommentar: string;
}

export interface CalculationSummary {
  totalSum: number;
  fortjeneste: number;
  timerTotalt: number;
  bidrag: number;
  totalKostprisTimer: number;
}

export interface CompanyInfo {
  firma: string;
  navn: string;
  epost: string;
  tlf: string;
  refNr: string;
  logo?: string;
  tilbudstittel?: string;
}

export interface CustomerInfo {
  kunde: string;
  adresse: string;
  epost: string;
  tlf: string;
}

export interface CalculationSettings {
  defaultKostpris: number;
  defaultTimepris: number;
  defaultPaslag: number;
}