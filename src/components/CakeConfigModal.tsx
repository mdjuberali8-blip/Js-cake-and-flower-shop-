import React, { useState, useEffect } from 'react';
import { Cake, CakeSizeOption, CakeFlavorOption, CakeIcingOption } from '../types';
import { useShop } from '../store/ShopContext';
import { useLanguage } from '../i18n/LanguageContext';
import { DEFAULT_CAKE_SIZES, DEFAULT_CAKE_FLAVORS, DEFAULT_CAKE_ICINGS } from '../data/cakes';
import {
  X,
  Check,
  Plus,
  Minus,
  Star,
  Clock,
  Sparkles,
  ShoppingBag,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface CakeConfigModalProps {
  cake: Cake | null;
  isOpen: boolean;
  onClose: () => void;
  onAddedToCart?: () => void;
}

export default function CakeConfigModal({
  cake,
  isOpen,
  onClose,
  onAddedToCart,
}: CakeConfigModalProps) {
  const { addToCart } = useShop();
  const { t, language } = useLanguage();

  const availableSizes: CakeSizeOption[] =
    cake?.sizeOptions && cake.sizeOptions.length > 0
      ? cake.sizeOptions
      : DEFAULT_CAKE_SIZES;

  const availableFlavors: CakeFlavorOption[] =
    cake?.flavorOptions && cake.flavorOptions.length > 0
      ? cake.flavorOptions
      : DEFAULT_CAKE_FLAVORS;

  const availableIcings: CakeIcingOption[] =
    cake?.icingOptions && cake.icingOptions.length > 0
      ? cake.icingOptions
      : DEFAULT_CAKE_ICINGS;

  // Selected state - hooks called unconditionally on every render
  const [selectedSize, setSelectedSize] = useState<CakeSizeOption>(
    () => availableSizes[0] || DEFAULT_CAKE_SIZES[0]
  );
  const [selectedFlavor, setSelectedFlavor] = useState<CakeFlavorOption>(
    () => availableFlavors[0] || DEFAULT_CAKE_FLAVORS[0]
  );
  const [selectedIcing, setSelectedIcing] = useState<CakeIcingOption>(
    () => availableIcings[0] || DEFAULT_CAKE_ICINGS[0]
  );
  const [customMessage, setCustomMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync defaults when cake changes
  useEffect(() => {
    if (cake) {
      const sizes = cake.sizeOptions?.length ? cake.sizeOptions : DEFAULT_CAKE_SIZES;
      const flavors = cake.flavorOptions?.length ? cake.flavorOptions : DEFAULT_CAKE_FLAVORS;
      const icings = cake.icingOptions?.length ? cake.icingOptions : DEFAULT_CAKE_ICINGS;

      setSelectedSize(sizes[0]);
      setSelectedFlavor(flavors[0]);
      setSelectedIcing(icings[0]);
      setCustomMessage('');
      setSpecialInstructions('');
      setQuantity(1);
      setIsSuccess(false);
    }
  }, [cake]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Early return is placed AFTER all hooks to adhere to React Rules of Hooks
  if (!isOpen || !cake) return null;

  // Price calculations
  const basePrice = cake.price;
  const sizeExtra = selectedSize.extraPrice || 0;
  const icingExtra = selectedIcing.extraPrice || 0;
  const singleUnitPrice = basePrice + sizeExtra + icingExtra;
  const totalPrice = singleUnitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(cake, {
      selectedWeight: selectedSize.label,
      selectedFlavor: selectedFlavor.name,
      selectedIcing: selectedIcing.name,
      customMessage: customMessage.trim(),
      specialInstructions: specialInstructions.trim(),
      unitPrice: singleUnitPrice,
      quantity,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      if (onAddedToCart) onAddedToCart();
      onClose();
    }, 700);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cake-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden relative max-h-[92vh] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 bg-stone-900 text-stone-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close configuration modal"
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 pr-10">
            <img
              src={cake.image}
              alt={cake.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-stone-700 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-medium mb-1">
                <span>{cake.category}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-stone-300">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {cake.rating} ({cake.reviewsCount})
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-stone-300">
                  <Clock className="w-3.5 h-3.5" />
                  {cake.prepTimeHours}h {t('prepTime')}
                </span>
              </div>
              <h2
                id="modal-cake-title"
                className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug"
              >
                {t('configureTitle')} {cake.name}
              </h2>
              <p className="text-xs text-stone-400 mt-1 line-clamp-1">
                {cake.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Configuration Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800">
          {/* STEP 1: SIZE / STYLES */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-xs uppercase font-bold tracking-wider text-stone-900 flex items-center gap-1.5">
                <span>
                  {cake.itemType === 'flower'
                    ? (language === 'hi' ? '1. बुके का साइज़ व संख्या' : '1. Select Bouquet Size & Stems')
                    : cake.itemType === 'combo'
                    ? (language === 'hi' ? '1. कॉम्बो का साइज़ चुनें' : '1. Select Combo Pack Size')
                    : t('step1Size')}
                </span>
                <span className="text-amber-600 font-semibold">*</span>
              </label>
              <span className="text-xs text-stone-500">
                {t('selected')}: <strong className="text-stone-900">{selectedSize.label}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {availableSizes.map((size) => {
                const isSelected = selectedSize.id === size.id;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`text-left p-3 rounded-2xl border transition-all relative ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-serif font-bold text-sm text-stone-900">
                        {size.label}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-1">{size.serves}</p>
                    <p className="text-xs font-semibold text-amber-800 mt-2">
                      {size.extraPrice === 0 ? t('included') : `+₹${size.extraPrice.toLocaleString('en-IN')}`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: SPONGE & FLAVOR / FLORAL STYLE */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-xs uppercase font-bold tracking-wider text-stone-900 flex items-center gap-1.5">
                <span>
                  {cake.itemType === 'flower'
                    ? (language === 'hi' ? '2. फूलों की ताज़गी व स्टाइल' : '2. Fresh Floral Style')
                    : cake.itemType === 'combo'
                    ? (language === 'hi' ? '2. केक फ्लेवर चयन' : '2. Cake Sponge Flavor')
                    : t('step2Flavor')}
                </span>
                <span className="text-amber-600 font-semibold">*</span>
              </label>
              <span className="text-xs text-stone-500">
                {t('selected')}: <strong className="text-stone-900">{selectedFlavor.name}</strong>
              </span>
            </div>

            <div className="space-y-2">
              {availableFlavors.map((flavor) => {
                const isSelected = selectedFlavor.id === flavor.id;
                return (
                  <button
                    key={flavor.id}
                    type="button"
                    onClick={() => setSelectedFlavor(flavor)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-500/10'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-stone-900">{flavor.name}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">{flavor.description}</p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                        isSelected
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: ICING & FROSTING / WRAPPING */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-xs uppercase font-bold tracking-wider text-stone-900 flex items-center gap-1.5">
                <span>
                  {cake.itemType === 'flower'
                    ? (language === 'hi' ? '3. लग्ज़री गिफ्ट रैपिंग व रिबन' : '3. Presentation & Luxury Wrap')
                    : cake.itemType === 'combo'
                    ? (language === 'hi' ? '3. गिफ्ट रैपिंग व पैकेजिंग' : '3. Gift Packaging & Wrap')
                    : t('step3Icing')}
                </span>
                <span className="text-amber-600 font-semibold">*</span>
              </label>
              <span className="text-xs text-stone-500">
                {t('selected')}: <strong className="text-stone-900">{selectedIcing.name}</strong>
              </span>
            </div>

            <div className="space-y-2">
              {availableIcings.map((icing) => {
                const isSelected = selectedIcing.id === icing.id;
                return (
                  <button
                    key={icing.id}
                    type="button"
                    onClick={() => setSelectedIcing(icing)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-500/10'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-stone-900">{icing.name}</p>
                        {icing.extraPrice ? (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded">
                            +₹{icing.extraPrice.toLocaleString('en-IN')}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">{icing.description}</p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                        isSelected
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 4: CUSTOM MESSAGE PLAQUE & INSTRUCTIONS */}
          <div className="pt-2 border-t border-stone-100 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="config-plaque"
                  className="text-xs font-bold text-stone-700 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {cake.itemType === 'flower'
                      ? (language === 'hi' ? 'ग्रीटिंग कार्ड पर संदेश (वैकल्पिक)' : 'Greeting Card Inscription Note (Optional)')
                      : cake.itemType === 'combo'
                      ? (language === 'hi' ? 'केक व कार्ड पर संदेश' : 'Cake & Greeting Card Message')
                      : t('step4Plaque')}
                  </span>
                </label>
                <span className="text-[10px] text-stone-400">
                  {customMessage.length}/40 {t('characters')}
                </span>
              </div>
              <input
                id="config-plaque"
                type="text"
                maxLength={40}
                placeholder={
                  cake.itemType === 'flower'
                    ? (language === 'hi' ? 'उदा. जन्मदिन की हार्दिक शुभकामनाएं!' : 'e.g. Wishing you joy & happiness!')
                    : 'e.g. Happy Birthday!'
                }
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full text-xs px-3.5 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
              />
            </div>

            <div>
              <label
                htmlFor="config-notes"
                className="text-xs font-bold text-stone-700 block mb-1"
              >
                {t('step4Notes')}
              </label>
              <input
                id="config-notes"
                type="text"
                placeholder="e.g. Please include 5 golden candles; separate nuts."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full text-xs px-3.5 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer with Live Price & Add to Cart */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Quantity Selector & Price Breakdown */}
            <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
              <div className="flex items-center border border-stone-300 rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold w-8 text-center text-stone-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  {t('totalConfiguredPrice')}
                </span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-none">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
                {quantity > 1 && (
                  <span className="text-[11px] text-stone-500 block">
                    (₹{singleUnitPrice.toLocaleString('en-IN')} {t('each')})
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold tracking-wide transition-colors"
              >
                {t('cancel')}
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSuccess}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
                  isSuccess
                    ? 'bg-emerald-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white'
                }`}
              >
                {isSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{t('addedToBasket')}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {cake.itemType === 'flower'
                        ? (language === 'hi' ? 'बुके बास्केट में जोड़ें' : 'Add Bouquet to Basket')
                        : cake.itemType === 'combo'
                        ? (language === 'hi' ? 'कॉम्बो बास्केट में जोड़ें' : 'Add Combo to Basket')
                        : t('addToBasket')}{' '}
                      · ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
