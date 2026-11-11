import React, { useState } from 'react';
import Home from './pages/Home';
import Booking from './pages/Booking';
import ClientDashboard from './pages/ClientDashboard';

type Screen = 'home' | 'booking' | 'dashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [bookingParams, setBookingParams] = useState<{ groupName?: string | null }>({});

  const handleOpenBooking = (params?: { groupName?: string }) => {
    setBookingParams(params || {});
    setCurrentScreen('booking');
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa]">
      {currentScreen === 'home' && (
        <Home 
          onNavigateBooking={handleOpenBooking} 
          onNavigateDashboard={() => setCurrentScreen('dashboard')}
        />
      )}

      {currentScreen === 'booking' && (
        <Booking
          initialGroupName={bookingParams.groupName}
          onNavigateHome={() => setCurrentScreen('home')}
          onNavigateMyAppointments={() => setCurrentScreen('dashboard')}
        />
      )}

      {currentScreen === 'dashboard' && (
        <ClientDashboard
          onNavigateHome={() => setCurrentScreen('home')}
          onNavigateBooking={() => handleOpenBooking()}
        />
      )}
    </div>
  );
}