'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/types/user';

export default function ProfilePage() {
  const { user } = useAuth();
  const userProfile = user as UserProfile | undefined;
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    cpf: '',
    companyName: '',
    cnpj: '',
  });

  useEffect(() => {
    setLoading(true);
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
    setLoading(false);
  }, [userProfile]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Exemplo: ajuste para sua API real
    // await fetch('/api/profile', { method: 'PUT', body: JSON.stringify(form) });
    setLoading(false);
    // Feedback visual pode ser adicionado aqui
  }

  return (
    <div className="min-h-screen w-full bg-[#f7f8fa] flex">
      {/* Sidebar já está fora, aqui é só o content */}
      <div className="flex flex-col justify-start items-start w-full max-w-2xl px-16 py-16">
        <h2 className="text-2xl font-bold text-[#181b4a] mb-8">Editar Perfil</h2>
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6fdcff] to-[#6f43d0] flex items-center justify-center shadow">
            <span className="text-3xl font-extrabold text-white">{form.firstName[0] || 'U'}</span>
          </div>
          <button className="bg-[#6fdcff] text-white rounded-full p-2 shadow hover:bg-[#181b4a] transition-all border-2 border-white">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M16.5 7.5l-9 9" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <form className="w-full grid grid-cols-2 gap-x-6 gap-y-4 mb-8" onSubmit={handleSubmit}>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              name="firstName"
              type="text"
              placeholder="Seu nome"
              value={form.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#6fdcff] focus:outline-none bg-[#f7f8fa]"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
            <input
              name="lastName"
              type="text"
              placeholder="Seu sobrenome"
              value={form.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#6fdcff] focus:outline-none bg-[#f7f8fa]"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Seu e-mail"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#6fdcff] focus:outline-none bg-[#f7f8fa]"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <input
              name="cpf"
              type="text"
              placeholder="Seu CPF"
              value={form.cpf}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#6fdcff] focus:outline-none bg-[#f7f8fa]"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <input
              name="companyName"
              type="text"
              placeholder="Nome da empresa"
              value={form.companyName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#6fdcff] focus:outline-none bg-[#f7f8fa]"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
            <input
              name="cnpj"
              type="text"
              placeholder="CNPJ da empresa"
              value={form.cnpj}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#6fdcff] focus:outline-none bg-[#f7f8fa]"
            />
          </div>
        </form>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#6fdcff] to-[#6f43d0] text-white font-semibold py-3 rounded-xl shadow hover:scale-[1.01] hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#6fdcff]"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
}
