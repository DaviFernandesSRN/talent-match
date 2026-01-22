import { useState } from 'react';

export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // --- TODOS OS USUÁRIOS MANTIDOS NO CÓDIGO ---
    if (email === 'teste@talentmatch.com' && password === 'teste123') {
      onLogin({ name: 'Usuário Teste', role: 'Recrutador Senior', avatar: 'UT' });
    } 
    else if (email === 'carol@talentmatch.com' && password === '123456') {
      onLogin({ name: 'Carol Rocha', role: 'Product Manager', avatar: 'CR' });
    } 
    else if (email === 'davifernandes@talentmatch.com' && password === 'admin123') {
      onLogin({ name: 'Davi Fernandes', role: 'Tech Lead', avatar: 'DF' });
    } 
    else {
      alert('⚠️ Credenciais inválidas. Use os dados da dica abaixo.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-indigo-500/20">🎯</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TalentMatch</h1>
          <p className="text-slate-400 mt-2">Plataforma de Auditoria Técnica</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">E-mail</label>
            <input 
              type="email" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
            <input 
              type="password" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
          >
            Entrar no Dashboard
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-4">Acesso para Teste Público:</p>
          <div className="flex flex-col gap-2">
            {/* APENAS O USUÁRIO NOVO É EXIBIDO NA INTERFACE */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400">
              <span className="text-indigo-400 font-bold">Usuário:</span> teste@talentmatch.com
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400">
              <span className="text-indigo-400 font-bold">Senha:</span> teste123
            </div>
          </div>
          <p className="text-[10px] text-slate-600 mt-4 italic">Acessos administrativos permanecem ativos para usuários autorizados.</p>
        </div>
      </div>
    </div>
  );
}