import { create } from 'zustand';
import type {
  Player,
  Commission,
  Trip,
  PlayerVehicle,
  Warehouse,
  LedgerEntry,
  SaveGame,
  City,
  Route,
  Goods,
  Vehicle,
  Weather,
  GameEvent,
  ReputationGrade,
} from '../../shared/types';
import { api } from '../services/api';
import {
  createInitialSaveGame,
  generateRandomCommissions,
  getRandomWeather,
  getRandomEvents,
  generateId,
  advanceTime,
  getCurrentDate,
  calculateWarehouseUsedSpace,
} from '../utils/gameLogic';
import {
  calculateReputationGrade,
  settleTrip,
  generateLedgerEntries,
  calculateWarehouseCapacity,
  calculateWarehouseUpgradeCost,
  type TripSettlement,
} from '../utils/settlement';
import {
  calculateRouteTime,
  calculateLoad,
  calculateTripCost,
} from '../utils/routeCalc';

interface GameState {
  player: Player;
  commissions: Commission[];
  trips: Trip[];
  vehicles: PlayerVehicle[];
  warehouse: Warehouse;
  ledger: LedgerEntry[];
  currentWeather: Weather | null;
  
  cities: City[];
  routes: Route[];
  goodsList: Goods[];
  vehicleTemplates: Vehicle[];
  weatherList: Weather[];
  eventsList: GameEvent[];
  
  selectedCommissions: string[];
  selectedVehicle: string | null;
  selectedRoute: string | null;
  currentSettlement: TripSettlement | null;
  showSettlement: boolean;
  currentEvent: GameEvent | null;
  showEvent: boolean;
  
  isLoading: boolean;
  error: string | null;
  
  loadGameData: () => Promise<void>;
  loadSaveGame: () => Promise<void>;
  saveGame: () => Promise<void>;
  newGame: () => void;
  
  generateDailyCommissions: () => void;
  acceptCommission: (commissionId: string) => boolean;
  selectCommission: (commissionId: string) => void;
  selectVehicle: (vehicleId: string) => void;
  selectRoute: (routeId: string) => void;
  
  startTrip: () => Promise<boolean>;
  processTripEvents: (tripId: string) => void;
  handleEventChoice: (choiceIndex: number) => void;
  completeTrip: (tripId: string) => void;
  closeSettlement: () => void;
  
  upgradeWarehouse: () => boolean;
  advanceTimeOfDay: () => void;
  
  updatePlayerGold: (amount: number) => void;
  updatePlayerReputation: (amount: number) => void;
  
  getAvailableVehicles: () => PlayerVehicle[];
  getAvailableRoutes: (destinationId: string) => Route[];
  getCurrentDate: () => string;
}

