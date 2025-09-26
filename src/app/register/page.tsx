'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/user';
import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import RightShowcase from '@/components/RightShowcase';
import RegisterSuccess from '@/components/RegisterSuccess';

const DEFAULT_ROLE = UserRole.Infoproducer;

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useUser();
  const { login } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    cpf: '',
    password: '',
    role: DEFAULT_ROLE,
    companyName: '',
    cnpj: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);
    setShowLoader(false);
    setLoginLoading(false);
    if (!form.firstName || !form.lastName || !form.email || !form.cpf || !form.password) {
      setFormError('Preencha todos os campos obrigatórios');
      return;
    }
    try {
      await register(form);
      setSuccess(true);
      setShowLoader(true);
      setLoginLoading(false);
      // aguarda 2 segundos antes do login automático
      setTimeout(async () => {
        setLoginLoading(true);
        try {
          await login({ email: form.email, password: form.password });
          router.replace('/dashboard');
        } finally {
          setLoginLoading(false);
        }
      }, 2000);
    } catch {
      setLoginLoading(false);
      // erro já tratado pelo hook
    }
  }

  // Removido o redirecionamento por countdown

  return (
    <main className="min-h-screen w-full flex bg-[#0a0b15]">
      {/* ESQUERDA — CADASTRO */}
      <section className="flex-1 flex items-center justify-center px-6 md:px-12 py-12 bg-white rounded-r-none rounded-l-3xl shadow-xl">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
          {/* sucesso: só texto, loader e contador */}
          {success ? (
            <RegisterSuccess
              showLoader={showLoader}
              message="Preparando sua conta para você..."
              loading={loginLoading}
            />
          ) : (
            <>
              {/* headline + descrição padrão */}
              <div className="space-y-2 mb-6">
                <h1
                  className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-[#181b4a]"
                  style={{ letterSpacing: '-0.4px' }}
                >
                  Crie sua conta
                </h1>
                <p className="text-slate-600 text-sm sm:text-[15px]">
                  Preencha os dados para começar a usar o ChatCheckout.
                </p>
              </div>
              {/* formulário */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-1/2 flex flex-col">
                    <input
                      name="firstName"
                      type="text"
                      placeholder="Nome *"
                      autoComplete="given-name"
                      value={form.firstName}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-xl px-5 py-4 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6f43d0] shadow-sm transition-all text-base"
                    />
                  </div>
                  <div className="w-1/2 flex flex-col">
                    <input
                      name="lastName"
                      type="text"
                      placeholder="Sobrenome *"
                      autoComplete="family-name"
                      value={form.lastName}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-xl px-5 py-4 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6f43d0] shadow-sm transition-all text-base"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <input
                    name="email"
                    type="email"
                    placeholder="E-mail *"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-xl px-5 py-4 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6f43d0] shadow-sm transition-all text-base"
                  />
                </div>
                <div className="flex flex-col">
                  <input
                    name="cpf"
                    type="text"
                    placeholder="CPF *"
                    autoComplete="off"
                    value={form.cpf}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-xl px-5 py-4 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6f43d0] shadow-sm transition-all text-base"
                  />
                </div>
                <div className="flex flex-col">
                  <input
                    name="password"
                    type="password"
                    placeholder="Senha *"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-xl px-5 py-4 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6f43d0] shadow-sm transition-all text-base"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="w-1/2 flex flex-col">
                    <input
                      name="companyName"
                      type="text"
                      placeholder="Nome da empresa"
                      autoComplete="organization"
                      value={form.companyName}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-xl px-5 py-4 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6f43d0] shadow-sm transition-all text-base"
                    />
                    <span className="text-xs text-gray-400 mt-1">Opcional</span>
                  </div>
                  <div className="w-1/2 flex flex-col">
                    <input
                      name="cnpj"
                      type="text"
                      placeholder="CNPJ"
                      autoComplete="off"
                      value={form.cnpj}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-xl px-5 py-4 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6f43d0] shadow-sm transition-all text-base"
                    />
                    <span className="text-xs text-gray-400 mt-1">Opcional</span>
                  </div>
                </div>
                {/* role não é exibido, mas é enviado como DEFAULT_ROLE no payload */}

                {(formError || error) && (
                  <div className="text-red-600 text-sm sm:text-base text-center font-semibold">
                    {formError || error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full bg-gradient-to-r from-[#181b4a] via-[#6f43d0] to-[#6fdcff] text-white font-semibold py-4 rounded-xl shadow-md hover:scale-[1.01] hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#6f43d0] disabled:opacity-60"
                >
                  {loading ? 'Cadastrando…' : 'Cadastrar'}
                </button>
                <p className="text-center text-gray-500 text-sm">
                  Já possui conta?
                  <Link href="/login" className="ml-2 text-[#6f43d0] font-semibold hover:underline">
                    Entrar
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </section>
      {/* DIREITA — showcase compartilhado */}
      <RightShowcase />
    </main>
  );
}
