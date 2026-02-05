
import React, { useState, useEffect } from 'react';
import { AppView, TeamMember, Booking } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface AssignTeamProps {
  onViewChange: (view: AppView) => void;
  selectedDesks: string[];
  onConfirm: (bookings: Booking[]) => void;
}

const AssignTeam: React.FC<AssignTeamProps> = ({ onViewChange, selectedDesks, onConfirm }) => {
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Unknown',
        role: doc.data().role || 'Member',
        avatar: doc.data().avatar || `https://picsum.photos/seed/${doc.id}/100/100`,
        ...doc.data()
      })) as TeamMember[];
      setTeam(fetchedUsers);
    });
    return () => unsubscribe();
  }, []);

  const handleAssign = (deskId: string, memberId: string) => {
    setAssignments(prev => ({ ...prev, [deskId]: memberId }));
  };

  const handleConfirm = () => {
    const newBookings: Booking[] = selectedDesks.map(deskId => {
      const memberId = assignments[deskId];
      const member = team.find(t => t.id === memberId)!;
      return {
        id: `book_${Math.random().toString(36).substr(2, 9)}`,
        memberId: member.id,
        memberName: member.name,
        memberAvatar: member.avatar,
        role: member.role,
        deskId: deskId,
        zone: 'Creative Hub',
        level: 4,
        status: 'Pending',
        dateRange: 'Oct 23 - Oct 27',
        timestamp: Date.now()
      };
    });
    onConfirm(newBookings);
  };

  const isComplete = Object.keys(assignments).length === selectedDesks.length;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between">
          <button onClick={() => onViewChange(AppView.FLOOR_MAP)} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-800 dark:text-white">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold flex-1 text-center">Assign Team</h1>
          <div className="size-10"></div>
        </div>
      </header>

      <main className="flex-1 pb-40 p-4">
        <div className="mb-6">
          <div className="bg-primary/10 dark:bg-primary/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm"><span className="material-symbols-outlined">calendar_month</span></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary opacity-80">Current Timeframe</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">Weekly (Oct 23 - Oct 27)</p>
            </div>
          </div>
        </div>

        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Selected Workstations</h2>
        <div className="space-y-4">
          {selectedDesks.map(deskId => (
            <div key={deskId} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 size-12"><span className="material-symbols-outlined">desktop_windows</span></div>
                <div className="flex flex-col justify-center flex-1">
                  <p className="text-base font-bold leading-normal">Desk {deskId}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Zone: Creative Hub • Level 4</p>
                </div>
              </div>
              <div className="relative">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Assign Team Member</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">person_search</span>
                  <select
                    value={assignments[deskId] || ""}
                    onChange={(e) => handleAssign(deskId, e.target.value)}
                    className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-700 appearance-none text-slate-900 dark:text-white transition-all"
                  >
                    <option value="" disabled>Select member</option>
                    {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">unfold_more</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="fixed bottom-0 max-w-[430px] w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 pb-10">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-500">Total Assignments</span>
            <span className="text-sm font-extrabold text-primary">{Object.keys(assignments).length} of {selectedDesks.length} Seats</span>
          </div>
          <button
            disabled={!isComplete}
            onClick={handleConfirm}
            className={`w-full h-14 rounded-2xl shadow-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${isComplete ? 'bg-primary text-white shadow-primary/25 active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
          >
            <span>Confirm and Send</span>
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AssignTeam;
