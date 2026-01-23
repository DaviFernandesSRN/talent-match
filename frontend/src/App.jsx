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
  const [editableFeedback, setEditableFeedback] = useState('');
  const [editTab, setEditTab] = useState('preview');

  useEffect(() => {
    const savedHistory = localStorage.getItem('tm_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    document.title = user ? "TalentMatch | Enterprise" : "Login | TalentMatch";
  }, [user]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const saveToHistory = (data, fileName, jobName) => {
    const newRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      candidateName: fileName,
      jobTitle: jobName,
      score: data.nota,
      feedback: data.feedback,
      fullResult: data
    };
    const updated = [newRecord, ...history];
    setHistory(updated);
    localStorage.setItem('tm_history', JSON.stringify(updated));
  };

  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    if (window.confirm("🗑️ Excluir apenas esta análise?")) {
      const updated = history.filter(item => item.id !== id);
      setHistory(updated);
      localStorage.setItem('tm_history', JSON.stringify(updated));
    }
  };

  const handleAnalyze = async () => {
    const hasJob = jobMode === 'text' ? jobDescription : jobFile;
    if (!file || !hasJob) { alert("⚠️ Anexe os arquivos."); return; }
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    if (jobMode === 'text') formData.append('jobDescription', jobDescription);
    else formData.append('jobFile', jobFile);
    try {
      const response = await fetch('https://talent-match-rc43.onrender.com/analisar', { method: 'POST', body: formData });
      const data = await response.json();
      setResult(data);
      setEditableFeedback(data.feedback);
      saveToHistory(data, file.name, jobMode === 'text' ? 'Vaga (Texto)' : 'Vaga (PDF)');
    } catch (e) { alert("❌ Erro no servidor."); }
    finally { setLoading(false); }
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold">🎯</div>
          {/* TÍTULO SEMPRE BRANCO NA SIDEBAR */}
          <h1 className="text-lg font-bold text-white">TalentMatch</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => { setView('new'); setResult(null); }} className={`w-full text-left px-4 py-3 rounded-xl ${view === 'new' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}>🚀 Nova Análise</button>
          <button onClick={() => setView('history')} className={`w-full text-left px-4 py-3 rounded-xl ${view === 'history' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}>📂 Histórico</button>
          <button onClick={() => setDarkMode(!darkMode)} className="w-full text-left px-4 py-3 mt-4"><span>{darkMode ? '☀️' : '🌙'}</span> {darkMode ? 'Claro' : 'Escuro'}</button>
          <button onClick={() => setUser(null)} className="w-full text-left px-4 py-3 text-red-400 mt-auto">🚪 Sair</button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 flex justify-between items-end">
            {/* TÍTULO BRANCO NO MODO ESCURO */}
            <h2 className="text-3xl font-bold dark:text-white text-slate-800">
              {view === 'new' ? 'TalentMatch' : 'Histórico de Análises'}
            </h2>
            {view === 'history' && history.length > 0 && (
              <button onClick={() => {setHistory([]); localStorage.removeItem('tm_history');}} className="text-red-500 text-sm font-bold">🗑️ Limpar Tudo</button>
            )}
          </div>

          {view === 'new' && (
            <>
              {!result && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
                    <label className="font-bold mb-4 block dark:text-white">1. Currículo (PDF)</label>
                    <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="w-full p-4 border-2 border-dashed rounded-xl dark:bg-slate-800 dark:border-slate-700" />
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
                    <label className="font-bold mb-4 block dark:text-white">2. Vaga</label>
                    <textarea className="w-full h-32 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white border-none" onChange={e => setJobDescription(e.target.value)} placeholder="Cole o texto aqui..." />
                  </div>
                  <button onClick={handleAnalyze} disabled={loading} className="lg:col-span-2 bg-indigo-600 text-white py-4 rounded-xl font-bold">{loading ? '⏳ Processando...' : '✨ Executar Análise'}</button>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border dark:border-slate-800 flex justify-between items-center">
                    <div className={`text-6xl font-black ${result.nota >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>{result.nota}%</div>
                    <PDFDownloadLink document={<ReportPDF fileName={file?.name} score={result.nota} feedback={editableFeedback} />} fileName={`TalentMatch_${file?.name}`}>
                      <button className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold">📄 Baixar PDF</button>
                    </PDFDownloadLink>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border dark:border-slate-800">
                    <div className="flex gap-4 mb-4">
                       <button onClick={() => setEditTab('preview')} className={`font-bold ${editTab === 'preview' ? 'text-indigo-600 border-b-2' : 'text-slate-400'}`}>Visualização</button>
                       <button onClick={() => setEditTab('edit')} className={`font-bold ${editTab === 'edit' ? 'text-indigo-600 border-b-2' : 'text-slate-400'}`}>Editar</button>
                    </div>
                    {editTab === 'preview' ? <div className="prose dark:prose-invert max-w-none"><ReactMarkdown>{editableFeedback}</ReactMarkdown></div> : <textarea className="w-full h-[500px] p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white" value={editableFeedback} onChange={e => setEditableFeedback(e.target.value)} />}
                  </div>
                </div>
              )}
            </>
          )}

          {view === 'history' && (
            <div className="space-y-4">
              {history.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border dark:border-slate-800 flex justify-between items-center">
                  <div onClick={() => {setResult(item.fullResult); setEditableFeedback(item.feedback); setView('new');}} className="cursor-pointer">
                    <h4 className="font-bold dark:text-white">{item.candidateName}</h4>
                    <p className="text-xs text-slate-500">{item.date} • {item.score}%</p>
                  </div>
                  <button onClick={(e) => deleteHistoryItem(item.id, e)} className="text-slate-400 hover:text-red-500">🗑️</button>
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