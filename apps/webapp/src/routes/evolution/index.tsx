import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/evolution/')({
  beforeLoad: () => {
    throw redirect({
      to: '/evolution/budgets',
    });
  },
});
