import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
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
  coverPage: {
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  coverHeaderSection: {
    backgroundColor: '#f1f5f9',
    padding: 40,
    paddingBottom: 30,
  },
  coverCompanyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  coverCompanyName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  coverContactText: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'right',
  },
  coverMainSection: {
    padding: 40,
    paddingTop: 30,
  },
  coverTitle: {
    fontSize: 52,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 15,
    color: '#1e293b',
    letterSpacing: 2,
  },
  coverSubtitle: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 35,
  },
  coverInfoBox: {
    backgroundColor: '#f8fafc',
    padding: 25,
    borderRadius: 4,
    borderLeft: '4px solid #3b82f6',
  },
  coverInfoLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  coverInfoText: {
    fontSize: 12,
    color: '#1e293b',
    marginBottom: 6,
    lineHeight: 1.5,
  },
  coverText: {
    fontSize: 11,
    lineHeight: 1.7,
    marginBottom: 10,
    color: '#475569',
  },
  coverFooterSection: {
    backgroundColor: '#f1f5f9',
    padding: 40,
    paddingTop: 20,
  },
  coverFooterText: {
    fontSize: 9,
    color: '#64748b',
  },
  closingPage: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  closingHeader: {
    backgroundColor: '#f1f5f9',
    padding: 30,
    marginBottom: 40,
    borderRadius: 4,
  },
  closingTitle: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  closingContent: {
    flex: 1,
  },
  closingText: {
    fontSize: 11,
    lineHeight: 1.7,
    marginBottom: 10,
    color: '#475569',
  },
  closingContactSection: {
    marginTop: 40,
    padding: 25,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderLeft: '4px solid #3b82f6',
  },
  closingContactTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closingContactInfo: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 6,
    lineHeight: 1.5,
  },
  closingFooter: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '2px solid #e2e8f0',
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#f9fafb',
    padding: 25,
    marginBottom: 0,
    borderBottom: '1px solid #e2e8f0',
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
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    color: '#64748b',
  },
  contentSection: {
    padding: 25,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 20,
  },
  infoBlock: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 4,
    border: '1px solid #e2e8f0',
  },
  infoTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: '#1e293b',
  },
  infoText: {
    marginBottom: 4,
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.4,
  },
  table: {
    marginBottom: 20,
    borderRadius: 4,
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderBottom: '1px solid #e2e8f0',
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    fontSize: 9,
  },
  tableHeaderRight: {
    textAlign: 'right',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    breakInside: 'avoid',
  },
  tableRowMain: {
    flexDirection: 'row',
    padding: 8,
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc', 
  },
  tableRowComment: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 4,
  },
  postCell: {
    width: '15%',
    paddingRight: 4,
  },
  descriptionCell: {
    width: '45%',
    paddingRight: 4,
    flexGrow: 1,
  },
  numberCell: {
    width: '13%',
    textAlign: 'right',
    fontSize: 10,
    paddingLeft: 4,
    paddingRight: 4,
  },
  commentText: {
    fontSize: 9,
    color: '#64748b',
    fontStyle: 'italic'
  },
  totalSection: {
    marginTop: 15,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 4,
    border: '1px solid #e2e8f0',
    breakInside: 'avoid',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingVertical: 2,
  },
  totalLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  totalAmount: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    minWidth: 80,
    textAlign: 'right',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  grandTotalAmount: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    minWidth: 80,
    textAlign: 'right',
  },
  footer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    border: '1px solid #e2e8f0',
  },
  footerText: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  summaryRow: {
    backgroundColor: '#f1f5f9',
    breakInside: 'avoid',
  },
  summaryCell: {
    color: '#1e293b',
    fontFamily: 'Helvetica-Bold',
  },
  pageBreak: {
    height: 0,
    pageBreakAfter: 'always',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#94a3b8',
  },
});

interface QuotePDFModernProps {
  entries: CalculationEntry[];
  companyInfo: CompanyInfo;
  customerInfo: CustomerInfo;
  coverText?: string;
  closingText?: string;
}

const formatCurrency = (value: number): string => {
  return `${formatNumber(value)} kr`;
};

