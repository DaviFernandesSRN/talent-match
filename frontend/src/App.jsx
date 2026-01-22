import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF } from './ReportPDF';

function App() {
  const [file, setFile] = useState(null);
  
  // Controle de Tema (Dark/Light)
  const [darkMode, setDarkMode] = useState(false);

  // Estados para controlar as abas da Vaga
  const [jobMode, setJobMode] = useState('text'); // 'text' ou 'pdf'
  const [jobDescription, setJobDescription] = useState('');
  const [jobFile, setJobFile] = useState(null);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Efeito para aplicar a classe 'dark' no HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
      // URL do Backend
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
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* 1. SIDEBAR (BARRA LATERAL) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 hidden md:flex border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-lg">🎯</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">TalentMatch</h1>
            <span className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider block">Enterprise Edition</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2 mt-4">Navegação</div>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl font-medium transition-all hover:bg-indigo-600 hover:text-white">
            <span>🚀</span> Nova Análise
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
            <span>📂</span> Histórico
          </button>
          
          {/* TOGGLE DARK MODE NA SIDEBAR */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors mt-4"
          >
            <span>{darkMode ? '☀️' : '🌙'}</span> 
            {darkMode ? 'Modo Claro' : 'Modo Escuro'}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg">A</div>
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-slate-400">Recruiter Lead</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL (MAIN CONTENT) */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        
        {/* Header Mobile */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
          <span className="font-bold flex items-center gap-2">🎯 TalentMatch</span>
          <button onClick={() => setDarkMode(!darkMode)} className="text-xl">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        <div className="max-w-5xl mx-auto p-6 lg:p-12">
          
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Painel de Auditoria</h2>
              <p className="text-slate-500 dark:text-slate-400">Mapeamento de gaps e evidências técnicas.</p>
            </div>
            <div className="hidden md:block">
              <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-800">
                ● Sistema Operacional
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* CARD 1: CURRÍCULO */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:border-indigo-400 dark:hover:border-indigo-500 group">
              <div className="flex justify-between items-center mb-4">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 w-6 h-6 flex items-center justify-center rounded text-xs font-bold">1</span> 
                  Currículo
                </label>
              </div>
              <div className="relative h-48">
                <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className={`border-2 border-dashed rounded-xl h-full flex flex-col items-center justify-center text-center p-4 transition-all duration-300
                  ${file 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 group-hover:border-indigo-400'
                  }`}>
                  {file ? (
                    <div className="flex flex-col items-center gap-2 animate-fade-in">
                      <span className="text-3xl">📄</span>
                      <p className="font-medium text-indigo-700 dark:text-indigo-300 truncate max-w-[200px]">{file.name}</p>
                      <span className="text-xs text-indigo-500 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded">PDF Carregado</span>
                    </div>
                  ) : (
                    <div className="text-slate-400 dark:text-slate-500">
                      <span className="text-3xl block mb-2 opacity-50">☁️</span>
                      <span className="text-sm font-medium">Arraste ou clique para enviar</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CARD 2: VAGA */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:border-purple-400 dark:hover:border-purple-500">
              <div className="flex justify-between items-center mb-4">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 w-6 h-6 flex items-center justify-center rounded text-xs font-bold">2</span> 
                  Vaga
                </label>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  <button onClick={() => setJobMode('text')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${jobMode === 'text' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Texto</button>
                  <button onClick={() => setJobMode('pdf')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${jobMode === 'pdf' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>PDF</button>
                </div>
              </div>

              {jobMode === 'text' ? (
                <textarea
                  className="w-full h-48 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                  placeholder="Cole os requisitos da vaga aqui..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                ></textarea>
              ) : (
                <div className="relative h-48 group">
                  <input type="file" accept=".pdf" onChange={(e) => setJobFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-xl h-full flex flex-col items-center justify-center text-center p-4 transition-all 
                    ${jobFile 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}>
                    {jobFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">💼</span>
                        <p className="font-medium text-purple-700 dark:text-purple-300 truncate max-w-[200px]">{jobFile.name}</p>
                      </div>
                    ) : (
                      <div className="text-slate-400 dark:text-slate-500">
                        <span className="text-3xl block mb-2 opacity-50">📎</span>
                        <span className="text-sm font-medium">PDF da Vaga</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ACTION BUTTON */}
          <div className="flex justify-end mb-12 border-b border-slate-200 dark:border-slate-800 pb-8">
            <button 
              onClick={handleAnalyze} 
              disabled={loading} 
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-xl shadow-indigo-500/20 transition-all transform hover:-translate-y-1 active:scale-95
                ${loading ? "bg-slate-400 cursor-wait" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"}
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Analisando Dados...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">✨</span> Executar Auditoria Técnica
                </>
              )}
            </button>
          </div>

          {/* RESULTS SECTION */}
          {result && (
            <div className="animate-fade-in-up space-y-6 pb-20">
              
              {/* SCORE CARD */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-10">
                <div className="text-center md:text-left min-w-[200px]">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Match Index</p>
                  <div className={`text-6xl font-black tracking-tighter ${result.nota >= 70 ? 'text-emerald-500' : result.nota >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {result.nota}%
                  </div>
                </div>
                
                <div className="flex-1 w-full">
                   <div className="flex justify-between text-xs mb-2 font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <span>Baixa</span>
                      <span>Média</span>
                      <span>Alta</span>
                   </div>
                   <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${
                          result.nota >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 
                          result.nota >= 40 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                          'bg-gradient-to-r from-rose-500 to-red-600'
                        }`}
                        style={{ width: `${result.nota}%` }}
                      ></div>
                   </div>
                   <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {result.nota >= 70 ? "✅ Candidato com fortes evidências técnicas alinhadas aos requisitos." : 
                       result.nota >= 40 ? "⚠️ Candidato apresenta Gaps que exigem investigação técnica profunda." : 
                       "❌ Evidências no currículo são insuficientes para a senioridade da vaga."}
                   </p>
                </div>
              </div>

              {/* REPORT CONTENT */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm">
                    🤖 Mapa de Investigação
                  </h3>
                  
                  <PDFDownloadLink
                    document={
                      <ReportPDF 
                        fileName={file?.name} 
                        jobMode={jobMode} 
                        score={result.nota} 
                        feedback={result.feedback} 
                      />
                    }
                    fileName={`TalentMatch_Auditoria.pdf`}
                  >
                    {({ loading }) => (
                      <button 
                        disabled={loading} 
                        className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-bold flex items-center gap-2"
                      >
                        {loading ? '⏳ Gerando PDF...' : '📄 Exportar Relatório PDF'}
                      </button>
                    )}
                  </PDFDownloadLink>
                </div>
                
                {/* MARKDOWN RENDERER COM ESTILOS ESCUROS OTIMIZADOS */}
                <div className="p-8 prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-800 dark:prose-headings:text-white prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-strong:text-slate-900 dark:prose-strong:text-white">
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