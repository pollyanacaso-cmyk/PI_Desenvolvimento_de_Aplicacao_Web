import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { salvarSessao } from '../utils/sessao';

interface LoginProps {
  onNavigateHome?: () => void;
  onNavigateProfessionals?: () => void;
  onLoginSuccess?: () => void;
  /** Mensagem exibida ao abrir a tela (ex.: sessão expirada). */
  aviso?: string;
}

export default function Login({ onNavigateHome, onLoginSuccess, aviso }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados dos formulários
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Estados da interface (Mensagens bonitas)
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(aviso ?? '');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

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

      // 🌟 Exibe a mensagem elegante de sucesso
      setSuccessMessage('Conta criada com sucesso! Redirecionando para o login...');

      // Limpa os campos de senha
      setSenha('');
      setConfirmarSenha('');

      // Após 2 segundos, muda suavemente para a aba de login
      setTimeout(() => {
        setIsRegistering(false);
        setSuccessMessage('');
      }, 2500);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
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

      const usuarioObj = data.usuario || data.cliente || data.user || (data.nome ? data : null);

      // Sem id real não existe sessão válida: evita "conta fantasma" que herdaria dados de outra
      if (!usuarioObj?.id) {
        throw new Error('Resposta de login inválida: dados do usuário não retornados.');
      }

      // Sobrescreve qualquer sessão anterior (ke_bella_user + ke_bella_token) e avisa o app
      salvarSessao(usuarioObj, data.token);

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
    <div className="min-h-screen bg-[#f8f5f2] flex flex-col">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Botão Voltar */}
        <button
          onClick={onNavigateHome}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6e635f] hover:text-[#3a2e2b] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

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
                onClick={() => { setIsRegistering(false); setErrorMessage(''); setSuccessMessage(''); }}
                className={`pb-3 text-xs font-semibold uppercase tracking-wider flex-1 text-center transition-all cursor-pointer ${
                  !isRegistering ? 'border-b-2 border-[#a3644f] text-[#a3644f]' : 'text-[#a09692] hover:text-[#3a2e2b]'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setIsRegistering(true); setErrorMessage(''); setSuccessMessage(''); }}
                className={`pb-3 text-xs font-semibold uppercase tracking-wider flex-1 text-center transition-all cursor-pointer ${
                  isRegistering ? 'border-b-2 border-[#a3644f] text-[#a3644f]' : 'text-[#a09692] hover:text-[#3a2e2b]'
                }`}
              >
                Criar Conta
              </button>
            </div>

            {/* 🟢 ALERTA BONITO DE SUCESSO */}
            {successMessage && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2.5 animate-fade-in shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {/* 🔴 ALERTA BONITO DE ERRO */}
            {errorMessage && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2.5 shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
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
    </div>
  );
}