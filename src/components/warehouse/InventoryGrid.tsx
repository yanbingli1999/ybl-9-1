import { Package, AlertCircle } from 'lucide-react';
import type { Commission, Goods } from '../../../shared/types';

interface InventoryGridProps {
  commissions: Commission[];
  goodsList: Goods[];
}

const InventoryGrid = ({ commissions, goodsList }: InventoryGridProps) => {
  const acceptedCommissions = commissions.filter(c => c.isAccepted && !c.isCompleted);

  const getGoodsInfo = (goodsId: string) => {
    return goodsList.find(g => g.id === goodsId);
  };

  const getFragilityColor = (fragility: number) => {
    if (fragility >= 8) return 'text-red-600';
    if (fragility >= 5) return 'text-amber-600';
    return 'text-green-600';
  };

  const getFragilityLabel = (fragility: number) => {
    if (fragility >= 8) return '极易碎';
    if (fragility >= 5) return '易碎';
    return '普通';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-indigo-500" />
        库存货物 ({acceptedCommissions.length})
      </h3>

      {acceptedCommissions.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">仓库暂无货物</p>
          <p className="text-sm text-slate-400 mt-1">去港口大厅承接委托吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {acceptedCommissions.map(commission => {
            const goods = getGoodsInfo(commission.goodsId);
            return (
              <div
                key={commission.id}
                className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{goods?.icon || '📦'}</span>
                    <div>
                      <div className="font-medium text-slate-800">
                        {commission.goodsName}
                      </div>
                      <div className="text-xs text-slate-500">
                        数量: {commission.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-amber-600">
                      ¥{commission.reward}
                    </div>
                    <div className={`text-xs flex items-center gap-1 justify-end ${getFragilityColor(goods?.fragility || 1)}`}>
                      <AlertCircle className="w-3 h-3" />
                      {getFragilityLabel(goods?.fragility || 1)}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  目的地: {commission.destinationName}
                </div>
                {commission.deadlineHours && (
                  <div className="text-xs text-slate-400 mt-1">
                    期限: {commission.deadlineHours} 小时
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventoryGrid;
