import { Warehouse as WarehouseIcon, ArrowUpCircle, Database, Coins } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import InventoryGrid from './InventoryGrid';

const Warehouse = () => {
  const { warehouse, commissions, goodsList, player, upgradeWarehouse } = useGameStore();

  const usagePercent = Math.min(100, (warehouse.usedSpace / warehouse.capacity) * 100);
  
  const getUsageColor = () => {
    if (usagePercent >= 90) return 'from-red-500 to-red-600';
    if (usagePercent >= 70) return 'from-amber-500 to-amber-600';
    return 'from-emerald-500 to-emerald-600';
  };

  const handleUpgrade = () => {
    const success = upgradeWarehouse();
    if (success) {
      // 升级成功
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">仓库管理</h2>
          <p className="text-slate-500">管理库存货物和升级仓库容量</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-5">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <WarehouseIcon className="w-5 h-5 text-indigo-500" />
                仓库状态
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    Lv.{warehouse.level}
                  </div>
                  <div className="text-xs text-indigo-500">仓库等级</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {warehouse.usedSpace}
                  </div>
                  <div className="text-xs text-emerald-500">已用容量</div>
                </div>
                <div className="bg-sky-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-sky-600">
                    {warehouse.capacity}
                  </div>
                  <div className="text-xs text-sky-500">总容量</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {warehouse.upgradeCost}
                  </div>
                  <div className="text-xs text-amber-500">升级费用</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Database className="w-4 h-4" />
                    容量使用
                  </span>
                  <span className="font-medium text-slate-800">
                    {warehouse.usedSpace} / {warehouse.capacity} ({usagePercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getUsageColor()} rounded-full transition-all duration-500`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-700">升级仓库</div>
                  <div className="text-sm text-slate-500">
                    升级到 Lv.{warehouse.level + 1}，容量 +50
                  </div>
                </div>
                <button
                  onClick={handleUpgrade}
                  disabled={player.gold < warehouse.upgradeCost}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    player.gold >= warehouse.upgradeCost
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  <Coins className="w-4 h-4" />
                  升级 ¥{warehouse.upgradeCost}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-md p-5">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                升级收益
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">当前等级</span>
                  <span className="font-medium text-slate-800">Lv.{warehouse.level}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">当前容量</span>
                  <span className="font-medium text-slate-800">{warehouse.capacity}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <span className="text-sm text-indigo-600">升级后容量</span>
                  <span className="font-medium text-indigo-700">{warehouse.capacity + 50}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">升级费用</span>
                  <span className="font-medium text-amber-600">¥{warehouse.upgradeCost}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  💡 提示：仓库容量不足时无法承接新委托。及时升级仓库可以承接更多货物，获得更高收益。
                </p>
              </div>
            </div>
          </div>
        </div>

        <InventoryGrid commissions={commissions} goodsList={goodsList} />
      </div>
    </div>
  );
};

export default Warehouse;
