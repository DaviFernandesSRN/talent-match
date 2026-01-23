// ... (mantenha os estados e useEffects anteriores)

  // --- NOVA FUNÇÃO: EXCLUIR ITEM ÚNICO ---
  const deleteHistoryItem = (id, e) => {
    // e.stopPropagation impede que ao clicar em excluir, a análise seja carregada
    e.stopPropagation();
    
    if (window.confirm("🗑️ Deseja remover apenas esta análise do histórico?")) {
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
      localStorage.setItem('tm_history', JSON.stringify(updatedHistory));
    }
  };

  // --- LIMPAR HISTÓRICO COMPLETO (MANTIDO) ---
  const clearHistory = () => {
    if (window.confirm("⚠️ Tem certeza que deseja apagar TODO o histórico?")) {
      setHistory([]);
      localStorage.removeItem('tm_history');
    }
  };

// ... (dentro do return, na visualização de histórico)

{view === 'history' && (
  <div className="space-y-4 animate-fade-in-up">
    {history.length === 0 ? (
      <div className="text-center py-20 text-slate-500 italic">Nenhuma análise no histórico.</div>
    ) : (
      history.map(item => (
        <div 
          key={item.id} 
          onClick={() => loadHistoryItem(item)}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border flex justify-between items-center dark:border-slate-800 hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div>
            <h4 className="font-bold dark:text-white">{item.candidateName}</h4>
            <p className="text-xs text-slate-500">{item.date} às {item.time} • {item.jobTitle}</p>
          </div>
          <div className="flex items-center gap-6">
            <span className={`font-bold ${item.score >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {item.score}%
            </span>
            
            {/* BOTÃO DE EXCLUSÃO INDIVIDUAL */}
            <button 
              onClick={(e) => deleteHistoryItem(item.id, e)}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              title="Excluir apenas esta análise"
            >
              🗑️
            </button>
            
            <span className="text-indigo-600 font-bold text-sm group-hover:underline">Ver</span>
          </div>
        </div>
      ))
    )}
  </div>
)}