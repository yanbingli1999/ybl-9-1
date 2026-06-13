import { Coins, Star, Calendar, Cloud, Save, RotateCcw } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { getTimeOfDayName } from '../../utils/gameLogic';

const Header = () => {
  const { player, currentWeather, getCurrentDate, saveGame, newGame } = useGameStore();
  const timeName = getTimeOfDayName(player.timeOfDay);
  
  const gradeColors: Record<string, string> = {
    '甲': 'text-amber-500',
    '乙': 'text-purple-500',
    '丙': 'text-blue-500',
    '丁': 'text-gray-500',
  };

  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-amber-400" style={{ fontFamily: 'serif' }}>
              月港邮差
            </h1>
            <div className="h-8 w-px bg-slate-600" />
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">{getCurrentDate()}</span>
              <span className="text-amber-400 font-medium">第 {player.currentDay} 天</span>
              <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">
                {timeName}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {currentWeather && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg">
                <span className="text-xl">{currentWeather.icon}</span>
                <span className="text-sm text-slate-300">{currentWeather.name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-600/20 rounded-lg">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-bold">{player.gold.toLocaleString()}</span>
              <span className="text-amber-300/70 text-sm">金币</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 rounded-lg">
              <Star className="w-4 h-4 text-purple-400" />
              <span className={`font-bold ${gradeColors[player.reputationGrade]}`}>
                {player.reputationGrade}
              </span>
              <span className="text-purple-300/70 text-sm">
                {player.reputation}
              </span>
              {player.priceBonus !== 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  player.priceBonus > 0 ? 'bg-green-600/30 text-green-400' : 'bg-red-600/30 text-red-400'
                }`}>
                  {player.priceBonus > 0 ? '+' : ''}{player.priceBonus}%
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={saveGame}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="保存游戏"
              >
                <Save className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
              <button
                onClick={() => {
                  if (confirm('确定要重新开始游戏吗？当前进度将丢失。')) {
                    newGame();
                  }
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="重新开始"
              >
                <RotateCcw className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
