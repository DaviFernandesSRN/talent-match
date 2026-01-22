import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF } from './ReportPDF';
import { Login } from './Login';

function App() {
  const [user, setUser] = useState(null); 
  const [view, setView] = useState('new'); 
  const [history, setHistory] = useState([]); 
  const [file, setFile] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [jobMode, setJobMode] = useState('text');
  const [jobDescription, setJobDescription] = useState('');
  const [jobFile, setJobFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('tm_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    document.title = user ? "TalentMatch | Enterprise" : "Login | TalentMatch";
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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

  const clearHistory = () => {
    if (window.confirm("⚠️ Tem certeza que deseja apagar todo o histórico?")) {
      setHistory([]);
      localStorage.removeItem('tm_history');
    }
  };

  const handleAnalyze = async () => {
    const hasJob = jobMode === 'text' ? jobDescription : jobFile;
    if (!file || !hasJob) {
      alert("⚠️ Anexe o Currículo e a Vaga.");
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
      if (!response.ok) throw new Error(data.error || "Erro");
      setResult(data);
      saveToHistory(data, file.name, jobMode === 'text' ? 'Vaga (Texto)' : jobFile.name);
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
    <div className={`flex h-screen overflow-hidden transition-colors ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-lg">🎯</div>
          <h1 className="text-lg font-bold">TalentMatch</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => { setView('new'); setResult(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'new' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>🚀 Nova Análise</button>
          <button onClick={() => setView('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'history' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>📂 Histórico</button>
          <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-xl mt-4"><span>{darkMode ? '☀️' : '🌙'}</span> {darkMode ? 'Claro' : 'Escuro'}</button>
          <button onClick={() => setUser(null)} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl mt-auto">🚪 Sair</button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                {view === 'new' ? 'Análise de Relatório' : 'Histórico de Análises'}
              </h2>
              {/* FRASE REMOVIDA DAQUI */}
            </div>
            {view === 'history' && history.length > 0 && (
              <button onClick={clearHistory} className="text-red-500 text-sm font-bold border border-red-200 px-4 py-2 rounded-lg">Limpar Tudo</button>
            )}
          </div>

          {view === 'new' && (
            <>
              {!result && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <label className="font-bold dark:text-white mb-4 block">1. Currículo (PDF)</label>
                      <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="w-full p-4 border-2 border-dashed rounded-xl dark:text-slate-400" />
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <label className="font-bold dark:text-white mb-4 block">2. Descrição da Vaga</label>
                      <textarea className="w-full h-32 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Cole a vaga aqui..." />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleAnalyze} disabled={loading} className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600">
                      {loading ? '⏳ Processando...' : '✨ Executar Análise'}
                    </button>
                  </div>
                </>
              )}

              {result && (
                <div className="space-y-6">
                  <button onClick={() => setResult(null)} className="text-sm text-slate-500">⬅ Nova análise</button>
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border flex items-center gap-10">
                    <div className={`text-6xl font-black ${result.nota >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>{result.nota}%</div>
                    <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full" style={{ width: `${result.nota}%` }}></div>
                    </div>
                    <PDFDownloadLink document={<ReportPDF fileName={file?.name} score={result.nota} feedback={result.feedback} />} fileName={`TalentMatch_${file?.name}`}>
                      <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold">📄 Baixar PDF</button>
                    </PDFDownloadLink>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border dark:text-white prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{result.feedback}</ReactMarkdown>
                  </div>
                </div>
              )}
            </>
          )}

          {view === 'history' && (
            <div className="space-y-4">
              {history.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border flex justify-between items-center">
                  <div>
                    <h4 className="font-bold dark:text-white">{item.candidateName}</h4>
                    <p className="text-xs text-slate-500">{item.date} - {item.jobTitle}</p>
                  </div>
                  <button onClick={() => loadHistoryItem(item)} className="text-indigo-600 font-bold text-sm">Ver Relatório</button>
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