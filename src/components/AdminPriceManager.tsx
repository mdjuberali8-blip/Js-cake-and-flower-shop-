import React, { useState } from 'react';
import { useShop } from '../store/ShopContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Cake } from '../types';
import {
  DollarSign,
  Tag,
  Check,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Sliders,
  Search,
  ArrowRight,
  ShieldCheck,
  Star
} from 'lucide-react';

export default function AdminPriceManager() {
  const { cakes, updateCakePrice, resetCakePrices } = useShop();
  const { t, language } = useLanguage();
  const isHindi = language === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [savedCakeId, setSavedCakeId] = useState<string | null>(null);

  // Local draft inputs for prices so admin can type freely before saving
  const [draftPrices, setDraftPrices] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    cakes.forEach((c) => {
      map[c.id] = c.price;
    });
    return map;
  });

  const categories = [
    'All',
    'Pineapple Cakes',
    'Rasmalai & Fusion Cakes',
    'Butterscotch Cakes',
    'Black Forest Cakes',
    'Chocolate Cakes',
    'Red Velvet Cakes',
    'Fresh Fruit Cakes',
    'Fresh Flowers',
    'Combos',
  ];

  const filteredCakes = cakes.filter((cake) => {
    const matchesCategory = selectedCategory === 'All' || cake.category === selectedCategory;
    const matchesSearch =
      cake.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cake.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePriceChange = (cakeId: string, val: number) => {
    const safeVal = Math.max(0, val);
    setDraftPrices((prev) => ({ ...prev, [cakeId]: safeVal }));
  };

  const handleQuickAdjust = (cakeId: string, delta: number) => {
    const current = draftPrices[cakeId] !== undefined ? draftPrices[cakeId] : (cakes.find(c => c.id === cakeId)?.price || 0);
    const nextVal = Math.max(0, current + delta);
    setDraftPrices((prev) => ({ ...prev, [cakeId]: nextVal }));
  };

  const handleSavePrice = (cakeId: string) => {
    const newPrice = draftPrices[cakeId];
    if (newPrice !== undefined) {
      updateCakePrice(cakeId, newPrice);
      setSavedCakeId(cakeId);
      setTimeout(() => {
        setSavedCakeId((curr) => (curr === cakeId ? null : curr));
      }, 2500);
    }
  };

  const handleResetAll = () => {
    if (window.confirm(isHindi ? 'क्या आप सभी केक के मूल्य डिफ़ॉल्ट दरों पर रीसेट करना चाहते हैं?' : 'Reset all cake prices to standard bakery catalog defaults?')) {
      resetCakePrices();
      setDraftPrices({});
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview & Instructions Banner */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-xs font-semibold border border-amber-500/30">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>{isHindi ? 'भारतीय रुपया (₹) मूल्य प्रबंधन' : 'INR (₹) Rate Control Center'}</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              {t('priceManagerTitle')}
            </h2>
            <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
              {t('priceManagerSubtitle')}
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>{t('resetAllRatesBtn')}</span>
          </button>
        </div>

        {/* Global Stats on Price Adjustments */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-100">
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              {isHindi ? 'कुल केक सूची' : 'Total Cakes'}
            </span>
            <span className="font-serif text-xl font-bold text-stone-900 mt-0.5 block">
              {cakes.length} {isHindi ? 'फ्लेवर' : 'Varieties'}
            </span>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              {isHindi ? 'न्यूनतम दर' : 'Lowest Rate'}
            </span>
            <span className="font-serif text-xl font-bold text-emerald-700 mt-0.5 block">
              ₹{Math.min(...cakes.map((c) => c.price)).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              {isHindi ? 'उच्चतम दर' : 'Highest Rate'}
            </span>
            <span className="font-serif text-xl font-bold text-amber-700 mt-0.5 block">
              ₹{Math.max(...cakes.map((c) => c.price)).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              {isHindi ? 'करेंसी' : 'Active Currency'}
            </span>
            <span className="font-serif text-xl font-bold text-stone-900 mt-0.5 block">
              INR (₹)
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat === 'All'
                ? (isHindi ? 'सभी' : 'All')
                : cat === 'Pineapple Cakes'
                ? (isHindi ? '🍍 पाइनएप्पल' : 'Pineapple')
                : cat === 'Rasmalai & Fusion Cakes'
                ? (isHindi ? '🥛 रसमलाई' : 'Rasmalai')
                : cat === 'Butterscotch Cakes'
                ? (isHindi ? '🍯 बटरस्कॉच' : 'Butterscotch')
                : cat === 'Black Forest Cakes'
                ? (isHindi ? '🍒 ब्लैक फॉरेस्ट' : 'Black Forest')
                : cat === 'Chocolate Cakes'
                ? (isHindi ? '🍫 चॉकलेट' : 'Chocolate')
                : cat === 'Red Velvet Cakes'
                ? (isHindi ? '🍓 रेड वेलवेट' : 'Red Velvet')
                : cat === 'Fresh Fruit Cakes'
                ? (isHindi ? '🥝 फ्रूट केक' : 'Fruit Cakes')
                : cat === 'Fresh Flowers'
                ? (isHindi ? '💐 ताज़े फूल' : 'Flowers')
                : cat === 'Combos'
                ? (isHindi ? '🎁 कॉम्बो' : 'Combos')
                : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isHindi ? 'केक का नाम खोजें...' : 'Search cake by name...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50"
          />
        </div>
      </div>

      {/* Cakes Rate Customizer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCakes.map((cake) => {
          const currentDraft = draftPrices[cake.id] !== undefined ? draftPrices[cake.id] : cake.price;
          const isModified = currentDraft !== cake.price;
          const isRecentlySaved = savedCakeId === cake.id;

          return (
            <div
              key={cake.id}
              className={`bg-white rounded-3xl border transition-all duration-300 p-5 shadow-sm flex flex-col justify-between ${
                isRecentlySaved
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : isModified
                  ? 'border-amber-500 ring-2 ring-amber-500/10'
                  : 'border-stone-200/90 hover:border-stone-300'
              }`}
            >
              <div>
                {/* Cake Header with Thumbnail */}
                <div className="flex items-start gap-3.5 mb-3">
                  <img
                    src={cake.image}
                    alt={cake.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shrink-0 bg-stone-100"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">
                        {cake.category}
                      </span>
                      <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {cake.rating}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-stone-900 text-sm mt-1 leading-snug truncate">
                      {cake.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {cake.tagline}
                    </p>
                  </div>
                </div>

                {/* Live Store Price Display */}
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                      {t('currentRate')} ({t('liveOnStore')})
                    </span>
                    <span className="font-serif text-xl font-bold text-stone-900 leading-tight">
                      ₹{cake.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {isHindi ? 'स्टोर पर एक्टिव' : 'Live on Store'}
                  </span>
                </div>

                {/* Rate Customizer Controls */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                    <span>{t('basePriceLabel')}</span>
                    {isModified && (
                      <span className="text-amber-700 text-[10px] font-semibold animate-pulse">
                        {isHindi ? 'बदलाव सुरक्षित नहीं हुआ' : 'Unsaved change'}
                      </span>
                    )}
                  </label>

                  {/* Input with Quick Buttons */}
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-serif font-bold text-stone-500 text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={10}
                        value={currentDraft}
                        onChange={(e) => handlePriceChange(cake.id, Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 text-sm font-bold text-stone-900 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    {/* Quick Step Buttons */}
                    <button
                      type="button"
                      onClick={() => handleQuickAdjust(cake.id, -50)}
                      className="px-2 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs font-bold transition-colors"
                      title="- ₹50"
                    >
                      -50
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdjust(cake.id, 50)}
                      className="px-2 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs font-bold transition-colors"
                      title="+ ₹50"
                    >
                      +50
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSavePrice(cake.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                    isRecentlySaved
                      ? 'bg-emerald-600 text-white'
                      : isModified
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  {isRecentlySaved ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{isHindi ? 'मूल्य सुरक्षित!' : 'Rate Saved!'}</span>
                    </>
                  ) : (
                    <>
                      <Tag className="w-3.5 h-3.5" />
                      <span>{t('saveRateBtn')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
