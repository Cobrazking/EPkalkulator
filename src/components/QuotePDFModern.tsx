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
    backgroundColor: '#f8fafc',
    padding: 30,
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
    padding: 30,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 20,
  },
  infoBlock: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 4,
    border: '1px solid #e2e8f0',
  },
  infoTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    color: '#1e293b',
  },
  infoText: {
    marginBottom: 5,
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.4,
  },
  table: {
    marginBottom: 30,
    borderRadius: 4,
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderBottom: '1px solid #e2e8f0',
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    fontSize: 9,
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    breakInside: 'avoid',
  },
  tableRowMain: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#ffffff',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc', 
  },
  tableRowComment: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 10,
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
    backgroundColor: '#f8fafc',
    padding: 6,
    borderRadius: 4,
    marginTop: 4,
  },
  totalSection: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 4,
    border: '1px solid #e2e8f0',
    breakInside: 'avoid',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 3,
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
    paddingTop: 10,
    marginTop: 6,
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
    marginTop: 30,
    padding: 15,
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
    bottom: 20,
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

  // Calculate how many entries to show per page (approximately)
  // This is a rough estimate - adjust based on your needs
  const ENTRIES_PER_PAGE = 15;
  const totalPages = Math.ceil(validEntries.length / ENTRIES_PER_PAGE);
  
  // Split entries into pages
  const entriesByPage = Array.from({ length: totalPages }, (_, i) => 
    validEntries.slice(i * ENTRIES_PER_PAGE, (i + 1) * ENTRIES_PER_PAGE)
  );

  return (
    <Document>
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

          {/* Content Section */}
          <View style={styles.contentSection}>
            {/* Info Section - only on first page */}
            {pageIndex === 0 && (
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
            )}

            {/* Page number indicator for multi-page documents */}
            {totalPages > 1 && (
              <Text style={styles.pageNumber}>Side {pageIndex + 1} av {totalPages}</Text>
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
                    <View style={styles.postCell}>
                      <Text style={{ fontSize: 10, color: '#475569' }}>{entry.post || '-'}</Text>
                    </View>
                    <View style={styles.descriptionCell}>
                      <Text style={{ fontSize: 10, color: '#1e293b' }}>{entry.beskrivelse || '-'}</Text>
                    </View>
                    <Text style={styles.numberCell}>{formatNumber(entry.antall)}</Text>
                    <Text style={styles.numberCell}>{formatCurrency(entry.enhetspris)}</Text>
                    <Text style={[styles.numberCell, { fontFamily: 'Helvetica-Bold' }]}>{formatCurrency(entry.sum)}</Text>
                  </View>
                  {entry.kommentar && (
                    <View style={[styles.tableRowComment, index % 2 === 1 && styles.tableRowAlt]}>
                      <Text style={styles.commentText}>{entry.kommentar}</Text>
                    </View>
                  )}
                </View>
              ))}

              {/* Summary Row - only on last page */}
              {pageIndex === entriesByPage.length - 1 && (
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
              )}
            </View>

            {/* Total Section - only on last page */}
            {pageIndex === entriesByPage.length - 1 && (
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
            )}

            {/* Footer - only on last page */}
            {pageIndex === entriesByPage.length - 1 && (
              <View style={styles.footer} fixed={false}>
                <Text style={styles.footerText}>
                  Alle priser er oppgitt i NOK. Tilbudet er gyldig i 30 dager fra {currentDate}.
                </Text>
              </View>
            )}
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default QuotePDFModern;