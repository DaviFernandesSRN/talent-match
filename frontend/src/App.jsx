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
  const [editTab, setEditTab] = useState('preview'); // 'preview' ou 'edit'

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

  const clearHistory = () => {
    if (window.confirm("⚠️ Tem certeza que deseja apagar todo o histórico?")) {
      setHistory([]);
      localStorage.removeItem('tm_history');
    }
  };

  const handleAnalyze = async () => {
    const hasJob = jobMode === 'text' ? jobDescription : jobFile;
    if (!file || !hasJob) { alert("⚠️ Anexe os arquivos necessários."); return; }
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
      saveToHistory(data, file.name, jobMode === 'text' ? 'Vaga (Texto)' : jobFile.name);
    } catch (e) { alert("❌ Erro na comunicação com o servidor."); }
    finally { setLoading(false); }
  };

  const loadHistoryItem = (item) => {
    setResult(item.fullResult);
    setEditableFeedback(item.feedback);
    setFile({ name: item.candidateName });
    setView('new');
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* SIDEBAR RESTAURADA */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold">🎯</div>
          <h1 className="text-lg font-bold">TalentMatch</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => { setView('new'); setResult(null); }} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${view === 'new' ? 'bg-indigo-600' : 'hover:bg-slate-800 text-slate-400'}`}>🚀 Nova Análise</button>
          <button onClick={() => setView('history')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${view === 'history' ? 'bg-indigo-600' : 'hover:bg-slate-800 text-slate-400'}`}>📂 Histórico</button>
          <button onClick={() => setDarkMode(!darkMode)} className="w-full text-left px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-xl mt-4"><span>{darkMode ? '☀️' : '🌙'}</span> {darkMode ? 'Claro' : 'Escuro'}</button>
          <div className="mt-auto pt-4 border-t border-slate-800">
            <div className="px-4 py-2 bg-slate-800/50 rounded-lg mb-2 text-xs">
              <p className="text-indigo-400 font-bold">{user.name}</p>
              <p className="text-slate-400">{user.role}</p>
            </div>
            <button onClick={() => setUser(null)} className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors">🚪 Sair</button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 flex justify-between items-end">
            <h2 className="text-3xl font-bold dark:text-white">{view === 'new' ? 'TalentMatch' : 'Histórico de Análises'}</h2>
            {view === 'history' && history.length > 0 && (
              <button onClick={clearHistory} className="text-red-500 font-bold border border-red-200 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors">🗑️ Limpar Tudo</button>
            )}
          </div>

          {view === 'new' && (
            <>
              {!result && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
                    <label className="font-bold dark:text-white mb-4 block">1. Currículo (PDF)</label>
                    <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="w-full p-4 border-2 border-dashed rounded-xl dark:text-slate-400" />
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between mb-4">
                      <label className="font-bold dark:text-white">2. Vaga</label>
                      <div className="flex bg-slate-100 dark:bg-slate-800 rounded p-1">
                        <button onClick={() => setJobMode('text')} className={`px-2 py-0.5 text-xs rounded ${jobMode === 'text' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>Texto</button>
                        <button onClick={() => setJobMode('pdf')} className={`px-2 py-0.5 text-xs rounded ${jobMode === 'pdf' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>PDF</button>
                      </div>
                    </div>
                    {jobMode === 'text' ? <textarea className="w-full h-32 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white border outline-none focus:ring-2 focus:ring-indigo-500" value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Cole a descrição aqui..." /> : <input type="file" accept=".pdf" onChange={e => setJobFile(e.target.files[0])} className="w-full p-4 border-2 border-dashed rounded-xl dark:text-slate-400" />}
                  </div>
                  <div className="lg:col-span-2 flex justify-end">
                    <button onClick={handleAnalyze} disabled={loading} className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl transition-transform hover:-translate-y-1">{loading ? '⏳ Processando...' : '✨ Executar Análise'}</button>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-6 pb-10">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-6">
                      <div className={`text-6xl font-black ${result.nota >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>{result.nota}%</div>
                      <div className="text-slate-400 uppercase text-xs font-bold tracking-widest">Match<br/>Index</div>
                    </div>
                    <PDFDownloadLink document={<ReportPDF fileName={file?.name} score={result.nota} feedback={editableFeedback} />} fileName={`TalentMatch_${file?.name}`}>
                      <button className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors">📄 Baixar PDF</button>
                    </PDFDownloadLink>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden">
                    <div className="flex border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                      <button onClick={() => setEditTab('preview')} className={`px-6 py-3 font-bold text-sm transition-all ${editTab === 'preview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>👁️ Visualização</button>
                      <button onClick={() => setEditTab('edit')} className={`px-6 py-3 font-bold text-sm transition-all ${editTab === 'edit' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>✍️ Editar</button>
                    </div>
                    
                    <div className="p-8">
                      {editTab === 'preview' ? (
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                          <ReactMarkdown>{editableFeedback}</ReactMarkdown>
                        </div>
                      ) : (
                        <textarea 
                          className="w-full h-[500px] p-4 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white font-mono text-sm border outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                          value={editableFeedback}
                          onChange={(e) => setEditableFeedback(e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                  <button onClick={() => setResult(null)} className="text-indigo-600 font-bold hover:underline">⬅ Nova Análise</button>
                </div>
              )}
            </>
          )}

          {view === 'history' && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-20 text-slate-500 italic">Nenhuma análise no histórico.</div>
              ) : (
                history.map(item => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border flex justify-between items-center dark:border-slate-800 hover:border-indigo-400 transition-all">
                    <div>
                      <h4 className="font-bold dark:text-white">{item.candidateName}</h4>
                      <p className="text-xs text-slate-500">{item.date} às {item.time} • {item.jobTitle}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-bold ${item.score >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>{item.score}%</span>
                      <button onClick={() => loadHistoryItem(item)} className="text-indigo-600 font-bold text-sm hover:underline">Ver</button>
                    </div>
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