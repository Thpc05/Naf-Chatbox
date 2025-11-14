import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import ActualLoginPage from './pages/ActualLoginPage';

const AdminRoute = () => {
  const user = JSON.parse(localStorage.getItem('LocalUser'));
  
  // Se o usuário existir E for admin, poggers -Buisi
  // Senão, redireciona para o chat, ou seja, not poggers -Buisi
  if (user && user.isAdmin) {
    return <AdminPage />;
  }
  return <Navigate to="/chat" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ActualLoginPage />} />
        <Route path="/Sign" element={<LoginPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/admin" element={<AdminRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;