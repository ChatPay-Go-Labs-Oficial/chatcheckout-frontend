'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { useDocumentFormatter } from '@/hooks/useDocumentFormatter';
import { sanitizeDocument } from '@/utils/validations';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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

    if (!validateForm()) {
      setFormError('Por favor, corrija os erros abaixo');
      return;
    }

    try {
      const sanitizedForm = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        cpf: sanitizeDocument(form.cpf),
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
        companyName:
          form.companyName && form.companyName.trim() ? form.companyName.trim() : undefined,
        cnpj: form.cnpj && form.cnpj.trim() ? sanitizeDocument(form.cnpj) : undefined,
      };

      await register(sanitizedForm);
      setSuccess(true);

      setTimeout(async () => {
        setLoginLoading(true);
        try {
          await login({ identifier: form.email, password: form.password });
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
                  <div className="w-1/2 space-y-2">
                    <Label htmlFor="firstName">Nome *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Nome"
                      value={form.firstName}
                      data-testid="firstName-input"
                      autoComplete="given-name"
                      aria-invalid={hasFieldError('firstName')}
                      required
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange('firstName', e.target.value)
                      }
                      onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldBlur('firstName', e.target.value)
                      }
                    />
                    {hasFieldError('firstName') && (
                      <p className="text-destructive text-xs mt-1">{getFieldError('firstName')}</p>
                    )}
                  </div>
                  <div className="w-1/2 space-y-2">
                    <Label htmlFor="lastName">Sobrenome *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Sobrenome"
                      value={form.lastName}
                      data-testid="lastName-input"
                      autoComplete="family-name"
                      aria-invalid={hasFieldError('lastName')}
                      required
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange('lastName', e.target.value)
                      }
                      onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldBlur('lastName', e.target.value)
                      }
                    />
                    {hasFieldError('lastName') && (
                      <p className="text-destructive text-xs mt-1">{getFieldError('lastName')}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="E-mail"
                    value={form.email}
                    data-testid="email-input"
                    autoComplete="email"
                    aria-invalid={hasFieldError('email')}
                    required
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFieldChange('email', e.target.value)
                    }
                    onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFieldBlur('email', e.target.value)
                    }
                  />
                  {hasFieldError('email') && (
                    <p className="text-destructive text-xs mt-1">{getFieldError('email')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    placeholder="CPF"
                    value={form.cpf}
                    data-testid="cpf-input"
                    autoComplete="off"
                    aria-invalid={hasFieldError('cpf')}
                    required
                    onChange={handleCPF}
                    onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFieldBlur('cpf', e.target.value)
                    }
                  />
                  {hasFieldError('cpf') && (
                    <p className="text-destructive text-xs mt-1">{getFieldError('cpf')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Senha"
                    value={form.password}
                    data-testid="password-input"
                    autoComplete="new-password"
                    aria-invalid={hasFieldError('password')}
                    required
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFieldChange('password', e.target.value)
                    }
                    onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFieldBlur('password', e.target.value)
                    }
                  />
                  {hasFieldError('password') && (
                    <p className="text-destructive text-xs mt-1">{getFieldError('password')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirmar senha"
                    value={form.confirmPassword}
                    data-testid="confirmPassword-input"
                    autoComplete="new-password"
                    aria-invalid={hasFieldError('confirmPassword')}
                    required
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFieldChange('confirmPassword', e.target.value)
                    }
                    onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFieldBlur('confirmPassword', e.target.value)
                    }
                  />
                  {hasFieldError('confirmPassword') && (
                    <p className="text-destructive text-xs mt-1">
                      {getFieldError('confirmPassword')}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <div className="w-1/2 space-y-2">
                    <Label htmlFor="companyName">Nome da empresa</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      placeholder="Nome da empresa"
                      value={form.companyName}
                      autoComplete="organization"
                      aria-invalid={hasFieldError('companyName')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange('companyName', e.target.value)
                      }
                      onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldBlur('companyName', e.target.value)
                      }
                    />
                    {hasFieldError('companyName') ? (
                      <p className="text-destructive text-xs mt-1">
                        {getFieldError('companyName')}
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-xs mt-1">Opcional</p>
                    )}
                  </div>
                  <div className="w-1/2 space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      name="cnpj"
                      placeholder="CNPJ"
                      value={form.cnpj}
                      data-testid="cnpj-input"
                      autoComplete="off"
                      aria-invalid={hasFieldError('cnpj')}
                      onChange={handleCNPJ}
                      onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldBlur('cnpj', e.target.value)
                      }
                    />
                    {hasFieldError('cnpj') ? (
                      <p className="text-destructive text-xs mt-1">{getFieldError('cnpj')}</p>
                    ) : (
                      <p className="text-muted-foreground text-xs mt-1">Opcional</p>
                    )}
                  </div>
                </div>

                {(formError || error) && (
                  <div className="text-destructive text-sm sm:text-base text-center font-semibold mt-4">
                    {formError || error}
                  </div>
                )}
                <Button
                  data-testid="submit-button"
                  type="submit"
                  disabled={loading || success}
                  className="w-full bg-gradient-to-r from-space_cadet via-secondary to-accent text-white font-semibold py-6 mt-4 rounded-xl shadow-md hover:scale-[1.01] hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-60"
                >
                  {loading ? 'Cadastrando…' : 'Cadastrar'}
                </Button>
                <p className="text-center text-muted-foreground text-sm mt-4">
                  Já possui conta?
                  <Link href="/login" className="ml-2 text-primary font-semibold hover:underline">
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
