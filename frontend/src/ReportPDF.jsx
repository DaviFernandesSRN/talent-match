import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff', color: '#334155' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#4f46e5', paddingBottom: 10 },
  brand: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  subBrand: { fontSize: 10, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 2 },
  meta: { fontSize: 10, color: '#64748b', textAlign: 'right' },
  scoreCard: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 8, marginBottom: 25, borderLeftWidth: 5 },
  scoreTitle: { fontSize: 10, textTransform: 'uppercase', color: '#64748b', marginBottom: 4, fontWeight: 'bold' },
  scoreValue: { fontSize: 32, fontWeight: 'bold', color: '#0f172a' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#4f46e5', marginTop: 15, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 2 },
  text: { fontSize: 11, lineHeight: 1.5, marginBottom: 4, textAlign: 'justify' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#94a3b8' }
});

export const ReportPDF = ({ fileName, score, feedback }) => {
  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  
  const formatText = (rawText) => {
    if (!rawText) return null;
    return rawText.split('\n').map((line, index) => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith('##')) return <Text key={index} style={styles.sectionTitle}>{cleanLine.replace(/##/g, '').trim().toUpperCase()}</Text>;
      if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
        const content = cleanLine.replace(/[*|-]/g, '').replace(/\*\*/g, '').trim();
        return (
          <View key={index} style={{ flexDirection: 'row', marginBottom: 2 }}>
            <Text style={{ fontSize: 10, color: '#4f46e5', marginRight: 5 }}>•</Text>
            <Text style={styles.text}>{content}</Text>
          </View>
        );
      }
      if (cleanLine.length > 0) return <Text key={index} style={styles.text}>{cleanLine.replace(/\*\*/g, '')}</Text>;
      return null;
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>TalentMatch</Text>
            <Text style={styles.subBrand}>Relatório Técnico</Text>
          </View>
          <View>
            <Text style={styles.meta}>Data: {new Date().toLocaleDateString()}</Text>
            <Text style={styles.meta}>Candidato: {fileName || "Desconhecido"}</Text>
          </View>
        </View>

        <View style={[styles.scoreCard, { borderLeftColor: scoreColor }]}>
          <Text style={styles.scoreTitle}>Índice de Aderência (Match Score)</Text>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>{score}%</Text>
        </View>

        <View>{formatText(feedback)}</View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Relatório gerado por TalentMatch AI.</Text>
          <Text style={styles.footerText}>Confidencial</Text>
        </View>
      </Page>
    </Document>
  );
};