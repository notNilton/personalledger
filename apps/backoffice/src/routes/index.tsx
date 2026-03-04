import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

// MOCK DATA: Representa o response do endpoint GET /vehicles
const MOCK_VEHICLES = [
  {
    id: '1',
    name: 'Caminhão de Entrega 01',
    licensePlate: 'ABC-1234',
    make: 'Mercedes-Benz',
    model: 'Actros',
    year: 2021,
    isActive: true,
  },
  {
    id: '2',
    name: 'Carro Executivo 05',
    licensePlate: 'XYZ-9876',
    make: 'Toyota',
    model: 'Corolla',
    year: 2023,
    isActive: true,
  },
  {
    id: '3',
    name: 'Van de Transporte',
    licensePlate: 'DEF-5678',
    make: 'Renault',
    model: 'Master',
    year: 2018,
    isActive: false,
  },
]

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Frota de Veículos
            </h1>
            <p className="text-gray-500 mt-2">
              Visão geral e monitoramento (Mockado)
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
            Adicionar Veículo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_VEHICLES.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    {vehicle.name}
                  </CardTitle>
                  <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">
                    {vehicle.licensePlate}
                  </p>
                </div>
                <Badge
                  variant={vehicle.isActive ? 'default' : 'secondary'}
                  className={
                    vehicle.isActive
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {vehicle.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fabricante</span>
                    <span className="font-medium text-gray-900">
                      {vehicle.make}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Modelo</span>
                    <span className="font-medium text-gray-900">
                      {vehicle.model}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ano</span>
                    <span className="font-medium text-gray-900">
                      {vehicle.year}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Ver Abastecimentos
                  </button>
                  <span className="text-gray-300">|</span>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Editar Detalhes
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
