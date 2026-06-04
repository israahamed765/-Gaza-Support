import React, { useState } from 'react';
import { useSanad } from '../context/SanadContext';
import { ActiveTab } from '../types';
import { Heart, Home, AlertCircle, Sparkles, BookOpen, User, LogOut, Menu, X, Globe, Bell, Coins, MessageCircle } from 'lucide-react';
import { translations } from '../translations';

export const HeaderNavbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentBeneficiary, 
    logout, 
    language, 
    setLanguage,
    notifications,
    markAllNotificationsAsRead
  } = useSanad();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const t = translations[language];

  // Filter notifications to only those belonging to the logged-in family (completely private)
  const myNotifications = currentBeneficiary 
    ? notifications.filter(n => n.beneficiaryId === currentBeneficiary.id)
    : [];

  // Nav links definitions
  const navItems = [
    { id: 'home' as ActiveTab, Arabic: t.nav_home, English: t.nav_home, Icon: Home },
    { id: 'needs' as ActiveTab, Arabic: t.nav_needs, English: t.nav_needs, Icon: AlertCircle },
    { id: 'challenges' as ActiveTab, Arabic: t.nav_challenges, English: t.nav_challenges, Icon: BookOpen },
    { id: 'hope' as ActiveTab, Arabic: t.nav_hope, English: t.nav_hope, Icon: Sparkles },
  ];

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs" id="main_header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Brand Area */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabClick('home')} id="logo_container">
            <div className="bg-emerald-500 p-2.5 rounded-2xl text-white shadow-md shadow-emerald-200 flex items-center justify-center">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div className="text-start">
              <h1 className="text-xl sm:text-2xl font-bold text-teal-950 font-sans tracking-tight">{t.logo_title}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] sm:text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md font-black">
                  {language === 'ar' ? 'سحابي آمن 100%' : '100% Secure Cloud'}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5" id="desktop_nav">
            {navItems.map((item) => {
              const Icon = item.Icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>{item.Arabic}</span>
                </button>
              );
            })}
          </nav>

          {/* User Auth Portal Actions & Language Toggle */}
          <div className="hidden lg:flex items-center gap-3" id="desktop_auth">
            
            {/* Elegant high-contrast bilingual switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 transition text-slate-700 cursor-pointer"
              title="Change Language / تغيير اللغة"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {currentBeneficiary ? (
              <div className="flex items-center gap-3 bg-teal-50/70 border border-teal-100 rounded-2xl p-1.5 pr-4 pl-3">
                <div className="flex flex-col items-start text-start">
                  <span className="text-xs text-slate-500">{t.user_welcome}</span>
                  <span className="text-xs font-semibold text-teal-900 line-clamp-1 max-w-[120px]">{currentBeneficiary.name || t.home_family_fallback_name}</span>
                </div>
                <img
                  src={currentBeneficiary.profilePicture || 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=300'}
                  alt={currentBeneficiary.name}
                  className="w-8 h-8 rounded-full object-cover border border-emerald-300"
                />
                <button
                  onClick={() => handleTabClick('dashboard')}
                  className="relative text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 active:scale-95"
                >
                  <span>{t.dashboard_button}</span>
                  {myNotifications.filter(n => !n.read).length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block shrink-0"></span>
                  )}
                </button>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-colors"
                  title={t.logout_tooltip}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Mobile Actions Controls */}
          <div className="flex lg:hidden items-center gap-2" id="mobile_menu_trigger">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-[11px] font-bold border border-slate-200 bg-slate-50 text-slate-700 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {currentBeneficiary && (
              <div className="relative shrink-0">
                <img
                  src={currentBeneficiary.profilePicture || 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=300'}
                  alt={currentBeneficiary.name}
                  onClick={() => handleTabClick('dashboard')}
                  className="w-8 h-8 rounded-full object-cover border border-emerald-400 cursor-pointer active:scale-95 transition-transform"
                />
                {myNotifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-white animate-pulse"></span>
                )}
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-100 bg-white shadow-xl animate-none transition-all duration-300" id="mobile_drawer">
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.Icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-start text-sm transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-500'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>{item.Arabic}</span>
                </button>
              );
            })}
            
            <div className="pt-4 border-t border-slate-100">
              {currentBeneficiary ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                    <img
                      src={currentBeneficiary.profilePicture || 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=300'}
                      alt={currentBeneficiary.name}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-300"
                    />
                    <div className="flex-1 text-start">
                      <p className="text-xs text-slate-500">{t.mobile_welcome_msg}</p>
                      <h4 className="text-sm font-bold text-slate-800">{currentBeneficiary.name || t.home_family_fallback_name}</h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleTabClick('dashboard')}
                      className="w-full text-center bg-emerald-500 text-white rounded-xl py-2 text-sm font-semibold hover:bg-emerald-600 transition"
                    >
                      {t.dashboard_button}
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-center text-slate-600 bg-slate-100 rounded-xl py-2 text-sm font-medium hover:bg-slate-200 transition"
                    >
                      {t.logout_button}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