const QuotePDFModern: React.FC<QuotePDFModernProps> = ({ entries, companyInfo, customerInfo, coverText, closingText }) => {
  // Only filter out entries with zero values
  const validEntries = entries.filter(entry => entry.antall > 0 || entry.enhetspris > 0 || entry.sum > 0);

  const totalSum = validEntries.reduce((acc, entry) => acc + entry.sum, 0);
  const currentDate = new Date().toLocaleDateString('nb-NO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Calculate how many entries to show per page (approximately)
  // This is a rough estimate - adjust based on your needs
  const ENTRIES_PER_PAGE = 15; // Increased to better utilize page space
  const totalPages = Math.max(1, Math.ceil(validEntries.length / ENTRIES_PER_PAGE));
  
  // Split entries into pages
  const entriesByPage = [];
  for (let i = 0; i < totalPages; i++) {
    const pageEntries = validEntries.slice(i * ENTRIES_PER_PAGE, (i + 1) * ENTRIES_PER_PAGE);
    entriesByPage.push(pageEntries);
  }

  return (
    <Document>
      {/* Cover Page */}
      {coverText && (
        <Page size="A4" style={styles.coverPage}>
          <View style={styles.coverHeaderSection}>
            <View style={styles.coverCompanyInfo}>
              <Text style={styles.coverCompanyName}>{companyInfo.firma || 'Firma'}</Text>
              {companyInfo.logo && (
                <Image src={companyInfo.logo} style={{ width: 80, height: 'auto', maxHeight: 60 }} />
              )}
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

            <View style={{ marginTop: 20 }}>
              {coverText.split('\n').map((line, index) => (
                <Text key={index} style={styles.coverText}>{line || ' '}</Text>
              ))}
            </View>
          </View>

          <View style={styles.coverFooterSection}>
            <Text style={styles.coverFooterText}>Dato: {currentDate}</Text>
          </View>
        </Page>
      )}

      {entriesByPage.map((pageEntries, pageIndex) => (
        <Page key={`page-${pageIndex}`} size="A4" style={styles.page}>
          {/* Header Section - only on first page */}
          {pageIndex === 0 && (
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <Text style={styles.title}>{companyInfo.tilbudstittel || 'Tilbud'}</Text>
                  <Text style={styles.subtitle}>Tilbud fra {companyInfo.firma}</Text>
                  <Text style={styles.date}>{currentDate}</Text>
                </View>
                {companyInfo.logo && (
                  <View style={styles.headerRight}>
                    <Image src={companyInfo.logo} style={styles.logo} />
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Content Section with conditional rendering */}
          {pageEntries.length > 0 && (
            <View style={styles.contentSection}>
              {/* Info Section - only on first page */}
              {pageIndex === 0 && (
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
                    <Text style={styles.infoText}>{customerInfo.kunde || 'Kunde ikke spesifisert'}</Text>
                    {customerInfo.adresse && <Text style={styles.infoText}>{customerInfo.adresse}</Text>}
                    {customerInfo.epost && <Text style={styles.infoText}>{customerInfo.epost}</Text>}
                    {customerInfo.tlf && <Text style={styles.infoText}>{customerInfo.tlf}</Text>}
                  </View>
                </View>
              )}

              {/* Table */}
              <View style={styles.table}>
               <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.postCell]}>Post</Text>
                <Text style={[styles.tableHeaderCell, styles.descriptionCell]}>Beskrivelse</Text>
                <Text style={[styles.tableHeaderCell, styles.numberCell]}>Antall</Text>
                <Text style={[styles.tableHeaderCell, styles.numberCell]}>Enhetspris</Text>
                <Text style={[styles.tableHeaderCell, styles.numberCell]}>Sum</Text>
               </View>

                {pageEntries.map((entry, index) => (
                  <View key={`${entry.id}-${index}`} style={styles.tableRow}>
                    <View style={[styles.tableRowMain, index % 2 === 1 && styles.tableRowAlt]}>
                      <Text style={[styles.postCell, { fontSize: 10, color: '#475569' }]}>{entry.post || '-'}</Text>
                      <Text style={[styles.descriptionCell, { fontSize: 10, color: '#1e293b' }]}>{entry.beskrivelse || '-'}</Text>
                      <Text style={styles.numberCell}>{formatNumber(entry.antall)}</Text>
                      <Text style={styles.numberCell}>{formatCurrency(entry.enhetspris)}</Text>
                      <Text style={[styles.numberCell, { fontFamily: 'Helvetica-Bold' }]}>{formatCurrency(entry.sum)}</Text>
                    </View>
                    {entry.kommentar && (
                      <View style={[styles.tableRowComment, index % 2 === 1 ? { backgroundColor: '#f8fafc' } : {}]}>
                        <Text style={styles.commentText}>{entry.kommentar}</Text>
                      </View>
                    )}
                  </View>
                ))}

                {/* Summary Row - only on last page */}
                {pageIndex === entriesByPage.length - 1 && (
                  <View style={[styles.tableRow, styles.summaryRow]}>
                    <View style={styles.tableRowMain}>
                      <Text style={[styles.postCell, styles.summaryCell]}>TOTAL</Text>
                      <Text style={[styles.descriptionCell, styles.summaryCell]}></Text>
                      <Text style={[styles.numberCell, styles.summaryCell]}></Text>
                      <Text style={[styles.numberCell, styles.summaryCell]}></Text>
                      <Text style={[styles.numberCell, styles.summaryCell]}>{formatCurrency(totalSum)}</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Total Section - only on last page */}
              {pageIndex === entriesByPage.length - 1 && (
                <View style={styles.totalSection}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Totalt ekskl. mva</Text>
                    <Text style={styles.totalAmount}>{formatCurrency(totalSum)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { fontSize: 9 }]}>MVA 25%</Text>
                    <Text style={[styles.totalAmount, { fontSize: 9 }]}>{formatCurrency(totalSum * 0.25)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { fontSize: 9 }]}>Totalt inkl. mva</Text>
                    <Text style={[styles.totalAmount, { fontSize: 9 }]}>{formatCurrency(totalSum * 1.25)}</Text>
                  </View>
                </View>
              )}

              {/* Footer - only on last page */}
              {pageIndex === entriesByPage.length - 1 && (
                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Alle priser er oppgitt i NOK. Tilbudet er gyldig i 30 dager fra {currentDate}.
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {/* Page number indicator for multi-page documents */}
          {totalPages > 1 && (
            <Text style={styles.pageNumber}>Side {pageIndex + 1} av {totalPages}</Text>
          )}
        </Page>
      ))}

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

export default QuotePDFModern;