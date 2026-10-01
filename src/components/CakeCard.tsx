import React, { useState } from 'react';
import { Cake } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import CakeConfigModal from './CakeConfigModal';
import { Star, Clock, Sparkles, SlidersHorizontal } from 'lucide-react';

interface CakeCardProps {
  cake: Cake;
}

export default function CakeCard({ cake }: CakeCardProps) {
  const { t, language } = useLanguage();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const flavorCount = cake.flavorOptions?.length || 3;
  const icingCount = cake.icingOptions?.length || 3;

  return (
    <>
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
        {/* Cake Image with Badge - Clickable to open configuration modal */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsConfigModalOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsConfigModalOpen(true);
            }
          }}
          className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 cursor-pointer"
          aria-label={`Configure ${cake.name}`}
        >
          <img
            src={cake.image}
            alt={cake.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          {cake.isChefSpecial && (
            <div className="absolute top-3 left-3 bg-stone-900/90 text-amber-300 text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md backdrop-blur-sm border border-stone-800">
              {t('chefsSignature')}
            </div>
          )}
          <div className="absolute top-3 right-3 bg-stone-900/85 text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm border border-stone-700/80 shadow-xs">
            {cake.category}
          </div>
          <div className="absolute bottom-3 right-3 bg-white/95 text-stone-950 px-2.5 py-1 rounded-lg text-sm font-bold shadow-sm backdrop-blur-sm border border-stone-100">
            {t('fromPrice')} ₹{cake.price.toLocaleString('en-IN')}
          </div>

          <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-stone-900/90 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 shadow-lg">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('customizeSizeFlavorIcing')}</span>
            </span>
          </div>
        </div>

        {/* Cake Details */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Metadata: Category · Rating · Prep Time (Zero-Pill discipline) */}
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
              <span className="font-medium text-amber-700">{cake.category}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-semibold text-stone-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {cake.rating} ({cake.reviewsCount})
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                {cake.prepTimeHours}h {t('prepTime')}
              </span>
            </div>

            <h3
              onClick={() => setIsConfigModalOpen(true)}
              className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors leading-snug cursor-pointer"
            >
              {cake.name}
            </h3>

            <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
              {cake.description}
            </p>

            {/* Quick overview of options available */}
            <div className="mt-3 py-2 border-y border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
              {cake.itemType === 'flower' ? (
                <>
                  <span>{cake.sizeOptions?.length || 3} {t('sizesAvailable')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{t('catFreshFlowers')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{icingCount} {language === 'hi' ? 'गिफ्ट रैपिंग' : 'Wrappings'}</span>
                </>
              ) : cake.itemType === 'combo' ? (
                <>
                  <span>{cake.sizeOptions?.length || 3} {language === 'hi' ? 'कॉम्बो साइज़' : 'Combo Packs'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{language === 'hi' ? 'केक + फूल' : 'Cake + Flowers'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{language === 'hi' ? 'फ्री कार्ड' : 'Free Card'}</span>
                </>
              ) : (
                <>
                  <span>{cake.sizeOptions?.length || 3} {t('sizesAvailable')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{flavorCount} {t('spongeFlavors')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{icingCount} {t('icingsAvailable')}</span>
                </>
              )}
            </div>
          </div>

          {/* Configuration Trigger Button */}
          <div className="mt-4 pt-2">
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>
                {cake.itemType === 'flower'
                  ? (language === 'hi' ? '💐 बुके व रैपिंग चुनें' : '💐 Select Bouquet & Wrap')
                  : cake.itemType === 'combo'
                  ? (language === 'hi' ? '🎁 कॉम्बो कस्टमाइज़ करें' : '🎁 Customize Combo Pack')
                  : t('selectOptions')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {isConfigModalOpen && (
        <CakeConfigModal
          cake={cake}
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
        />
      )}
    </>
  );
}
