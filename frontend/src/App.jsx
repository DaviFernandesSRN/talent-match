import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF } from './ReportPDF';

function App() {
  const [file, setFile] = useState(null);
  
  // Estados para controlar as abas da Vaga
  const [jobMode, setJobMode] = useState('text'); // 'text' ou 'pdf'
  const [jobDescription, setJobDescription] = useState('');
  const [jobFile, setJobFile] = useState(null);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "TalentMatch | Enterprise Dashboard";
  }, []);

  const handleAnalyze = async () => {
    const hasJob = jobMode === 'text' ? jobDescription : jobFile;
    
    if (!file || !hasJob) {
      alert("⚠️ Por favor, anexe o Currículo e os dados da Vaga.");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    if (jobMode === 'text') {
      formData.append('jobDescription', jobDescription);
    } else {
      formData.append('jobFile', jobFile);
    }

    try {
      // URL do seu backend (ajuste se estiver testando local)
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-hidden">
      
      {/* 1. SIDEBAR (BARRA LATERAL) - O "Cockpit" */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <h1 className="text-xl font-bold tracking-tight">TalentMatch <span className="text-xs text-indigo-400 block font-normal">Enterprise Edition</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Menu Principal</div>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 rounded-xl text-white font-medium shadow-lg shadow-indigo-900/50">
            <span>🚀</span> Nova Análise
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
            <span>📂</span> Histórico
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
            <span>⚙️</span> Configurações
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">A</div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-slate-500">Recruiter Lead</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL (MAIN CONTENT) */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Header Mobile (Só aparece em telas pequenas) */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
          <span className="font-bold">TalentMatch</span>
          <span>☰</span>
        </header>

        <div className="max-w-5xl mx-auto p-6 lg:p-12">
          
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Painel de Recrutamento</h2>
            <p className="text-slate-500 dark:text-slate-400">Configure os parâmetros abaixo para iniciar a análise de aderência.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* INPUT CURRÍCULO */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <span className="bg-indigo-100 dark:bg-indigo-900 p-1 rounded text-indigo-600">1</span> Currículo (Candidato)
                </label>
              </div>
              <div className="relative group h-40">
                <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className={`border-2 border-dashed rounded-xl h-full flex flex-col items-center justify-center text-center p-4 transition-all 
                  ${file 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}>
                  {file ? (
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-medium">
                      <span>📄</span> {file.name}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm">Arraste ou clique para enviar PDF</span>
                  )}
                </div>
              </div>
            </div>

            {/* INPUT VAGA */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <span className="bg-purple-100 dark:bg-purple-900 p-1 rounded text-purple-600">2</span> Descrição da Vaga
                </label>
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                  <button onClick={() => setJobMode('text')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${jobMode === 'text' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400'}`}>Texto</button>
                  <button onClick={() => setJobMode('pdf')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${jobMode === 'pdf' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400'}`}>PDF</button>
                </div>
              </div>

              {jobMode === 'text' ? (
                <textarea
                  className="w-full h-40 p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none dark:text-white"
                  placeholder="Cole os requisitos aqui..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                ></textarea>
              ) : (
                <div className="relative group h-40">
                  <input type="file" accept=".pdf" onChange={(e) => setJobFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-xl h-full flex flex-col items-center justify-center text-center p-4 transition-all 
                    ${jobFile 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}>
                    {jobFile ? (
                      <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-medium">
                        <span>💼</span> {jobFile.name}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">Arraste o PDF da Vaga</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="flex justify-end mb-12 border-b border-slate-200 dark:border-slate-700 pb-8">
            <button 
              onClick={handleAnalyze} 
              disabled={loading} 
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-95
                ${loading ? "bg-slate-400 cursor-wait" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30"}
              `}
            >
              {loading ? (
                <>⏳ Processando IA...</>
              ) : (
                <>✨ Executar Análise de Match</>
              )}
            </button>
          </div>

          {/* RESULTADOS (DASHBOARD STYLE) */}
          {result && (
            <div className="animate-fade-in-up space-y-6 pb-20">
              
              {/* SCORE CARD COM PROGRESS BAR */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center gap-8">
                <div className="text-center md:text-left min-w-[200px]">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Aderência Geral</p>
                  <div className="text-5xl font-black text-slate-800 dark:text-white">{result.nota}%</div>
                </div>
                
                {/* A Barra de Progresso Visual que a Carol pediu */}
                <div className="flex-1 w-full">
                   <div className="flex justify-between text-sm mb-2 font-medium">
                      <span className="text-red-500">Baixa</span>
                      <span className="text-yellow-500">Média</span>
                      <span className="text-green-500">Alta</span>
                   </div>
                   <div className="w-full h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          result.nota >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 
                          result.nota >= 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 
                          'bg-gradient-to-r from-red-500 to-pink-500'
                        }`}
                        style={{ width: `${result.nota}%` }}
                      ></div>
                   </div>
                   <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
                      {result.nota >= 70 ? "✅ Candidato altamente recomendado para a fase de entrevistas." : 
                       result.nota >= 50 ? "⚠️ Candidato com potencial, mas requer validação técnica." : 
                       "❌ Perfil distante dos requisitos mandatórios."}
                   </p>
                </div>
              </div>

              {/* REPORT CARD */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    🤖 Parecer Técnico da IA
                  </h3>
                  
                  {/* BOTÃO EXPORTAR PDF */}
                  <PDFDownloadLink
                    document={
                      <ReportPDF 
                        fileName={file?.name} 
                        jobMode={jobMode} 
                        score={result.nota} 
                        feedback={result.feedback} 
                      />
                    }
                    fileName={`TalentMatch_Report.pdf`}
                  >
                    {({ loading }) => (
                      <button disabled={loading} className="text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-md shadow-sm hover:bg-slate-50 transition-colors text-slate-600 dark:text-slate-200 font-medium">
                        {loading ? 'Gerando...' : '📥 Baixar PDF'}
                      </button>
                    )}
                  </PDFDownloadLink>
                </div>
                
                <div className="p-8 prose prose-slate dark:prose-invert max-w-none">
                  <ReactMarkdown>{result.feedback}</ReactMarkdown>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;