import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CarFront, Plus, History, Edit2, Trash2, Loader2 } from 'lucide-react';
import PrivacyAmount from '../../components/PrivacyAmount';
import { api } from '../../lib/api';
import { VehicleModal } from '../../components/VehicleModal';

export const Route = createFileRoute('/settings/vehicles')({
  component: VehiclesPage,
});

interface Vehicle {
  id: string;
  name: string;
  licensePlate?: string;
  make?: string;
  model?: string;
  year?: number;
  tank?: number;
}

interface FuelTransaction {
  id: string;
  description: string;
  amount: number | string;
  date: string;
  refuelingLog?: {
    fuelType?: string;
    fuelLiters?: number | string;
    odometer?: number | string;
  };
}

interface VehicleStats {
  avgConsumption: number;
  avgCost: number;
  avgPricePerLiter: number;
  autonomy: number;
}

function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
}: {
  vehicle: Vehicle;
  onEdit: (v: Vehicle) => void;
  onDelete: (id: string) => void;
}) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['vehicle-stats', vehicle.id],
    queryFn: () => api.get<VehicleStats>(`/vehicles/${vehicle.id}/stats`),
  });

  return (
    <div className="card-premium p-6 group flex flex-col gap-6 relative overflow-hidden h-full">
      <div className="relative flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center border border-border">
            <CarFront className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg tracking-tight">{vehicle.name}</h3>
            <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider flex gap-2">
              <span>{vehicle.make}</span> {vehicle.model && <span>• {vehicle.model}</span>}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {vehicle.licensePlate && (
            <div className="px-2.5 py-1 rounded border border-border bg-muted/20">
              <span className="font-mono font-bold text-[11px] tracking-widest">
                {vehicle.licensePlate}
              </span>
            </div>
          )}
          <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-smooth">
            <button
              onClick={() => onEdit(vehicle)}
              className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-smooth"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(vehicle.id)}
              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-smooth"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border mt-auto">
        <div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
            Autonomia Est.
          </p>
          <p className="font-bold">{isLoading ? '...' : `${stats?.autonomy ?? 0} km`}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
            Consumo Médio
          </p>
          <p className="font-bold text-primary">
            {isLoading ? '...' : `${stats?.avgConsumption ?? 0} km/l`}
          </p>
        </div>
      </div>
    </div>
  );
}

function VehiclesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get<Vehicle[]>('/vehicles'),
  });

  const { data: fuelTransactions = [], isLoading: isFuelLoading } = useQuery({
    queryKey: ['fuel-transactions'],
    queryFn: () => api.get<FuelTransaction[]>('/transactions?classification=FUEL&limit=10'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const handleAdd = () => {
    setModalMode('create');
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setModalMode('edit');
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        'Tem certeza que deseja excluir este veículo? Totais de abastecimento serão mantidos mas o veículo não aparecerá mais.',
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold whitespace-nowrap">Frota & Combustível</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus veículos e acompanhe o desempenho e custos de manutenção.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-smooth active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Adicionar Veículo
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Carregando frota...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          <button
            onClick={handleAdd}
            className="rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center p-8 text-muted-foreground hover:bg-muted/30 hover:border-primary/50 transition-smooth cursor-pointer group min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm tracking-tight">Cadastrar novo veículo</span>
            <span className="text-[10px] font-medium opacity-60">Motos ou carros particulares</span>
          </button>
        </div>
      )}

      {/* Real Refueling History */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
            <History className="w-4 h-4" />
            Últimos Abastecimentos
          </h2>
        </div>

        <div className="card-premium overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Data
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Veículo / Posto
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Detalhes
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isFuelLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground text-sm">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Carregando histórico...
                  </td>
                </tr>
              ) : fuelTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-muted-foreground text-sm italic"
                  >
                    Nenhum abastecimento registrado.
                  </td>
                </tr>
              ) : (
                fuelTransactions.map((t: FuelTransaction) => (
                  <tr key={t.id} className="hover:bg-muted/20 transition-smooth group">
                    <td className="px-6 py-4 text-xs font-medium">
                      {new Date(t.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-xs">{t.description}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                        {t.refuelingLog?.fuelType?.replace('_', ' ') ?? 'Combustível'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3 text-[10px] font-bold">
                        <span className="text-primary">
                          {t.refuelingLog?.fuelLiters
                            ? `${Number(t.refuelingLog.fuelLiters)}L`
                            : '--'}
                        </span>
                        <span className="text-muted-foreground">
                          {t.refuelingLog?.odometer
                            ? `${Number(t.refuelingLog.odometer)} km`
                            : '--'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <PrivacyAmount value={-Number(t.amount)} className="font-bold text-xs" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['vehicles'] })}
        mode={modalMode}
        initialData={selectedVehicle}
      />
    </div>
  );
}
