
import React, { useState, useEffect } from 'react';
import { AppView, User, Booking } from './types';
import Dashboard from './components/Dashboard';
import FloorMap from './components/FloorMap';
import AssignTeam from './components/AssignTeam';
import Stats from './components/Stats';
import Profile from './components/Profile';
import TeamBookings from './components/TeamBookings';
import Confirmation from './components/Confirmation';
import Login from './components/Login';
import AdminUsers from './components/AdminUsers';


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [selectedDesks, setSelectedDesks] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDates, setBookingDates] = useState<Date[]>([]);

  // 1. Listen for Auth State Changes - REMOVED for Local implementation
  useEffect(() => {
    // Check local storage or session if we implemented persistence.
    // For now simple session state.
    setLoading(false);
  }, []);

  // 2. Fetch bookings when user logs in
  useEffect(() => {
    if (!user) return;
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const res = await fetch('http://localhost:5001/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = async () => {
    setUser(null);
    setCurrentView(AppView.LOGIN);
  };

  const addBooking = async (newBookings: Booking[], selectedDates?: Date[]) => {
    try {
      setLoading(true);

      if (!selectedDates || selectedDates.length === 0) {
        alert('Please select at least one date for the booking.');
        setLoading(false);
        return;
      }

      // Create a booking for each desk and each selected date
      const bookingPromises = [];
      for (const booking of newBookings) {
        for (const date of selectedDates) {
          bookingPromises.push(
            fetch('http://localhost:5001/api/bookings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                memberId: booking.memberId,
                memberName: booking.memberName,
                memberAvatar: booking.memberAvatar,
                role: booking.role,
                deskId: booking.deskId,
                zone: booking.zone,
                level: booking.level,
                status: 'Pending',
                bookingDate: date.toISOString().split('T')[0] // Format as YYYY-MM-DD
              })
            })
          );
        }
      }

      await Promise.all(bookingPromises);

      if (selectedDates) {
        setBookingDates(selectedDates);
      }

      setSelectedDesks([]);
      setCurrentView(AppView.CONFIRMATION);

      // Refresh bookings list
      fetchBookings();
    } catch (error) {
      console.error("Error saving bookings:", error);
      alert("Failed to save bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && currentView === AppView.LOGIN) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.LOGIN:
        return <Login onLogin={handleLogin} />;
      case AppView.DASHBOARD:
        return <Dashboard onViewChange={setCurrentView} user={user} bookings={bookings} onRefreshBookings={fetchBookings} />;
      case AppView.FLOOR_MAP:
        return (
          <FloorMap
            onViewChange={setCurrentView}
            selectedDesks={selectedDesks}
            setSelectedDesks={setSelectedDesks}
            existingBookings={bookings}
          />
        );
      case AppView.ASSIGN_TEAM:
        return (
          <AssignTeam
            onViewChange={setCurrentView}
            selectedDesks={selectedDesks}
            onConfirm={addBooking}
            user={user}
          />
        );
      case AppView.TEAM_BOOKINGS:
        return <TeamBookings onViewChange={setCurrentView} bookings={bookings} user={user} />;
      case AppView.STATS:
        return <Stats onViewChange={setCurrentView} bookings={bookings} user={user} />;
      case AppView.PROFILE:
        return <Profile onViewChange={setCurrentView} user={user} onLogout={handleLogout} />;
      case AppView.CONFIRMATION:
        return <Confirmation onViewChange={setCurrentView} bookingDates={bookingDates} />;
      case AppView.ADMIN_USERS:
        if (user?.role === 'Team Lead' || user?.role === 'Admin') {
          return <AdminUsers onViewChange={setCurrentView} />;
        }
        return <Dashboard onViewChange={setCurrentView} user={user} bookings={bookings} />;
      default:
        return <Dashboard onViewChange={setCurrentView} user={user} bookings={bookings} />;
    }
  };

  return (
    <div className="flex justify-center bg-slate-200 dark:bg-slate-950 min-h-screen">
      <div className="w-full max-w-[430px] bg-background-light dark:bg-background-dark min-h-screen relative shadow-2xl flex flex-col">
        {renderView()}
      </div>
    </div>
  );
};

export default App;
