import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { CalculationEntry, CompanyInfo, CustomerInfo } from '../types';
import { formatNumber } from '../utils/calculations';

// Register fonts
Font.register({
  family: 'Helvetica-Light',
  src: 'https://fonts.gstatic.com/s/opensans/v18/mem5YaGs126MiZpBA-UN_r8OUuhpKKSTjw.woff2'
});

Font.register({
  family: 'Helvetica-Bold',
  src: 'https://fonts.gstatic.com/s/opensans/v18/mem5YaGs126MiZpBA-UNirkOUuhpKKSTjw.woff2'
});

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica-Light',
    fontSize: 10,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#1e293b',
    padding: 30,
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
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  contentSection: {
    padding: 40,
    paddingTop: 30,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 40,
  },
  infoBlock: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    borderLeft: '3px solid #3b82f6',
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
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
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    padding: 12,
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    breakInside: 'avoid',
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
    color: '#475569',
    fontStyle: 'italic',
    paddingTop: 4,
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  totalSection: {
    marginTop: 30,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    breakInside: 'avoid',
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
    color: '#64748b',
  },
  totalAmount: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    minWidth: 80,
    textAlign: 'right',
  },
  grandTotalRow: {
    borderTopWidth: 2,
    borderTopColor: '#3b82f6',
    paddingTop: 12,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  grandTotalAmount: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#3b82f6',
    minWidth: 80,
    textAlign: 'right',
  },
  footer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
  },
  footerText: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  accent: {
    color: '#3b82f6',
    fontFamily: 'Helvetica-Bold',
  },
  summaryRow: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    breakInside: 'avoid',
  },
  summaryCell: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
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
                    <Text style={{ fontSize: 10, color: '#1e293b' }}>{entry.beskrivelse || '-'}</Text>
                  </View>
                  <Text style={styles.numberCell}>{formatNumber(entry.antall)}</Text>
                  <Text style={styles.numberCell}>{formatCurrency(entry.enhetspris)}</Text>
                  <Text style={[styles.numberCell, { fontFamily: 'Helvetica-Bold', color: '#3b82f6' }]}>{formatCurrency(entry.sum)}</Text>
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
          <View style={styles.totalSection} wrap={false}>
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

        {/* Footer - only on last page */}
        <View style={styles.footer} fixed={false}>
          <Text style={styles.footerText}>
            Alle priser er oppgitt i NOK. Tilbudet er gyldig i 30 dager fra 14. juli 2025.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default QuotePDFModern;