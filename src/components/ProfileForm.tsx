'use client';

import { useState } from 'react';
import PersonalInfoTab from '@/components/profile/PersonalInfoTab';
import PaymentInfoTab from '@/components/profile/PaymentInfoTab';
import PasswordTab from '@/components/profile/PasswordTab';
import { User, CreditCard, Lock } from 'lucide-react';

type TabType = 'personal' | 'payment' | 'password';

const tabs = [
  {
    id: 'personal' as TabType,
    name: 'Informações Pessoais',
    icon: <User className="w-4 h-4" />,
  },
  {
    id: 'payment' as TabType,
    name: 'Pagamentos',
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    id: 'password' as TabType,
    name: 'Senha',
    icon: <Lock className="w-4 h-4" />,
  },
];

export default function ProfileForm() {
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === tab.id ? 'text-secondary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.name}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary/80 to-primary/80" />
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo das Abas */}
      <div>
        {activeTab === 'personal' && <PersonalInfoTab />}
        {activeTab === 'payment' && <PaymentInfoTab />}
        {activeTab === 'password' && <PasswordTab />}
      </div>
    </div>
  );
}
