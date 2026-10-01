import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Cake, User, ShieldCheck, Menu, X, LogIn, LogOut } from 'lucide-react';
import { useShop } from '../store/ShopContext';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const { cart, orders, userProfile, isLoggedIn, setIsAuthModalOpen, logout } = useShop();
  const { t, language } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Active in-progress orders (Received, Baking, Out for Delivery)
  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;

  const isActive = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/menu')) return true;
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.5rem] py-2 sm:py-2.5">
          {/* Logo Brand: JS Cake & Flower Shop */}
          <Link to="/" className="flex items-center gap-3 group py-1">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform font-bold shrink-0 shadow-sm">
              <Cake className="w-6 h-6" />
            </div>
            <div className="flex flex-col justify-center pt-1">
              <span className="font-serif font-bold text-lg sm:text-2xl text-stone-100 tracking-tight leading-snug">
                JS Cake & Flower Shop
              </span>
              <span className="text-[11px] sm:text-xs text-amber-400/90 font-medium tracking-wider uppercase mt-0.5">
                दरजिया, कुशीनगर · 7860828297
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/menu"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isActive('/menu') || isActive('/')
                  ? 'text-amber-400 bg-stone-800'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              {t('navMenu')}
            </Link>

            <Link
              to="/orders"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                isActive('/orders')
                  ? 'text-amber-400 bg-stone-800'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t('navTrackOrders')}</span>
              {activeOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950">
                  {activeOrdersCount} {t('liveBadge')}
                </span>
              )}
            </Link>

            <Link
              to="/admin"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/admin')
                  ? 'text-amber-400 bg-stone-800'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('navAdmin')}</span>
            </Link>
          </nav>

          {/* Right Action Icons & Customer Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher (EN | हिन्दी) */}
            <LanguageToggle />

            {/* Customer Profile / Login Button */}
            {isLoggedIn ? (
              <div className="flex items-center gap-1">
                <Link
                  to="/orders"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-800/90 hover:bg-stone-700/80 border border-stone-700 text-stone-200 text-xs transition-colors"
                  title={userProfile.name}
                >
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                    {userProfile.name?.charAt(0) || 'U'}
                  </div>
                  <span className="font-semibold max-w-[110px] truncate hidden sm:inline">
                    {userProfile.name}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title={language === 'hi' ? 'लॉग आउट' : 'Log Out'}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'लॉग इन' : 'Login'}</span>
              </button>
            )}

            <Link
              to="/cart"
              className="relative p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/60 text-stone-200 transition-colors flex items-center gap-2 px-3"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-medium hidden sm:inline">{t('navCart')}</span>
              {cartTotalItems > 0 ? (
                <span className="bg-amber-500 text-stone-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartTotalItems}
                </span>
              ) : (
                <span className="text-stone-400 text-xs hidden sm:inline">(0)</span>
              )}
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-800 bg-stone-900 px-4 pt-3 pb-4 space-y-2">
          <div className="pb-2 mb-2 border-b border-stone-800 flex items-center justify-between">
            <span className="text-xs text-stone-400">Language / भाषा:</span>
            <LanguageToggle />
          </div>

          {/* Customer Profile / Login in Mobile */}
          <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/70 mb-2">
            {isLoggedIn ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-300">👤 {userProfile.name}</p>
                  <p className="text-[11px] text-stone-400">{userProfile.phone || userProfile.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 underline"
                >
                  {language === 'hi' ? 'लॉग आउट' : 'Log Out'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'hi' ? 'ग्राहक लॉग इन / खाता बनाएं (OTP)' : 'Customer Sign In with OTP'}</span>
              </button>
            )}
          </div>

          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-stone-200 hover:bg-stone-800"
          >
            🎂 {t('navMenu')}
          </Link>

          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-stone-200 hover:bg-stone-800"
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>{t('navTrackOrders')}</span>
            </span>
            {activeOrdersCount > 0 && (
              <span className="text-xs font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full">
                {activeOrdersCount} {t('liveBadge')}
              </span>
            )}
          </Link>

          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-stone-200 hover:bg-stone-800"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{t('navAdmin')}</span>
          </Link>
        </div>
      )}
    </header>
  );
}

