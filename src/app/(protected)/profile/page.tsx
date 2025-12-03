'use client';

import ProfileForm from '@/components/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="w-full flex">
      <div className="flex flex-col w-full max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#181b4a]">Perfil do Usuário</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie suas informações pessoais e configurações
          </p>
        </div>
        <ProfileForm />
      </div>
    </div>
  );
}
