
import React, { useState, useEffect } from 'react';
import { AppView, TeamMember, Booking, User } from '../types';


interface AssignTeamProps {
  onViewChange: (view: AppView) => void;
  selectedDesks: string[];
  onConfirm: (bookings: Booking[]) => void;
  user: User | null;
}

const AssignTeam: React.FC<AssignTeamProps> = ({ onViewChange, selectedDesks, onConfirm, user }) => {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/users');
        if (res.ok) {
          const fetchedUsers = await res.json();
          // Filter to show only the logged-in team lead and their assigned members
          if (user) {
            const filteredTeam = fetchedUsers.filter((u: TeamMember) =>
              u.id === user.id || u.teamLeadId === user.id
            );
            setTeam(filteredTeam);
          } else {
            setTeam(fetchedUsers);
          }
        }
      } catch (e) {
        console.error("Error fetching team", e);
      }
    };
    fetchUsers();
  }, [user]);

  const toggleDateSelection = (date: Date) => {
    const dateStr = date.toDateString();
    const isSelected = selectedDates.some(d => d.toDateString() === dateStr);

    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => d.toDateString() !== dateStr));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(d => d.toDateString() === date.toDateString());
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

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
    onConfirm(newBookings, selectedDates);
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
        {/* Calendar Section */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Select Dates</h2>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="size-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">chevron_left</span>
              </button>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="size-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">chevron_right</span>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
                const days = [];

                // Empty cells for days before month starts
                for (let i = 0; i < startingDayOfWeek; i++) {
                  days.push(<div key={`empty-${i}`} className="aspect-square" />);
                }

                // Days of the month
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(year, month, day);
                  const selected = isDateSelected(date);
                  const past = isPastDate(date);

                  days.push(
                    <button
                      key={day}
                      onClick={() => !past && toggleDateSelection(date)}
                      disabled={past}
                      className={`aspect-square rounded-lg text-sm font-bold transition-all ${selected
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : past
                          ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                      {day}
                    </button>
                  );
                }

                return days;
              })()}
            </div>

            {/* Selected Dates Summary */}
            {selectedDates.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Selected Dates ({selectedDates.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDates.sort((a, b) => a.getTime() - b.getTime()).map((date, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold"
                    >
                      <span>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <button
                        onClick={() => toggleDateSelection(date)}
                        className="size-4 rounded-full hover:bg-primary/20 flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[12px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
