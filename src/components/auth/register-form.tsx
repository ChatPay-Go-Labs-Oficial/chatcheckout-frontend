'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { useDocumentFormatter } from '@/hooks/useDocumentFormatter';
import { sanitizeDocument } from '@/utils/validations';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from 'next/link';
import { ShoppingCart } from "lucide-react"
import RegisterSuccess from '@/components/RegisterSuccess';

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { register, loading, error: registerError } = useUser();
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
          setLoginLoading(false);
          setTimeout(() => {
            router.replace('/login');
          }, 2000);
        }
      }, 2000);
    } catch (registrationError) {
      setLoginLoading(false);
      console.error('Erro no cadastro:', registrationError);
    }
  }

  if (success) {
    return (
      <div className={cn("w-full max-w-md", className)}>
        <RegisterSuccess
          showLoader={success}
          message="Preparando sua conta para você..."
          loading={loginLoading}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        <FieldGroup className="gap-3">
          <div className="flex flex-col items-center gap-4 text-center mb-4">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight transition-opacity hover:opacity-90">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                <ShoppingCart className="size-5 fill-current/10" />
              </div>
              <span className="text-foreground">ChatCheckout</span>
            </Link>
            <div className="space-y-0.5">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Crie sua conta</h1>
              <p className="text-xs text-balance text-muted-foreground">
                Preencha os dados abaixo para começar
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="firstName">Nome *</FieldLabel>
              <Input
                id="firstName"
                placeholder="Nome"
                autoComplete="given-name"
                value={form.firstName}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                onBlur={(e) => handleFieldBlur('firstName', e.target.value)}
                className={cn("bg-background/50 h-9", hasFieldError('firstName') && "border-destructive")}
                required
              />
              {hasFieldError('firstName') && <FieldError>{getFieldError('firstName')}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="lastName">Sobrenome *</FieldLabel>
              <Input
                id="lastName"
                placeholder="Sobrenome"
                autoComplete="family-name"
                value={form.lastName}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                onBlur={(e) => handleFieldBlur('lastName', e.target.value)}
                className={cn("bg-background/50 h-9", hasFieldError('lastName') && "border-destructive")}
                required
              />
              {hasFieldError('lastName') && <FieldError>{getFieldError('lastName')}</FieldError>}
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="email">E-mail *</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="seu@parceiro.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={(e) => handleFieldBlur('email', e.target.value)}
              className={cn("bg-background/50 h-9", hasFieldError('email') && "border-destructive")}
              required
            />
            {hasFieldError('email') && <FieldError>{getFieldError('email')}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="cpf">CPF *</FieldLabel>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              autoComplete="off"
              value={form.cpf}
              onChange={handleCPF}
              onBlur={(e) => handleFieldBlur('cpf', e.target.value)}
              className={cn("bg-background/50 h-9", hasFieldError('cpf') && "border-destructive")}
              required
            />
            {hasFieldError('cpf') && <FieldError>{getFieldError('cpf')}</FieldError>}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="password">Senha *</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                onBlur={(e) => handleFieldBlur('password', e.target.value)}
                className={cn("bg-background/50 h-9", hasFieldError('password') && "border-destructive")}
                required
              />
              {hasFieldError('password') && <FieldError>{getFieldError('password')}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirmar Senha *</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                onBlur={(e) => handleFieldBlur('confirmPassword', e.target.value)}
                className={cn("bg-background/50 h-9", hasFieldError('confirmPassword') && "border-destructive")}
                required
              />
              {hasFieldError('confirmPassword') && <FieldError>{getFieldError('confirmPassword')}</FieldError>}
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="companyName">Empresa (Opcional)</FieldLabel>
              <Input
                id="companyName"
                placeholder="Nome da empresa"
                value={form.companyName}
                onChange={(e) => handleFieldChange('companyName', e.target.value)}
                onBlur={(e) => handleFieldBlur('companyName', e.target.value)}
                className="bg-background/50 h-9"
              />
              {hasFieldError('companyName') && <FieldError>{getFieldError('companyName')}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="cnpj">CNPJ (Opcional)</FieldLabel>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={form.cnpj}
                onChange={handleCNPJ}
                onBlur={(e) => handleFieldBlur('cnpj', e.target.value)}
                className="bg-background/50 h-9"
              />
              {hasFieldError('cnpj') && <FieldError>{getFieldError('cnpj')}</FieldError>}
            </Field>
          </div>

          {(formError || registerError) && (
            <FieldError className="text-center font-medium mt-1">
              {formError || registerError}
            </FieldError>
          )}

          <Button 
            type="submit" 
            className="w-full h-10 font-bold shadow-sm active:scale-95 transition-all mt-1" 
            disabled={loading || success}
          >
            {loading ? 'Cadastrando...' : 'Criar minha conta'}
          </Button>

          <FieldDescription className="text-center mt-3">
            Já possui uma conta?{" "}
            <Link href="/login" className="font-bold text-primary underline-offset-4 hover:underline">
              Fazer login
            </Link>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  )
}
