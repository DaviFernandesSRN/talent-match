import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// --- ESTILOS DO PDF (Parecido com CSS, mas para Impressão) ---
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    color: '#334155', // Slate-700
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5', // Indigo-600
    paddingBottom: 10,
  },
  brand: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b', // Slate-800
  },
  subBrand: {
    fontSize: 10,
    color: '#6366f1', // Indigo-500
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  meta: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
  },
  scoreCard: {
    backgroundColor: '#f8fafc', // Slate-50
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
    borderLeftWidth: 5,
    // A cor da borda será dinâmica no código
  },
  scoreTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#64748b',
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  scoreValue: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#4f46e5', // Indigo-600 (Cor da marca)
    marginTop: 15,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 2,
  },
  text: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 4,
    textAlign: 'justify',
  },
  bullet: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 4,
    paddingLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  }
});

// --- COMPONENTE DO PDF ---
export const ReportPDF = ({ fileName, jobMode, score, feedback }) => {
  
  // Define a cor baseada na nota
  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  
  // FUNÇÃO MÁGICA: Converte Markdown simples em Componentes PDF
  const formatText = (rawText) => {
    if (!rawText) return null;
    
    return rawText.split('\n').map((line, index) => {
      const cleanLine = line.trim();
      
      // 1. Títulos (##)
      if (cleanLine.startsWith('##')) {
        return (
          <Text key={index} style={styles.sectionTitle}>
            {cleanLine.replace(/##/g, '').trim().toUpperCase()}
          </Text>
        );
      }
      
      // 2. Bullet Points (* ou -)
      if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
        // Remove os **bold** do markdown para não poluir, já que o PDF padrão não suporta negrito no meio da string fácil
        const content = cleanLine.replace(/[*|-]/g, '').replace(/\*\*/g, '').trim();
        return (
          <View key={index} style={{ flexDirection: 'row', marginBottom: 2 }}>
            <Text style={{ fontSize: 10, color: '#4f46e5', marginRight: 5 }}>•</Text>
            <Text style={styles.text}>{content}</Text>
          </View>
        );
      }
      
      // 3. Texto Normal (remove negrito ** para ficar limpo)
      if (cleanLine.length > 0) {
        return <Text key={index} style={styles.text}>{cleanLine.replace(/\*\*/g, '')}</Text>;
      }

      return null;
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>TalentMatch</Text>
            <Text style={styles.subBrand}>Auditoria Técnica</Text>
          </View>
          <View>
            <Text style={styles.meta}>Gerado em: {new Date().toLocaleDateString()}</Text>
            <Text style={styles.meta}>Candidato: {fileName || "Desconhecido"}</Text>
          </View>
        </View>

        {/* SCORE CARD */}
        <View style={[styles.scoreCard, { borderLeftColor: scoreColor }]}>
          <Text style={styles.scoreTitle}>Índice de Aderência (Match Score)</Text>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>{score}%</Text>
          <Text style={{ fontSize: 10, color: '#64748b', marginTop: 5 }}>
            {score >= 70 ? "Recomendação: ALTA (Entrevista Prioritária)" : 
             score >= 40 ? "Recomendação: MÉDIA (Investigar Gaps)" : 
             "Recomendação: BAIXA (Perfil Distante)"}
          </Text>
        </View>

        {/* CONTEÚDO DA IA FORMATADO */}
        <View>
          {formatText(feedback)}
        </View>

        {/* RODAPÉ */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Relatório gerado por Inteligência Artificial (Llama-3).</Text>
          <Text style={styles.footerText}>Confidencial - Uso Interno</Text>
        </View>

      </Page>
    </Document>
  );
};