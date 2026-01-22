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
  
  const [jobMode, setJobMode] = useState('text'); // 'text' ou 'pdf'
  const [jobDescription, setJobDescription] = useState('');
  const [jobFile, setJobFile] = useState(null);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. CARREGAR HISTÓRICO E TÍTULO
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

  // --- LIMPAR HISTÓRICO ---
  const clearHistory = () => {
    if (window.confirm("⚠️ Tem certeza que deseja apagar todo o histórico?")) {
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

  if (!user) return <Login onLogin={(userData) => setUser(userData)} />;

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 hidden md:flex border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-lg">🎯</div>
          <h1 className="text-lg font-bold">TalentMatch</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => { setView('new'); setResult(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${view === 'new' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>🚀 Nova Análise</button>
          <button onClick={() => setView('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${view === 'history' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>📂 Histórico</button>
          <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-xl mt-4"><span>{darkMode ? '☀️' : '🌙'}</span> {darkMode ? 'Modo Claro' : 'Modo Escuro'}</button>
          <button onClick={() => setUser(null)} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl mt-auto">🚪 Sair</button>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth p-6 lg:p-12">
        <div className="max-w-5xl mx-auto">
          
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
                {view === 'new' ? 'Análise de Relatório' : 'Histórico de Análises'}
              </h2>
            </div>
            {view === 'history' && history.length > 0 && (
              <button onClick={clearHistory} className="text-red-500 hover:text-red-700 px-4 py-2 rounded-lg text-sm font-bold border border-red-200">🗑️ Limpar Tudo</button>
            )}
          </div>

          {view === 'new' && (
            <>
              {!result && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in-up">
                    {/* CARD 1: CURRÍCULO */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-colors">
                      <label className="font-bold text-slate-700 dark:text-slate-200 mb-4 block">1. Currículo (Candidato)</label>
                      <div className="relative h-48 group">
                        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className={`border-2 border-dashed rounded-xl h-full flex flex-col items-center justify-center text-center p-4 transition-all ${file ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50'}`}>
                          {file ? <div className="text-indigo-600 font-bold">{file.name}</div> : <span className="text-slate-400">Arraste o PDF aqui</span>}
                        </div>
                      </div>
                    </div>

                    {/* CARD 2: VAGA (RESTAURADO) */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 transition-colors">
                      <div className="flex justify-between mb-4">
                        <label className="font-bold text-slate-700 dark:text-slate-200">2. Descrição da Vaga</label>
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded p-1">
                          <button onClick={() => setJobMode('text')} className={`px-2 py-0.5 text-xs rounded ${jobMode === 'text' ? 'bg-white shadow text-purple-600' : 'text-slate-400'}`}>Texto</button>
                          <button onClick={() => setJobMode('pdf')} className={`px-2 py-0.5 text-xs rounded ${jobMode === 'pdf' ? 'bg-white shadow text-purple-600' : 'text-slate-400'}`}>PDF</button>
                        </div>
                      </div>
                      
                      {jobMode === 'text' ? (
                        <textarea className="w-full h-48 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm dark:text-white resize-none outline-none" placeholder="Cole a vaga aqui..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                      ) : (
                        <div className="relative h-48 group">
                          <input type="file" accept=".pdf" onChange={(e) => setJobFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className={`border-2 border-dashed rounded-xl h-full flex flex-col items-center justify-center text-center p-4 transition-all ${jobFile ? 'border-purple-500 bg-purple-50' : 'border-slate-300'}`}>
                            {jobFile ? <div className="text-purple-600 font-bold">{jobFile.name}</div> : <span className="text-slate-400">PDF da Vaga</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mb-12">
                    <button onClick={handleAnalyze} disabled={loading} className="px-8 py-4 rounded-xl font-bold text-white shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600">
                      {loading ? '⏳ Processando...' : '✨ Executar Análise'}
                    </button>
                  </div>
                </>
              )}

              {/* RESULTADOS */}
              {result && (
                <div className="animate-fade-in-up space-y-6 pb-20">
                  <button onClick={() => setResult(null)} className="text-sm text-slate-500 flex items-center gap-1">⬅ Nova análise</button>

                  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-10">
                    <div className="text-center min-w-[150px]">
                      <div className={`text-6xl font-black ${result.nota >= 70 ? 'text-emerald-500' : result.nota >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>{result.nota}%</div>
                      <p className="text-xs font-bold text-slate-400 mt-2 uppercase">Match Index</p>
                    </div>
                    <div className="flex-1 w-full">
                       <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${result.nota >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${result.nota}%` }}></div>
                       </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <h3 className="font-bold text-slate-700 dark:text-slate-200">🤖 Detalhamento Técnico</h3>
                      <PDFDownloadLink document={<ReportPDF fileName={file?.name} score={result.nota} feedback={result.feedback} />} fileName={`TalentMatch_${file?.name}`}>
                        {({ loading }) => <button disabled={loading} className="text-xs bg-white dark:bg-slate-800 border px-4 py-2 rounded-lg font-bold">{loading ? '⏳...' : '📄 Baixar Relatório PDF'}</button>}
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

          {view === 'history' && (
            <div className="space-y-4 animate-fade-in-up">
              {history.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{item.candidateName}</h4>
                    <p className="text-xs text-slate-500 mt-1">📅 {item.date} às {item.time} • 💼 {item.jobTitle}</p>
                  </div>
                  <button onClick={() => loadHistoryItem(item)} className="px-6 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-sm">Ver Relatório</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;