'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { useDocumentFormatter } from '@/hooks/useDocumentFormatter';
import { sanitizeDocument } from '@/utils/validations';
import { FormField } from '@/components/FormField';
import Link from 'next/link';
import RightShowcase from '@/components/RightShowcase';
import RegisterSuccess from '@/components/RegisterSuccess';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useUser();
  const { login } = useAuth();
  const { handleCPFChange, handleCNPJChange } = useDocumentFormatter();

  const {
    form,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    hasFieldError,
    getFieldError,
    clearValidationErrors,
  } = useRegisterForm();

  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Handlers para campos com formatação especial
  const handleCPF = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleCPFChange(e.target.value, (value) => handleFieldChange('cpf', value));
    },
    [handleCPFChange, handleFieldChange],
  );

  const handleCNPJ = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleCNPJChange(e.target.value, (value) => handleFieldChange('cnpj', value));
    },
    [handleCNPJChange, handleFieldChange],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    clearValidationErrors();
    setSuccess(false);
    setLoginLoading(false);

    // Validar formulário usando nossos utilitários
    if (!validateForm()) {
      setFormError('Por favor, corrija os erros abaixo');
      return;
    }

    try {
      // Sanitizar dados antes de enviar (remover máscaras)
      const sanitizedForm = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        cpf: sanitizeDocument(form.cpf),
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
        // Só inclui campos opcionais se preenchidos
        companyName:
          form.companyName && form.companyName.trim() ? form.companyName.trim() : undefined,
        cnpj: form.cnpj && form.cnpj.trim() ? sanitizeDocument(form.cnpj) : undefined,
      };

      await register(sanitizedForm);
      setSuccess(true);

      // Aguarda 2 segundos antes do login automático
      setTimeout(async () => {
        setLoginLoading(true);
        try {
          await login({ email: form.email, password: form.password });
          router.replace('/dashboard');
        } catch (loginError) {
          console.error('Erro no login automático:', loginError);
          setFormError('Cadastro realizado com sucesso! Faça login para continuar.');
          setTimeout(() => {
            router.replace('/login');
          }, 2000);
        } finally {
          setLoginLoading(false);
        }
      }, 2000);
    } catch (registrationError) {
      setLoginLoading(false);
      console.error('Erro no cadastro:', registrationError);
    }
  }

  return (
    <main className="min-h-screen w-full flex bg-[#0a0b15]">
      {/* ESQUERDA — CADASTRO */}
      <section className="flex-1 flex items-center justify-center px-6 md:px-12 py-12 bg-white rounded-r-none rounded-l-3xl shadow-xl">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
          {success ? (
            <RegisterSuccess
              showLoader={success}
              message="Preparando sua conta para você..."
              loading={loginLoading}
            />
          ) : (
            <>
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
                  <div className="w-1/2">
                    <FormField
                      name="firstName"
                      placeholder="Nome"
                      value={form.firstName}
                      testId="firstName-input"
                      autoComplete="given-name"
                      hasError={hasFieldError('firstName')}
                      errorMessage={getFieldError('firstName')}
                      required
                      onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      onBlur={(e) => handleFieldBlur('firstName', e.target.value)}
                    />
                  </div>
                  <div className="w-1/2">
                    <FormField
                      name="lastName"
                      placeholder="Sobrenome"
                      value={form.lastName}
                      testId="lastName-input"
                      autoComplete="family-name"
                      hasError={hasFieldError('lastName')}
                      errorMessage={getFieldError('lastName')}
                      required
                      onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      onBlur={(e) => handleFieldBlur('lastName', e.target.value)}
                    />
                  </div>
                </div>
                <FormField
                  name="email"
                  type="email"
                  placeholder="E-mail"
                  value={form.email}
                  testId="email-input"
                  autoComplete="email"
                  hasError={hasFieldError('email')}
                  errorMessage={getFieldError('email')}
                  required
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={(e) => handleFieldBlur('email', e.target.value)}
                />
                <FormField
                  name="cpf"
                  placeholder="CPF"
                  value={form.cpf}
                  testId="cpf-input"
                  autoComplete="off"
                  hasError={hasFieldError('cpf')}
                  errorMessage={getFieldError('cpf')}
                  required
                  onChange={handleCPF}
                  onBlur={(e) => handleFieldBlur('cpf', e.target.value)}
                />
                <FormField
                  name="password"
                  type="password"
                  placeholder="Senha"
                  value={form.password}
                  testId="password-input"
                  autoComplete="new-password"
                  hasError={hasFieldError('password')}
                  errorMessage={getFieldError('password')}
                  required
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={(e) => handleFieldBlur('password', e.target.value)}
                />
                <FormField
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirmar senha"
                  value={form.confirmPassword}
                  testId="confirmPassword-input"
                  autoComplete="new-password"
                  hasError={hasFieldError('confirmPassword')}
                  errorMessage={getFieldError('confirmPassword')}
                  required
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  onBlur={(e) => handleFieldBlur('confirmPassword', e.target.value)}
                />
                <div className="flex gap-3">
                  <div className="w-1/2">
                    <FormField
                      name="companyName"
                      placeholder="Nome da empresa"
                      value={form.companyName}
                      autoComplete="organization"
                      hasError={hasFieldError('companyName')}
                      errorMessage={getFieldError('companyName')}
                      helperText="Opcional"
                      onChange={(e) => handleFieldChange('companyName', e.target.value)}
                      onBlur={(e) => handleFieldBlur('companyName', e.target.value)}
                    />
                  </div>
                  <div className="w-1/2">
                    <FormField
                      name="cnpj"
                      placeholder="CNPJ"
                      value={form.cnpj}
                      testId="cnpj-input"
                      autoComplete="off"
                      hasError={hasFieldError('cnpj')}
                      errorMessage={getFieldError('cnpj')}
                      helperText="Opcional"
                      onChange={handleCNPJ}
                      onBlur={(e) => handleFieldBlur('cnpj', e.target.value)}
                    />
                  </div>
                </div>
                {/* role não é exibido, mas é enviado como DEFAULT_ROLE no payload */}

                {(formError || error) && (
                  <div className="text-red-600 text-sm sm:text-base text-center font-semibold">
                    {formError || error}
                  </div>
                )}
                <button
                  data-testid="submit-button"
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
