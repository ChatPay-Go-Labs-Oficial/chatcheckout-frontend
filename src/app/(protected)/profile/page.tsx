'use client';

import ProfileForm from '@/components/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="w-full p-8 pt-4 mx-auto pb-6">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Perfil do Usuário</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Gerencie suas informações pessoais e configurações da plataforma com segurança.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
