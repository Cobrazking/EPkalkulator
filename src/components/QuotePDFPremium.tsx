import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CalculationEntry, CompanyInfo, CustomerInfo } from '../types';
import { formatNumber } from '../utils/calculations';

const styles = StyleSheet.create({
  coverPage: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 0,
  },
  coverHeader: {
    padding: 40,
    paddingBottom: 20,
  },
  coverLogoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 60,
  },
  coverCompanyName: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  coverContact: {
    fontSize: 10,
    color: '#cccccc',
    textAlign: 'right',
  },
  coverMainSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  coverTitle: {
    fontSize: 64,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    marginBottom: 20,
    letterSpacing: 4,
  },
  coverSubtitle: {
    fontSize: 24,
    color: '#cccccc',
    marginBottom: 60,
  },
  coverInfoBox: {
    backgroundColor: '#2a2a2a',
    padding: 30,
    borderLeft: '4px solid #3b82f6',
  },
  coverInfoLabel: {
    fontSize: 10,
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  coverInfoText: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 1.4,
  },
  coverFooter: {
    padding: 40,
    paddingTop: 20,
    borderTop: '1px solid #333333',
  },
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottom: '2px solid #e5e7eb',
  },
  pageHeaderLeft: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  pageDate: {
    fontSize: 10,
    color: '#666666',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 30,
  },
  infoBlock: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 4,
    borderLeft: '3px solid #3b82f6',
  },
  infoTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
    color: '#1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoText: {
    marginBottom: 4,
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
  coverTextSection: {
    marginBottom: 30,
    backgroundColor: '#f9fafb',
    padding: 25,
    borderRadius: 4,
  },
  coverTextContent: {
    fontSize: 11,
    lineHeight: 1.8,
    color: '#374151',
    marginBottom: 8,
  },
  table: {
    marginBottom: 30,
    borderRadius: 4,
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 12,
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  tableRowMain: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-start',
  },
  tableRowComment: {
    paddingLeft: 24,
    paddingRight: 12,
    paddingBottom: 12,
  },
  postCell: {
    width: '12%',
    paddingRight: 8,
    flexShrink: 0,
  },
  descriptionCell: {
    width: '40%',
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
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 1.4,
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: '2px solid #e5e7eb',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
    paddingRight: 12,
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginRight: 20,
    color: '#374151',
  },
  totalAmount: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    width: '15%',
    textAlign: 'right',
    color: '#1a1a1a',
  },
  totalHighlight: {
    fontSize: 13,
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: 8,
    borderRadius: 4,
  },
  closingPage: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: 50,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  closingTitle: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    marginBottom: 40,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  closingContent: {
    flex: 1,
  },
  closingText: {
    fontSize: 11,
    lineHeight: 1.8,
    marginBottom: 12,
    color: '#cccccc',
  },
  closingContactSection: {
    marginTop: 50,
    paddingTop: 30,
    borderTop: '2px solid #333333',
  },
  closingContactTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closingContactInfo: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 8,
    lineHeight: 1.6,
  },
  closingFooter: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1px solid #333333',
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
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

interface QuotePDFPremiumProps {
  entries: CalculationEntry[];
  companyInfo: CompanyInfo;
  customerInfo: CustomerInfo;
  coverText?: string;
  closingText?: string;
}

const formatCurrency = (value: number): string => {
  return `${formatNumber(value)} kr`;
};

const QuotePDFPremium: React.FC<QuotePDFPremiumProps> = ({
  entries,
  companyInfo,
  customerInfo,
  coverText,
  closingText
}) => {
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
            <View style={styles.coverLogoSection}>
              <Text style={styles.coverCompanyName}>{companyInfo.firma || 'FIRMA'}</Text>
              <View>
                {companyInfo.epost && (
                  <Text style={styles.coverContact}>{companyInfo.epost}</Text>
                )}
                {companyInfo.tlf && (
                  <Text style={styles.coverContact}>{companyInfo.tlf}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.coverMainSection}>
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
          </View>

          <View style={styles.coverFooter}>
            <Text style={[styles.coverContact, { textAlign: 'left' }]}>
              Dato: {currentDate}
            </Text>
          </View>
        </Page>
      )}

      {/* Introduction/Cover Text Page */}
      {coverText && (
        <Page size="A4" style={styles.page}>
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderLeft}>
              <Text style={styles.pageTitle}>Introduksjon</Text>
              <Text style={styles.pageDate}>{currentDate}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoTitle}>Fra</Text>
              <Text style={styles.infoText}>{companyInfo.firma}</Text>
              {companyInfo.navn && <Text style={styles.infoText}>{companyInfo.navn}</Text>}
              {companyInfo.epost && <Text style={styles.infoText}>{companyInfo.epost}</Text>}
              {companyInfo.tlf && <Text style={styles.infoText}>{companyInfo.tlf}</Text>}
              {companyInfo.refNr && (
                <Text style={styles.infoText}>Ref.nr: {companyInfo.refNr}</Text>
              )}
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.infoTitle}>Til</Text>
              <Text style={styles.infoText}>{customerInfo.kunde || 'Kunde'}</Text>
              {customerInfo.adresse && <Text style={styles.infoText}>{customerInfo.adresse}</Text>}
              {customerInfo.epost && <Text style={styles.infoText}>{customerInfo.epost}</Text>}
              {customerInfo.tlf && <Text style={styles.infoText}>{customerInfo.tlf}</Text>}
            </View>
          </View>

          <View style={styles.coverTextSection}>
            {coverText.split('\n').map((line, index) => (
              <Text key={index} style={styles.coverTextContent}>{line || ' '}</Text>
            ))}
          </View>
        </Page>
      )}

      {/* Main Quote Page with Table */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderLeft}>
            <Text style={styles.pageTitle}>{companyInfo.tilbudstittel || 'Tilbud'}</Text>
            <Text style={styles.pageDate}>{currentDate}</Text>
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
            <View
              key={`${entry.id}-${index}`}
              style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
            >
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

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total sum eks. mva</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalSum)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>MVA 25%</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalSum * 0.25)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 8 }]}>
            <Text style={[styles.totalLabel, styles.totalHighlight]}>Total sum inkl. mva</Text>
            <Text style={[styles.totalAmount, styles.totalHighlight]}>
              {formatCurrency(totalSum * 1.25)}
            </Text>
          </View>
        </View>
      </Page>

      {/* Closing Page */}
      {closingText && (
        <Page size="A4" style={styles.closingPage}>
          <View style={styles.closingContent}>
            <Text style={styles.closingTitle}>Vilkår & Betingelser</Text>

            <View>
              {closingText.split('\n').map((line, index) => (
                <Text key={index} style={styles.closingText}>{line || ' '}</Text>
              ))}
            </View>

            <View style={styles.closingContactSection}>
              <Text style={styles.closingContactTitle}>Kontaktinformasjon</Text>
              {companyInfo.firma && (
                <Text style={styles.closingContactInfo}>{companyInfo.firma}</Text>
              )}
              {companyInfo.navn && (
                <Text style={styles.closingContactInfo}>{companyInfo.navn}</Text>
              )}
              {companyInfo.epost && (
                <Text style={styles.closingContactInfo}>E-post: {companyInfo.epost}</Text>
              )}
              {companyInfo.tlf && (
                <Text style={styles.closingContactInfo}>Telefon: {companyInfo.tlf}</Text>
              )}
            </View>
          </View>

          <View style={styles.closingFooter}>
            <Text>Vi ser frem til et godt samarbeid</Text>
          </View>
        </Page>
      )}
    </Document>
  );
};

export default QuotePDFPremium;
