import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { MapPin, Phone, Clock, Navigation, ShieldCheck, Truck, Sparkles, MessageCircle } from 'lucide-react';

export default function ShopLocationMap() {
  const { language } = useLanguage();

  const isHindi = language === 'hi';

  const address = isHindi
    ? 'दुकान नं. 05, मुख्य चौराहा (कसया रोड), दरजिया, कुशीनगर, उत्तर प्रदेश - 274403'
    : 'Shop No. 05, Main Chauraha (Kasia Road), Darjiya, Kushinagar, Uttar Pradesh - 274403';

  const landmark = isHindi
    ? 'लैंडमार्क: दरजिया चौराहा, कसया / फाजिलनगर मार्ग, कुशीनगर'
    : 'Landmark: Near Darjiya Chauraha, Kasia - Fazilnagar Route, Kushinagar';

  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Darjiya+Kushinagar+Uttar+Pradesh+274403';
  const embedMapUrl = 'https://maps.google.com/maps?q=Darjiya+Kushinagar+Uttar+Pradesh&t=&z=14&ie=UTF8&iwloc=&output=embed';

  return (
    <section className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden my-8">
      <div className="p-6 sm:p-8 bg-stone-900 text-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 mb-2">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHindi ? 'दरजिया, कुशीनगर लोकेशन व लाइव मैप' : 'Darjiya, Kushinagar Location & Live Map'}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {isHindi ? 'JS Cake & Flower Shop - दरजिया, कुशीनगर' : 'JS Cake & Flower Shop - Darjiya, Kushinagar'}
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-xl">
            {isHindi
              ? 'ताज़ा बेक किए गए प्रीमियम केक और ताज़े महकते फूलों के बुके सीधे हमारे दरजिया कुशीनगर स्टोर से पूरे जिले में तेज़ी से डिलीवर किए जाते हैं।'
              : 'Handcrafted premium cakes and fresh floral bouquets dispatched daily from our Darjiya, Kushinagar bakery & floral studio.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href="https://wa.me/917860828297?text=Hello%20JS%20Cake%20Shop%20Darjiya%20Kushinagar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>{isHindi ? 'व्हाट्सऐप ऑर्डर' : 'WhatsApp Order'}</span>
          </a>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs tracking-wide transition-all shadow-md"
          >
            <Navigation className="w-4 h-4 fill-current" />
            <span>{isHindi ? 'गूगल मैप्स में देखें' : 'View on Google Maps'}</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Side: Interactive Location Info */}
        <div className="lg:col-span-5 p-6 sm:p-8 space-y-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-stone-200">
          <div className="space-y-4 text-xs text-stone-700">
            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                  {isHindi ? 'दुकान का पूरा पता' : 'Physical Address'}
                </span>
                <p className="font-medium text-stone-900 text-sm leading-snug mt-0.5">
                  {address}
                </p>
                <p className="text-[11px] text-amber-800 font-medium mt-1">
                  {landmark}
                </p>
              </div>
            </div>

            {/* Contact Phone */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                  {isHindi ? 'सीधा संपर्क / मोबाइल नंबर' : 'Direct Mobile & Orders'}
                </span>
                <a
                  href="tel:+917860828297"
                  className="font-bold text-emerald-800 text-base hover:text-emerald-900 transition-colors block mt-0.5 tracking-wide"
                >
                  +91 7860828297
                </a>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                  {isHindi ? '✓ कॉल व व्हाट्सऐप सपोर्ट 24x7 उपलब्ध' : '✓ Call & WhatsApp Support 24x7'}
                </span>
              </div>
            </div>

            {/* Timings */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                  {isHindi ? 'स्टोर व किचन समय' : 'Store & Kitchen Hours'}
                </span>
                <p className="font-semibold text-stone-900 text-xs mt-0.5">
                  {isHindi ? 'सोमवार – रविवार: सुबह 7:00 बजे से रात 10:00 बजे तक' : 'Monday – Sunday: 7:00 AM – 10:00 PM'}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {isHindi
                    ? 'ताज़ा बेकिंग और ताज़ा फूलों का स्टॉक रोज़ाना सुबह 7:00 AM'
                    : 'Daily Fresh Baking & Fresh Floral Stock from 7:00 AM'}
                </p>
              </div>
            </div>

            {/* Delivery Coverage */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                  {isHindi ? 'डिलीवरी कवरेज क्षेत्र' : 'Delivery Coverage Area'}
                </span>
                <p className="font-medium text-stone-800 text-xs mt-0.5">
                  {isHindi
                    ? 'दरजिया, कसया, फाजिलनगर, पडरौना, हाटा, तमकुही राज व पूरे कुशीनगर क्षेत्र में सेम-डे सुरक्षित डिलीवरी'
                    : 'Darjiya, Kasia, Fazilnagar, Padrauna, Hata, Tamkuhi Raj & across Kushinagar (Same-day delivery)'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5 text-stone-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isHindi ? '100% शुद्ध वेज/एगलेस केक व ताज़े फूल' : '100% Eggless Pure Veg Cakes & Fresh Flowers'}</span>
            </span>
            <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              {isHindi ? 'पिनकोड: 274403' : 'PIN: 274403'}
            </span>
          </div>
        </div>

        {/* Right Side: Embedded Interactive Google Map */}
        <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[400px] bg-stone-100">
          <iframe
            title="JS Cake Shop Darjiya Kushinagar Location Map"
            src={embedMapUrl}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '360px' }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full block"
          />

          {/* Floating Map Pin Card */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-stone-200/80 max-w-xs pointer-events-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                JS
              </div>
              <div>
                <p className="font-serif font-bold text-xs text-stone-900 leading-tight">JS Cake & Flower Shop</p>
                <p className="text-[11px] text-stone-600 font-medium">दरजिया, कुशीनगर (Darjiya, Kushinagar)</p>
                <p className="text-[10px] text-amber-700 font-semibold">📞 7860828297</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
