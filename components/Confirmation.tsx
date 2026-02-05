
import React, { useEffect, useState } from 'react';
import { AppView } from '../types';

interface ConfirmationProps {
  onViewChange: (view: AppView) => void;
  bookingDates?: Date[];
}

const Confirmation: React.FC<ConfirmationProps> = ({ onViewChange, bookingDates = [] }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  const formatDateRange = () => {
    if (!bookingDates || bookingDates.length === 0) {
      return 'No dates selected';
    }

    const sortedDates = [...bookingDates].sort((a, b) => a.getTime() - b.getTime());

    if (sortedDates.length === 1) {
      return sortedDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    const firstDate = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];

    return `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-white dark:bg-slate-900">
      <header className="flex items-center p-4 justify-between z-10">
        <button onClick={() => onViewChange(AppView.DASHBOARD)} className="text-slate-900 dark:text-white flex size-12 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-lg font-extrabold flex-1 text-center">Confirmation</h2>
        <div className="size-12"></div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden">
        {/* Abstract Confetti Simulation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-sm animate-bounce`}
                style={{
                  top: `${Math.random() * 80}%`,
                  left: `${Math.random() * 90}%`,
                  backgroundColor: ['#197fe6', '#fb923c', '#22c55e', '#f43f5e', '#a855f7'][Math.floor(Math.random() * 5)],
                  animationDelay: `${Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            ))}
          </div>
        )}

        <div className="relative mb-10 scale-125 animate-in zoom-in-50 duration-500">
          <div className="size-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <div className="size-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <span className="material-symbols-outlined text-white text-5xl">check</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-slate-900 dark:text-white text-[40px] font-black leading-tight mb-4 animate-in slide-in-from-bottom-4 duration-700">Success!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-[280px] mx-auto animate-in slide-in-from-bottom-8 duration-700 delay-100">
            Your team has been notified of their seat assignments.
          </p>
        </div>

        <div className="mt-12 w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center gap-5 animate-in slide-in-from-bottom-12 duration-700 delay-200">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <span className="material-symbols-outlined">event_available</span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking Period</p>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{formatDateRange()}</p>
            {bookingDates && bookingDates.length > 1 && (
              <p className="text-xs text-slate-500 mt-1">{bookingDates.length} days selected</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-8 py-10">
        <button
          onClick={() => onViewChange(AppView.DASHBOARD)}
          className="flex w-full items-center justify-center rounded-2xl h-16 bg-primary text-white text-lg font-black shadow-2xl shadow-primary/30 active:scale-95 transition-transform"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => onViewChange(AppView.TEAM_BOOKINGS)}
          className="flex w-full items-center justify-center h-12 bg-transparent text-primary text-base font-extrabold hover:underline"
        >
          View Booking Details
        </button>
      </div>

      <div className="h-8 w-full flex justify-center items-end pb-4">
        <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      </div>
    </div>
  );
};

export default Confirmation;
