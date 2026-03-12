'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { UserProfile, UserUpdatePayload } from '@/types/user';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGlobalToast } from '@/contexts/ToastContext';
import { formatDocument } from '@/utils/validations';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  return true;
};

const validateCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  return true;
};

export default function PersonalInfoTab() {
  const { user, accessToken, setUserGlobal } = useAuth();
  const { update, error } = useUser(accessToken ?? undefined);
  const userProfile = user as UserProfile | undefined;
  const toast = useGlobalToast();

  const [form, setForm] = useState<UserUpdatePayload>({});
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setForm({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        cpf: userProfile.cpf,
        companyName: userProfile.companyName,
        cnpj: userProfile.cnpj,
      });
      // Se há dados empresariais, abre automaticamente
      if (userProfile.companyName || userProfile.cnpj) {
        setIsCompanyOpen(true);
      }
    }
  }, [userProfile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    if (form.email && !validateEmail(form.email)) {
      setFormError('Email inválido');
      setSaving(false);
      return;
    }

    if (form.cpf && !validateCPF(form.cpf)) {
      setFormError('CPF inválido');
      setSaving(false);
      return;
    }

    if (form.cnpj && !validateCNPJ(form.cnpj)) {
      setFormError('CNPJ inválido');
      setSaving(false);
      return;
    }

    try {
      // Create payload with only changed fields (PATCH behavior)
      const changes: Partial<UserUpdatePayload> = {};

      if (form.firstName !== userProfile?.firstName) {
        changes.firstName = form.firstName;
      }
      if (form.lastName !== userProfile?.lastName) {
        changes.lastName = form.lastName;
      }
      if (form.companyName !== userProfile?.companyName) {
        changes.companyName = form.companyName;
      }

      // CPF, CNPJ and Email are immutable - only send if they don't exist yet
      if (form.cpf && !userProfile?.cpf) {
        changes.cpf = form.cpf.replace(/\D/g, '');
      }
      if (form.cnpj && !userProfile?.cnpj) {
        changes.cnpj = form.cnpj.replace(/\D/g, '');
      }

      // Don't send request if nothing changed
      if (Object.keys(changes).length === 0) {
        toast.info('Nenhuma alteração detectada');
        setSaving(false);
        return;
      }

      const updatedUser = await update(userProfile?.id || '', changes);
      if (updatedUser) {
        // Merge com dados existentes para não perder campos não retornados pelo backend
        setUserGlobal({ ...userProfile, ...updatedUser });
      }
      toast.success('Perfil atualizado com sucesso!');
    } catch {
      const errorMsg = error || 'Erro ao salvar alterações';
      setFormError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 pb-4">Informações Pessoais</h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nome</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Digite seu nome"
              value={form.firstName ?? ''}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Digite seu sobrenome"
              value={form.lastName ?? ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-3 space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Digite seu email"
            disabled
            value={form.email ?? ''}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2 mb-3">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            name="cpf"
            type="text"
            placeholder="000.000.000-00"
            disabled
            value={formatDocument(form.cpf ?? '')}
            onChange={handleChange}
          />
        </div>
      </Card>

      <Card className="p-6">
        <button
          type="button"
          onClick={() => setIsCompanyOpen(!isCompanyOpen)}
          className="w-full flex items-center justify-between text-left mb-4"
        >
          <div>
            <h3 className="text-lg font-semibold text-[#181b4a]">Informações da Empresa</h3>
            <p className="text-sm text-gray-500 mt-1">
              {isCompanyOpen ? 'Clique para ocultar' : 'Clique para expandir'}
            </p>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isCompanyOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isCompanyOpen && (
          <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-gray-100">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                placeholder="Nome da empresa"
                value={form.companyName ?? ''}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                name="cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
                disabled={userProfile?.cnpj ? true : false}
                value={formatDocument(form.cnpj ?? '')}
                onChange={handleChange}
              />
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-end gap-3 mt-6">
        {formError && <span className="text-destructive text-sm font-medium">{formError}</span>}
        <Button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-accent to-secondary text-white font-semibold px-8 py-6 rounded-xl shadow hover:scale-[1.02] hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
}
