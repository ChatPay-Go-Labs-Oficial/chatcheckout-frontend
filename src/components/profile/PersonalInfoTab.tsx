'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { UserProfile, UserUpdatePayload } from '@/types/user';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGlobalToast } from '@/contexts/ToastContext';
import { formatDocument } from '@/utils/validations';
import { ChevronDown, RefreshCcw, User as UserIcon, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      const changes: Partial<UserUpdatePayload> = {};
      if (form.firstName !== userProfile?.firstName) changes.firstName = form.firstName;
      if (form.lastName !== userProfile?.lastName) changes.lastName = form.lastName;
      if (form.companyName !== userProfile?.companyName) changes.companyName = form.companyName;
      if (form.cpf && !userProfile?.cpf) changes.cpf = form.cpf.replace(/\D/g, '');
      if (form.cnpj && !userProfile?.cnpj) changes.cnpj = form.cnpj.replace(/\D/g, '');

      if (Object.keys(changes).length === 0) {
        toast.info('Nenhuma alteração detectada');
        setSaving(false);
        return;
      }

      const updatedUser = await update(userProfile?.id || '', changes);
      if (updatedUser) setUserGlobal({ ...userProfile, ...updatedUser });
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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 animate-in fade-in duration-300 w-full max-w-4xl"
    >
      <Card className="shadow-sm border-muted/60">
        <CardHeader className="py-2.5 px-5 border-b bg-muted/10">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-muted-foreground/80" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>

        <CardContent className="px-5 pt-3 pb-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-xs font-medium text-foreground">
                Nome
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Ex: Matheus"
                value={form.firstName ?? ''}
                onChange={handleChange}
                className="bg-muted/30 focus-visible:ring-1 h-9 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                disabled
                value={form.email ?? ''}
                className="bg-muted/50 h-9 text-sm border-dashed"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cpf" className="text-xs font-medium text-foreground">
                CPF
              </label>
              <Input
                id="cpf"
                name="cpf"
                type="text"
                disabled
                value={formatDocument(form.cpf ?? '')}
                className="bg-muted/50 h-9 text-sm border-dashed"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-muted/60">
        <button
          type="button"
          onClick={() => setIsCompanyOpen(!isCompanyOpen)}
          className="w-full flex items-center justify-between p-3 px-5 hover:bg-muted/5 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground/80" />
            <div className="text-left">
              <h3 className="text-sm font-bold text-foreground">Informações da Empresa</h3>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {isCompanyOpen ? 'Recolher detalhes' : 'Exibir detalhes (Opcional)'}
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-muted-foreground transition-transform duration-200',
              isCompanyOpen && 'rotate-180',
            )}
          />
        </button>

        {isCompanyOpen && (
          <CardContent className="px-5 pt-0 pb-5 animate-in slide-in-from-top-1 duration-200">
            <div className="border-t border-muted/30 pt-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="companyName" className="text-xs font-medium text-foreground">
                    Nome da Empresa
                  </label>
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="Ex: Minha Empresa LTDA"
                    value={form.companyName ?? ''}
                    onChange={handleChange}
                    className="bg-muted/30 focus-visible:ring-1 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="cnpj" className="text-xs font-medium text-foreground">
                    CNPJ
                  </label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    type="text"
                    disabled={!!userProfile?.cnpj}
                    value={formatDocument(form.cnpj ?? '')}
                    onChange={handleChange}
                    className={cn(
                      'h-9 text-sm',
                      userProfile?.cnpj ? 'bg-muted/50 border-dashed' : 'bg-muted/30',
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-muted/30">
        {formError && (
          <span className="text-destructive text-[13px] font-bold w-full text-center sm:text-right sm:w-auto">
            {formError}
          </span>
        )}
        <Button
          type="submit"
          disabled={saving}
          className="shadow-md px-8 h-10 font-bold text-sm bg-primary hover:bg-primary/90 w-full sm:w-auto"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 animate-spin" />
              Processando...
            </span>
          ) : (
            'Salvar Alterações'
          )}
        </Button>
      </div>
    </form>
  );
}
