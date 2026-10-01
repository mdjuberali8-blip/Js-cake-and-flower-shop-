import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-xl bg-stone-800/80 p-0.5 border border-stone-700/80 text-xs shadow-xs">
      <div className="flex items-center pl-2 pr-1 text-stone-400">
        <Globe className="w-3.5 h-3.5 text-amber-400" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
          language === 'en'
            ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
            : 'text-stone-300 hover:text-white'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
          language === 'hi'
            ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
            : 'text-stone-300 hover:text-white'
        }`}
        aria-label="हिन्दी में बदलें"
      >
        हिन्दी
      </button>
    </div>
  );
}
