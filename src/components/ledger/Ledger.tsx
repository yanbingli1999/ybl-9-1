import { useState } from 'react';
import { BookOpen, TrendingUp, TrendingDown, Filter, Calendar } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import Statistics from './Statistics';

const Ledger = () => {
  const { ledger, player } = useGameStore();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showStats, setShowStats] = useState(true);

  const filteredLedger = ledger.filter(entry => {
    if (filter === 'all') return true;
    return entry.type === filter;
  }).sort((a, b) => b.createdAt - a.createdAt);

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-emerald-600' : 'text-red-600';
  };

  const getTypeIcon = (type: string) => {
    return type === 'income' 
      ? <TrendingUp className="w-4 h-4 text-emerald-500" />
      : <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getTypePrefix = (type: string) => {
    return type === 'income' ? '+' : '-';
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">账本系统</h2>
            <p className="text-slate-500">查看收支记录和经营统计</p>
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-all"
          >
            <Filter className="w-4 h-4" />
            {showStats ? '隐藏统计' : '显示统计'}
          </button>
        </div>

        {showStats && (
          <div className="mb-6">
            <Statistics ledger={ledger} currentDay={player.currentDay} />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md">
          <div className="p-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                收支明细
              </h3>
              <div className="flex gap-2">
                {(['all', 'income', 'expense'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filter === f
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f === 'all' ? '全部' : f === 'income' ? '收入' : '支出'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredLedger.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">暂无收支记录</p>
                <p className="text-sm text-slate-400 mt-1">完成运输任务后会产生收支记录</p>
              </div>
            ) : (
              filteredLedger.map(entry => (
                <div
                  key={entry.id}
                  className="p-4 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        entry.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                      }`}>
                        {getTypeIcon(entry.type)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">
                          {entry.description}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                            {entry.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {entry.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${getTypeColor(entry.type)}`}>
                      {getTypePrefix(entry.type)}¥{entry.amount}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ledger;
