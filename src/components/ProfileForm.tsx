import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { UserProfile, UserUpdatePayload } from '@/types/user';

function validateEmail(email: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}
function validateCPF(cpf: string) {
  return /^\d{11}$/.test(cpf.replace(/\D/g, ''));
}
function validateCNPJ(cnpj: string) {
  return /^\d{14}$/.test(cnpj.replace(/\D/g, ''));
}

export default function ProfileForm() {
  const { user, accessToken, setUserGlobal } = useAuth();
  const { update, error } = useUser(accessToken ?? undefined);
  const userProfile = user as UserProfile | undefined;
  const [form, setForm] = useState<UserUpdatePayload>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setForm({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        cpf: userProfile.cpf || '',
        companyName: userProfile.companyName || '',
        cnpj: userProfile.cnpj || '',
      });
    }
  }, [userProfile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError(null);
    setSuccess(false);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);
    setSaving(true);
    // Validação
    if (!form.firstName || !form.lastName || !form.email || !form.cpf) {
      setFormError('Preencha todos os campos obrigatórios');
      setSaving(false);
      return;
    }
    if (!validateEmail(form.email!)) {
      setFormError('E-mail inválido');
      setSaving(false);
      return;
    }
    if (!validateCPF(form.cpf!)) {
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
      const updatedUser = await update(userProfile?.id || '', form);
      if (updatedUser) {
        setUserGlobal(updatedUser);
      }
      setSuccess(true);
    } catch {
      setFormError(error || 'Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="w-full grid grid-cols-2 gap-x-6 gap-y-4 mb-8"
      onSubmit={handleSubmit}
      aria-label="Formulário de perfil"
    >
      <div className="col-span-1">
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
          Nome
        </label>
        <input
          name="firstName"
          id="firstName"
          type="text"
          placeholder="Seu nome"
          value={form.firstName || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#6fdcff] focus:outline-none bg-[#f7f8fa]"
          required
          disabled={saving}
        />
      </div>
      <div className="col-span-1">
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
          Sobrenome
        </label>
        <input
          name="lastName"
          id="lastName"
          type="text"
          placeholder="Seu sobrenome"
          value={form.lastName || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#6fdcff] focus:outline-none bg-[#f7f8fa]"
          required
          disabled={saving}
        />
      </div>
      <div className="col-span-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          name="email"
          id="email"
          type="email"
          placeholder="Seu e-mail"
          value={form.email || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#6fdcff] focus:outline-none bg-[#f7f8fa]"
          required
          disabled={saving}
        />
      </div>
      <div className="col-span-1">
        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
          CPF
        </label>
        <input
          name="cpf"
          id="cpf"
          type="text"
          placeholder="Seu CPF"
          value={form.cpf || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#6fdcff] focus:outline-none bg-[#f7f8fa]"
          required
          disabled={saving}
        />
      </div>
      <div className="col-span-1">
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
          Empresa
        </label>
        <input
          name="companyName"
          id="companyName"
          type="text"
          placeholder="Nome da empresa"
          value={form.companyName || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#6fdcff] focus:outline-none bg-[#f7f8fa]"
          disabled={saving}
        />
      </div>
      <div className="col-span-1">
        <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
          CNPJ
        </label>
        <input
          name="cnpj"
          id="cnpj"
          type="text"
          placeholder="CNPJ da empresa"
          value={form.cnpj || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#6fdcff] focus:outline-none bg-[#f7f8fa]"
          disabled={saving}
        />
      </div>
      <div className="col-span-2 mt-2">
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#6fdcff] to-[#6f43d0] text-white font-semibold py-3 rounded-xl shadow hover:scale-[1.01] hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#6fdcff]"
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
      {formError && (
        <div className="col-span-2 text-red-600 text-sm text-center font-semibold mt-2">
          {formError}
        </div>
      )}
      {success && (
        <div className="col-span-2 text-green-600 text-sm text-center font-semibold mt-2">
          Perfil atualizado com sucesso!
        </div>
      )}
    </form>
  );
}
