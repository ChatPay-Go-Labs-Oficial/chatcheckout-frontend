'use client';

import ProfileForm from '@/components/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="min-h-screen w-full bg-[#f7f8fa] flex">
      <div className="flex flex-col justify-start items-start w-full max-w-2xl px-16 py-16">
        <h2 className="text-2xl font-bold text-[#181b4a] mb-8">Editar Perfil</h2>
        <ProfileForm />
      </div>
    </div>
  );
}
