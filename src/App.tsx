import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { ShopProvider } from './store/ShopContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import CustomerAuthModal from './components/CustomerAuthModal';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <LanguageProvider>
      <ShopProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-100 selection:text-amber-900">
            <Navbar />
            <ToastContainer />
            <CustomerAuthModal />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<MenuPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<UserProfilePage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ShopProvider>
    </LanguageProvider>
  );
}
