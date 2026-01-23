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

  const loadHistoryItem = (item) => {
    setResult(item.fullResult);
    setEditableFeedback(item.feedback);
    setFile({ name: item.candidateName });
    setView('new');
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
      saveToHistory(data, file.name, jobMode === 'text' ? 'Vaga (Texto)' : (jobFile ? jobFile.name : 'Vaga PDF'));
    } catch (e) { 
      alert("❌ Erro no servidor."); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold">🎯</div>
          <h1 className="text-lg font-bold text-white tracking-tight">TalentMatch</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => { setView('new'); setResult(null); }} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${view === 'new' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>🚀 Nova Análise</button>
          <button onClick={() => setView('history')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${view === 'history' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>📂 Histórico</button>
          <button onClick={() => setDarkMode(!darkMode)} className="w-full text-left px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-xl mt-4"><span>{darkMode ? '☀️' : '🌙'}</span> Alternar Tema</button>
          <button onClick={() => setUser(null)} className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors mt-auto font-bold">🚪 Sair</button>
        </nav>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-12 transition-colors duration-300">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 flex justify-between items-end">
            <h2 className="text-3xl font-bold transition-colors" style={{ color: darkMode ? '#ffffff' : '#1e293b' }}>
              {view === 'new' ? 'TalentMatch' : 'Histórico de Análises'}
            </h2>
          </div>

          {view === 'new' && (
            <>
              {!result && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 relative">
                  
                  {/* CARD 1: CURRÍCULO */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all">
                    <label className="font-bold mb-4 block" style={{ color: '#1e293b' }}>1. Currículo (PDF)</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center">
                      <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm text-slate-500" />
                    </div>
                  </div>
                  
                  {/* CARD 2: VAGA */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all">
                    <div className="flex justify-between mb-4 items-center">
                      <label className="font-bold" style={{ color: '#1e293b' }}>2. Vaga</label>
                      <div className="flex bg-slate-100 rounded p-1">
                        <button onClick={() => setJobMode('text')} className={`px-2 py-0.5 text-xs rounded transition-all ${jobMode === 'text' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>Texto</button>
                        <button onClick={() => setJobMode('pdf')} className={`px-2 py-0.5 text-xs rounded transition-all ${jobMode === 'pdf' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>PDF</button>
                      </div>
                    </div>
                    {jobMode === 'text' ? (
                      <textarea className="w-full h-32 p-3 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Cole o texto aqui..." />
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center">
                        <input type="file" accept=".pdf" onChange={(e) => setJobFile(e.target.files[0])} className="w-full text-sm text-slate-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="lg:col-span-2 flex justify-end mt-4">
                    <button onClick={handleAnalyze} disabled={loading} className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl transition-all hover:scale-105 active:scale-95">
                      {loading ? '⏳ Processando...' : '✨ Executar Análise'}
                    </button>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-6 pb-10">
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-6">
                      <div className={`text-6xl font-black ${result.nota >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>{result.nota}%</div>
                      <div className="text-slate-400 uppercase text-xs font-bold tracking-widest">Aderência</div>
                    </div>
                    <PDFDownloadLink document={<ReportPDF fileName={file?.name} score={result.nota} feedback={editableFeedback} />} fileName={`TalentMatch_${file?.name}`}>
                      <button className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold">📄 Baixar PDF</button>
                    </PDFDownloadLink>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex border-b border-slate-200 bg-slate-50">
                      <button onClick={() => setEditTab('preview')} className={`px-6 py-3 font-bold text-sm transition-all ${editTab === 'preview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>👁️ Visualizar</button>
                      <button onClick={() => setEditTab('edit')} className={`px-6 py-3 font-bold text-sm transition-all ${editTab === 'edit' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>✍️ Editar</button>
                    </div>
                    <div className="p-8">
                      {editTab === 'preview' ? (
                        <div className="prose prose-slate max-w-none transition-colors" style={{ color: '#1e293b' }}>
                          <ReactMarkdown>{editableFeedback}</ReactMarkdown>
                        </div>
                      ) : (
                        <textarea className="w-full h-[500px] p-4 rounded-xl bg-slate-50 text-slate-800 font-mono text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" value={editableFeedback} onChange={(e) => setEditableFeedback(e.target.value)} />
                      )}
                    </div>
                  </div>
                  <button onClick={() => setResult(null)} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">⬅ Nova Análise</button>
                </div>
              )}
            </>
          )}

          {view === 'history' && (
            <div className="space-y-4">
              {history.map(item => (
                <div key={item.id} onClick={() => loadHistoryItem(item)} className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center hover:border-indigo-400 transition-all cursor-pointer group shadow-sm">
                  <div>
                    <h4 className="font-bold text-slate-800">{item.candidateName}</h4>
                    <p className="text-xs text-slate-500">{item.date} • {item.score}%</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <button onClick={(e) => deleteHistoryItem(item.id, e)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">🗑️</button>
                    <span className="text-indigo-600 font-bold text-sm group-hover:underline">Ver</span>
                  </div>
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