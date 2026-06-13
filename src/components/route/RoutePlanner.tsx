import { Truck, MapPin, Clock, Coins, AlertTriangle } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { calculateRouteTime, calculateLoad, calculateTripCost } from '../../utils/routeCalc';
import CommissionCard from '../port/CommissionCard';
import { useMemo, useState } from 'react';

const RoutePlanner = () => {
  const {
    commissions,
    vehicles,
    routes,
    cities,
    goodsList,
    currentWeather,
    player,
    selectedCommissions,
    selectedVehicle,
    selectedRoute,
    selectCommission,
    selectVehicle,
    selectRoute,
    startTrip,
    isDispatching,
    error,
  } = useGameStore();
  
  const [destinationId, setDestinationId] = useState<string>('');
  
  const acceptedCommissions = commissions.filter(c => c.isAccepted && !c.isShipped && !c.isCompleted);
  
  const availableVehicles = vehicles.filter(v => v.isAvailable);
  
  const availableRoutes = useMemo(() => {
    if (!destinationId) return [];
    return routes.filter(
      r => 
        (r.fromCityId === 'yuegang' && r.toCityId === destinationId) ||
        (r.fromCityId === destinationId && r.toCityId === 'yuegang')
    );
  }, [routes, destinationId]);
  
  const selectedCommissionsData = selectedCommissions.map(id => 
    commissions.find(c => c.id === id)
  ).filter(Boolean);
  
  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);
  const selectedRouteData = routes.find(r => r.id === selectedRoute);
  const destination = cities.find(c => c.id === destinationId);
  
  const routeCalculation = useMemo(() => {
    if (!selectedRouteData || !selectedVehicleData || !currentWeather) return null;
    return calculateRouteTime(selectedRouteData, selectedVehicleData, currentWeather);
  }, [selectedRouteData, selectedVehicleData, currentWeather]);
  
  const loadCalculation = useMemo(() => {
    if (!selectedVehicleData || selectedCommissionsData.length === 0) return null;
    return calculateLoad(
      selectedVehicleData,
      selectedCommissionsData as any,
      goodsList
    );
  }, [selectedVehicleData, selectedCommissionsData, goodsList]);
  
  const tripCost = useMemo(() => {
    if (!selectedRouteData || !selectedVehicleData || !routeCalculation) return 0;
    return calculateTripCost(selectedRouteData, selectedVehicleData, routeCalculation.totalTime);
  }, [selectedRouteData, selectedVehicleData, routeCalculation]);
  
  const handleStartTrip = async () => {
    const success = await startTrip();
    if (success) {
      setDestinationId('');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">路线规划</h2>
          <p className="text-slate-500">选择货物、车辆和路线，安排运输任务</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-5">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                待运货物 ({acceptedCommissions.length})
              </h3>
              
              {acceptedCommissions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  暂无待运货物，请先在港口大厅接单
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {acceptedCommissions.map(commission => (
                    <CommissionCard
                      key={commission.id}
                      commission={commission}
                      showAccept={false}
                      showSelect={true}
                      isSelected={selectedCommissions.includes(commission.id)}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {selectedCommissionsData.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-5">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  选择目的地
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cities.filter(c => c.id !== 'yuegang').map(city => (
                    <button
                      key={city.id}
                      onClick={() => {
                        setDestinationId(city.id);
                        selectRoute('');
                      }}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        destinationId === city.id
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-medium text-slate-800">{city.name}</div>
                      <div className="text-xs text-slate-500 capitalize">
                        {city.type === 'port' ? '港口' : 
                         city.type === 'capital' ? '都城' :
                         city.type === 'overseas' ? '海外' : '城市'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {destinationId && (
              <div className="bg-white rounded-xl shadow-md p-5">
                <h3 className="font-semibold text-slate-800 mb-4">
                  可选路线 - {destination?.name}
                </h3>
                
                {availableRoutes.length === 0 ? (
                  <div className="text-center py-4 text-slate-500">
                    暂无直达路线，请选择其他目的地
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableRoutes.map(route => {
                      const routeType = route.type === 'land' ? '陆路' : '水路';
                      const routeTypeColor = route.type === 'land' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
                      
                      return (
                        <button
                          key={route.id}
                          onClick={() => selectRoute(route.id)}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            selectedRoute === route.id
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${routeTypeColor}`}>
                                {routeType}
                              </span>
                              <span className="font-medium text-slate-800">{route.distance} 里</span>
                            </div>
                            <span className="text-sm text-slate-600">
                              基础费用: {route.baseCost} 金币
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              约 {route.baseTimeHours} 小时
                            </span>
                            <span>驿站停靠: {route.stops} 次</span>
                            <span>路况: {Math.round(route.condition * 100)}%</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-5">
              <h3 className="font-semibold text-slate-800 mb-4">选择车辆</h3>
              
              {availableVehicles.length === 0 ? (
                <div className="text-center py-4 text-slate-500">
                  暂无可用车辆
                </div>
              ) : (
                <div className="space-y-3">
                  {availableVehicles.map(vehicle => {
                    const vehicleType = vehicle.type === 'land' ? '陆路' : '水路';
                    const isCompatible = !selectedRouteData || 
                      (selectedRouteData.type === vehicle.type);
                    
                    return (
                      <button
                        key={vehicle.id}
                        onClick={() => selectVehicle(vehicle.id)}
                        disabled={!isCompatible}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedVehicle === vehicle.id
                            ? 'border-amber-500 bg-amber-50'
                            : isCompatible
                            ? 'border-slate-200 hover:border-slate-300'
                            : 'border-slate-100 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{vehicle.icon}</span>
                          <div>
                            <div className="font-medium text-slate-800">{vehicle.name}</div>
                            <div className="text-xs text-slate-500">{vehicleType}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                          <div>
                            <div className="text-slate-400">载重</div>
                            <div className="font-medium">{vehicle.capacity}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">速度</div>
                            <div className="font-medium">{vehicle.speed}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">时薪</div>
                            <div className="font-medium">{vehicle.costPerHour}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            {selectedCommissionsData.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-5">
                <h3 className="font-semibold text-slate-800 mb-4">运输预览</h3>
                
                <div className="space-y-4">
                  {loadCalculation && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">载重</span>
                        <span className={`font-medium ${
                          loadCalculation.isOverloaded ? 'text-red-500' : 'text-slate-800'
                        }`}>
                          {loadCalculation.currentLoad} / {loadCalculation.vehicleCapacity}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            loadCalculation.isOverloaded ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, 
                              (loadCalculation.currentLoad / loadCalculation.vehicleCapacity) * 100
                            )}%` 
                          }}
                        />
                      </div>
                      {loadCalculation.isOverloaded && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          超载！罚款 {loadCalculation.overloadPenalty} 金币
                        </p>
                      )}
                    </div>
                  )}
                  
                  {routeCalculation && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">预计耗时</span>
                        <span className="font-medium text-slate-800">
                          {routeCalculation.totalTime} 小时
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">驿站停靠</span>
                        <span className="font-medium text-slate-800">
                          {routeCalculation.stops} 次 ({routeCalculation.stopTime}小时)
                        </span>
                      </div>
                      {currentWeather && currentWeather.speedModifier > 1 && (
                        <div className="flex justify-between text-amber-600">
                          <span className="flex items-center gap-1">
                            {currentWeather.icon} 天气影响
                          </span>
                          <span>×{currentWeather.speedModifier}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-600">运输费用</span>
                      <span className="font-bold text-lg text-amber-600 flex items-center gap-1">
                        <Coins className="w-5 h-5" />
                        {tripCost.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-slate-600">预计收入</span>
                      <span className="font-bold text-green-600">
                        {selectedCommissionsData.reduce((sum, c) => sum + (c?.reward || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-slate-700">预计利润</span>
                      <span className={`text-lg ${
                        selectedCommissionsData.reduce((sum, c) => sum + (c?.reward || 0), 0) - tripCost >= 0
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}>
                        {selectedCommissionsData.reduce((sum, c) => sum + (c?.reward || 0), 0) - tripCost >= 0 ? '+' : ''}
                        {(selectedCommissionsData.reduce((sum, c) => sum + (c?.reward || 0), 0) - tripCost).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleStartTrip}
                    disabled={
                      selectedCommissions.length === 0 ||
                      !selectedVehicle ||
                      !selectedRoute ||
                      player.gold < tripCost ||
                      (loadCalculation?.isOverloaded || false) ||
                      isDispatching
                    }
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDispatching ? '派车中...' : '确认派车'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
