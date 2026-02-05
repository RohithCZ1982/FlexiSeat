
import React from 'react';
import { AppView, User, Booking } from '../types';
import { TopAppBar, BottomNav } from './Layout';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface DashboardProps {
  onViewChange: (view: AppView) => void;
  user: User | null;
  bookings: Booking[];
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange, user, bookings }) => {
  const activeBookings = bookings.filter(b => b.status === 'Accepted');
  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const totalSpots = 24; // Expanded for a "real" floor feel
  const occupancyRate = Math.min(100, Math.round((activeBookings.length / totalSpots) * 100));

  const handleAction = async (id: string, action: 'Accept' | 'Reject') => {
    try {
      const bookingRef = doc(db, 'bookings', id);
      if (action === 'Accept') {
        await updateDoc(bookingRef, { status: 'Accepted' });
      } else {
        await deleteDoc(bookingRef);
      }
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  return (
    <div className="flex flex-col flex-1 animate-in fade-in duration-500">
      <TopAppBar title="Lead Dashboard" onRightClick={() => onViewChange(AppView.PROFILE)} />
      
      <main className="flex flex-col gap-6 p-5 pb-32 overflow-y-auto">
        <section className="mt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Workspace Overview</h2>
              <h1 className="text-slate-900 dark:text-white text-2xl font-black mt-1">Hello, {user?.name?.split(' ')[0] || 'Lead'}!</h1>
            </div>
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined fill">verified_user</span>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-gradient-to-br from-primary to-blue-700 rounded-[2rem] p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 size-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-white/70 text-sm font-bold uppercase tracking-wider">Floor Occupancy</p>
                  <p className="text-4xl font-black mt-1">{activeBookings.length}<span className="text-xl text-white/50 font-medium">/{totalSpots}</span></p>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Level 4 • Zone A
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out" style={{ width: `${occupancyRate}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>{occupancyRate}% Capacity</span>
                  <span className="opacity-70">{totalSpots - activeBookings.length} Desks Available</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onViewChange(AppView.FLOOR_MAP)} className="flex flex-col items-start gap-3 p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm active:scale-95 transition-transform group">
              <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center group-hover:rotate-12 transition-transform">
                <span className="material-symbols-outlined">add_location</span>
              </div>
              <span className="font-black text-sm text-slate-900 dark:text-white">Quick<br/>Booking</span>
            </button>
            <button onClick={() => onViewChange(AppView.STATS)} className="flex flex-col items-start gap-3 p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm active:scale-95 transition-transform group">
              <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center group-hover:-rotate-12 transition-transform">
                <span className="material-symbols-outlined">query_stats</span>
              </div>
              <span className="font-black text-sm text-slate-900 dark:text-white">Attendance<br/>Reports</span>
            </button>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="text-slate-900 dark:text-white text-lg font-black">Requests</h3>
            <button onClick={() => onViewChange(AppView.TEAM_BOOKINGS)} className="text-primary text-xs font-bold hover:underline">View History</button>
          </div>
          
          <div className="flex flex-col gap-3">
            {pendingBookings.length > 0 ? (
              pendingBookings.map((req) => (
                <div key={req.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 group transition-all">
                  <div className="relative">
                    <img src={req.memberAvatar} alt={req.memberName} className="size-12 rounded-2xl object-cover" />
                    <div className="absolute -bottom-1 -right-1 size-5 bg-orange-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-[10px] text-white">priority_high</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 dark:text-white font-black text-sm truncate">{req.memberName}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-tighter">Desk {req.deskId} • Level {req.level}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction(req.id, 'Reject')}
                      className="size-9 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-danger hover:bg-danger/10 flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, 'Accept')}
                      className="size-9 rounded-xl bg-success text-white shadow-lg shadow-success/20 flex items-center justify-center active:scale-90 transition-all"
                    >
                      <span className="material-symbols-outlined text-xl">check</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-3">auto_awesome</span>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-bold">No pending actions.<br/>Enjoy your day!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav currentView={AppView.DASHBOARD} onViewChange={onViewChange} />
    </div>
  );
};

export default Dashboard;
