
import React, { useMemo } from 'react';
import { AppView, Booking } from '../types';
import { TopAppBar, BottomNav } from './Layout';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface StatsProps {
  onViewChange: (view: AppView) => void;
  bookings: Booking[];
}

const Stats: React.FC<StatsProps> = ({ onViewChange, bookings }) => {
  // Aggregate real data for the chart
  const weeklyStats = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    
    bookings.forEach(b => {
      if (b.status === 'Accepted' && b.timestamp) {
        const date = new Date(typeof b.timestamp === 'number' ? b.timestamp : (b.timestamp as any).seconds * 1000);
        counts[date.getDay()]++;
      }
    });

    return days.slice(1, 6).map((day, i) => ({
      name: day,
      value: counts[i + 1]
    }));
  }, [bookings]);

  const acceptedCount = bookings.filter(b => b.status === 'Accepted').length;
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const totalCount = acceptedCount + pendingCount;
  const ratio = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col flex-1 animate-in fade-in duration-500">
      <TopAppBar title="Floor Analytics" onLeftClick={() => onViewChange(AppView.DASHBOARD)} />
      
      <main className="flex-1 overflow-y-auto p-5 pb-32">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Bookings</p>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-900 dark:text-white text-3xl font-black">{bookings.length}</span>
              <span className="text-emerald-500 text-[10px] font-bold">+12%</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Completion</p>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-900 dark:text-white text-3xl font-black">{ratio}%</span>
            </div>
          </div>
        </div>

        <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-slate-900 dark:text-white text-xl font-black">Daily Volume</h3>
              <p className="text-slate-400 text-xs font-bold mt-1">Confirmed desk usage by day</p>
            </div>
            <div className="size-10 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined">calendar_today</span>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={32}>
                  {weeklyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#197fe6' : '#f1f5f9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-slate-900 dark:text-white text-xl font-black mb-6">Status Breakdown</h3>
          <div className="flex items-center gap-10">
            <div className="relative size-32 shrink-0">
              <svg className="size-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#197fe6" strokeWidth="4" strokeDasharray={`${ratio} 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-900 dark:text-white">{ratio}%</span>
                <span className="text-[8px] font-black text-slate-400 uppercase">Success</span>
              </div>
            </div>
            <div className="flex flex-col gap-5 flex-1">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="size-2 rounded-full bg-primary"></div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">Accepted</span>
                </div>
                <span className="text-slate-400 text-xs font-bold pl-4">{acceptedCount} bookings</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="size-2 rounded-full bg-slate-200"></div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">Pending</span>
                </div>
                <span className="text-slate-400 text-xs font-bold pl-4">{pendingCount} bookings</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav currentView={AppView.STATS} onViewChange={onViewChange} />
    </div>
  );
};

export default Stats;
