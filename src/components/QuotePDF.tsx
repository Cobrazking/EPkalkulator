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
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  coverHeader: {
    marginBottom: 40,
    paddingBottom: 20,
    borderBottom: '2px solid #e5e7eb',
  },
  coverCompanyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  coverCompanyName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  coverContactText: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'right',
  },
  coverMain: {
    flex: 1,
    justifyContent: 'center',
  },
  coverTitle: {
    fontSize: 48,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 20,
    color: '#1a1a1a',
    letterSpacing: 2,
  },
  coverSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
  },
  coverInfoBox: {
    backgroundColor: '#f9fafb',
    padding: 25,
    borderLeft: '4px solid #3b82f6',
    marginTop: 30,
  },
  coverInfoLabel: {
    fontSize: 10,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  coverInfoText: {
    fontSize: 12,
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 1.5,
  },
  coverText: {
    fontSize: 11,
    lineHeight: 1.7,
    marginBottom: 10,
    color: '#374151',
  },
  coverFooter: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1px solid #e5e7eb',
    fontSize: 9,
    color: '#666666',
  },
  closingPage: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  closingHeader: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2px solid #e5e7eb',
  },
  closingTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  closingContent: {
    flex: 1,
  },
  closingText: {
    fontSize: 11,
    lineHeight: 1.7,
    marginBottom: 10,
    color: '#374151',
  },
  closingContactSection: {
    marginTop: 40,
    padding: 25,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  closingContactTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closingContactInfo: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 6,
    lineHeight: 1.5,
  },
  closingFooter: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1px solid #e5e7eb',
    fontSize: 9,
    color: '#666666',
    textAlign: 'center',
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
          <View style={styles.coverHeader}>
            <View style={styles.coverCompanyInfo}>
              <Text style={styles.coverCompanyName}>{companyInfo.firma || 'Firma'}</Text>
              <View>
                {companyInfo.epost && (
                  <Text style={styles.coverContactText}>{companyInfo.epost}</Text>
                )}
                {companyInfo.tlf && (
                  <Text style={styles.coverContactText}>{companyInfo.tlf}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.coverMain}>
            <Text style={styles.coverTitle}>TILBUD</Text>
            <Text style={styles.coverSubtitle}>{companyInfo.tilbudstittel || 'Pristilbud'}</Text>

            <View style={styles.coverInfoBox}>
              <Text style={styles.coverInfoLabel}>Tilbud til</Text>
              <Text style={styles.coverInfoText}>{customerInfo.kunde || 'Kunde'}</Text>
              {customerInfo.adresse && (
                <Text style={styles.coverInfoText}>{customerInfo.adresse}</Text>
              )}
              {customerInfo.epost && (
                <Text style={styles.coverInfoText}>{customerInfo.epost}</Text>
              )}
              {customerInfo.tlf && (
                <Text style={styles.coverInfoText}>{customerInfo.tlf}</Text>
              )}
            </View>

            <View style={{ marginTop: 30 }}>
              {coverText.split('\n').map((line, index) => (
                <Text key={index} style={styles.coverText}>{line || ' '}</Text>
              ))}
            </View>
          </View>

          <View style={styles.coverFooter}>
            <Text>Dato: {currentDate}</Text>
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
          <View style={styles.closingHeader}>
            <Text style={styles.closingTitle}>Vilkår & Betingelser</Text>
          </View>

          <View style={styles.closingContent}>
            <View>
              {closingText.split('\n').map((line, index) => (
                <Text key={index} style={styles.closingText}>{line || ' '}</Text>
              ))}
            </View>

            {companyInfo.firma && (
              <View style={styles.closingContactSection}>
                <Text style={styles.closingContactTitle}>Kontaktinformasjon</Text>
                <Text style={styles.closingContactInfo}>{companyInfo.firma}</Text>
                {companyInfo.navn && <Text style={styles.closingContactInfo}>{companyInfo.navn}</Text>}
                {companyInfo.epost && <Text style={styles.closingContactInfo}>E-post: {companyInfo.epost}</Text>}
                {companyInfo.tlf && <Text style={styles.closingContactInfo}>Telefon: {companyInfo.tlf}</Text>}
              </View>
            )}
          </View>

          <View style={styles.closingFooter}>
            <Text>Vi ser frem til et godt samarbeid</Text>
          </View>
        </Page>
      )}
    </Document>
  );
};

export default QuotePDF;