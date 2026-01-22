import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // <--- O IMPORT NOVO AQUI

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-800 font-sans">
      
      {/* HEADER */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎯</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">TalentMatch</h1>
          </div>
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider hidden sm:block">Powered by AI Llama 3</div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">
        <div className="text-center mb-12 max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Encontre o candidato <br/><span className="text-indigo-600">perfeito em segundos.</span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Análise semântica avançada de currículos e vagas com Inteligência Artificial.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* UPLOAD */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">📄</div>
              <label className="font-bold text-lg text-slate-700">1. Currículo (PDF)</label>
            </div>
            <div className="relative group h-64">
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className={`border-2 border-dashed rounded-2xl h-full flex flex-col items-center justify-center text-center p-6 transition-all ${file ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400'}`}>
                {file ? (
                  <>
                    <span className="text-5xl mb-4 animate-bounce">📎</span>
                    <p className="font-semibold text-indigo-700 text-lg">{file.name}</p>
                  </>
                ) : (
                  <>
                    <span className="text-5xl mb-4 text-slate-300">☁️</span>
                    <p className="font-medium text-slate-600 text-lg">Arraste seu PDF aqui</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* VAGA */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-purple-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600">💼</div>
              <label className="font-bold text-lg text-slate-700">2. Descrição da Vaga</label>
            </div>
            <textarea
              className="w-full h-64 p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-purple-500 outline-none resize-none transition-all"
              placeholder="Cole os requisitos da vaga..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            ></textarea>
          </div>
        </div>

        <button onClick={handleAnalyze} disabled={loading} className={`w-full md:w-auto px-12 py-5 rounded-full font-bold text-lg text-white shadow-lg transition-all hover:-translate-y-1 ${loading ? "bg-slate-400 cursor-wait" : "bg-gradient-to-r from-indigo-600 to-purple-600"}`}>
          {loading ? "Analisando..." : "✨ Analisar Compatibilidade"}
        </button>

        {/* RESULTADO FORMATADO */}
        {result && (
          <div className="mt-16 w-full max-w-3xl animate-fade-in-up">
            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
              
              {/* Score Header */}
              <div className={`${result.nota >= 70 ? 'bg-green-50' : result.nota >= 50 ? 'bg-yellow-50' : 'bg-red-50'} p-10 text-center border-b border-slate-100`}>
                <p className="text-slate-500 uppercase tracking-widest text-xs font-bold mb-4">Match Score</p>
                <div className={`text-7xl font-black mb-2 ${result.nota >= 70 ? 'text-green-600' : result.nota >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {result.nota}%
                </div>
                <p className="text-slate-600 font-medium text-lg">
                  {result.nota >= 70 ? "🚀 Excelente Aderência" : result.nota >= 50 ? "⚠️ Aderência Média" : "❌ Baixa Aderência"}
                </p>
              </div>

              {/* Feedback da IA (Renderizado com Markdown) */}
              <div className="p-10 bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 p-2 rounded-lg">🤖</div>
                  <h3 className="font-bold text-slate-800 text-lg">Análise da IA</h3>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed">
                  {/* O COMPONENTE MÁGICO ABAIXO: */}
                  <ReactMarkdown 
                    components={{
                      strong: ({node, ...props}) => <span className="font-bold text-indigo-700" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />
                    }}
                  >
                    {result.feedback}
                  </ReactMarkdown>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
      <footer className="text-center py-8 text-slate-400 text-sm">&copy; 2024 TalentMatch AI</footer>
    </div>
  );
}

export default App;