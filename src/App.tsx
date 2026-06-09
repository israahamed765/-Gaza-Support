/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SanadProvider, useSanad } from './context/SanadContext';
import { HeaderNavbar } from './components/HeaderNavbar';
import { HomePage } from './components/HomePage';
import { CurrentNeedsPage } from './components/CurrentNeedsPage';
import { DailyChallengesPage } from './components/DailyChallengesPage';
import { WallOfHopePage } from './components/WallOfHopePage';
import { BeneficiaryDashboard } from './components/BeneficiaryDashboard';
import { DynamicProfileView } from './components/DynamicProfileView';
import { SecureDashboardLoader } from './components/SecureDashboardLoader';
import { Heart, Globe, ArrowUp } from 'lucide-react';
import { translations } from './translations';

function SanadAppContent() {
  const { setActiveTab, language } = useSanad();
  const t = translations[language];
  const location = useLocation();

  const isHome = location.pathname === '/';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div 
      className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950 animate-fade-in" 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      
      {/* 1. Global Navigation header */}
      <HeaderNavbar />

      {/* 2. Main Content Wrapper */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/needs" element={<CurrentNeedsPage />} />
          <Route path="/challenges" element={<DailyChallengesPage />} />
          <Route path="/hope" element={<WallOfHopePage />} />
          <Route path="/dashboard" element={<BeneficiaryDashboard />} />
          <Route path="/profile/:id" element={<DynamicProfileView />} />
          <Route path="/user/:username" element={<DynamicProfileView />} />
          <Route path="/dashboard/:slug" element={<SecureDashboardLoader />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 3. Global Footer block */}
      <footer className="bg-white border-t border-emerald-100 mt-20 relative overflow-hidden text-start" id="main_footer">
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-50 rounded-full blur-3xl -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
              
              {/* Branding Column */}
              <div className="col-span-1 md:col-span-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="bg-emerald-500 p-2 rounded-xl text-white">
                    <Heart className="w-5 h-5 fill-white" />
                  </div>
                  <span className="text-xl font-bold text-slate-900">{t.logo_title}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t.footer_desc}
                </p>
              </div>

              {/* Platform Quick links */}
              <div className="col-span-1 md:col-span-4 space-y-4">
                <h4 className="text-sm font-extrabold text-slate-900 tracking-wider font-sans">{t.footer_pages_title}</h4>
                <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                  <li>
                    <button onClick={() => setActiveTab('home')} className="text-slate-500 hover:text-emerald-600 transition">
                      {t.footer_home_link}
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('needs')} className="text-slate-500 hover:text-emerald-600 transition">
                      {t.footer_needs_link}
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('challenges')} className="text-slate-500 hover:text-emerald-600 transition">
                      {t.footer_challenges_link}
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('hope')} className="text-slate-500 hover:text-emerald-600 transition">
                      {t.footer_hope_link}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Info Badge Column */}
              <div className="col-span-1 md:col-span-3 space-y-4 text-xs sm:text-sm font-medium">
                <h4 className="text-sm font-extrabold text-slate-900">{t.footer_solidarity_title}</h4>
                <p className="text-slate-500 leading-relaxed text-xs font-sans">
                  {t.footer_solidarity_desc}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t.footer_location}</span>
                  </span>
                  <span>{t.footer_year}</span>
                </div>
              </div>

            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] sm:text-xs text-slate-400 font-medium">
              <p className="text-center sm:text-start">
                {t.footer_copyright}
              </p>
              <button
                onClick={scrollToTop}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-1 transition-colors border border-emerald-100"
              >
                <span>{t.footer_scroll_up}</span>
                <ArrowUp className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </footer>

    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <SanadProvider>
        <SanadAppContent />
      </SanadProvider>
    </HashRouter>
  );
}
