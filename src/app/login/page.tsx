'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import RightShowcase from '@/components/RightShowcase';
import IdentifierInput from '@/components/IdentifierInput';
import { validateIdentifier } from '@/utils/validations/field-validators';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!identifier || !password) {
      return setFormError('Preencha todos os campos');
    }

    const { isValid, value } = validateIdentifier(identifier);
    if (!isValid) {
      return setFormError('Credenciais inválidas');
    }

    try {
      await login({ identifier: value, password });
      if (!error) router.replace('/dashboard');
    } catch {
      // erro já é tratado pelo hook useAuth
    }
  }

  return (
    <main className="min-h-screen w-full flex bg-[#0a0b15]">
      {/* ESQUERDA — LOGIN */}
      <section className="flex-1 flex items-center justify-center px-6 md:px-12 py-12 bg-white rounded-r-none rounded-l-3xl shadow-xl">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
          {/* headline + descrição */}
          <div className="space-y-2 mb-6">
            <h1
              className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-[#181b4a]"
              style={{ letterSpacing: '-0.4px' }}
            >
              Bem-vindo ao{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6f43d0] via-[#6f43d0] to-[#6fdcff]">
                ChatCheckout!
              </span>
            </h1>
            <p className="text-slate-600 text-sm sm:text-[15px]">
              Entre e descubra a mágica para o seu negócio.
            </p>
          </div>

          {/* formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="identifier" className="sr-only">
                E-mail, CPF ou CNPJ
              </label>
              <IdentifierInput value={identifier} onChange={setIdentifier} required />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Senha"
                autoComplete="current-password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-primary text-sm hover:underline transition">
                Esqueci minha senha
              </a>
            </div>

            {(formError || error) && (
              <div className="text-destructive text-sm sm:text-base text-center font-semibold">
                {formError || error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-space_cadet via-secondary to-accent text-white font-semibold py-6 rounded-xl shadow-md hover:scale-[1.01] hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-60"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>

            <p className="text-center text-gray-500 text-sm">
              Não possui conta?
              <Link href="/register" className="ml-2 text-[#6f43d0] font-semibold hover:underline">
                Cadastre-se
              </Link>
            </p>
          </form>
        </div>
      </section>

      {/* DIREITA — showcase compartilhado */}
      <RightShowcase />
    </main>
  );
}
