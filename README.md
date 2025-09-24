# ChatCheckout Frontend

Projeto Next.js com App Router, TailwindCSS e TypeScript.

## Estrutura de Pastas
```
src/
  app/         # Rotas, páginas e layouts do Next.js
  components/  # Componentes reutilizáveis
  hooks/       # Custom hooks
  utils/       # Funções utilitárias
  services/    # Integração com APIs/backends
  types/       # Tipos e interfaces
```

## Como rodar localmente
```bash
npm install
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000)

## Configuração de ambiente
Crie um arquivo `.env.local` na raiz do projeto:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=ChatCheckout
```

## Padrões de código
- ESLint + Prettier para padronização
- Imports com alias `@/` para `src/`
- Componentes, hooks e utils organizados por responsabilidade

## Boas práticas
- Use componentes reutilizáveis
- Separe lógica de negócio em hooks e services
- Tipos e interfaces em `src/types`
- Variáveis de ambiente sempre com prefixo `NEXT_PUBLIC_`

## Ferramentas
- [Next.js](https://nextjs.org)
- [TailwindCSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

---

Para dúvidas sobre estrutura ou padrões, consulte este README ou peça ajuda!
