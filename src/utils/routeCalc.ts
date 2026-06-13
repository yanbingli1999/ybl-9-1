import type { Route, Vehicle, Weather, Commission, Goods, PlayerVehicle } from '../../shared/types';

type VehicleLike = Vehicle | PlayerVehicle;

export interface RouteCalculation {
  baseTime: number;
  weatherModifier: number;
  vehicleSpeed: number;
  totalTime: number;
  stops: number;
  stopTime: number;
  distance: number;
}

export interface LoadCalculation {
  vehicleCapacity: number;
  currentLoad: number;
  isOverloaded: boolean;
  overloadPenalty: number;
  overloadPercentage: number;
}

export interface DamageCalculation {
  baseFragility: number;
  weatherDamage: number;
  roadCondition: number;
  overloadFactor: number;
  totalDamageChance: number;
  expectedDamage: number;
}

export const calculateRouteTime = (
  route: Route,
  vehicle: VehicleLike,
  weather: Weather
): RouteCalculation => {
  const baseTime = route.baseTimeHours;
  const weatherModifier = weather.speedModifier;
  const vehicleSpeed = vehicle.speed;
  const stops = route.stops;
  const stopTime = stops * 2;
  
  const adjustedTime = (route.distance / vehicleSpeed) * weatherModifier;
  const totalTime = Math.ceil(adjustedTime + stopTime);
  
  return {
    baseTime,
    weatherModifier,
    vehicleSpeed,
    totalTime,
    stops,
    stopTime,
    distance: route.distance,
  };
};

export const calculateLoad = (
  vehicle: VehicleLike,
  commissions: Commission[],
  goodsList: Goods[]
): LoadCalculation => {
  const vehicleCapacity = vehicle.capacity;
  
  const currentLoad = commissions.reduce((total, commission) => {
    const goods = goodsList.find(g => g.id === commission.goodsId);
    const weight = goods ? goods.weight : 1;
    return total + (commission.quantity * weight);
  }, 0);
  
  const isOverloaded = currentLoad > vehicleCapacity;
  const overloadPercentage = isOverloaded ? ((currentLoad - vehicleCapacity) / vehicleCapacity) * 100 : 0;
  const overloadPenalty = isOverloaded ? Math.floor(overloadPercentage * 2) : 0;
  
  return {
    vehicleCapacity,
    currentLoad,
    isOverloaded,
    overloadPenalty,
    overloadPercentage,
  };
};

export const calculateDamageChance = (
  commission: Commission,
  route: Route,
  weather: Weather,
  isOverloaded: boolean
): DamageCalculation => {
  const baseFragility = commission.fragility / 100;
  const weatherDamage = weather.damageChance;
  const roadCondition = 1 - route.condition;
  const overloadFactor = isOverloaded ? 0.3 : 0;
  
  const totalDamageChance = Math.min(0.95, 
    baseFragility * (1 + weatherDamage) * (1 + roadCondition) * (1 + overloadFactor)
  );
  
  const expectedDamage = Math.ceil(commission.quantity * totalDamageChance * 0.3);
  
  return {
    baseFragility,
    weatherDamage,
    roadCondition,
    overloadFactor,
    totalDamageChance,
    expectedDamage,
  };
};

export const calculateTripCost = (
  route: Route,
  vehicle: VehicleLike,
  totalTime: number
): number => {
  const baseCost = route.baseCost;
  const hourlyCost = vehicle.costPerHour * totalTime;
  return baseCost + hourlyCost;
};

export const calculateReward = (
  baseReward: number,
  reputationBonus: number,
  isEmergency: boolean = false
): number => {
  const bonusMultiplier = 1 + (reputationBonus / 100);
  const emergencyMultiplier = isEmergency ? 1.5 : 1;
  return Math.floor(baseReward * bonusMultiplier * emergencyMultiplier);
};

export const findRoutesBetweenCities = (
  routes: Route[],
  fromCityId: string,
  toCityId: string
): Route[] => {
  return routes.filter(
    r => 
      (r.fromCityId === fromCityId && r.toCityId === toCityId) ||
      (r.fromCityId === toCityId && r.toCityId === fromCityId)
  );
};

export const getAvailableVehiclesForRoute = (
  vehicles: Vehicle[],
  route: Route
): Vehicle[] => {
  return vehicles.filter(v => v.type === route.type);
};
