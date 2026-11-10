import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginProps {
  onNavigateHome?: () => void;
  onLoginSuccess?: () => void;
}

export default function Login({ onNavigateHome, onLoginSuccess }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados dos formulários
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Estados da interface
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (senha !== confirmarSenha) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    if (senha.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nomeCompleto,
          email: email,
          telefone: telefone,
          senha: senha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || data.mensagem || 'Erro ao realizar cadastro.');
      }

      alert('Conta criada com sucesso! Faça o seu login para continuar.');
      setIsRegistering(false);
      setSenha('');
      setConfirmarSenha('');
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setErrorMessage('Não foi possível conectar ao servidor. Verifique se o backend está a rodar na porta 3000.');
      } else {
        setErrorMessage(err.message || 'Erro ao criar conta.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. AÇÃO DE LOGIN (Conexão com http://localhost:3000/auth/login)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          senha: senha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || data.mensagem || 'E-mail ou senha incorretos.');
      }

      // 1. Guardar Token
      if (data.token) {
        localStorage.setItem('ke_bella_token', data.token);
      }

      // 2. Extrair o objeto do utilizador da resposta da API
      const usuarioObj = data.usuario || data.cliente || data.user || (data.nome ? data : null);

      if (usuarioObj) {
        localStorage.setItem('ke_bella_user', JSON.stringify(usuarioObj));
      } else {
        // Fallback caso a API retorne apenas e-mail ou dados soltos
        localStorage.setItem('ke_bella_user', JSON.stringify({
          nome: email.split('@')[0],
          email: email
        }));
      }

      // 3. Notificar o Header para atualizar o estado imediatamente
      window.dispatchEvent(new Event('storage'));

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setErrorMessage('Não foi possível conectar ao servidor. Verifique se o backend está a rodar na porta 3000.');
      } else {
        setErrorMessage(err.message || 'Erro ao efetuar login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Botão Voltar */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-12">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6e635f] hover:text-[#3a2e2b] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#f0ece9] grid grid-cols-1 md:grid-cols-2">
          
          {/* Lado Esquerdo - Banner */}
          <div className="relative bg-[#3a2e2b] p-10 text-white flex flex-col justify-between overflow-hidden min-h-[320px] md:min-h-[500px]">
            <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800")' }} />
            <div className="relative z-10">
              <span className="font-serif italic text-2xl tracking-wide">Ke Bella</span>
              <p className="text-[10px] uppercase tracking-widest text-white/70 font-semibold">Estética & Beleza</p>
            </div>

            <div className="relative z-10 space-y-4">
              <p className="font-serif text-2xl sm:text-3xl font-light italic leading-snug">
                "Realce a sua beleza natural com o atendimento exclusivo que você merece."
              </p>
              <p className="text-xs text-white/80 font-light">
                Agendamentos rápidos, profissionais qualificados e ambiente aconchegante.
              </p>
            </div>
          </div>

          {/* Lado Direito - Formulários */}
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            
            {/* Abas Alternar */}
            <div className="flex border-b border-[#f0ece9] mb-6">
              <button
                type="button"
                onClick={() => { setIsRegistering(false); setErrorMessage(''); }}
                className={`pb-3 text-xs font-semibold uppercase tracking-wider flex-1 text-center transition-all cursor-pointer ${
                  !isRegistering ? 'border-b-2 border-[#a3644f] text-[#a3644f]' : 'text-[#a09692] hover:text-[#3a2e2b]'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setIsRegistering(true); setErrorMessage(''); }}
                className={`pb-3 text-xs font-semibold uppercase tracking-wider flex-1 text-center transition-all cursor-pointer ${
                  isRegistering ? 'border-b-2 border-[#a3644f] text-[#a3644f]' : 'text-[#a09692] hover:text-[#3a2e2b]'
                }`}
              >
                Criar Conta
              </button>
            </div>

            {/* Alerta de Erro */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FORMULÁRIO DE LOGIN */}
            {!isRegistering ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#3a2e2b] mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full px-4 py-3 bg-[#fcfbfa] border border-[#e5ded8] rounded-xl text-xs text-[#3a2e2b] focus:outline-none focus:border-[#a3644f] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#3a2e2b] mb-1">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-[#fcfbfa] border border-[#e5ded8] rounded-xl text-xs text-[#3a2e2b] focus:outline-none focus:border-[#a3644f] transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09692] hover:text-[#3a2e2b] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#a3644f] hover:bg-[#8a4f3d] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            ) : (
              
              /* FORMULÁRIO DE CADASTRAR */
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#3a2e2b] mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-4 py-2.5 bg-[#fcfbfa] border border-[#e5ded8] rounded-xl text-xs text-[#3a2e2b] focus:outline-none focus:border-[#a3644f] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#3a2e2b] mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seunome@exemplo.com"
                    className="w-full px-4 py-2.5 bg-[#fcfbfa] border border-[#e5ded8] rounded-xl text-xs text-[#3a2e2b] focus:outline-none focus:border-[#a3644f] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#3a2e2b] mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(35) 99899-2300"
                    className="w-full px-4 py-2.5 bg-[#fcfbfa] border border-[#e5ded8] rounded-xl text-xs text-[#3a2e2b] focus:outline-none focus:border-[#a3644f] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#3a2e2b] mb-1">Senha (Mín. 6 caracteres)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-[#fcfbfa] border border-[#e5ded8] rounded-xl text-xs text-[#3a2e2b] focus:outline-none focus:border-[#a3644f] transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09692] hover:text-[#3a2e2b] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#3a2e2b] mb-1">Confirmar Senha</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-[#fcfbfa] border border-[#e5ded8] rounded-xl text-xs text-[#3a2e2b] focus:outline-none focus:border-[#a3644f] transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09692] hover:text-[#3a2e2b] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#a3644f] hover:bg-[#8a4f3d] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}