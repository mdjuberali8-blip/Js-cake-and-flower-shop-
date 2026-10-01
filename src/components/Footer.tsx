import React from 'react';
import { Cake, Clock, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 pt-12 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col: JS Cake Shop */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Cake className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-lg text-white">JS Cake & Flower Shop</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t('footerDesc')}
            </p>
            <div className="text-xs text-amber-400/90 font-medium">
              {t('footerHours')}
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-stone-100 mb-3">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/menu" className="hover:text-amber-400 transition-colors">
                  {t('navMenu')}
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-amber-400 transition-colors">
                  {t('navTrackOrders')}
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-amber-400 transition-colors">
                  {t('navCart')}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  {t('navAdmin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Bakehouse Commitment */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-stone-100 mb-3">
              {t('liveProgressTitle')}
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>1. {t('statusReceived')}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>2. {t('statusBaking')}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>3. {t('statusOutForDelivery')}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>4. {t('statusDelivered')}</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-stone-100 mb-3">
              {t('brandTagline')}
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{t('indianAddressFull')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:+917860828297" className="hover:text-amber-400 transition-colors font-medium">
                  {t('indianPhone')}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t('footerHours')}</span>
              </li>
              <li className="pt-1">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Darjiya+Kushinagar+Uttar+Pradesh+274403"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-semibold underline text-[11px] inline-flex items-center gap-1"
                >
                  <span>📍 {t('viewLocationMap')}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3">
          <p>© {new Date().getFullYear()} JS Cake Shop. {t('allRightsReserved')}</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>{t('contactlessDelivery')}</span>
            <span aria-hidden="true">·</span>
            <span>{t('temperatureMonitored')}</span>
            <span aria-hidden="true">·</span>
            <span>{t('realtimeTracking')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
