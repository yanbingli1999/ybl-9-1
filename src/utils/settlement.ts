import type { 
  Trip, 
  Commission, 
  Goods, 
  Weather, 
  GameEvent, 
  SettlementResult,
  LedgerEntry,
  ReputationGrade
} from '../../shared/types';
import { calculateIsLateGameTime } from './gameLogic';

export interface TripSettlement {
  tripId: string;
  commissions: {
    commissionId: string;
    goodsName: string;
    quantity: number;
    delivered: number;
    damaged: number;
    baseReward: number;
    actualReward: number;
    isLate: boolean;
    latePenalty: number;
  }[];
  tripCost: number;
  totalIncome: number;
  totalExpense: number;
  totalProfit: number;
  reputationChange: number;
  events: string[];
  lateCount: number;
  damageCount: number;
}

export const calculateReputationGrade = (score: number): { grade: ReputationGrade; priceBonus: number } => {
  if (score >= 900) {
    return { grade: '甲', priceBonus: 20 };
  } else if (score >= 700) {
    return { grade: '乙', priceBonus: 10 };
  } else if (score >= 400) {
    return { grade: '丙', priceBonus: 0 };
  } else {
    return { grade: '丁', priceBonus: -10 };
  }
};

export const calculateActualDamage = (
  commission: Commission,
  weather: Weather,
  routeCondition: number,
  isOverloaded: boolean,
  events: GameEvent[]
): number => {
  const baseFragility = commission.fragility / 100;
  const weatherDamage = weather.damageChance;
  const roadCondition = 1 - routeCondition;
  const overloadFactor = isOverloaded ? 0.3 : 0;
  
  let eventDamage = 0;
  events.forEach(event => {
    event.effects.forEach(effect => {
      if (effect.type === 'damage') {
        eventDamage += (effect.value as number) / 100;
      }
    });
  });
  
  const totalDamageChance = Math.min(0.95,
    baseFragility * (1 + weatherDamage) * (1 + roadCondition) * (1 + overloadFactor) + eventDamage
  );
  
  const random = Math.random();
  if (random < totalDamageChance) {
    const maxDamage = Math.ceil(commission.quantity * 0.4);
    return Math.floor(Math.random() * maxDamage) + 1;
  }
  
  return 0;
};

export const settleTrip = (
  trip: Trip,
  commissions: Commission[],
  goodsList: Goods[],
  weather: Weather,
  routeCondition: number,
  isOverloaded: boolean,
  eventEffects: { title: string; effect: any }[],
  reputationBonus: number,
  totalTripHours: number
): TripSettlement => {
  let totalIncome = 0;
  let totalExpense = trip.totalCost;
  let reputationChange = 0;
  let lateCount = 0;
  let damageCount = 0;
  const eventDescriptions: string[] = [];
  
  let extraDelay = 0;
  let extraGoldFromEvents = 0;
  eventEffects.forEach(item => {
    const { title, effect } = item;
    if (effect.type === 'delay') {
      extraDelay += effect.value as number;
    }
    if (effect.type === 'reputation') {
      reputationChange += effect.value as number;
    }
    if (effect.type === 'gold') {
      extraGoldFromEvents += effect.value as number;
      if ((effect.value as number) < 0) {
        totalExpense += Math.abs(effect.value as number);
      } else {
        totalIncome += (effect.value as number);
      }
    }
    eventDescriptions.push(`${title}: ${effect.description}`);
  });
  
  const settledCommissions = commissions.map(commission => {
    const goods = goodsList.find(g => g.id === commission.goodsId);
    const goodsName = goods?.name || '未知货物';
    
    const relevantEvents = eventEffects
      .filter(e => e.effect.type === 'damage')
      .map(e => {
        const event = e as any;
        return { ...event, effects: [{ type: 'damage', value: e.effect.value }] };
      });
    
    const damaged = calculateActualDamage(
      commission,
      weather,
      routeCondition,
      isOverloaded,
      relevantEvents
    );
    const delivered = commission.quantity - damaged;
    
    const acceptedGameHours = commission.acceptedGameHours || trip.departureGameHours || 0;
    const departedGameHours = trip.departureGameHours || 0;
    
    const isLate = calculateIsLateGameTime(
      acceptedGameHours,
      commission.deadlineHours,
      departedGameHours,
      totalTripHours,
      extraDelay
    );
    
    const latePenalty = isLate ? Math.floor(commission.reward * 0.3) : 0;
    if (latePenalty > 0) {
      totalExpense += latePenalty;
    }
    
    if (damaged > 0) {
      const damageCompensation = Math.floor(commission.reward * (damaged / commission.quantity) * 0.5);
      totalExpense += damageCompensation;
    }
    
    const bonusMultiplier = 1 + (reputationBonus / 100);
    const baseReward = Math.floor(commission.reward * (delivered / commission.quantity) * bonusMultiplier);
    const actualReward = Math.max(0, baseReward - latePenalty);
    
    totalIncome += actualReward;
    
    if (isLate) {
      reputationChange -= 30;
      lateCount++;
    } else {
      reputationChange += 20;
    }
    
    if (damaged > 0) {
      reputationChange -= 10;
      damageCount++;
    }
    
    return {
      commissionId: commission.id,
      goodsName,
      quantity: commission.quantity,
      delivered,
      damaged,
      baseReward: commission.reward,
      actualReward,
      isLate,
      latePenalty,
    };
  });
  
  const totalProfit = totalIncome - totalExpense;
  
  return {
    tripId: trip.id,
    commissions: settledCommissions,
    tripCost: trip.totalCost,
    totalIncome,
    totalExpense,
    totalProfit,
    reputationChange,
    events: eventDescriptions,
    lateCount,
    damageCount,
  };
};

export const generateLedgerEntries = (
  settlement: TripSettlement,
  day: number,
  date: string
): LedgerEntry[] => {
  const entries: LedgerEntry[] = [];
  
  if (settlement.totalIncome > 0) {
    entries.push({
      id: '',
      type: 'income',
      description: `运输收入 - ${settlement.commissions.map(c => c.goodsName).join(', ')}`,
      amount: settlement.totalIncome,
      date,
      day,
      category: '运输',
      createdAt: 0,
    });
  }
  
  if (settlement.tripCost > 0) {
    entries.push({
      id: '',
      type: 'expense',
      description: `运输成本 - 车辆费用`,
      amount: settlement.tripCost,
      date,
      day,
      category: '成本',
      createdAt: 0,
    });
  }
  
  settlement.commissions.forEach(c => {
    if (c.latePenalty > 0) {
      entries.push({
        id: '',
        type: 'expense',
        description: `迟到罚款 - ${c.goodsName}`,
        amount: c.latePenalty,
        date,
        day,
        category: '罚款',
        createdAt: 0,
      });
    }
    if (c.damaged > 0) {
      entries.push({
        id: '',
        type: 'expense',
        description: `货损 - ${c.goodsName} x${c.damaged}`,
        amount: Math.floor(c.baseReward * (c.damaged / c.quantity) * 0.5),
        date,
        day,
        category: '货损',
        createdAt: 0,
      });
    }
  });
  
  return entries;
};

export const calculateWarehouseUpgradeCost = (currentLevel: number): number => {
  return 500 * Math.pow(2, currentLevel - 1);
};

export const calculateWarehouseCapacity = (level: number): number => {
  return 100 + (level - 1) * 50;
};