export const useGameStore = create<GameState>((set, get) => ({
  player: createInitialSaveGame().player,
  commissions: [],
  trips: [],
  vehicles: createInitialSaveGame().vehicles,
  warehouse: createInitialSaveGame().warehouse,
  ledger: [],
  currentWeather: null,
  
  cities: [],
  routes: [],
  goodsList: [],
  vehicleTemplates: [],
  weatherList: [],
  eventsList: [],
  
  selectedCommissions: [],
  selectedVehicle: null,
  selectedRoute: null,
  currentSettlement: null,
  showSettlement: false,
  currentEvent: null,
  showEvent: false,
  
  isLoading: false,
  error: null,
  
  loadGameData: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.data.getAll();
      if (response.success && response.data) {
        const data = response.data as {
          cities: City[];
          routes: Route[];
          goods: Goods[];
          vehicles: Vehicle[];
          weather: Weather[];
          events: GameEvent[];
        };
        set({
          cities: data.cities,
          routes: data.routes,
          goodsList: data.goods,
          vehicleTemplates: data.vehicles,
          weatherList: data.weather,
          eventsList: data.events,
        });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadSaveGame: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.save.get();
      if (response.success && response.data) {
        const saveData = response.data as SaveGame;
        set({
          player: saveData.player,
          commissions: saveData.commissions,
          trips: saveData.trips,
          vehicles: saveData.vehicles,
          warehouse: saveData.warehouse,
          ledger: saveData.ledger,
          currentWeather: saveData.currentWeatherId 
            ? get().weatherList.find(w => w.id === saveData.currentWeatherId) || null
            : null,
        });
      } else {
        get().newGame();
      }
    } catch (error) {
      set({ error: (error as Error).message });
      get().newGame();
    } finally {
      set({ isLoading: false });
    }
  },
  
  saveGame: async () => {
    const state = get();
    const saveData: SaveGame = {
      player: state.player,
      commissions: state.commissions,
      trips: state.trips,
      vehicles: state.vehicles,
      warehouse: state.warehouse,
      ledger: state.ledger,
      currentWeatherId: state.currentWeather?.id || 'sunny',
      savedAt: Date.now(),
    };
    
    try {
      await api.save.post(saveData);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  
  newGame: () => {
    const initial = createInitialSaveGame();
    const weatherList = get().weatherList;
    const weather = weatherList.length > 0 ? getRandomWeather(weatherList) : null;
    
    set({
      player: initial.player,
      commissions: [],
      trips: [],
      vehicles: initial.vehicles,
      warehouse: initial.warehouse,
      ledger: [],
      currentWeather: weather,
      selectedCommissions: [],
      selectedVehicle: null,
      selectedRoute: null,
      currentSettlement: null,
      showSettlement: false,
      currentEvent: null,
      showEvent: false,
    });
    
    get().generateDailyCommissions();
  },
  
  generateDailyCommissions: () => {
    const state = get();
    const newCommissions = generateRandomCommissions(
      state.goodsList,
      state.cities,
      state.player.reputationGrade,
      6
    );
    
    const existingIds = state.commissions.filter(c => !c.isAccepted).map(c => c.id);
    const filteredCommissions = state.commissions.filter(c => c.isAccepted || c.isCompleted);
    
    set({
      commissions: [...filteredCommissions, ...newCommissions],
    });
  },
  
  acceptCommission: (commissionId: string) => {
    const state = get();
    const commission = state.commissions.find(c => c.id === commissionId);
    if (!commission) return false;
    
    const goods = state.goodsList.find(g => g.id === commission.goodsId);
    if (!goods) return false;
    
    const newLoad = commission.quantity * goods.weight;
    const currentLoad = calculateWarehouseUsedSpace(
      state.commissions,
      state.goodsList,
      state.trips
    );
    
    if (currentLoad + newLoad > state.warehouse.capacity) {
      set({ error: '仓库容量不足' });
      return false;
    }
    
    const updatedCommissions = state.commissions.map(c =>
      c.id === commissionId ? { ...c, isAccepted: true } : c
    );
    
    const usedSpace = currentLoad + newLoad;
    
    set({
      commissions: updatedCommissions,
      warehouse: { ...state.warehouse, usedSpace },
    });
    
    return true;
  },
  
  selectCommission: (commissionId: string) => {
    const state = get();
    const selected = state.selectedCommissions;
    let newSelected: string[];
    
    if (selected.includes(commissionId)) {
      newSelected = selected.filter(id => id !== commissionId);
    } else {
      newSelected = [...selected, commissionId];
    }
    
    set({ selectedCommissions: newSelected });
  },
  
  selectVehicle: (vehicleId: string) => {
    set({ selectedVehicle: vehicleId });
  },
  
  selectRoute: (routeId: string) => {
    set({ selectedRoute: routeId });
  },
  
  startTrip: async () => {
    const state = get();
    const { selectedCommissions, selectedVehicle, selectedRoute } = state;
    
    if (selectedCommissions.length === 0) {
      set({ error: '请选择要运输的货物' });
      return false;
    }
    if (!selectedVehicle) {
      set({ error: '请选择运输车辆' });
      return false;
    }
    if (!selectedRoute) {
      set({ error: '请选择运输路线' });
      return false;
    }
    
    const vehicle = state.vehicles.find(v => v.id === selectedVehicle);
    const route = state.routes.find(r => r.id === selectedRoute);
    const weather = state.currentWeather || state.weatherList[0];
    
    if (!vehicle || !route) return false;
    
    const commissions = state.commissions.filter(
      c => selectedCommissions.includes(c.id)
    );
    
    const loadCalc = calculateLoad(vehicle, commissions, state.goodsList);
    if (loadCalc.isOverloaded) {
      set({ error: '车辆超载，请减少货物或更换更大的车辆' });
      return false;
    }
    
    const routeCalc = calculateRouteTime(route, vehicle, weather);
    const tripCost = calculateTripCost(route, vehicle, routeCalc.totalTime);
    
    if (state.player.gold < tripCost) {
      set({ error: '金币不足，无法支付运输费用' });
      return false;
    }
    
    const trip: Trip = {
      id: generateId(),
      vehicleId: selectedVehicle,
      routeId: selectedRoute,
      commissionIds: selectedCommissions,
      status: 'in_progress',
      progress: 0,
      departureTime: Date.now(),
      eta: Date.now() + routeCalc.totalTime * 3600 * 1000,
      currentDamage: 0,
      weatherId: weather.id,
      events: [],
      totalCost: tripCost,
    };
    
    const updatedVehicles = state.vehicles.map(v =>
      v.id === selectedVehicle ? { ...v, isAvailable: false } : v
    );
    
    set({
      trips: [...state.trips, trip],
      vehicles: updatedVehicles,
      player: { ...state.player, gold: state.player.gold - tripCost },
      selectedCommissions: [],
      selectedVehicle: null,
      selectedRoute: null,
    });
    
    await get().saveGame();
    return true;
  },
  
  processTripEvents: (tripId: string) => {
    const state = get();
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;
    
    const route = state.routes.find(r => r.id === trip.routeId);
    if (!route) return;
    
    const events = getRandomEvents(state.eventsList, route.type, 2);
    if (events.length > 0) {
      set({
        currentEvent: events[0],
        showEvent: true,
      });
    } else {
      get().completeTrip(tripId);
    }
  },
  
  handleEventChoice: (choiceIndex: number) => {
    const state = get();
    const event = state.currentEvent;
    if (!event) return;
    
    const effect = event.effects[choiceIndex];
    const inProgressTrip = state.trips.find(t => t.status === 'in_progress');
    
    if (inProgressTrip && effect) {
      const updatedTrips = state.trips.map(t => {
        if (t.id === inProgressTrip.id) {
          return {
            ...t,
            events: [...t.events, `${event.title}: ${effect.description}`],
          };
        }
        return t;
      });
      set({ trips: updatedTrips });
    }
    
    if (effect?.type === 'gold') {
      get().updatePlayerGold(effect.value as number);
    }
    if (effect?.type === 'reputation') {
      get().updatePlayerReputation(effect.value as number);
    }
    
    set({
      currentEvent: null,
      showEvent: false,
    });
    
    if (inProgressTrip) {
      setTimeout(() => {
        get().completeTrip(inProgressTrip.id);
      }, 500);
    }
  },
  
  completeTrip: (tripId: string) => {
    const state = get();
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;
    
    const vehicle = state.vehicles.find(v => v.id === trip.vehicleId);
    const route = state.routes.find(r => r.id === trip.routeId);
    const weather = state.weatherList.find(w => w.id === trip.weatherId) || state.weatherList[0];
    
    if (!vehicle || !route) return;
    
    const commissions = state.commissions.filter(
      c => trip.commissionIds.includes(c.id)
    );
    
    const loadCalc = calculateLoad(vehicle, commissions, state.goodsList);
    
    const tripEvents = state.eventsList.filter(e =>
      trip.events.some(ev => ev.startsWith(e.title))
    );
    
    const settlement = settleTrip(
      trip,
      commissions,
      state.goodsList,
      weather,
      route.condition,
      loadCalc.isOverloaded,
      tripEvents,
      state.player.priceBonus
    );
    
    const ledgerEntries = generateLedgerEntries(
      settlement,
      state.player.currentDay,
      getCurrentDate(state.player.currentDay)
    );
    
    const updatedCommissions = state.commissions.map(c => {
      if (trip.commissionIds.includes(c.id)) {
        return { ...c, isCompleted: true };
      }
      return c;
    });
    
    const updatedVehicles = state.vehicles.map(v =>
      v.id === trip.vehicleId ? { ...v, isAvailable: true } : v
    );
    
    const updatedTrips = state.trips.map(t =>
      t.id === tripId ? { ...t, status: 'completed' as const, actualArrivalTime: Date.now() } : t
    );
    
    const newReputation = Math.max(0, Math.min(1000, 
      state.player.reputation + settlement.reputationChange
    ));
    const repInfo = calculateReputationGrade(newReputation);
    
    const usedSpace = calculateWarehouseUsedSpace(
      updatedCommissions,
      state.goodsList,
      updatedTrips
    );
    
    set({
      player: {
        ...state.player,
        gold: state.player.gold + settlement.totalProfit,
        reputation: newReputation,
        reputationGrade: repInfo.grade as ReputationGrade,
        priceBonus: repInfo.priceBonus,
      },
      commissions: updatedCommissions,
      vehicles: updatedVehicles,
      trips: updatedTrips,
      ledger: [...state.ledger, ...ledgerEntries],
      warehouse: { ...state.warehouse, usedSpace },
      currentSettlement: settlement,
      showSettlement: true,
    });
    
    api.ledger.postBatch(ledgerEntries);
    get().saveGame();
  },
  
  closeSettlement: () => {
    set({ showSettlement: false, currentSettlement: null });
  },
  
  upgradeWarehouse: () => {
    const state = get();
    const { warehouse, player } = state;
    
    if (player.gold < warehouse.upgradeCost) {
      set({ error: '金币不足，无法升级仓库' });
      return false;
    }
    
    const newLevel = warehouse.level + 1;
    const newCapacity = calculateWarehouseCapacity(newLevel);
    const newUpgradeCost = calculateWarehouseUpgradeCost(newLevel);
    
    set({
      warehouse: {
        ...warehouse,
        level: newLevel,
        capacity: newCapacity,
        upgradeCost: newUpgradeCost,
      },
      player: {
        ...player,
        gold: player.gold - warehouse.upgradeCost,
      },
    });
    
    const ledgerEntry: LedgerEntry = {
      id: '',
      type: 'expense',
      description: `仓库升级到 Lv.${newLevel}`,
      amount: warehouse.upgradeCost,
      date: getCurrentDate(player.currentDay),
      day: player.currentDay,
      category: '升级',
      createdAt: 0,
    };
    
    api.ledger.post(ledgerEntry);
    get().saveGame();
    
    return true;
  },
  
  advanceTimeOfDay: () => {
    const state = get();
    const newPlayer = advanceTime(state.player);
    
    let weather = state.currentWeather;
    if (newPlayer.timeOfDay === 'morning') {
      weather = getRandomWeather(state.weatherList);
      get().generateDailyCommissions();
    }
    
    set({
      player: newPlayer,
      currentWeather: weather,
    });
    
    get().saveGame();
  },
  
  updatePlayerGold: (amount: number) => {
    set(state => ({
      player: { ...state.player, gold: state.player.gold + amount },
    }));
  },
  
  updatePlayerReputation: (amount: number) => {
    set(state => {
      const newRep = Math.max(0, Math.min(1000, state.player.reputation + amount));
      const repInfo = calculateReputationGrade(newRep);
      return {
        player: {
          ...state.player,
          reputation: newRep,
          reputationGrade: repInfo.grade as ReputationGrade,
          priceBonus: repInfo.priceBonus,
        },
      };
    });
  },
  
  getAvailableVehicles: () => {
    return get().vehicles.filter(v => v.isAvailable);
  },
  
  getAvailableRoutes: (destinationId: string) => {
    const state = get();
    return state.routes.filter(
      r => 
        (r.fromCityId === 'yuegang' && r.toCityId === destinationId) ||
        (r.fromCityId === destinationId && r.toCityId === 'yuegang')
    );
  },
  
  getCurrentDate: () => {
    return getCurrentDate(get().player.currentDay);
  },
}));
