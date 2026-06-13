import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import PortHall from './components/port/PortHall';
import RoutePlanner from './components/route/RoutePlanner';
import TransportManager from './components/transport/TransportManager';
import Warehouse from './components/warehouse/Warehouse';
import Ledger from './components/ledger/Ledger';
import EventModal from './components/transport/EventModal';
import SettlementModal from './components/settlement/SettlementModal';
import { useGameStore } from './store/useGameStore';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { 
    loadGameData, 
    loadSaveGame, 
    isLoading, 
    error, 
    showEvent, 
    currentEvent, 
    showSettlement, 
    currentSettlement 
  } = useGameStore();
  
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initGame = async () => {
      await loadGameData();
      await loadSaveGame();
      setIsInitialized(true);
    };
    initGame();
  }, []);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">正在加载游戏数据...</p>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-100 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<PortHall />} />
              <Route path="/route" element={<RoutePlanner />} />
              <Route path="/transport" element={<TransportManager />} />
              <Route path="/warehouse" element={<Warehouse />} />
              <Route path="/ledger" element={<Ledger />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {showEvent && currentEvent && (
          <EventModal 
            event={currentEvent} 
            onClose={() => {}} 
          />
        )}

        {showSettlement && currentSettlement && (
          <SettlementModal 
            settlement={currentSettlement} 
            onClose={() => {}} 
          />
        )}

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300">
            {error}
          </div>
        )}
      </div>
    </Router>
  );
}
