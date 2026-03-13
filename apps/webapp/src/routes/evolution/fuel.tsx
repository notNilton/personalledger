import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Fuel, Car, Gauge, Loader2, TrendingUp, BarChart3, List } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import PrivacyAmount from '../../components/PrivacyAmount';
import { api } from '../../lib/api';
import type { Vehicle, RefuelingLog, VehicleStats } from './_types';

export const Route = createFileRoute('/evolution/fuel')({
  component: FuelPage,
});

function FuelCharts({ data }: { data: RefuelingLog[] }) {
  const detailedData = [...data]
    .reverse()
    .map((log, index, array) => {
      const nextLog = array[index + 1];
      if (!nextLog) return null;
      const kmDiff = Number(nextLog.odometer) - Number(log.odometer);
      if (kmDiff <= 0) return null;
      return {
        date: new Date(nextLog.transaction.date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
        }),
        consumo: Number((kmDiff / Number(nextLog.fuelLiters)).toFixed(2)),
        gasto: Math.abs(Number(nextLog.transaction.amount)),
        totalKm: Number(nextLog.odometer),
      };
    })
    .filter(Boolean);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card-premium p-6 h-[350px] flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Consumo Médio (km/L)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={detailedData}>
            <defs>
              <linearGradient id="colorConsumo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              fontSize={10}
              fontWeight="bold"
              tickLine={false}
              axisLine={false}
            />
            <YAxis fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="consumo"
              stroke="var(--primary)"
              fillOpacity={1}
              fill="url(#colorConsumo)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card-premium p-6 h-[350px] flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Gasto por Abastecimento (R$)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={detailedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              fontSize={10}
              fontWeight="bold"
              tickLine={false}
              axisLine={false}
            />
            <YAxis fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="gasto" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FuelPage() {
  const [fuelSubTab, setFuelSubTab] = useState<'history' | 'charts'>('history');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get<Vehicle[]>('/vehicles'),
    staleTime: 1000 * 60 * 5,
  });

  const activeVehicleId = selectedVehicleId ?? vehicles[0]?.id ?? null;

  const { data: refuelings = [], isLoading: refuelingsLoading } = useQuery({
    queryKey: ['vehicle-refuelings', activeVehicleId],
    queryFn: () => api.get<RefuelingLog[]>(`/vehicles/${activeVehicleId}/refuelings`),
    enabled: !!activeVehicleId,
    staleTime: 1000 * 60,
  });

  const { data: vehicleStats } = useQuery({
    queryKey: ['vehicle-stats', activeVehicleId],
    queryFn: () => api.get<VehicleStats>(`/vehicles/${activeVehicleId}/stats`),
    enabled: !!activeVehicleId,
    staleTime: 1000 * 60,
  });

  if (vehiclesLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="card-premium p-12 flex flex-col items-center justify-center gap-4 text-center">
        <Car className="w-12 h-12 text-muted-foreground/40" />
        <div>
          <p className="font-bold">Nenhum veículo cadastrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastre um veículo em Veículos para ver o histórico de abastecimentos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Dashboard Card - Mobile Responsive */}
      <div className="card-premium p-0 overflow-hidden border-primary/5">
        {/* Top: Vehicle Selector */}
        <div className="p-4 sm:p-6 border-b border-border bg-gradient-to-r from-card to-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 block mb-0.5">
                Veículo em Análise
              </label>
              <select
                value={activeVehicleId ?? ''}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="bg-transparent font-bold text-base sm:text-lg outline-none cursor-pointer hover:text-primary transition-smooth w-full truncate"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id} className="bg-card text-foreground">
                    {v.nickname ?? `${v.brand} ${v.model}`}
                    {v.licensePlate ? ` (${v.licensePlate})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50">
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-0.5">
                Odômetro
              </p>
              <p className="font-display font-bold text-lg text-foreground">
                {refuelings[0] ? Number(refuelings[0].odometer).toLocaleString('pt-BR') : '—'}
                <span className="text-[10px] ml-1 opacity-50 font-sans">km</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-0.5">
                Registros
              </p>
              <p className="font-display font-bold text-lg text-foreground">
                {refuelings.length}
                <span className="text-[10px] ml-1 opacity-50 font-sans">total</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: Minimalist Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y md:divide-y-0 divide-border/50 bg-muted/5">
          <div className="p-4 sm:p-6 flex flex-col gap-1">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-1.5">
              <Gauge className="w-3 h-3 text-emerald-500" />
              Consumo
            </h4>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black font-display text-foreground">
                {vehicleStats?.avgConsumption.toFixed(1) ?? '—'}
              </span>
              <span className="text-[10px] font-bold text-foreground/40 uppercase">km/L</span>
            </div>
          </div>

          <div className="p-4 sm:p-6 flex flex-col gap-1">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-1.5">
              <Fuel className="w-3 h-3 text-blue-500" />
              Gasto Médio
            </h4>
            <div className="flex items-baseline gap-1">
              {vehicleStats ? (
                <PrivacyAmount
                  value={vehicleStats.avgCost}
                  className="text-xl sm:text-2xl font-black font-display text-foreground"
                />
              ) : (
                <span className="text-xl sm:text-2xl font-black font-display text-foreground">
                  —
                </span>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 col-span-2 md:col-span-1 border-t md:border-t-0 flex flex-col gap-1">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-orange-500" />
              Autonomia
            </h4>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black font-display text-foreground">
                {vehicleStats?.autonomy ?? '—'}
              </span>
              <span className="text-[10px] font-bold text-foreground/40 uppercase">km Est.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs for Fuel */}
      <div className="flex bg-muted/40 p-1.5 rounded-xl border border-border/50 w-full md:w-fit">
        <button
          onClick={() => setFuelSubTab('history')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
            fuelSubTab === 'history'
              ? 'bg-background text-primary shadow-sm'
              : 'text-foreground/60 hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          Histórico
        </button>
        <button
          onClick={() => setFuelSubTab('charts')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
            fuelSubTab === 'charts'
              ? 'bg-background text-primary shadow-sm'
              : 'text-foreground/60 hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Gráficos
        </button>
      </div>

      {fuelSubTab === 'charts' ? (
        <FuelCharts data={refuelings} />
      ) : (
        /* Refueling history */
        <div className="flex flex-col gap-4">
          {refuelingsLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
            </div>
          ) : refuelings.length === 0 ? (
            <div className="py-24 text-center card-premium">
              <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                <Fuel className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-bold text-foreground">Nenhum abastecimento encontrado</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[250px] mx-auto">
                As transações da categoria 'Combustível' vinculadas a este veículo aparecerão aqui.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block card-premium overflow-hidden border-primary/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border">
                        <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-foreground/40">
                          Data do Registro
                        </th>
                        <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-foreground/40">
                          Posto / Estabelecimento
                        </th>
                        <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-foreground/40 text-center">
                          Odômetro
                        </th>
                        <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-foreground/40 text-center">
                          Volume (L)
                        </th>
                        <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-foreground/40 text-right">
                          Valor Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {refuelings.map((h) => (
                        <tr key={h.id} className="hover:bg-muted/10 transition-smooth group">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-foreground">
                                {new Date(h.transaction.date).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  timeZone: 'UTC',
                                })}
                              </span>
                              <span className="text-[9px] font-medium text-foreground/40">
                                {new Date(h.createdAt).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-black text-xs text-foreground group-hover:text-primary transition-colors">
                              {h.station || 'Posto não informado'}
                            </div>
                            <div className="text-[9px] text-foreground/40 uppercase tracking-widest font-bold mt-0.5">
                              {h.fuelType?.replace('_', ' ') ?? 'Combustível'}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/40 border border-border/30">
                              <span className="text-xs font-black text-foreground">
                                {Number(h.odometer).toLocaleString('pt-BR')}
                              </span>
                              <span className="text-[9px] uppercase font-bold text-foreground/40">
                                km
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-black text-primary">
                                {Number(h.fuelLiters).toLocaleString('pt-BR', {
                                  minimumFractionDigits: 2,
                                })}{' '}
                                L
                              </span>
                              <span className="text-[9px] text-foreground/40 font-medium">
                                R${' '}
                                {Number(h.pricePerLiter).toLocaleString('pt-BR', {
                                  minimumFractionDigits: 3,
                                })}
                                /L
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <PrivacyAmount
                              value={-Number(h.transaction.amount)}
                              className="font-black text-sm text-foreground"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View - Cards Layout */}
              <div className="flex flex-col gap-3 md:hidden">
                {refuelings.map((h) => (
                  <div key={h.id} className="card-premium p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-foreground">
                          {new Date(h.transaction.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            timeZone: 'UTC',
                          })}
                        </span>
                        <span className="text-[10px] text-foreground/40 font-medium">
                          {new Date(h.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <PrivacyAmount
                        value={-Number(h.transaction.amount)}
                        className="font-black text-sm text-foreground"
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Fuel className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-xs text-foreground leading-tight">
                          {h.station || 'Posto não informado'}
                        </div>
                        <div className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold mt-1">
                          {h.fuelType?.replace('_', ' ') ?? 'Combustível'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="bg-muted/30 p-2 rounded-lg border border-border/30">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
                          Odômetro
                        </p>
                        <p className="text-xs font-black text-foreground">
                          {Number(h.odometer).toLocaleString('pt-BR')}{' '}
                          <span className="text-[10px] opacity-40">KM</span>
                        </p>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-lg border border-border/30 text-right">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
                          Volume
                        </p>
                        <p className="text-xs font-black text-primary">
                          {Number(h.fuelLiters).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}{' '}
                          <span className="text-[10px] opacity-40">L</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
