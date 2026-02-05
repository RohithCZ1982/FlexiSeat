
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
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [selectedDesks, setSelectedDesks] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Listen for Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Map Firebase User to our App User type
        const appUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Team Lead',
          email: firebaseUser.email || '',
          role: 'Team Lead',
          avatar: `https://picsum.photos/seed/${firebaseUser.uid}/300/300`,
        };

        // Sync User to Firestore (so they appear in the team list)
        // Sync User to Firestore (so they appear in the team list)
        const userRef = doc(db, "users", firebaseUser.uid);

        // Check if user exists to get their REAL role (don't overwrite 'Team Lead' every time)
        getDoc(userRef).then((docSnap) => {
          if (firebaseUser.email === 'admin@office.com') {
            appUser.role = 'Admin'; // HARDCODED Admin
          } else if (docSnap.exists()) {
            const data = docSnap.data();
            appUser.role = data.role || 'Member'; // Use existing role or default
          } else {
            appUser.role = 'Member'; // Default new users to Member
          }

          setDoc(userRef, {
            id: firebaseUser.uid,
            name: appUser.name,
            email: appUser.email,
            role: appUser.role, // Persist the role we just resolved
            avatar: appUser.avatar,
            lastLogin: serverTimestamp()
          }, { merge: true });

          setUser({ ...appUser }); // Update state with resolved role
        });
        if (currentView === AppView.LOGIN) {
          setCurrentView(AppView.DASHBOARD);
        }
      } else {
        setUser(null);
        setCurrentView(AppView.LOGIN);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Listen for Real-time Firestore Updates
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "bookings"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBookings: Booking[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      setBookings(fetchedBookings);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = (userData: User) => {
    // User state is handled by onAuthStateChanged listener
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const addBooking = async (newBookings: Booking[]) => {
    try {
      setLoading(true);
      for (const booking of newBookings) {
        // We omit the ID from the object because Firestore generates its own
        const { id: _, ...bookingData } = booking;
        await addDoc(collection(db, "bookings"), {
          ...bookingData,
          timestamp: serverTimestamp()
        });
      }
      setSelectedDesks([]);
      setCurrentView(AppView.CONFIRMATION);
    } catch (error) {
      console.error("Error saving bookings:", error);
      alert("Failed to save bookings to cloud.");
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
        return <Dashboard onViewChange={setCurrentView} user={user} bookings={bookings} />;
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
          />
        );
      case AppView.TEAM_BOOKINGS:
        return <TeamBookings onViewChange={setCurrentView} bookings={bookings} user={user} />;
      case AppView.STATS:
        return <Stats onViewChange={setCurrentView} bookings={bookings} user={user} />;
      case AppView.PROFILE:
        return <Profile onViewChange={setCurrentView} user={user} onLogout={handleLogout} />;
      case AppView.CONFIRMATION:
        return <Confirmation onViewChange={setCurrentView} />;
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
