import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Shield,
  ChevronRight,
  LogOut,
  CarFront,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { api } from '../../lib/api';
import { auth } from '../../lib/auth';

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
});

interface UserProfile {
  id: string;
  name?: string;
  email: string;
  avatarUrl?: string;
  privacyModeEnabled?: boolean;
}

function SettingItem({
  icon: Icon,
  title,
  description,
  to,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-smooth cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-2 rounded-xl ${iconBg} ${iconColor} group-hover:bg-primary group-hover:text-primary-foreground transition-smooth`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-sm tracking-tight">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-smooth" />
    </Link>
  );
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }
  return (email?.[0] ?? 'U').toUpperCase();
}

function SettingsPage() {
  const { data: profile } = useQuery({
    queryKey: ['settings-profile'],
    queryFn: () => api.get<UserProfile>('/settings/profile'),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="p-8 max-w-2xl mx-auto flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seu perfil e as preferências de segurança da sua conta.
        </p>
      </div>

      {/* Profile summary */}
      {profile && (
        <div className="card-premium p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(profile.name, profile.email)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate">{profile.name ?? 'Usuário'}</p>
            <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
          </div>
          <Link
            to="/settings/personal-info"
            className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline shrink-0"
          >
            Editar
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">
          Conta e Segurança
        </h3>
        <div className="card-premium overflow-hidden divide-y divide-border">
          <SettingItem
            icon={User}
            to="/settings/personal-info"
            title="Informações Pessoais"
            description="Nome, email e foto de perfil."
          />
          <SettingItem
            icon={Shield}
            to="/settings/data-privacy"
            title="Privacidade e Dados"
            description="Controle de dados e configurações de privacidade."
          />
          <SettingItem
            icon={CarFront}
            to="/settings/vehicles"
            title="Gerenciar Frota"
            description="Cadastre seus veículos e acompanhe o consumo."
          />
          <SettingItem
            icon={Wallet}
            to="/settings/accounts"
            title="Gerenciar Contas Bancárias"
            description="Gerencie seus saldos e instituições financeiras."
          />
        </div>
      </div>

      <div className="flex justify-center pt-8 border-t border-border mt-4">
        <button
          onClick={() => auth.logout()}
          className="flex items-center gap-2 text-rose-500 font-bold text-sm hover:underline transition-smooth"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}
