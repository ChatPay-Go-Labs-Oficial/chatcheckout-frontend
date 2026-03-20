'use client';

import { Lock, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PasswordTab() {
  return (
    <div className="w-full max-w-4xl animate-in fade-in duration-300">
      <Card className="shadow-sm border-muted/60 flex flex-col">
        <CardHeader className="py-2.5 px-5 border-b bg-muted/10">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground/80" />
            Segurança da Conta
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/30 text-muted-foreground/50 mb-6 border border-muted-foreground/10">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-foreground mb-2">
            Alteração de Senha
          </h3>
          <p className="text-[13px] text-muted-foreground max-w-[320px] leading-relaxed">
            Esta funcionalidade está sendo preparada para garantir a máxima segurança dos seus
            dados. Em breve você poderá atualizar sua credenciais aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
