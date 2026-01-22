import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF } from './ReportPDF';
import { Login } from './Login';

function App() {
  // --- ESTADOS GERAIS ---
  const [user, setUser] = useState(null); 
  const [view, setView] = useState('new'); 
  const [history, setHistory] = useState([]); 

  // --- ESTADOS DO FORMULÁRIO ---
  const [file, setFile] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  
  const [jobMode, setJobMode] = useState('text');
  const [jobDescription, setJobDescription] = useState('');
  const [jobFile, setJobFile] = useState(null);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. CARREGAR HISTÓRICO
  useEffect(() => {
    const savedHistory = localStorage.getItem('tm_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    document.title = user ? "TalentMatch | Enterprise" : "Login | TalentMatch";
  }, [user]);

  // 2. DARK MODE
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- SALVAR NO HISTÓRICO ---
  const saveToHistory = (analysisData, fileName, jobName) => {
    const newRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      candidateName: fileName,
      jobTitle: jobName,
      score: analysisData.nota,
      feedback: analysisData.feedback,
      fullResult: analysisData
    };

    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('tm_history', JSON.stringify(updatedHistory));
  };

  // --- APAGAR HISTÓRICO (NOVO!) ---
  const clearHistory = () => {
    if (window.confirm("⚠️ Tem certeza que deseja apagar todo o histórico de análises?")) {
      setHistory([]);
      localStorage.removeItem('tm_history');
    }
  };

  // --- ANÁLISE ---
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
    if (jobMode === 'text') formData.append('jobDescription', jobDescription);
    else formData.append('jobFile', jobFile);

    try {
      const apiUrl = 'https://talent-match-rc43.onrender.com/analisar'; 
      const response = await fetch(apiUrl, { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Erro desconhecido");

      setResult(data);
      const jobName = jobMode === 'text' ? 'Vaga (Texto)' : jobFile.name;
      saveToHistory(data, file.name, jobName);

    } catch (error) {
      console.error(error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item) => {
    setResult(item.fullResult);
    setFile({ name: item.candidateName });
    setView('new');
  };

  if (!user) {
    return <Login onLogin={(userData) => setUser(userData)} />;
  }

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* SIDEBAR */}
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
          <button 
            onClick={() => { setView('new'); setResult(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${view === 'new' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <span>🚀</span> Nova Análise
          </button>
          <button 
            onClick={() => setView('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${view === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <span>📂</span> Histórico <span className="ml-auto text-xs bg-slate-800 px-2 py-0.5 rounded-full">{history.length}</span>
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors mt-4">
            <span>{darkMode ? '☀️' : '🌙'}</span> {darkMode ? 'Modo Claro' : 'Modo Escuro'}
          </button>
          <button onClick={() => setUser(null)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-900/20 rounded-xl text-red-400 hover:text-red-300 transition-colors mt-auto">
            <span>🚪</span> Sair
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg">
              {user.avatar}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
          <span className="font-bold flex items-center gap-2">🎯 TalentMatch</span>
          <button onClick={() => setDarkMode(!darkMode)} className="text-xl">{darkMode ? '☀️' : '🌙'}</button>
        </header>

        <div className="max-w-5xl mx-auto p-6 lg:p-12">
          
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
                {view === 'new' ? 'Análise de Relatório' : 'Histórico de Análises'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                {view === 'new' 
                  ? `Olá, ${user.name.split(' ')[0]}. Configure a análise abaixo.` 
                  : 'Consulte os relatórios gerados anteriormente.'}
              </p>
            </div>
            {/* BOTÃO LIMPAR HISTÓRICO (SÓ APARECE NA TELA DE HISTÓRICO) */}
            {view === 'history' && history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 border border-red-200 dark:border-red-900/30"
              >
                <span>🗑️</span> Limpar Tudo
              </button>
            )}
          </div>

          {/* === VISÃO 1: NOVA ANÁLISE === */}
          {view === 'new' && (
            <>
              {!result && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in-up">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-colors">
                      <label className="font-bold text-slate-700 dark:text-slate-200 mb-4 block">1. Currículo (Candidato)</label>
                      <div className="relative h-48 group">
                        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className={`border-2 border-dashed rounded-xl h-full flex flex-col items-center justify-center text-center p-4 transition-all 
                          ${file ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                          {file ? <div className="text-indigo-600 font-bold">{file.name}</div> : <span className="text-slate-400">Arraste o PDF aqui</span>}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-purple-400 transition-colors">
                      <div className="flex justify-between mb-4">
                        <label className="font-bold text-slate-700 dark:text-slate-200">2. Descrição da Vaga</label>
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded p-1">
                          <button onClick={() => setJobMode('text')} className={`px-2 py-0.5 text-xs rounded ${jobMode === 'text' ? 'bg-white shadow text-purple-600' : 'text-slate-400'}`}>Texto</button>
                          <button onClick={() => setJobMode('pdf')} className={`px-2 py-0.5 text-xs rounded ${jobMode === 'pdf' ? 'bg-white shadow text-purple-600' : 'text-slate-400'}`}>PDF</button>
                        </div>
                      </div>
                      {jobMode === 'text' ? (
                        <textarea className="w-full h-48 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm dark:text-white resize-none outline-none focus:ring-2 focus:ring-purple-500" placeholder="Cole a vaga aqui..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}></textarea>
                      ) : (
                        <div className="relative h-48 group">
                          <input type="file" accept=".pdf" onChange={(e) => setJobFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className={`border-2 border-dashed rounded-xl h-full flex flex-col items-center justify-center text-center p-4 transition-all 
                            ${jobFile ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            {jobFile ? <div className="text-purple-600 font-bold">{jobFile.name}</div> : <span className="text-slate-400">PDF da Vaga</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mb-12">
                    <button onClick={handleAnalyze} disabled={loading} className={`px-8 py-4 rounded-xl font-bold text-white shadow-xl transition-all hover:-translate-y-1 ${loading ? "bg-slate-400" : "bg-gradient-to-r from-indigo-600 to-purple-600"}`}>
                      {loading ? '⏳ Analisando...' : '✨ Executar Auditoria'}
                    </button>
                  </div>
                </>
              )}

              {/* RESULTADOS */}
              {result && (
                <div className="animate-fade-in-up space-y-6 pb-20">
                  <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setResult(null)} className="text-sm text-slate-500 hover:text-indigo-500 flex items-center gap-1">
                      ⬅ Fazer nova análise
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-10">
                    <div className="text-center min-w-[150px]">
                      <div className={`text-6xl font-black tracking-tighter ${result.nota >= 70 ? 'text-emerald-500' : result.nota >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>{result.nota}%</div>
                      <p className="text-xs uppercase font-bold text-slate-400 mt-2">Match Index</p>
                    </div>
                    <div className="flex-1">
                       <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                          <div className={`h-full rounded-full ${result.nota >= 70 ? 'bg-emerald-500' : result.nota >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${result.nota}%` }}></div>
                       </div>
                       <p className="text-slate-600 dark:text-slate-400 text-sm">
                          {result.nota >= 70 ? "✅ Candidato com fortes evidências." : result.nota >= 40 ? "⚠️ Gaps identificados." : "❌ Baixa aderência."}
                       </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <h3 className="font-bold text-slate-700 dark:text-slate-200">🤖 Mapa de Investigação</h3>
                      <PDFDownloadLink document={<ReportPDF fileName={file?.name || result.candidateName} jobMode={jobMode} score={result.nota} feedback={result.feedback} />} fileName={`TalentMatch_${file?.name || result.candidateName}`}>
                        {({ loading }) => (
                          <button disabled={loading} className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                            {loading ? '⏳...' : '📄 Baixar PDF'}
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
            </>
          )}

          {/* === VISÃO 2: HISTÓRICO === */}
          {view === 'history' && (
            <div className="space-y-4 animate-fade-in-up">
              {history.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <span className="text-4xl block mb-2">📂</span>
                  <p className="text-slate-500">Nenhuma análise salva no histórico ainda.</p>
                  <button onClick={() => setView('new')} className="mt-4 text-indigo-500 font-bold text-sm hover:underline">Criar a primeira agora</button>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 transition-all flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white shadow-md
                        ${item.score >= 70 ? 'bg-emerald-500' : item.score >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}>
                        {Math.round(item.score)}%
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-lg">{item.candidateName}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span>📅 {item.date} às {item.time}</span>
                          <span>•</span>
                          <span>💼 {item.jobTitle}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => loadHistoryItem(item)} className="px-6 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors w-full md:w-auto">
                      Ver Relatório
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;