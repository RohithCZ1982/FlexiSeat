
import React, { useState } from 'react';
import { AppView, Booking, User } from '../types';
import { TopAppBar, BottomNav } from './Layout';

interface TeamBookingsProps {
  onViewChange: (view: AppView) => void;
  bookings: Booking[];
  user: User | null;
}

const TeamBookings: React.FC<TeamBookingsProps> = ({ onViewChange, bookings, user }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const isMember = user?.role === 'Member';

  const relevantBookings = isMember
    ? bookings.filter(b => b.memberId === user?.id)
    : bookings;

  const filteredBookings = relevantBookings.filter(b =>
    b.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.deskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Accepted': return 'bg-emerald-500/10 text-emerald-500';
      case 'Pending': return 'bg-orange-500/10 text-orange-500';
      case 'Rejected': return 'bg-red-500/10 text-red-500';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted': return 'check_circle';
      case 'Pending': return 'schedule';
      case 'Rejected': return 'cancel';
      default: return 'info';
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <TopAppBar title="Team History" leftIcon="chevron_left" onLeftClick={() => onViewChange(AppView.DASHBOARD)} rightIcon="notifications" />

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="mb-6">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search employee or desk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-primary text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          <button className="flex h-10 items-center gap-2 rounded-xl bg-primary text-white px-4 font-bold text-sm">All Status <span className="material-symbols-outlined text-sm">expand_more</span></button>
          <button className="flex h-10 items-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 text-slate-500 font-bold text-sm">This Week <span className="material-symbols-outlined text-sm">calendar_month</span></button>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Booking Log ({filteredBookings.length})</p>

        <div className="space-y-3">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((req, i) => (
              <div key={req.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-50 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full border-2 border-white dark:border-slate-700 overflow-hidden">
                      <img src={req.memberAvatar} alt={req.memberName} className="size-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-slate-900 dark:text-white text-base font-extrabold leading-none mb-1">{req.memberName}</p>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">{req.role}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] ${getStatusStyle(req.status)}`}>
                    <span className="material-symbols-outlined text-[14px]">{getStatusIcon(req.status)}</span>
                    {req.status}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                  <div className="flex flex-col">
                    <p className={`text-slate-900 dark:text-white text-sm font-bold ${req.status === 'Rejected' ? 'line-through opacity-40' : ''}`}>Desk {req.deskId}</p>
                    <p className="text-slate-400 text-[10px] font-medium">{req.dateRange}</p>
                  </div>
                  <p className="text-slate-400 text-[10px] font-bold">Zone {req.zone}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center opacity-50">
              <span className="material-symbols-outlined text-4xl mb-2">sentiment_dissatisfied</span>
              <p className="text-sm font-bold">No results found</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav currentView={AppView.TEAM_BOOKINGS} onViewChange={onViewChange} />
    </div>
  );
};

export default TeamBookings;
