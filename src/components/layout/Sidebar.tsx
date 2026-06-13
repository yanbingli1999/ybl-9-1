import { NavLink } from 'react-router-dom';
import { Anchor, Map, Truck, Warehouse, BookOpen, Clock } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

const Sidebar = () => {
  const { advanceTimeOfDay, player, trips } = useGameStore();
  
  const inProgressTrips = trips.filter(t => t.status === 'in_progress');
  
  const navItems = [
    { path: '/', icon: Anchor, label: '港口大厅', time: ['morning', 'afternoon'] },
    { path: '/route', icon: Map, label: '路线规划', time: ['afternoon', 'evening'] },
    { path: '/transport', icon: Truck, label: '运输管理', time: ['evening', 'night'] },
    { path: '/warehouse', icon: Warehouse, label: '仓库管理', time: ['morning', 'afternoon', 'evening', 'night'] },
    { path: '/ledger', icon: BookOpen, label: '账本系统', time: ['morning', 'afternoon', 'evening', 'night'] },
  ];

  const isTimeAvailable = (times: string[]) => {
    return times.includes(player.timeOfDay);
  };

  return (
    <aside className="w-64 bg-slate-900 min-h-screen border-r border-slate-700">
      <div className="p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const available = isTimeAvailable(item.time);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                      : available
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-600 cursor-not-allowed'
                  }`
                }
                onClick={(e) => {
                  if (!available) {
                    e.preventDefault();
                  }
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {!available && (
                  <span className="ml-auto text-xs text-slate-500">未开放</span>
                )}
              </NavLink>
            );
          })}
        </nav>
        
        <div className="mt-8 pt-6 border-t border-slate-700">
          {inProgressTrips.length > 0 && player.timeOfDay === 'night' ? (
            <button
              onClick={() => {
                const trip = inProgressTrips[0];
                useGameStore.getState().processTripEvents(trip.id);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg"
            >
              <Clock className="w-5 h-5 animate-pulse" />
              <span className="font-medium">处理运输 ({inProgressTrips.length})</span>
            </button>
          ) : (
            <button
              onClick={advanceTimeOfDay}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg"
            >
              <Clock className="w-5 h-5" />
              <span className="font-medium">推进时间</span>
            </button>
          )}
          
          <div className="mt-4 p-3 bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-400 mb-2">时间说明</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">清晨</span>
                <span className="text-slate-400">港口接单</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">午后</span>
                <span className="text-slate-400">接单/排线</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">傍晚</span>
                <span className="text-slate-400">排线/派车</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">夜晚</span>
                <span className="text-slate-400">运输/结算</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
