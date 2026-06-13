import type { 
  Commission, 
  Goods, 
  City, 
  Weather, 
  GameEvent,
  Player,
  PlayerVehicle,
  Warehouse,
  SaveGame,
  Trip
} from '../../shared/types';
import { calculateReputationGrade, calculateWarehouseCapacity, calculateWarehouseUpgradeCost } from './settlement';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getCurrentDate = (day: number): string => {
  const baseDate = new Date('2024-01-01');
  baseDate.setDate(baseDate.getDate() + day - 1);
  return `${baseDate.getFullYear()}年${baseDate.getMonth() + 1}月${baseDate.getDate()}日`;
};

export const generateRandomCommissions = (
  goodsList: Goods[],
  cities: City[],
  reputationGrade: string,
  count: number = 6
): Commission[] => {
  const commissions: Commission[] = [];
  const destinations = cities.filter(c => c.id !== 'yuegang');
  
  let qualityMultiplier = 1;
  if (reputationGrade === '甲') qualityMultiplier = 1.5;
  else if (reputationGrade === '乙') qualityMultiplier = 1.2;
  else if (reputationGrade === '丁') qualityMultiplier = 0.8;
  
  for (let i = 0; i < count; i++) {
    const goods = goodsList[Math.floor(Math.random() * goodsList.length)];
    const destination = destinations[Math.floor(Math.random() * destinations.length)];
    
    const baseQuantity = Math.floor(Math.random() * 15) + 5;
    const quantity = Math.ceil(baseQuantity * qualityMultiplier);
    
    const baseReward = goods.basePrice * quantity;
    const rewardMultiplier = 1.2 + Math.random() * 0.6;
    const reward = Math.floor(baseReward * rewardMultiplier * qualityMultiplier);
    
    const deadlineBase = 12 + Math.floor(Math.random() * 36);
    const deadlineHours = Math.ceil(deadlineBase / qualityMultiplier);
    
    const isEmergency = Math.random() < 0.2;
    const finalReward = isEmergency ? Math.floor(reward * 1.5) : reward;
    const finalDeadline = isEmergency ? Math.ceil(deadlineHours * 0.7) : deadlineHours;
    
    commissions.push({
      id: generateId(),
      goodsId: goods.id,
      goodsName: goods.name,
      destinationId: destination.id,
      destinationName: destination.name,
      quantity,
      reward: finalReward,
      deadlineHours: finalDeadline,
      fragility: goods.fragility,
      isAccepted: false,
      createdAt: Date.now(),
    });
  }
  
  return commissions;
};

export const getRandomWeather = (weatherList: Weather[]): Weather => {
  const weights = [40, 25, 12, 5, 8, 4, 3, 3];
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < weatherList.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return weatherList[i];
    }
  }
  
  return weatherList[0];
};

export const getRandomEvents = (
  eventsList: GameEvent[],
  routeType: 'land' | 'water',
  count: number = 2
): GameEvent[] => {
  const filteredEvents = eventsList.filter(e => {
    if (routeType === 'water' && e.id === 'bandit') return false;
    if (routeType === 'land' && e.id === 'pirate') return false;
    return true;
  });
  
  const selected: GameEvent[] = [];
  const shuffled = [...filteredEvents].sort(() => Math.random() - 0.5);
  
  for (const event of shuffled) {
    if (selected.length >= count) break;
    if (Math.random() < event.probability * 2) {
      selected.push(event);
    }
  }
  
  return selected;
};

export const createInitialPlayer = (): Player => {
  return {
    id: generateId(),
    name: '月港邮差',
    gold: 1000,
    reputation: 600,
    reputationGrade: '丙',
    priceBonus: 0,
    currentDay: 1,
    timeOfDay: 'morning',
  };
};

export const createInitialVehicles = (): PlayerVehicle[] => {
  return [
    {
      id: generateId(),
      vehicleId: 'donkey-cart',
      name: '驴车',
      type: 'land',
      capacity: 50,
      speed: 12,
      costPerHour: 5,
      icon: '🐴',
      isAvailable: true,
    },
    {
      id: generateId(),
      vehicleId: 'small-boat',
      name: '小渡船',
      type: 'water',
      capacity: 80,
      speed: 20,
      costPerHour: 15,
      icon: '⛵',
      isAvailable: true,
    },
  ];
};

export const createInitialWarehouse = (): Warehouse => {
  const level = 1;
  return {
    id: generateId(),
    level,
    capacity: calculateWarehouseCapacity(level),
    usedSpace: 0,
    upgradeCost: calculateWarehouseUpgradeCost(level),
  };
};

export const createInitialSaveGame = (): SaveGame => {
  const player = createInitialPlayer();
  const repInfo = calculateReputationGrade(player.reputation);
  player.reputationGrade = repInfo.grade;
  player.priceBonus = repInfo.priceBonus;
  
  return {
    player,
    commissions: [],
    trips: [],
    vehicles: createInitialVehicles(),
    warehouse: createInitialWarehouse(),
    ledger: [],
    currentWeatherId: 'sunny',
    savedAt: Date.now(),
  };
};

export const advanceTime = (player: Player): Player => {
  const timeOrder: Player['timeOfDay'][] = ['morning', 'afternoon', 'evening', 'night'];
  const currentIndex = timeOrder.indexOf(player.timeOfDay);
  
  let newTimeOfDay: Player['timeOfDay'];
  let newDay = player.currentDay;
  
  if (currentIndex === timeOrder.length - 1) {
    newTimeOfDay = 'morning';
    newDay += 1;
  } else {
    newTimeOfDay = timeOrder[currentIndex + 1];
  }
  
  return {
    ...player,
    timeOfDay: newTimeOfDay,
    currentDay: newDay,
  };
};

export const getTimeOfDayName = (timeOfDay: Player['timeOfDay']): string => {
  const names: Record<Player['timeOfDay'], string> = {
    morning: '清晨',
    afternoon: '午后',
    evening: '傍晚',
    night: '夜晚',
  };
  return names[timeOfDay];
};

export const canAcceptCommission = (
  commission: Commission,
  warehouse: Warehouse,
  goodsList: Goods[],
  acceptedCommissions: Commission[]
): { canAccept: boolean; reason?: string } => {
  const goods = goodsList.find(g => g.id === commission.goodsId);
  if (!goods) {
    return { canAccept: false, reason: '货物信息不存在' };
  }
  
  const newLoad = commission.quantity * goods.weight;
  const currentLoad = acceptedCommissions.reduce((total, c) => {
    const g = goodsList.find(good => good.id === c.goodsId);
    return total + (c.quantity * (g?.weight || 1));
  }, 0);
  
  if (currentLoad + newLoad > warehouse.capacity) {
    return { canAccept: false, reason: '仓库容量不足' };
  }
  
  return { canAccept: true };
};

export const calculateWarehouseUsedSpace = (
  commissions: Commission[],
  goodsList: Goods[],
  completedTrips: Trip[]
): number => {
  const activeCommissions = commissions.filter(c => c.isAccepted && !c.isCompleted);
  
  return activeCommissions.reduce((total, commission) => {
    const goods = goodsList.find(g => g.id === commission.goodsId);
    return total + (commission.quantity * (goods?.weight || 1));
  }, 0);
};
