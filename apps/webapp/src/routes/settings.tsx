import { createFileRoute } from '@tanstack/react-router'
import { User, Bell, Shield, Wallet, Laptop, ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingItem({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-smooth cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-sm tracking-tight">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-display font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie seu perfil e as preferências da sua conta.</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Account Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-4">Conta e Perfil</h3>
          <div className="card-premium overflow-hidden divide-y divide-border">
            <SettingItem icon={User} title="Informações Pessoais" description="Nome, email e foto de perfil." />
            <SettingItem icon={Wallet} title="Planos e Assinatura" description="Você está usando o Plano Grátis." />
          </div>
        </div>

        {/* Preferences Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-4">Preferências</h3>
          <div className="card-premium overflow-hidden divide-y divide-border">
            <SettingItem icon={Bell} title="Notificações" description="Defina como quer ser avisado sobre seus gastos." />
            <SettingItem icon={Laptop} title="Visualização" description="Personalize o tema e a exibição monetária." />
          </div>
        </div>

        {/* Security Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-4">Segurança</h3>
          <div className="card-premium overflow-hidden divide-y divide-border">
            <SettingItem icon={Shield} title="Privacidade e Dados" description="Gerencie sua senha e autenticação de 2 fatores." />
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8 border-t border-border mt-4">
        <button className="text-rose-500 font-bold text-sm hover:underline">
          Sair da conta
        </button>
      </div>
    </div>
  )
}
