import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import BookRide from './pages/BookRide';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Login page coming soon...</p></div>} />
      <Route path="/dashboard" element={<div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Dashboard coming soon...</p></div>} />
      <Route path="/book-ride" element={<BookRide />} />
      <Route path="/rides" element={<div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Ride history coming soon...</p></div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
