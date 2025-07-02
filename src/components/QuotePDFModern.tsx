import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { CalculationEntry, CompanyInfo, CustomerInfo } from '../types';
import { formatNumber } from '../utils/calculations';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 40,
    marginBottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    width: 120,
    alignItems: 'flex-end',
  },
  logo: {
    width: '100%',
    maxHeight: 60,
    objectFit: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  contentSection: {
    padding: 40,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    gap: 40,
  },
  infoBlock: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 8,
    borderLeft: '4px solid #2563eb',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: {
    marginBottom: 6,
    fontSize: 11,
    color: '#475569',
    lineHeight: 1.4,
  },
  table: {
    marginBottom: 30,
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 12,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRowMain: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#ffffff',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableRowComment: {
    paddingLeft: 24,
    paddingRight: 12,
    paddingBottom: 12,
    backgroundColor: 'inherit',
  },
  postCell: {
    width: '12%',
    paddingRight: 8,
  },
  descriptionCell: {
    width: '35%',
    paddingRight: 8,
  },
  numberCell: {
    width: '12%',
    textAlign: 'right',
    fontSize: 10,
  },
  commentText: {
    fontSize: 9,
    color: '#64748b',
    fontStyle: 'italic',
    paddingTop: 4,
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  totalSection: {
    marginTop: 30,
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 12,
    color: '#475569',
  },
  totalAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    minWidth: 80,
    textAlign: 'right',
  },
  grandTotalRow: {
    borderTopWidth: 2,
    borderTopColor: '#2563eb',
    paddingTop: 12,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  grandTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    minWidth: 80,
    textAlign: 'right',
  },
  footer: {
    backgroundColor: '#1e293b',
    padding: 20,
    marginTop: 40,
  },
  footerText: {
    fontSize: 10,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  accent: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  summaryRow: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
  },
  summaryCell: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

interface QuotePDFModernProps {
  entries: CalculationEntry[];
  companyInfo: CompanyInfo;
  customerInfo: CustomerInfo;
}

const formatCurrency = (value: number): string => {
  return `${formatNumber(value)} kr`;
};

const QuotePDFModern: React.FC<QuotePDFModernProps> = ({ entries, companyInfo, customerInfo }) => {
  // Only filter out entries with zero values
  const validEntries = entries.filter(entry => entry.antall > 0 || entry.enhetspris > 0 || entry.sum > 0);

  const totalSum = validEntries.reduce((acc, entry) => acc + entry.sum, 0);
  const currentDate = new Date().toLocaleDateString('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>{companyInfo.tilbudstittel || 'Tilbud'}</Text>
              <Text style={styles.subtitle}>Profesjonelt tilbud fra {companyInfo.firma}</Text>
              <Text style={styles.date}>{currentDate}</Text>
            </View>
            {companyInfo.logo && (
              <View style={styles.headerRight}>
                <Image src={companyInfo.logo} style={styles.logo} />
              </View>
            )}
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoTitle}>Fra</Text>
              <Text style={styles.infoText}>{companyInfo.firma}</Text>
              <Text style={styles.infoText}>{companyInfo.navn}</Text>
              <Text style={styles.infoText}>{companyInfo.epost}</Text>
              <Text style={styles.infoText}>{companyInfo.tlf}</Text>
              {companyInfo.refNr && (
                <Text style={styles.infoText}>Ref.nr: {companyInfo.refNr}</Text>
              )}
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.infoTitle}>Til</Text>
              <Text style={styles.infoText}>{customerInfo.kunde}</Text>
              <Text style={styles.infoText}>{customerInfo.adresse}</Text>
              <Text style={styles.infoText}>{customerInfo.epost}</Text>
              <Text style={styles.infoText}>{customerInfo.tlf}</Text>
            </View>
          </View>

          {/* Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.postCell]}>Post</Text>
              <Text style={[styles.tableHeaderCell, styles.descriptionCell]}>Beskrivelse</Text>
              <Text style={[styles.tableHeaderCell, styles.numberCell]}>Antall</Text>
              <Text style={[styles.tableHeaderCell, styles.numberCell]}>Enhetspris</Text>
              <Text style={[styles.tableHeaderCell, styles.numberCell]}>Sum</Text>
            </View>

            {validEntries.map((entry, index) => (
              <View key={`${entry.id}-${index}`} style={styles.tableRow}>
                <View style={[styles.tableRowMain, index % 2 === 1 && styles.tableRowAlt]}>
                  <View style={styles.postCell}>
                    <Text style={{ fontSize: 10, color: '#475569' }}>{entry.post || '-'}</Text>
                  </View>
                  <View style={styles.descriptionCell}>
                    <Text style={{ fontSize: 10, color: '#1e293b', fontWeight: 'medium' }}>{entry.beskrivelse || '-'}</Text>
                  </View>
                  <Text style={styles.numberCell}>{formatNumber(entry.antall)}</Text>
                  <Text style={styles.numberCell}>{formatCurrency(entry.enhetspris)}</Text>
                  <Text style={[styles.numberCell, { fontWeight: 'bold', color: '#2563eb' }]}>{formatCurrency(entry.sum)}</Text>
                </View>
                {entry.kommentar && (
                  <View style={[styles.tableRowComment, index % 2 === 1 && styles.tableRowAlt]}>
                    <Text style={styles.commentText}>{entry.kommentar}</Text>
                  </View>
                )}
              </View>
            ))}

            {/* Summary Row */}
            <View style={[styles.tableRow, styles.summaryRow]}>
              <View style={styles.tableRowMain}>
                <View style={styles.postCell}>
                  <Text style={styles.summaryCell}>TOTAL</Text>
                </View>
                <View style={styles.descriptionCell}>
                  <Text style={styles.summaryCell}></Text>
                </View>
                <Text style={[styles.numberCell, styles.summaryCell]}></Text>
                <Text style={[styles.numberCell, styles.summaryCell]}></Text>
                <Text style={[styles.numberCell, styles.summaryCell]}>{formatCurrency(totalSum)}</Text>
              </View>
            </View>
          </View>

          {/* Total Section */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal eks. mva</Text>
              <Text style={styles.totalAmount}>{formatCurrency(totalSum)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>MVA 25%</Text>
              <Text style={styles.totalAmount}>{formatCurrency(totalSum * 0.25)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total sum inkl. mva</Text>
              <Text style={styles.grandTotalAmount}>{formatCurrency(totalSum * 1.25)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tilbudet er gyldig i 30 dager fra {currentDate}. Alle priser er oppgitt i NOK inkludert merverdiavgift.
            {'\n'}Takk for at du vurderer våre tjenester. Vi ser frem til å høre fra deg.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default QuotePDFModern;