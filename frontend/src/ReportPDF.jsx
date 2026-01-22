import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Estilos do PDF (Parecido com CSS, mas para o motor do PDF)
const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 40 },
  header: { marginBottom: 20, paddingBottom: 10, borderBottom: 2, borderBottomColor: '#4f46e5' }, // Roxo Indigo
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 10, color: '#666', marginTop: 4 },
  
  section: { margin: 10, padding: 10, flexGrow: 1 },
  
  scoreBox: { 
    padding: 20, 
    backgroundColor: '#f8fafc', 
    borderRadius: 8, 
    alignItems: 'center',
    marginVertical: 20 
  },
  scoreTitle: { fontSize: 12, color: '#64748b', textTransform: 'uppercase' },
  scoreValue: { fontSize: 48, fontWeight: 'bold', color: '#4f46e5' },
  scoreLabel: { fontSize: 14, color: '#334155' },

  feedbackSection: { marginTop: 20 },
  feedbackTitle: { fontSize: 18, marginBottom: 10, color: '#1e293b' },
  feedbackText: { fontSize: 12, lineHeight: 1.5, color: '#334155', textAlign: 'justify' },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 10, textAlign: 'center', color: '#94a3b8', borderTop: 1, borderTopColor: '#e2e8f0', paddingTop: 10 }
});

// Função para limpar o Markdown (Tirar os ** e ##) para o PDF ficar limpo
const cleanText = (text) => {
  if (!text) return "";
  return text.replace(/\*\*/g, '').replace(/###/g, '').replace(/__/g, '');
};

// O Componente do Documento
export const ReportPDF = ({ fileName, jobMode, score, feedback }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Text style={styles.title}>TalentMatch Report</Text>
        <Text style={styles.subtitle}>Relatório Técnico de Aderência Profissional</Text>
      </View>

      {/* DADOS GERAIS */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        <View>
          <Text style={{ fontSize: 10, color: '#94a3b8' }}>CANDIDATO (ARQUIVO)</Text>
          <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold' }}>{fileName || "Desconhecido"}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 10, color: '#94a3b8' }}>TIPO DE ANÁLISE</Text>
          <Text style={{ fontSize: 12 }}>{jobMode === 'pdf' ? "PDF vs PDF" : "PDF vs Texto"}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 10, color: '#94a3b8' }}>DATA</Text>
          <Text style={{ fontSize: 12 }}>{new Date().toLocaleDateString('pt-BR')}</Text>
        </View>
      </View>

      {/* PLACAR (SCORE) */}
      <View style={styles.scoreBox}>
        <Text style={styles.scoreTitle}>Match Score</Text>
        <Text style={{ ...styles.scoreValue, color: score >= 70 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626' }}>
          {score}%
        </Text>
        <Text style={styles.scoreLabel}>
          {score >= 70 ? "Excelente Aderência" : score >= 50 ? "Aderência Média" : "Baixa Aderência"}
        </Text>
      </View>

      {/* ANÁLISE DETALHADA */}
      <View style={styles.feedbackSection}>
        <Text style={styles.feedbackTitle}>Análise da IA</Text>
        <Text style={styles.feedbackText}>
          {cleanText(feedback)}
        </Text>
      </View>

      {/* RODAPÉ */}
      <Text style={styles.footer}>
        Gerado automaticamente por TalentMatch AI • Powered by Llama 3
      </Text>
    </Page>
  </Document>
);