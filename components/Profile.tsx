
import React from 'react';
import { AppView, User } from '../types';
import { BottomNav } from './Layout';

interface ProfileProps {
  onViewChange: (view: AppView) => void;
  user: User | null;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onViewChange, user, onLogout }) => {
  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center bg-transparent p-4 pb-2 justify-between">
        <button onClick={() => onViewChange(AppView.DASHBOARD)} className="text-slate-900 dark:text-white flex size-12 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold flex-1 text-center">Profile</h2>
        <button className="flex size-12 items-center justify-center rounded-full bg-transparent text-slate-900 dark:text-white">
          <span className="material-symbols-outlined text-2xl">settings</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="flex flex-col items-center py-8 px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative mb-4">
            <div className="size-32 rounded-full border-4 border-white dark:border-slate-700 shadow-lg overflow-hidden">
              <img src={user?.avatar || "https://picsum.photos/seed/placeholder/300/300"} alt={user?.name} className="size-full object-cover" />
            </div>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            <p className="text-slate-900 dark:text-white text-2xl font-extrabold">{user?.name || 'User'}</p>
            <p className="text-primary font-bold text-base">{user?.role || 'Team Lead'}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{user?.email}</p>
          </div>
        </div>

        <section className="px-4 py-6">
          <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-2 mb-3">Account Settings</h3>
          <div className="space-y-2">
            {[
              { icon: 'person', label: 'Personal Information' },
              { icon: 'desk', label: 'Work Preferences', sub: 'Preferred: Floor 4, Window seat' },
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-50 dark:border-slate-800 active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-slate-900 dark:text-white text-base font-bold">{item.label}</p>
                    {item.sub && <p className="text-slate-400 text-[10px] font-medium">{item.sub}</p>}
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
              </button>
            ))}
          </div>
        </section>

        {(user?.role === 'Team Lead' || user?.role === 'Admin') && (
          <section className="px-4 py-2">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-2 mb-3">Admin Panel</h3>
            <button
              onClick={() => onViewChange(AppView.ADMIN_USERS)}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-50 dark:border-slate-800 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <span className="material-symbols-outlined">shield_person</span>
                </div>
                <div className="text-left">
                  <p className="text-slate-900 dark:text-white text-base font-bold">Manage Users</p>
                  <p className="text-slate-400 text-[10px] font-medium">Roles & Permissions</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
          </section>
        )}

        <section className="px-4 py-2">
          <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-2 mb-3">App Preferences</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">notifications</span>
                </div>
                <p className="text-slate-900 dark:text-white text-base font-bold">Notifications</p>
              </div>
              <div className="size-10 flex items-center justify-center">
                <div className="w-11 h-6 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 size-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">dark_mode</span>
                </div>
                <p className="text-slate-900 dark:text-white text-base font-bold">Dark Mode</p>
              </div>
              <div className="size-10 flex items-center justify-center">
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative">
                  <div className="absolute left-1 top-1 size-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="px-6 py-10">
          <button
            onClick={onLogout}
            className="w-full h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-extrabold flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
          <p className="text-slate-400 text-[10px] font-bold text-center mt-8">Version 2.4.1 (Build 890)</p>
        </div>
      </main>

      <BottomNav currentView={AppView.PROFILE} onViewChange={onViewChange} />
    </div>
  );
};

export default Profile;
