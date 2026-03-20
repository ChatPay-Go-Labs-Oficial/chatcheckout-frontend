import { useState } from 'react';
import PersonalInfoTab from '@/components/profile/PersonalInfoTab';
import PaymentInfoTab from '@/components/profile/PaymentInfoTab';
import PasswordTab from '@/components/profile/PasswordTab';
import { User, CreditCard, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfileForm() {
  return (
    <Tabs defaultValue="personal" className="w-full">
      <div className="p-1 bg-muted rounded-lg flex items-center border shadow-sm w-full sm:w-fit mb-6 overflow-x-auto">
        <TabsList className="bg-transparent h-auto sm:h-7 p-0 gap-1 min-w-max">
          <TabsTrigger 
            value="personal" 
            className="h-7 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-semibold"
          >
            <User className="size-3.5 mr-2" />
            Informações Pessoais
          </TabsTrigger>
          <TabsTrigger 
            value="payment" 
            className="h-7 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-semibold"
          >
            <CreditCard className="size-3.5 mr-2" />
            Configuração de Conta de Pagamentos
          </TabsTrigger>
          <TabsTrigger 
            value="password" 
            className="h-7 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-semibold"
          >
            <Lock className="size-3.5 mr-2" />
            Senha
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="personal" className="mt-0 outline-none">
        <PersonalInfoTab />
      </TabsContent>
      <TabsContent value="payment" className="mt-0 outline-none">
        <PaymentInfoTab />
      </TabsContent>
      <TabsContent value="password" className="mt-0 outline-none">
        <PasswordTab />
      </TabsContent>
    </Tabs>
  );
}
