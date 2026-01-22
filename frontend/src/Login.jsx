import { useState } from 'react';

// --- BANCO DE DADOS SIMULADO ---
const USERS_DB = [
  {
    email: 'admin@talentmatch.com',
    password: '123',
    name: 'Davi Fernandes', // Coloque seu nome
    role: 'CEO & Founder',
    avatar: 'DF'
  },
  {
    email: 'carol@talentmatch.com', // A PM do projeto
    password: '123',
    name: 'Carol Rocha',
    role: 'Product Manager',
    avatar: 'CR'
  },
  {
    email: 'tech@talentmatch.com',
    password: '123',
    name: 'Recruiter Lead',
    role: 'Tech Recruiter',
    avatar: 'RL'
  }
];

export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simula tempo de processamento
    setTimeout(() => {
      // Procura o usuário na nossa lista "fake"
      const userFound = USERS_DB.find(
        (u) => u.email === email && u.password === password
      );

      if (userFound) {
        onLogin(userFound); // Sucesso! Manda os dados pra dentro do App
      } else {
        setError('Acesso negado. Verifique e-mail e senha.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 animate-fade-in-up">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 shadow-lg shadow-indigo-500/20">
            🎯
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TalentMatch</h1>
          <p className="text-slate-500 text-sm mt-2">Acesse seu painel de auditoria</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">E-mail Corporativo</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
              placeholder="ex: admin@talentmatch.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
              placeholder="••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center flex items-center justify-center gap-2">
              <span>🚫</span> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>

        {/* Dica visual para facilitar seus testes (opcional, pode remover depois) */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-slate-600 text-xs mb-2">Dica para Teste:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">admin@talentmatch.com</span>
            <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">carol@talentmatch.com</span>
            <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">Senha: 123</span>
          </div>
        </div>
      </div>
    </div>
  );
}