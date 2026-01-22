import { useState, useEffect } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Muda o título da aba
  useEffect(() => {
    document.title = "TalentMatch | Recrutador IA";
  }, []);

  const handleAnalyze = async () => {
    if (!file || !jobDescription) {
      alert("⚠️ Por favor, anexe o PDF e preencha a vaga.");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobDescription', jobDescription);

    try {
      const apiUrl = 'https://talent-match-rc43.onrender.com/analisar';

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro desconhecido");
      }

      setResult(data);

    } catch (error) {
      console.error(error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-800 font-sans selection:bg-indigo-200">
      
      {/* --- HEADER --- */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎯</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              TalentMatch
            </h1>
          </div>
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider hidden sm:block">
            Powered by AI Llama 3
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">
        
        <div className="text-center mb-12 max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Encontre o candidato <br/>
            <span className="text-indigo-600">perfeito em segundos.</span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Nossa IA analisa a compatibilidade semântica entre currículos e vagas, eliminando o trabalho manual de triagem.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          
          {/* CARD UPLOAD */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-100/50 border border-indigo-50 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">📄</div>
              <label className="font-bold text-lg text-slate-700">1. Currículo (PDF)</label>
            </div>
            
            <div className="relative group">
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center text-center p-6 transition-all duration-300 ${file ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}>
                {file ? (
                  <>
                    <span className="text-5xl mb-4 animate-bounce">📎</span>
                    <p className="font-semibold text-indigo-700 text-lg truncate w-full px-4">{file.name}</p>
                    <p className="text-sm text-indigo-400 mt-2">Clique para trocar</p>
                  </>
                ) : (
                  <>
                    <span className="text-5xl mb-4 text-slate-300 group-hover:text-indigo-400 transition-colors">☁️</span>
                    <p className="font-medium text-slate-600 text-lg">Arraste ou clique para enviar</p>
                    <p className="text-sm text-slate-400 mt-2">Apenas arquivos PDF</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* CARD VAGA */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-purple-100/50 border border-purple-50 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600">💼</div>
              <label className="font-bold text-lg text-slate-700">2. Descrição da Vaga</label>
            </div>
            <textarea
              className="w-full h-64 p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none resize-none transition-all text-slate-600 text-base"
              placeholder="Cole aqui os requisitos da vaga (Ex: Desenvolvedor Python Sênior...)"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`w-full md:w-auto px-12 py-5 rounded-full font-bold text-lg text-white shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-1 hover:shadow-indigo-500/50 active:scale-95 ${
            loading 
              ? "bg-slate-400 cursor-wait" 
              : "bg-gradient-to-r from-indigo-600 to-purple-600"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analisando...
            </span>
          ) : (
            "✨ Analisar Compatibilidade"
          )}
        </button>

        {/* RESULTADO */}
        {result && (
          <div className="mt-16 w-full max-w-3xl animate-fade-in-up">
            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
              
              {/* Header do Resultado */}
              <div className={`${result.nota >= 70 ? 'bg-green-50' : result.nota >= 50 ? 'bg-yellow-50' : 'bg-red-50'} p-10 text-center border-b border-slate-100`}>
                <p className="text-slate-500 uppercase tracking-widest text-xs font-bold mb-4">Match Score</p>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle className="text-slate-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
                    <circle 
                      className={`${result.nota >= 70 ? 'text-green-500' : result.nota >= 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`} 
                      strokeWidth="8" 
                      strokeDasharray={440} 
                      strokeDashoffset={440 - (440 * result.nota) / 100} 
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="70" cx="80" cy="80" 
                    />
                  </svg>
                  <span className={`absolute text-5xl font-black ${result.nota >= 70 ? 'text-green-600' : result.nota >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {result.nota}%
                  </span>
                </div>
                <p className="text-slate-600 font-medium mt-4 text-lg">
                  {result.nota >= 70 ? "🚀 Excelente Aderência" : result.nota >= 50 ? "⚠️ Aderência Média" : "❌ Baixa Aderência"}
                </p>
              </div>

              {/* Feedback da IA */}
              <div className="p-10 bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className