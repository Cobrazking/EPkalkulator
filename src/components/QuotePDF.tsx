import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { CalculationEntry, CompanyInfo, CustomerInfo } from '../types';
import { formatNumber } from '../utils/calculations';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
  },
  coverPage: {
    padding: 60,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#333',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#111',
    textAlign: 'center',
  },
  coverText: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 10,
    color: '#333',
  },
  closingPage: {
    padding: 60,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#333',
  },
  closingText: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 10,
    color: '#333',
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    width: 120,
  },
  logo: {
    width: '100%',
    maxHeight: 60,
    objectFit: 'contain',
  },
  title: {
    fontSize: 24,
    marginBottom: 4,
    color: '#111',
  },
  date: {
    fontSize: 10,
    color: '#666',
    marginBottom: 20,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoBlock: {
    maxWidth: '45%',
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111',
    textTransform: 'uppercase',
  },
  infoText: {
    marginBottom: 4,
    fontSize: 10,
  },
  table: {
    marginBottom: 30,
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#111',
  },
  tableRow: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    breakInside: 'avoid',
  },
  tableRowMain: {
    flexDirection: 'row',
    padding: 8,
    flexWrap: 'nowrap',
    alignItems: 'flex-start',
  },
  tableRowComment: {
    marginTop: 4,
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
  },
  postCell: {
    width: '12%',
    paddingRight: 8,
    flexShrink: 0,
  },
  descriptionCell: {
    width: '38%',
    paddingRight: 8,
    flexShrink: 0,
    flexGrow: 1,
  },
  numberCell: {
    width: '12%',
    textAlign: 'right',
    flexShrink: 0,
  },
  commentText: {
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
    paddingTop: 4,
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 10,
    breakInside: 'avoid',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  totalAmount: {
    fontWeight: 'bold',
    width: '15%',
    textAlign: 'right',
  },
  footer: {
    marginTop: 30,
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  text: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  textWrap: {
    maxWidth: '100%',
    wordBreak: 'break-word',
  },
});

interface QuotePDFProps {
  entries: CalculationEntry[];
  companyInfo: CompanyInfo;
  customerInfo: CustomerInfo;
  coverText?: string;
  closingText?: string;
}

const formatCurrency = (value: number): string => {
  return `${formatNumber(value)} Kr`;
};

const QuotePDF: React.FC<QuotePDFProps> = ({ entries, companyInfo, customerInfo, coverText, closingText }) => {
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
      {/* Cover Page */}
      {coverText && (
        <Page size="A4" style={styles.coverPage}>
          <Text style={styles.coverTitle}>TILBUD</Text>
          <View>
            {coverText.split('\n').map((line, index) => (
              <Text key={index} style={styles.coverText}>{line}</Text>
            ))}
          </View>
        </Page>
      )}

      {/* Main Quote Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{companyInfo.tilbudstittel || 'Tilbud'}</Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
          {companyInfo.logo && (
            <View style={styles.headerRight}>
              <Image src={companyInfo.logo} style={styles.logo} />
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Utsteder</Text>
            <Text style={styles.infoText}>{companyInfo.firma}</Text>
            <Text style={styles.infoText}>{companyInfo.navn}</Text>
            <Text style={styles.infoText}>{companyInfo.epost}</Text>
            <Text style={styles.infoText}>{companyInfo.tlf}</Text>
            {companyInfo.refNr && (
              <Text style={styles.infoText}>Ref.nr: {companyInfo.refNr}</Text>
            )}
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Kunde</Text>
            <Text style={styles.infoText}>{customerInfo.kunde || ''}</Text>
            {customerInfo.adresse && <Text style={styles.infoText}>{customerInfo.adresse}</Text>}
            {customerInfo.epost && <Text style={styles.infoText}>{customerInfo.epost}</Text>}
            {customerInfo.tlf && <Text style={styles.infoText}>{customerInfo.tlf}</Text>}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.postCell]}>Post</Text>
            <Text style={[styles.tableHeaderCell, styles.descriptionCell]}>Beskrivelse</Text>
            <Text style={[styles.tableHeaderCell, styles.numberCell]}>Antall</Text>
            <Text style={[styles.tableHeaderCell, styles.numberCell]}>Enhetspris</Text>
            <Text style={[styles.tableHeaderCell, styles.numberCell]}>Sum</Text>
          </View>

          {validEntries.map((entry, index) => (
            <View key={`${entry.id}-${index}`} style={[styles.tableRow, index % 2 === 0 && { backgroundColor: '#f9fafb' }]}>
              <View style={styles.tableRowMain}>
                <View style={styles.postCell}>
                  <Text style={[styles.text, styles.textWrap]}>{entry.post || '-'}</Text>
                </View>
                <View style={styles.descriptionCell}>
                  <Text style={[styles.text, styles.textWrap]}>{entry.beskrivelse || '-'}</Text>
                </View>
                <Text style={styles.numberCell}>{formatNumber(entry.antall)}</Text>
                <Text style={styles.numberCell}>{formatCurrency(entry.enhetspris)}</Text>
                <Text style={styles.numberCell}>{formatCurrency(entry.sum)}</Text>
              </View>
              {entry.kommentar && (
                <View style={styles.tableRowComment}>
                  <Text style={[styles.commentText, styles.textWrap]}>{entry.kommentar}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.totalSection} wrap={false}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total sum eks. mva</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalSum)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>MVA 25%</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalSum * 0.25)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total sum inkl. mva</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalSum * 1.25)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Alle priser er oppgitt i NOK. Tilbudet er gyldig i 30 dager fra 14. juli 2025.
          </Text>
        </View>
      </Page>

      {/* Closing Page */}
      {closingText && (
        <Page size="A4" style={styles.closingPage}>
          <View>
            {closingText.split('\n').map((line, index) => (
              <Text key={index} style={styles.closingText}>{line}</Text>
            ))}
          </View>

          {companyInfo.firma && (
            <View style={{ marginTop: 40 }}>
              <Text style={styles.closingText}>{companyInfo.firma}</Text>
              {companyInfo.navn && <Text style={styles.closingText}>{companyInfo.navn}</Text>}
              {companyInfo.epost && <Text style={styles.closingText}>{companyInfo.epost}</Text>}
              {companyInfo.tlf && <Text style={styles.closingText}>{companyInfo.tlf}</Text>}
            </View>
          )}
        </Page>
      )}
    </Document>
  );
};

export default QuotePDF;