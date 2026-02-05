
import React, { useState } from 'react';
import { AppView, Booking } from '../types';

interface FloorMapProps {
  onViewChange: (view: AppView) => void;
  selectedDesks: string[];
  setSelectedDesks: React.Dispatch<React.SetStateAction<string[]>>;
  existingBookings: Booking[];
}

const FloorMap: React.FC<FloorMapProps> = ({ onViewChange, selectedDesks, setSelectedDesks, existingBookings }) => {
  const [activeFloor, setActiveFloor] = useState(4);
  const [inspectingDesk, setInspectingDesk] = useState<Booking | null>(null);

  const toggleDesk = (id: string) => {
    setSelectedDesks(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const occupiedMap = existingBookings
    .filter(b => b.status === 'Accepted' && b.level === activeFloor)
    .reduce((acc, b) => {
      acc[b.deskId] = b;
      return acc;
    }, {} as Record<string, Booking>);

  const desks = Array.from({ length: 16 }, (_, i) => ({
    id: `${String.fromCharCode(65 + Math.floor(i / 4))}-${(i % 4) + 1}`.padStart(4, '0').replace('00', '')
  }));

  return (
    <div className="flex flex-col min-h-screen animate-in slide-in-from-right duration-500">
      <div className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between">
          <button onClick={() => onViewChange(AppView.DASHBOARD)} className="size-10 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="text-center">
            <h2 className="text-slate-900 dark:text-white text-lg font-black">Floor Map</h2>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Office HQ • Level {activeFloor}</p>
          </div>
          <button className="size-10 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>

        <div className="flex gap-2 px-5 pb-4 overflow-x-auto no-scrollbar">
          {[3, 4, 5, 6].map(f => (
            <button 
              key={f}
              onClick={() => setActiveFloor(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeFloor === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
            >
              L{f}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 p-5 pb-40">
        <div className="relative w-full aspect-[4/5] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-8">
          <div className="grid grid-cols-4 gap-4 h-full">
            {desks.map((desk) => {
              const booking = occupiedMap[desk.id];
              const isOccupied = !!booking;
              const isSelected = selectedDesks.includes(desk.id);

              return (
                <button
                  key={desk.id}
                  onClick={() => isOccupied ? setInspectingDesk(booking) : toggleDesk(desk.id)}
                  className={`
                    relative aspect-square rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1
                    ${isOccupied ? 'bg-slate-100 dark:bg-slate-800 border-transparent' : ''}
                    ${isSelected ? 'bg-primary border-primary text-white scale-105 shadow-xl shadow-primary/30' : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800'}
                  `}
                >
                  {isOccupied ? (
                    <img src={booking.memberAvatar} className="size-full object-cover rounded-2xl opacity-40 grayscale" alt="User" />
                  ) : (
                    <>
                      <span className={`material-symbols-outlined text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {isSelected ? 'check_circle' : 'desktop_windows'}
                      </span>
                      <span className={`text-[9px] font-black ${isSelected ? 'text-white' : 'text-slate-400'}`}>{desk.id}</span>
                    </>
                  )}
                  {isOccupied && (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="material-symbols-outlined text-slate-500 text-xs">lock</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Floating Detail Panel */}
        {inspectingDesk && (
          <div className="fixed inset-x-5 bottom-32 z-40 bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-bottom-10">
            <div className="flex items-center gap-4">
              <img src={inspectingDesk.memberAvatar} className="size-16 rounded-2xl object-cover" alt="User" />
              <div className="flex-1">
                <h4 className="font-black text-slate-900 dark:text-white">{inspectingDesk.memberName}</h4>
                <p className="text-xs font-bold text-primary uppercase tracking-wider">{inspectingDesk.role}</p>
                <p className="text-[10px] text-slate-400 mt-1">Occupying Desk {inspectingDesk.deskId}</p>
              </div>
              <button onClick={() => setInspectingDesk(null)} className="size-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 max-w-[430px] w-full p-6 bg-gradient-to-t from-background-light dark:from-background-dark pt-10">
        <button 
          disabled={selectedDesks.length === 0}
          onClick={() => onViewChange(AppView.ASSIGN_TEAM)}
          className={`w-full h-16 rounded-[1.5rem] shadow-2xl flex items-center justify-center gap-3 font-black text-lg transition-all duration-300 ${selectedDesks.length > 0 ? 'bg-primary text-white shadow-primary/40 active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
        >
          <span className="material-symbols-outlined">group_add</span>
          <span>Assign {selectedDesks.length || ''} Desk{selectedDesks.length === 1 ? '' : 's'}</span>
        </button>
      </div>
    </div>
  );
};

export default FloorMap;
