
import React, { useState } from 'react';
import { AppView, User, Booking } from '../types';
import { TopAppBar, BottomNav } from './Layout';


interface DashboardProps {
  onViewChange: (view: AppView) => void;
  user: User | null;
  bookings: Booking[];
  onRefreshBookings?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange, user, bookings, onRefreshBookings }) => {
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeBookingId, setRevokeBookingId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [activeTab, setActiveTab] = useState<'own' | 'team'>('own'); // Default to own view for leads
  const activeBookings = bookings.filter(b => b.status === 'Accepted');
  const isMember = user?.role === 'Member';
  const isTeamLead = user?.role === 'Team Lead';

  // For Leads/Admins: Show PENDING requests to approve
  // For Members: Show ALL their own requests (history/status)
  // For Team Leads with tabs: Filter based on active tab
  const displayedBookings = isMember
    ? bookings.filter(b => b.memberId === user?.id)
    : isTeamLead
      ? activeTab === 'own'
        ? bookings.filter(b => b.memberId === user?.id)
        : bookings.filter(b => b.status === 'Pending' && b.memberId !== user?.id)
      : bookings.filter(b => b.status === 'Pending');

  const totalSpots = 24; // Expanded for a "real" floor feel
  const occupancyRate = Math.min(100, Math.round((activeBookings.length / totalSpots) * 100));

  const handleAction = async (id: string, action: 'Accept' | 'Reject') => {
    try {
      if (action === 'Accept') {
        // Update booking status to Accepted
        const res = await fetch(`http://localhost:5001/api/bookings/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Accepted' })
        });

        if (res.ok) {
          onRefreshBookings?.();
        } else {
          alert('Failed to accept booking.');
        }
      } else {
        // Delete the booking
        const res = await fetch(`http://localhost:5001/api/bookings/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          onRefreshBookings?.();
        } else {
          alert('Failed to reject booking.');
        }
      }
    } catch (error) {
      console.error("Action failed:", error);
      alert('An error occurred. Please try again.');
    }
  };

  const initiateRevoke = (id: string) => {
    setRevokeBookingId(id);
    setShowRevokeModal(true);
  };

  const executeRevoke = async () => {
    if (!revokeBookingId || !revokeReason.trim()) {
      alert('Please provide a reason for revoking.');
      return;
    }

    try {
      // Delete the booking (or you could update status to 'Revoked' if you want to keep history)
      const res = await fetch(`http://localhost:5001/api/bookings/${revokeBookingId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setShowRevokeModal(false);
        setRevokeBookingId(null);
        setRevokeReason('');
        onRefreshBookings?.();
      } else {
        alert('Failed to revoke booking.');
      }
    } catch (error) {
      console.error("Revoke failed:", error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex flex-col flex-1 animate-in fade-in duration-500">
      <TopAppBar title="FlexiSeat" onRightClick={() => onViewChange(AppView.PROFILE)} />

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

        {!isMember && (
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
        )}

        <section>
          <div className="grid grid-cols-2 gap-4">
            {!isMember && (
              <button onClick={() => onViewChange(AppView.FLOOR_MAP)} className="flex flex-col items-start gap-3 p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm active:scale-95 transition-transform group">
                <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <span className="material-symbols-outlined">add_location</span>
                </div>
                <span className="font-black text-sm text-slate-900 dark:text-white">Quick<br />Booking</span>
              </button>
            )}
            <button onClick={() => onViewChange(AppView.STATS)} className={`flex flex-col items-start gap-3 p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm active:scale-95 transition-transform group ${isMember ? 'col-span-2 w-full' : ''}`}>
              <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center group-hover:-rotate-12 transition-transform">
                <span className="material-symbols-outlined">query_stats</span>
              </div>
              <span className="font-black text-sm text-slate-900 dark:text-white">Attendance<br />Reports</span>
            </button>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="text-slate-900 dark:text-white text-lg font-black">{isMember ? 'My Requests' : 'Requests'}</h3>
            <button onClick={() => onViewChange(AppView.TEAM_BOOKINGS)} className="text-primary text-xs font-bold hover:underline">View History</button>
          </div>

          {/* Tabs for Team Leads */}
          {isTeamLead && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('own')}
                className={`flex-1 h-10 rounded-xl font-bold text-sm transition-all ${activeTab === 'own'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                My Requests
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`flex-1 h-10 rounded-xl font-bold text-sm transition-all ${activeTab === 'team'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                Team Requests
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {displayedBookings.length > 0 ? (
              displayedBookings.map((req) => (
                <div key={req.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 group transition-all">
                  <div className="relative">
                    <img src={req.memberAvatar} alt={req.memberName} className="size-12 rounded-2xl object-cover" />
                    <div className={`absolute -bottom-1 -right-1 size-5 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center ${req.status === 'Pending' ? 'bg-orange-500' : req.status === 'Accepted' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                      <span className="material-symbols-outlined text-[10px] text-white">
                        {req.status === 'Pending' ? 'priority_high' : req.status === 'Accepted' ? 'check' : 'close'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 dark:text-white font-black text-sm truncate">{req.memberName}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-tighter">Desk {req.deskId} • Level {req.level}</p>
                  </div>
                  {/* Action Buttons */}
                  {!isMember ? (
                    req.status === 'Pending' ? (
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
                    ) : req.status === 'Accepted' ? (
                      <button
                        onClick={() => initiateRevoke(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
                      >
                        Revoke
                      </button>
                    ) : null
                  ) : (
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-600' : req.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                      {req.status}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-3">auto_awesome</span>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-bold">No {isMember ? 'requests found' : 'pending actions'}.<br />Enjoy your day!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Revoke Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="size-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl">block</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Revoke Booking?</h3>
              <p className="text-slate-500 font-medium text-sm">
                Please provide a reason for revoking this booking.
              </p>
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Reason</label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full h-24 mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-primary font-medium dark:text-white resize-none"
                placeholder="e.g., Desk maintenance required..."
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowRevokeModal(false); setRevokeBookingId(null); setRevokeReason(''); }}
                className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeRevoke}
                disabled={!revokeReason.trim()}
                className="flex-1 h-12 rounded-xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Revoke Booking
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav currentView={AppView.DASHBOARD} onViewChange={onViewChange} />
    </div>
  );
};

export default Dashboard;
