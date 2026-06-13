import { Package, MapPin, Clock, Coins, AlertTriangle, Check } from 'lucide-react';
import type { Commission } from '../../../shared/types';
import { useGameStore } from '../../store/useGameStore';

interface CommissionCardProps {
  commission: Commission;
  showAccept?: boolean;
  showSelect?: boolean;
  isSelected?: boolean;
}

const CommissionCard = ({ 
  commission, 
  showAccept = true, 
  showSelect = false,
  isSelected = false 
}: CommissionCardProps) => {
  const { acceptCommission, selectCommission, goodsList, cities, player, warehouse } = useGameStore();
  
  const goods = goodsList.find(g => g.id === commission.goodsId);
  const destination = cities.find(c => c.id === commission.destinationId);
  
  const handleAccept = () => {
    acceptCommission(commission.id);
  };
  
  const handleSelect = () => {
    selectCommission(commission.id);
  };

  const getFragilityColor = (fragility: number) => {
    if (fragility >= 80) return 'text-red-500 bg-red-500/10';
    if (fragility >= 50) return 'text-orange-500 bg-orange-500/10';
    return 'text-green-500 bg-green-500/10';
  };

  const getFragilityLabel = (fragility: number) => {
    if (fragility >= 80) return '极高';
    if (fragility >= 50) return '中等';
    return '较低';
  };

  const bonusMultiplier = 1 + (player.priceBonus / 100);
  const adjustedReward = Math.floor(commission.reward * bonusMultiplier);
  const isEmergency = commission.deadlineHours < 15;

  return (
    <div className={`relative bg-white rounded-xl shadow-md border-2 transition-all hover:shadow-lg ${
      isSelected ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-200'
    } ${commission.isAccepted ? 'opacity-60' : ''}`}>
      {isEmergency && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
          紧急
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{goods?.icon || '📦'}</span>
            <div>
              <h3 className="font-bold text-slate-800">
                {goods?.name || commission.goodsName}
              </h3>
              <p className="text-sm text-slate-500">x{commission.quantity}</p>
            </div>
          </div>
          
          <div className={`px-2 py-1 rounded text-xs font-medium ${getFragilityColor(commission.fragility)}`}>
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            易碎度: {getFragilityLabel(commission.fragility)}
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>目的地: </span>
            <span className="font-medium text-slate-800">{destination?.name || commission.destinationName}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>期限: </span>
            <span className={`font-medium ${isEmergency ? 'text-red-500' : 'text-slate-800'}`}>
              {commission.deadlineHours} 小时
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">重量: </span>
            <span className="font-medium text-slate-800">
              {commission.quantity * (goods?.weight || 1)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Coins className="w-5 h-5 text-amber-500" />
            <span className="text-xl font-bold text-amber-600">
              {adjustedReward.toLocaleString()}
            </span>
            {player.priceBonus !== 0 && (
              <span className={`text-xs ${
                player.priceBonus > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                ({player.priceBonus > 0 ? '+' : ''}{player.priceBonus}%)
              </span>
            )}
          </div>
          
          {showAccept && !commission.isAccepted && !commission.isCompleted && (
            <button
              onClick={handleAccept}
              disabled={warehouse.usedSpace + commission.quantity * (goods?.weight || 1) > warehouse.capacity}
              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              接单
            </button>
          )}
          
          {showSelect && commission.isAccepted && !commission.isCompleted && (
            <button
              onClick={handleSelect}
              className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                isSelected
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isSelected ? <Check className="w-4 h-4" /> : null}
              {isSelected ? '已选择' : '选择'}
            </button>
          )}
          
          {commission.isCompleted && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-lg">
              已完成
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionCard;
