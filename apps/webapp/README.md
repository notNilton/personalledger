# 📱 BudgetWise Webapp

O **BudgetWise** é a interface web principal para gerenciamento financeiro pessoal, construída com foco em performance, estética premium e usabilidade intuitiva.

## 🚀 Tecnologias

- **Core:** [React 19](https://react.dev/)
- **Routing & Framework:** [TanStack Start](https://tanstack.com/start) (SSR/Streaming)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** TanStack Router Loaders & Hooks

## ✨ Funcionalidades Implementadas

- **Dashboard Financeiro:** Visão consolidada de saldo total, receitas, despesas e "Safe-to-Spend".
- **Gestão de Transações:** Listagem detalhada com categorização automática (mock) e filtros.
- **Contas e Carteiras:** Visualização de patrimônio líquido e saldos individuais por instituição.
- **Orçamentos (Budgeting):** Definição de metas por categoria com indicadores visuais de progresso.
- **Importação de Dados:** Fluxo para upload de extratos bancários (OFX/CSV).
- **Settings:** Personalização de perfil, segurança e preferências de interface.

## 🛠️ Desenvolvimento

Para rodar o webapp localmente (dentro do monorepo):

```bash
# Na raiz do projeto
npm run dev:webapp
```

O servidor iniciará em `http://localhost:3000` (ou porta configurada pelo TanStack Start).

## 📁 Estrutura de Pastas

- `/src/routes`: Definição de rotas baseadas em arquivos (TanStack Router).
- `/src/components`: Componentes de UI reutilizáveis e layout.
- `/src/styles`: Configurações globais de CSS e temas.

---

Desenvolvido por **nilByte**.
