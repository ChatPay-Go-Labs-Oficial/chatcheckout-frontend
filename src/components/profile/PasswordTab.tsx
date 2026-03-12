'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function PasswordTab() {
  return (
    <Card>
      <CardContent className="text-center py-12 pt-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Alteração de Senha</h3>
        <p className="text-sm text-muted-foreground">
          Em breve você poderá alterar sua senha aqui.
        </p>
      </CardContent>
    </Card>
  );
}
