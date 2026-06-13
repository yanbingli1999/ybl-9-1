import { CheckCircle, XCircle, AlertTriangle, TrendingUp, TrendingDown, Coins, Star, Package, X } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import type { TripSettlement } from '../../utils/settlement';

interface SettlementModalProps {
  settlement: TripSettlement;
  onClose: () => void;
}

const SettlementModal = ({ settlement, onClose }: SettlementModalProps) => {
  const { closeSettlement } = useGameStore();

  const handleClose = () => {
    closeSettlement();
    onClose();
  };

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? 'text-emerald-600' : 'text-red-600';
  };

  const getProfitIcon = (profit: number) => {
    return profit >= 0 
      ? <TrendingUp className="w-5 h-5 text-emerald-500" />
      : <TrendingDown className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <div className={`p-6 text-white ${
          settlement.totalProfit >= 0 
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
            : 'bg-gradient-to-r from-red-500 to-rose-600'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settlement.totalProfit >= 0 
                ? <CheckCircle className="w-10 h-10" />
                : <XCircle className="w-10 h-10" />
              }
              <div>
                <h3 className="text-2xl font-bold">运输结算</h3>
                <p className="text-white/80">本次运输任务已完成</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <div className="text-sm text-emerald-600 mb-1">总收入</div>
              <div className="text-2xl font-bold text-emerald-700">¥{settlement.totalIncome}</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-sm text-red-600 mb-1">总支出</div>
              <div className="text-2xl font-bold text-red-700">¥{settlement.totalExpense}</div>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-indigo-600 mb-1">
                {getProfitIcon(settlement.totalProfit)}
                净利润
              </div>
              <div className={`text-2xl font-bold ${getProfitColor(settlement.totalProfit)}`}>
                ¥{settlement.totalProfit}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 py-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Star className={`w-5 h-5 ${settlement.reputationChange >= 0 ? 'text-amber-500' : 'text-slate-400'}`} />
              <span className="text-slate-600">声望变化:</span>
              <span className={`font-bold ${settlement.reputationChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {settlement.reputationChange >= 0 ? '+' : ''}{settlement.reputationChange}
              </span>
            </div>
            <div className="w-px h-6 bg-slate-300" />
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              <span className="text-slate-600">货损:</span>
              <span className="font-bold text-red-600">{settlement.damageCount} 件</span>
            </div>
            <div className="w-px h-6 bg-slate-300" />
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="text-slate-600">迟到:</span>
              <span className={`font-bold ${settlement.lateCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {settlement.lateCount} 单
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" />
              货物明细
            </h4>
            <div className="space-y-3">
              {settlement.commissions.map((item, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{item.goodsName}</span>
                      <span className="text-sm text-slate-500">x{item.quantity}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500">
                        基础 ¥{item.baseReward}
                      </div>
                      <div className="font-bold text-indigo-600">
                        实际 ¥{item.actualReward}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      item.delivered > 0 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      送达 {item.delivered} 件
                    </span>
                    {item.damaged > 0 && (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-700">
                        损坏 {item.damaged} 件
                      </span>
                    )}
                    {item.isLate && (
                      <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                        迟到 罚款 ¥{item.latePenalty}
                      </span>
                    )}
                    {!item.isLate && item.damaged === 0 && (
                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        完好准时
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {settlement.events.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                途中事件
              </h4>
              <div className="space-y-2">
                {settlement.events.map((event, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                    <span className="text-sm text-amber-800">{event}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <Coins className="w-5 h-5" />
              确认结算
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementModal;
