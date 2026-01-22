import { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const getScoreColor = (score) => {
    if (score < 50) return "text-red-600";
    if (score < 70) return "text-yellow-500";
    return "text-green-600";
  };

  const getScoreMessage = (score) => {
    if (score < 50) return "Baixa aderência";
    if (score < 70) return "Aderência média";
    return "Alta aderência! 🚀";
  };

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
      // --- CORREÇÃO FINAL: URL FIXA DO RENDER ---
      // Isso garante que o site SEMPRE vá para a nuvem, nunca para o localhost
      const apiUrl = 'https://talent-match-rc43.onrender.com/analisar';

      console.log("📡 Conectando em:", apiUrl); // Para ajudar no debug

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro desconhecido ao conectar na API");
      }

      setResult(data);

    } catch (error) {
      console.error(error);
      alert(`❌ Erro: ${error.message}. Tente novamente em alguns segundos (o servidor pode estar acordando).`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-6 font-sans text-gray-800">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2 text-indigo-700">TalentMatch 🎯</h1>
        <p className="text-gray-500">IA Recruiter: Análise Inteligente de Currículos.</p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Upload */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <label className="font-semibold text-lg mb-4 text-gray-700">1. Upload do Currículo (PDF)</label>
          <div className="flex-1 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30 hover:bg-indigo-50 transition relative group cursor-pointer flex flex-col items-center justify-center text-center p-6 h-64">
            <input 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="pointer-events-none">
              {file ? (
                <>
                  <span className="text-5xl mb-2 block">📄</span>
                  <p className="text-indigo-600 font-medium truncate max-w-xs">{file.name}</p>
                </>
              ) : (
                <>
                  <span className="text-5xl mb-2 block text-indigo-300">📂</span>
                  <p className="text-gray-500">Arraste seu PDF aqui</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Vaga */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <label className="font-semibold text-lg mb-4 text-gray-700">2. Descrição da Vaga</label>
          <textarea
            className="flex-1 w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-gray-600"
            placeholder="Cole aqui os requisitos da vaga..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          ></textarea>
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className={`px-10 py-4 rounded-full font-bold text-lg text-white shadow-lg transition-all transform hover:-translate-y-1 ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {loading ? "🤖 Consultando a IA..." : "Analisar com IA ✨"}
      </button>

      {/* RESULTADO DA ANÁLISE */}
      {result && (
        <div className="mt-12 w-full max-w-2xl animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-8 text-center">
              <p className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Resultado da Análise</p>
              
              <div className={`text-7xl font-black mb-2 ${getScoreColor(result.nota)}`}>
                {result.nota}%
              </div>
              
              <p className="text-gray-600 font-medium mb-8">
                {getScoreMessage(result.nota)}
              </p>

              {/* --- FEEDBACK DA IA --- */}
              {result.feedback && (
                <div className="bg-indigo-50 rounded-xl p-6 text-left border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🤖</span>
                    <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">
                      Feedback da Inteligência Artificial:
                    </p>
                  </div>
                  <p className="text-gray-700 italic leading-relaxed">
                    "{result.feedback}"
                  </p>
                </div>
              )}
              {/* ---------------------------------- */}

            </div>
            <div className={`h-2 w-full ${getScoreColor(result.nota).replace('text-', 'bg-')}`}></div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;