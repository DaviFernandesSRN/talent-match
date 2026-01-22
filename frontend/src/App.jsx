import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF } from './ReportPDF'; // <--- Importando o gerador de PDF

function App() {
  const [file, setFile] = useState(null);
  
  // Estados para controlar as abas da Vaga
  const [jobMode, setJobMode] = useState('text'); // 'text' ou 'pdf'
  const [jobDescription, setJobDescription] = useState('');
  const [jobFile, setJobFile] = useState(null);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "TalentMatch | Recrutador IA";
  }, []);

  const handleAnalyze = async () => {
    // Validação: Tem currículo? Tem vaga (texto ou arquivo)?
    const hasJob = jobMode === 'text' ? jobDescription : jobFile;
    
    if (!file || !hasJob) {
      alert("⚠️ Por favor, anexe o Currículo e os dados da Vaga.");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    // Envia só o que o usuário escolheu na aba
    if (jobMode === 'text') {
      formData.append('jobDescription', jobDescription);
    } else {
      formData.append('jobFile', jobFile);
    }

    try {
      const apiUrl = 'https://talent-match-rc43.onrender.com/analisar';
      const response = await fetch(apiUrl, { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Erro desconhecido");

      setResult(data);
    } catch (error) {
      console.error(error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-500">
      
      {/* HEADER */}
      <nav className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-indigo-100 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎯</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">TalentMatch</h1>
          </div>
          <div className="text-xs font-semibold text-indigo-400 dark:text-indigo-300 uppercase tracking-wider hidden sm:block">
            Powered by AI Llama 3
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">
        <div className="text-center mb-12 max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Encontre o candidato <br/><span className="text-indigo-600 dark:text-indigo-400">perfeito em segundos.</span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            Análise semântica avançada de currículos e vagas com Inteligência Artificial.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          
          {/* 1. CARD CANDIDATO */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-indigo-50 dark:border-slate-700 transition-colors duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-300">📄</div>
              <label className="font-bold text-lg text-slate-700 dark:text-slate-200">1. Currículo (PDF)</label>
            </div>
            <div className="relative group h-64">
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className={`border-2 border-dashed rounded-2xl h-full flex flex-col items-center justify-center text-center p-6 transition-all 
                ${file 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400' 
                  : 'border-slate-200 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}>
                {file ? (
                  <>
                    <span className="text-5xl mb-4 animate-bounce">📎</span>
                    <p className="font-semibold text-indigo-700 dark:text-indigo-300 text-lg truncate w-full">{file.name}</p>
                  </>
                ) : (
                  <>
                    <span className="text-5xl mb-4 text-slate-300 dark:text-slate-500">☁️</span>
                    <p className="font-medium text-slate-600 dark:text-slate-300 text-lg">Arraste o Currículo</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 2. CARD VAGA (COM ABAS) */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-purple-50 dark:border-slate-700 transition-colors duration-500 flex flex-col">
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-300">💼</div>
                <label className="font-bold text-lg text-slate-700 dark:text-slate-200">2. Vaga</label>
              </div>
              
              {/* BOTÕES DE ABA */}
              <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                <button 
                  onClick={() => setJobMode('text')}
                  className={`px-3 py-1 text-sm font-bold rounded-md transition-all ${jobMode === 'text' ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-300 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Texto
                </button>
                <button 
                  onClick={() => setJobMode('pdf')}
                  className={`px-3 py-1 text-sm font-bold rounded-md transition-all ${jobMode === 'pdf' ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-300 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  PDF
                </button>
              </div>
            </div>

            {/* CONTEÚDO DA VAGA (Muda conforme a aba) */}
            {jobMode === 'text' ? (
              <textarea
                className="w-full h-64 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:border-purple-500 dark:focus:border-purple-400 outline-none resize-none transition-all text-slate-600 dark:text-slate-200"
                placeholder="Cole os requisitos da vaga aqui..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              ></textarea>
            ) : (
              <div className="relative group h-64">
                <input type="file" accept=".pdf" onChange={(e) => setJobFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className={`border-2 border-dashed rounded-2xl h-full flex flex-col items-center justify-center text-center p-6 transition-all 
                  ${jobFile 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400' 
                    : 'border-slate-200 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}>
                  {jobFile ? (
                    <>
                      <span className="text-5xl mb-4 animate-bounce text-purple-500">📎</span>
                      <p className="font-semibold text-purple-700 dark:text-purple-300 text-lg truncate w-full">{jobFile.name}</p>
                      <p className="text-xs text-purple-400 mt-2">PDF da Vaga selecionado</p>
                    </>
                  ) : (
                    <>
                      <span className="text-5xl mb-4 text-slate-300 dark:text-slate-500">☁️</span>
                      <p className="font-medium text-slate-600 dark:text-slate-300 text-lg">Arraste o PDF da Vaga</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <button onClick={handleAnalyze} disabled={loading} className={`w-full md:w-auto px-12 py-5 rounded-full font-bold text-lg text-white shadow-lg transition-all hover:-translate-y-1 ${loading ? "bg-slate-400 cursor-wait" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/50"}`}>
          {loading ? "Analisando..." : "✨ Analisar Compatibilidade"}
        </button>

        {/* RESULTADO + BOTÃO DOWNLOAD */}
        {result && (
          <div className="mt-16 w-full max-w-3xl animate-fade-in-up">
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
              
              {/* Score Header */}
              <div className={`${result.nota >= 70 ? 'bg-green-50 dark:bg-green-900/20' : result.nota >= 50 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-red-50 dark:bg-red-900/20'} p-10 text-center border-b border-slate-100 dark:border-slate-700`}>
                <p className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs font-bold mb-4">Match Score</p>
                <div className={`text-7xl font-black mb-2 ${result.nota >= 70 ? 'text-green-600 dark:text-green-400' : result.nota >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  {result.nota}%
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">
                  {result.nota >= 70 ? "🚀 Excelente Aderência" : result.nota >= 50 ? "⚠️ Aderência Média" : "❌ Baixa Aderência"}
                </p>
              </div>

              {/* Feedback da IA */}
              <div className="p-10 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">🤖</div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">Análise da IA</h3>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <ReactMarkdown 
                    components={{
                      strong: ({node, ...props}) => <span className="font-bold text-indigo-700 dark:text-indigo-400" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />
                    }}
                  >
                    {result.feedback}
                  </ReactMarkdown>
                </div>
              </div>

              {/* BOTÃO EXPORTAR PDF (Rodapé do Card) */}
              <div className="bg-slate-50 dark:bg-slate-900 px-10 py-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <PDFDownloadLink
                  document={
                    <ReportPDF 
                      fileName={file?.name} 
                      jobMode={jobMode} 
                      score={result.nota} 
                      feedback={result.feedback} 
                    />
                  }
                  fileName={`TalentMatch_${file?.name ? file.name.split('.')[0] : 'Relatorio'}.pdf`}
                >
                  {({ loading }) => (
                    <button 
                      disabled={loading}
                      className="flex items-center gap-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1"
                    >
                      {loading ? 'Gerando PDF...' : (
                        <>
                          <span>📄</span> Baixar Parecer Técnico
                        </>
                      )}
                    </button>
                  )}
                </PDFDownloadLink>
              </div>

            </div>
          </div>
        )}

      </main>
      <footer className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">&copy; 2024 TalentMatch AI</footer>
    </div>
  );
}

export default App;