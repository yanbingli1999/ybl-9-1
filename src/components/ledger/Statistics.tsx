import { TrendingUp, TrendingDown, Coins, Wallet, BarChart3 } from 'lucide-react';
import type { LedgerEntry } from '../../../shared/types';

interface StatisticsProps {
  ledger: LedgerEntry[];
  currentDay: number;
}

const Statistics = ({ ledger, currentDay }: StatisticsProps) => {
  const totalIncome = ledger
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalExpense = ledger
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const netProfit = totalIncome - totalExpense;

  const todayIncome = ledger
    .filter(e => e.type === 'income' && e.day === currentDay)
    .reduce((sum, e) => sum + e.amount, 0);
  
  const todayExpense = ledger
    .filter(e => e.type === 'expense' && e.day === currentDay)
    .reduce((sum, e) => sum + e.amount, 0);

  const categoryStats = ledger.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = { income: 0, expense: 0 };
    }
    if (entry.type === 'income') {
      acc[entry.category].income += entry.amount;
    } else {
      acc[entry.category].expense += entry.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-slate-500">总收入</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">¥{totalIncome}</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-slate-500">总支出</span>
          </div>
          <div className="text-2xl font-bold text-red-600">¥{totalExpense}</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-sm text-slate-500">净利润</span>
          </div>
          <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            ¥{netProfit}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-slate-500">今日</span>
          </div>
          <div className="text-lg font-bold text-amber-600">
            +¥{todayIncome} / -¥{todayExpense}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-5">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-500" />
          分类统计
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(categoryStats).map(([category, stats]) => (
            <div key={category} className="bg-slate-50 rounded-lg p-4">
              <div className="font-medium text-slate-700 mb-2">{category}</div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600">收入: ¥{stats.income}</span>
                <span className="text-red-600">支出: ¥{stats.expense}</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                净额: ¥{stats.income - stats.expense}
              </div>
            </div>
          ))}
          {Object.keys(categoryStats).length === 0 && (
            <div className="col-span-full text-center py-4 text-slate-400">
              暂无统计数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
