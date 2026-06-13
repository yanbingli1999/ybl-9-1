import { AlertTriangle, Shield, Gift, CloudRain, X } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import type { GameEvent } from '../../../shared/types';

interface EventModalProps {
  event: GameEvent;
  onClose: () => void;
}

const EventModal = ({ event, onClose }: EventModalProps) => {
  const { handleEventChoice } = useGameStore();

  const getEventIcon = () => {
    switch (event.type) {
      case 'danger': return <AlertTriangle className="w-8 h-8 text-red-500" />;
      case 'accident': return <AlertTriangle className="w-8 h-8 text-amber-500" />;
      case 'luck': return <Gift className="w-8 h-8 text-emerald-500" />;
      case 'weather': return <CloudRain className="w-8 h-8 text-blue-500" />;
      default: return <AlertTriangle className="w-8 h-8 text-slate-500" />;
    }
  };

  const getEventBgColor = () => {
    switch (event.type) {
      case 'danger': return 'from-red-500 to-red-600';
      case 'accident': return 'from-amber-500 to-amber-600';
      case 'luck': return 'from-emerald-500 to-emerald-600';
      case 'weather': return 'from-blue-500 to-blue-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getEffectDisplay = (effect: any) => {
    if (!effect) return '';
    const { type, value } = effect;
    switch (type) {
      case 'gold':
      case 'damage':
      case 'reputation':
        const sign = (value as number) >= 0 ? '+' : '';
        return `${sign}${value}`;
      case 'delay':
        return `${value}小时`;
      default:
        return value as string;
    }
  };

  const getEffectColor = (effect: any) => {
    if (!effect) return '';
    const { type, value } = effect;
    if (type === 'hint') return 'text-slate-600';
    if (type === 'gold' || type === 'reputation') {
      return (value as number) >= 0 ? 'text-emerald-600' : 'text-red-600';
    }
    if (type === 'damage' || type === 'delay') {
      return 'text-red-600';
    }
    return 'text-slate-600';
  };

  const handleChoice = (index: number) => {
    handleEventChoice(index);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className={`bg-gradient-to-r ${getEventBgColor()} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getEventIcon()}
              <div>
                <h3 className="text-xl font-bold">{event.title}</h3>
                <p className="text-white/80 text-sm">途中遭遇事件</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-slate-700 mb-6 leading-relaxed">
            {event.description}
          </p>

          <div className="space-y-3">
            {event.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => handleChoice(index)}
              className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-sm font-medium text-slate-600 group-hover:text-indigo-600">
                    {index + 1}
                  </div>
                  <span className="font-medium text-slate-800 group-hover:text-indigo-700">
                    {choice}
                  </span>
                </div>
                {event.effects[index] && (
                  <span className={`text-sm font-medium ${getEffectColor(event.effects[index])}`}>
                    {getEffectDisplay(event.effects[index])}
                  </span>
                )}
              </div>
              {event.effects[index] && (
                <p className="text-xs text-slate-500 mt-1 ml-10">
                  {event.effects[index]?.description}
                </p>
              )}
            </button>
          ))}
          </div>

          <div className="mt-6 p-3 bg-slate-50 rounded-lg flex items-start gap-2">
            <Shield className="w-4 h-4 text-slate-400 mt-0.5" />
            <p className="text-xs text-slate-500">
              选择一个选项，后果将立即生效并记录到本次运输结算中。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
