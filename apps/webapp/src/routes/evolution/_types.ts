export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Budget {
  id: string;
  categoryId?: string;
  amountLimit: number | string;
  spent: number;
  month: number;
  year: number;
  category?: Category;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number | string;
  currentAmount: number | string;
  deadline?: string;
  icon?: string;
  color?: string;
}

export interface Vehicle {
  id: string;
  nickname?: string;
  brand: string;
  model: string;
  licensePlate?: string;
}

export interface RefuelingLog {
  id: string;
  createdAt: string;
  station?: string;
  fuelType: string;
  fuelLiters: number | string;
  odometer: number | string;
  pricePerLiter: number | string;
  transaction: {
    amount: number | string;
    date: string;
  };
}

export interface VehicleStats {
  avgConsumption: number;
  avgCost: number;
  autonomy: number;
}
