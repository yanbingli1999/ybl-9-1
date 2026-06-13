export interface City {
  id: string;
  name: string;
  type: 'port' | 'city' | 'capital' | 'overseas';
  x: number;
  y: number;
  description: string;
}

export interface Route {
  id: string;
  fromCityId: string;
  toCityId: string;
  type: 'land' | 'water';
  distance: number;
  baseTimeHours: number;
  baseCost: number;
  stops: number;
  condition: number;
}

export interface Goods {
  id: string;
  name: string;
  category: string;
  weight: number;
  fragility: number;
  basePrice: number;
  icon: string;
  description: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'land' | 'water';
  capacity: number;
  speed: number;
  costPerHour: number;
  purchaseCost: number;
  icon: string;
  description: string;
}

export interface Weather {
  id: string;
  name: string;
  icon: string;
  speedModifier: number;
  damageChance: number;
  delayChance: number;
  description: string;
}

export interface EventEffect {
  type: 'gold' | 'damage' | 'delay' | 'reputation' | 'hint';
  value: number | string;
  description: string;
}

export interface GameEvent {
  id: string;
  type: 'danger' | 'accident' | 'luck' | 'weather';
  title: string;
  description: string;
  choices: string[];
  effects: EventEffect[];
  probability: number;
}

export interface Commission {
  id: string;
  goodsId: string;
  goodsName?: string;
  destinationId: string;
  destinationName?: string;
  quantity: number;
  reward: number;
  deadlineHours: number;
  fragility: number;
  isAccepted: boolean;
  isShipped?: boolean;
  isCompleted?: boolean;
  createdAt?: number;
  acceptedAt?: number;
  acceptedGameHours?: number;
  shippedAt?: number;
  shippedGameHours?: number;
  completedAt?: number;
}

export interface PlayerVehicle {
  id: string;
  vehicleId: string;
  name: string;
  type: 'land' | 'water';
  capacity: number;
  speed: number;
  costPerHour: number;
  icon: string;
  isAvailable: boolean;
}

export interface Trip {
  id: string;
  vehicleId: string;
  routeId: string;
  commissionIds: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  departureTime: number;
  departureGameHours?: number;
  eta: number;
  etaGameHours?: number;
  actualArrivalTime?: number;
  actualArrivalGameHours?: number;
  currentDamage: number;
  weatherId: string;
  events: string[];
  eventEffects: { title: string; effect: any }[];
  totalCost: number;
}

export interface Warehouse {
  id: string;
  level: number;
  capacity: number;
  usedSpace: number;
  upgradeCost: number;
}

export interface LedgerEntry {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  day: number;
  category: string;
  createdAt: number;
}

export type ReputationGrade = '甲' | '乙' | '丙' | '丁';

export interface Player {
  id: string;
  name: string;
  gold: number;
  reputation: number;
  reputationGrade: ReputationGrade;
  priceBonus: number;
  currentDay: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface SaveGame {
  player: Player;
  commissions: Commission[];
  trips: Trip[];
  vehicles: PlayerVehicle[];
  warehouse: Warehouse;
  ledger: LedgerEntry[];
  currentWeatherId: string;
  savedAt: number;
}

export interface SettlementResult {
  tripId: string;
  commissions: {
    commissionId: string;
    goodsName: string;
    quantity: number;
    delivered: number;
    damaged: number;
    reward: number;
    isLate: boolean;
  }[];
  totalIncome: number;
  totalExpense: number;
  totalProfit: number;
  reputationChange: number;
  events: string[];
}
