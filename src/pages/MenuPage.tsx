import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../store/ShopContext';
import { useLanguage } from '../i18n/LanguageContext';
import CakeCard from '../components/CakeCard';
import ShopLocationMap from '../components/ShopLocationMap';
import { CAKE_SECTIONS_META } from '../data/cakes';
import { ProductCategory } from '../types';
import { Sparkles, ArrowRight, Search, Clock, ShieldCheck, Truck, Flame, Filter, ChevronRight } from 'lucide-react';

export default function MenuPage() {
  const { cakes, orders } = useShop();
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isHindi = language === 'hi';

  const filterTabs: { id: string; labelEn: string; labelHi: string; icon: string }[] = [
    { id: 'All', labelEn: 'All Sections', labelHi: 'सभी सेक्शन', icon: '✨' },
    { id: 'Pineapple Cakes', labelEn: 'Pineapple Cakes', labelHi: 'पाइनएप्पल केक', icon: '🍍' },
    { id: 'Rasmalai & Fusion Cakes', labelEn: 'Rasmalai & Fusion', labelHi: 'रसमलाई व मिठाई', icon: '🥛' },
    { id: 'Butterscotch Cakes', labelEn: 'Butterscotch', labelHi: 'बटरस्कॉच', icon: '🍯' },
    { id: 'Black Forest Cakes', labelEn: 'Black Forest', labelHi: 'ब्लैक फॉरेस्ट', icon: '🍒' },
    { id: 'Chocolate Cakes', labelEn: 'Chocolate Truffle', labelHi: 'चॉकलेट व ट्रफल', icon: '🍫' },
    { id: 'Red Velvet Cakes', labelEn: 'Red Velvet', labelHi: 'रेड वेलवेट', icon: '🍓' },
    { id: 'Fresh Fruit Cakes', labelEn: 'Fresh Fruit Cakes', labelHi: 'ताज़ा फ्रूट केक', icon: '🥝' },
    { id: 'Fresh Flowers', labelEn: 'Fresh Flowers', labelHi: 'ताज़े फूल व बुके', icon: '💐' },
    { id: 'Combos', labelEn: 'Cake + Flower Combos', labelHi: 'केक + फूल कॉम्बो', icon: '🎁' },
  ];

  // Organize cakes section-wise
  const sectionsWithCakes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return CAKE_SECTIONS_META.map((meta) => {
      const sectionCakes = cakes.filter((cake) => {
        const matchesCategory = cake.category === meta.category;
        if (!matchesCategory) return false;
        if (!q) return true;
        return (
          cake.name.toLowerCase().includes(q) ||
          cake.description.toLowerCase().includes(q) ||
          cake.tagline.toLowerCase().includes(q) ||
          cake.category.toLowerCase().includes(q)
        );
      });

      return {
        ...meta,
        cakes: sectionCakes,
      };
    });
  }, [cakes, searchQuery]);

  // Active in-progress orders
  const activeOrders = orders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
  );

  const displayedSections = useMemo(() => {
    if (selectedCategory === 'All') {
      return sectionsWithCakes.filter((s) => s.cakes.length > 0);
    }
    return sectionsWithCakes.filter(
      (s) => s.category === selectedCategory && s.cakes.length > 0
    );
  }, [sectionsWithCakes, selectedCategory]);

  const totalMatchingItems = useMemo(() => {
    return displayedSections.reduce((sum, s) => sum + s.cakes.length, 0);
  }, [displayedSections]);

  return (
    <div className="bg-stone-50 min-h-screen pb-20">
      {/* Active Order Notice Banner */}
      {activeOrders.length > 0 && (
        <div className="bg-amber-100/90 border-b border-amber-200/80 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
              </span>
              <span className="font-semibold">{t('activeOrderAlert')}</span>
              <span className="text-stone-700">
                Order #{activeOrders[0].id} (<strong>{activeOrders[0].status}</strong>)
              </span>
            </div>
            <Link
              to="/orders"
              className="font-semibold text-amber-900 hover:text-amber-950 underline flex items-center gap-1"
            >
              <span>{t('viewLiveProgress')}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-stone-900 text-stone-100 pt-10 sm:pt-14 pb-14 px-4 sm:px-6 lg:px-8 border-b border-stone-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isHindi
                ? 'दरजिया, कुशीनगर · ताज़े केक, पेस्ट्री व फूलों के बुके'
                : 'Darjiya, Kushinagar · Fresh Cakes, Pastries & Floral Bouquets'}
            </span>
          </div>

          {/* Prominent Shop Name Heading */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-2 drop-shadow-xs">
            JS Cake & Flower Shop
          </h1>
          <p className="text-amber-400 font-medium text-xs sm:text-sm tracking-wide uppercase mb-3">
            {isHindi
              ? 'दरजिया मुख्य चौराहा (कसया रोड), कुशीनगर · 100% शुद्ध शाकाहारी एगलेस बेकरी'
              : 'Darjiya Main Chauraha (Kasia Road), Kushinagar · 100% Eggless Bakehouse & Florist'}
          </p>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-stone-300 mb-6 leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-stone-300 pt-3 border-t border-stone-800/80 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{t('heroFeature1')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>{t('heroFeature2')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{t('heroFeature3')}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{t('heroFeature4')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Section Selector Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sticky top-16 z-30">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-lg border border-stone-200/90 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Scrollable Category Filter Pills */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
            {filterTabs.map((tab) => {
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`text-xs font-semibold px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs font-bold'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{isHindi ? tab.labelHi : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isHindi ? 'केक या फूल खोजें...' : 'Search cakes, flavor...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50"
            />
          </div>
        </div>
      </section>

      {/* Section-Wise Product Display */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-14">
        {/* Active Filter Header Indicator */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
              <span>{isHindi ? 'सेक्शन अनुसार भारतीय केक व फूल' : 'India’s Favorite Cakes & Flowers Menu'}</span>
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              {isHindi
                ? `${totalMatchingItems} स्वादिष्ट विकल्प उपलब्ध (दरजिया, कुशीनगर)`
                : `Showing ${totalMatchingItems} handcrafted options in Darjiya, Kushinagar`}
            </p>
          </div>

          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors"
            >
              {isHindi ? 'सभी सेक्शन देखें' : 'View All Sections'}
            </button>
          )}
        </div>

        {/* If no items match search */}
        {displayedSections.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-serif text-lg font-bold text-stone-800 mb-1">{t('noCakesFound')}</p>
            <p className="text-xs text-stone-500 mb-5">{t('noCakesDesc')}</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-xs font-semibold px-5 py-2.5 rounded-xl bg-amber-600 text-white shadow-sm hover:bg-amber-700 transition-colors"
            >
              {t('resetFilters')}
            </button>
          </div>
        ) : (
          /* Render Each Section */
          displayedSections.map((section) => (
            <section
              key={section.category}
              id={`section-${section.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className="scroll-mt-32 space-y-6"
            >
              {/* Section Header Card */}
              <div
                className={`p-5 sm:p-6 rounded-3xl bg-gradient-to-r ${section.bgGradient} border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-stone-200/80 flex items-center justify-center text-2xl shrink-0">
                    {section.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
                        {isHindi ? section.titleHi : section.titleEn}
                      </h2>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 text-stone-800 border border-stone-300/80 shadow-2xs">
                        {isHindi ? section.badgeHi : section.badgeEn}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 mt-1 max-w-2xl leading-relaxed">
                      {isHindi ? section.taglineHi : section.taglineEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <span className="text-xs font-semibold text-stone-600 bg-white/80 px-3 py-1.5 rounded-xl border border-stone-200">
                    {section.cakes.length} {isHindi ? 'वैरायटी' : 'Varieties'}
                  </span>
                  <a
                    href="tel:+917860828297"
                    className="text-xs font-bold text-stone-900 bg-white hover:bg-stone-50 px-3.5 py-1.5 rounded-xl border border-stone-300 shadow-2xs transition-colors"
                  >
                    📞 7860828297
                  </a>
                </div>
              </div>

              {/* Grid of Cakes/Items for this section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {section.cakes.map((cake) => (
                  <CakeCard key={cake.id} cake={cake} />
                ))}
              </div>
            </section>
          ))
        )}

        {/* Indian Bakery Location & Interactive Map Section */}
        <div className="pt-8">
          <ShopLocationMap />
        </div>
      </main>
    </div>
  );
}
