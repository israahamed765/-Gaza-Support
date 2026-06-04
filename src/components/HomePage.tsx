import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSanad } from '../context/SanadContext';
import { Heart, Activity, Users, User, ShieldCheck, HeartHandshake, ChevronLeft, Calendar, ArrowUpRight, CheckCircle2, TrendingUp, Sparkles, MapPin, Coins, ChevronRight } from 'lucide-react';
import { translations } from '../translations';

export const HomePage: React.FC = () => {
  const { 
    beneficiaries, 
    currentNeeds, 
    challenges, 
    setActiveTab, 
    selectedFamilyId, 
    setSelectedFamilyId,
    selectedFamily,
    currentBeneficiary,
    language
  } = useSanad();

  const t = translations[language];
  const isEn = language === 'en';
  const navigate = useNavigate();

  // Find currently active viewed family amongst initialized ones
  const initializedBeneficiaries = beneficiaries.filter(b => b.initialized);
  const remainingAmount = selectedFamily ? (typeof selectedFamily.totalDonated === 'number' ? selectedFamily.totalDonated : 0) - (typeof selectedFamily.totalSpent === 'number' ? selectedFamily.totalSpent : 0) : 0;

  // Fallback if somehow there's an issue finding the family
  const familyName = selectedFamily && selectedFamily.name ? selectedFamily.name : t.home_family_fallback_name;
  const familyLocation = selectedFamily && selectedFamily.location ? selectedFamily.location : t.home_family_fallback_loc;
  const familyPic = selectedFamily && selectedFamily.profilePicture ? selectedFamily.profilePicture : 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=300';
  const familyDesc = selectedFamily && selectedFamily.description ? selectedFamily.description : t.home_family_fallback_desc;
  const totalDonated = selectedFamily && typeof selectedFamily.totalDonated === 'number' ? selectedFamily.totalDonated : 0;
  const totalSpent = selectedFamily && typeof selectedFamily.totalSpent === 'number' ? selectedFamily.totalSpent : 0;

  // Filter Needs & Challenges dynamically based on the selected single family!
  const filteredNeeds = currentNeeds.filter(n => n.beneficiaryId === (selectedFamily?.id || ''));
  const filteredChallenges = challenges.filter(c => c.beneficiaryId === (selectedFamily?.id || ''));

  // Previews
  const urgentNeedsPreview = filteredNeeds.slice(0, 3);
  const challengesPreview = filteredChallenges.slice(0, 2);

  return (
    <div className="space-y-16 py-8 text-start" id="home_page_view">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-50 via-teal-50 to-sky-50 border border-emerald-100 p-8 sm:p-12 lg:p-16 shadow-xs animate-none" id="gaza_hero">
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/50 text-emerald-800 text-xs sm:text-sm font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t.home_badge}</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-teal-950 leading-tight">
            {t.logo_title} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 via-teal-600 to-sky-505">
              {t.home_title}
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
            {t.home_desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => setActiveTab('needs')}
              className="flex items-center justify-center gap-2 px-7 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 transition-all text-base cursor-pointer"
            >
              <HeartHandshake className="w-5 h-5" />
              <span>{isEn ? 'Explore Family Needs' : 'استكشف احتياجات العائلة الحالية'}</span>
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className="flex items-center justify-center gap-2 px-7 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded-2xl transition-all text-base cursor-pointer"
            >
              <span>{isEn ? 'Check Live Stories' : 'تابع يوميات السكن والصمود'}</span>
              {isEn ? <ChevronRight className="w-5 h-5 animate-bounce-horizontal" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl -z-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl -z-10 translate-y-1/3"></div>
      </section>

      {/* 2. Family Showcase Details Section */}
      <section className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-xs space-y-6" id="family_selector_section">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 text-[10px] bg-emerald-100 text-emerald-800 rounded-md font-bold">
                {isEn ? 'Resilient Family Profile' : 'الملف التعريفي للعائلة الصامدة'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{isEn ? 'About Our Resilient Family' : 'تفاصيل قصتنا وعائلتنا'}</h2>
            </div>
            <p className="text-xs text-slate-500">
              {isEn ? 'Discover our live registered family profile and their active updates directly' : 'اطلع على قصة عائلتنا الموثقة ومستجداتها اليومية ودعم صمودها مباشرة'}
            </p>
          </div>
        </div>

        {/* Selected Family Switcher Dropdown (Only appears if there are multiple initialized profiles and no user is logged in) */}
        {!currentBeneficiary && initializedBeneficiaries.length > 1 && (
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/55 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in" id="home_family_dropdown_container">
            <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>{t.home_select_label}</span>
            </span>
            <div className="relative w-full sm:w-80">
              <select
                value={selectedFamilyId}
                onChange={(e) => setSelectedFamilyId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-black text-slate-800 shadow-3xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
                id="beneficiary_select_input"
              >
                {initializedBeneficiaries.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.location})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Selected Family Details Spot */}
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-stretch">
          
          <div className="w-full lg:w-1/3 shrink-0 relative h-72 lg:h-auto min-h-[250px] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200">
            <img 
              src={familyPic} 
              alt={familyName} 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-5 text-white text-start">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{familyLocation}</span>
              </div>
              <h3 className="text-xl font-black">{familyName}</h3>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-extrabold text-slate-900">{t.home_family_card_title}</h3>
              </div>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed text-justify whitespace-pre-wrap">
                {familyDesc}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2.5">
                {selectedFamily && selectedFamily.crowdfundingUrl && (
                  <a
                    href={selectedFamily.crowdfundingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-750 border border-emerald-200 hover:bg-emerald-100 transition rounded-xl text-xs sm:text-sm font-bold"
                  >
                    <HeartHandshake className="w-4 h-4 text-emerald-600" />
                    <span>{t.home_crowdfunding_btn}</span>
                  </a>
                )}

                {selectedFamily && (
                  <button
                    onClick={() => {
                      if (selectedFamily.username) {
                        navigate(`/user/${selectedFamily.username}`);
                      } else {
                        navigate(`/profile/${selectedFamily.id}`);
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white transition rounded-xl text-xs sm:text-sm font-black shadow-xs cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>{isEn ? 'View Dedicated Profile' : 'عرض الملف المستقل'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Core Stats & Financial Transparency Dashboard (كم تبرع، كم صرف، وكم باقي) */}
      <section className="space-y-6" id="stats_dashboard">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Coins className="w-6 h-6 text-emerald-500" />
              <span>{isEn ? 'Family Financial Disclosure Ledger' : 'إفصاح الشفافية المالية لعائلتنا'}</span>
            </h2>
            <p className="text-sm text-slate-500">
              {isEn ? 'A direct, meticulous ledger showcasing funds received and direct spendings to secure bread and milk in Gaza.' : 'متابعة دقيقة لكل سنت يصل لعائلتنا وكيف نقوم بصرفه لحفظ كرامة ومعيشة أطفالنا في غزة.'}
            </p>
          </div>
          <span className="text-xs bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full font-bold">
            {isEn ? 'Real-time update' : 'تحديث فوري وتلقائي'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Card 1: Total Donated (كم تبرع) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-md">
                {isEn ? 'Overall Funds Raised' : 'المبلغ المحصَّل مسبقاً'}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-xs sm:text-sm font-bold text-start">{t.home_stat_donated}</p>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight text-start">
                ${(totalDonated ?? 0).toLocaleString()}
              </h3>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                {isEn ? 'From official campaigns' : 'تمت عبر قنوات تمويل معلنة'}
              </span>
            </div>
          </div>

          {/* Card 2: Total Spent (كم صرف) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-red-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-100 text-red-600 rounded-2xl">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-xs bg-rose-50 text-red-700 font-bold px-2.5 py-1 rounded-md">
                {isEn ? 'Direct Expenditures' : 'المبلغ المنفق فعلياً'}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-xs sm:text-sm font-bold text-start">{t.home_stat_spent}</p>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight text-start">
                ${(totalSpent ?? 0).toLocaleString()}
              </h3>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-red-600 font-semibold">
                {isEn ? 'Updated by direct receipts' : 'محدَّثة بقيم الإصحاح والتوثيق اليومي'}
              </span>
            </div>
          </div>

          {/* Card 3: Remaining (كم باقي) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-teal-100 text-teal-600 rounded-2xl">
                <Heart className="w-6 h-6 fill-teal-50" />
              </div>
              <span className="text-xs bg-teal-50 text-teal-700 font-bold px-2.5 py-1 rounded-md">
                {isEn ? 'Liquidity Balance' : 'السيولة المتبقية الحالية'}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-xs sm:text-sm font-bold text-start">{t.home_stat_remaining}</p>
              <h3 className="text-3xl sm:text-4xl font-black text-teal-900 font-mono tracking-tight text-start">
                ${(remainingAmount ?? 0).toLocaleString()}
              </h3>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between font-semibold">
              <span className="text-xs text-teal-600">
                {isEn ? 'Total raised less total spends' : 'مجموع تبرع عائلتنا ناقصاً المصروفات'}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Trust Badge Banner */}
      <section className="bg-emerald-600 rounded-3xl text-white p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6" id="trust_badge_banner">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500 opacity-20 rounded-full blur-2xl -translate-x-12 -translate-y-12"></div>
        <div className="flex items-center gap-4 relative z-10 text-start">
          <div className="p-3.5 bg-white/20 rounded-2xl text-white">
            <ShieldCheck className="w-8 h-8 font-bold" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold">{isEn ? '100% Peer-to-Peer Solidarity Covenant' : 'ميثاق التبرع المباشر والموثق بنسبة 100%'}</h3>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 leading-relaxed">
              {isEn ? 'All donations bypass intermediaries entirely and direct to family fundraising campaigns, enabling authentic mutual aid and real-time disclosures.' : 'تتحول دعمكم وتكافلكم عبر هذه المنصة مباشرة ومن دون أي عمولة وسيطة إلى الحملات والحلول الفردية المسجلة للعائلة، ليرى الإنسانية حقيقة التكافل وملاذ الأمل بغزة.'}
            </p>
          </div>
        </div>
        <div className="shrink-0 relative z-10 w-full md:w-auto text-end">
          <div className="inline-flex items-center gap-1.5 bg-white text-emerald-800 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t.home_stat_card_footer}</span>
          </div>
        </div>
      </section>

      {/* 5. Latest Urgent Needs Section */}
      <section className="space-y-6" id="home_needs_preview">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{isEn ? 'Urgent Needs Requiring Direct Care' : 'احتياجات عاجلة تتطلب تدخلاً طارئاً لعائلتنا'}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {isEn ? 'Essentials compiled by our family to withstand illness, rain leaks, and winter freeze.' : 'احتياجات قمنا بتوثيقها حالياً والتي نرنو كبقية العوائل لسدها لحمايتنا وتأمين حياة أطفالنا.'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('needs')}
            className="text-sm text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer group"
          >
            <span>{isEn ? 'View All Family Needs' : 'عرض كل متطلباتنا والاحتياجات'}</span>
            {isEn ? <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /> : <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />}
          </button>
        </div>

        {urgentNeedsPreview.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 text-slate-400 text-sm">
             {t.home_empty_needs}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {urgentNeedsPreview.map((need) => {
              const pct = Math.min(100, Math.round((need.collectedAmount / need.cost) * 100));
              return (
                <div
                  key={need.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition duration-300 flex flex-col overflow-hidden"
                >
                  <div className="relative h-48 w-full bg-slate-100 shrink-0">
                    <img
                      src={need.imageUrl}
                      alt={need.title}
                      className="w-full h-full object-cover"
                    />
                    {need.isUrgent && (
                      <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 rounded-md py-1">
                        {t.needs_urgent}
                      </span>
                    )}
                    <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-xs font-semibold">
                      {need.beneficiaryLocation}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2 text-start">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">{need.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{need.description}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center font-semibold text-slate-500">
                          <span>{t.needs_percentage.replace('{pct}', String(pct))}</span>
                          <span>{t.needs_required.replace('{cost}', String(need.cost))}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs sm:text-sm font-bold text-teal-850">
                          {t.home_need_collected} <span className="text-emerald-600">${need.collectedAmount}</span>
                        </span>
                        <button
                          onClick={() => setActiveTab('needs')}
                          className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg transition shrink-0"
                        >
                          {isEn ? 'Support' : 'تفاصيل الدعم'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Daily Diaries Preview */}
      <section className="space-y-6" id="home_challenges_preview">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{isEn ? 'Our Daily Camp Diaries' : 'يوميات وعز عائلتنا اليومية'}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {isEn ? 'Daily updates and stories of hope drafted on-site straight from our tents.' : 'تحديثات اجتماعية ومستجدات إنسانية نكتبها مباشرة من داخل الخيام ومراكز الصمود بغزة.'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('challenges')}
            className="text-sm text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer group"
          >
            <span>{isEn ? 'Read All Diaries' : 'طالع كامل مذكراتنا'}</span>
            {isEn ? <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /> : <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />}
          </button>
        </div>

        {challengesPreview.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 text-slate-400 text-sm">
             {t.home_empty_challenges}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challengesPreview.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 hover:border-emerald-100 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-start">
                    <img
                      src={challenge.beneficiaryAvatar || 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=300'}
                      alt={challenge.beneficiaryName}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-200"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{challenge.beneficiaryName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{challenge.date}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-start">
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{challenge.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{challenge.text}</p>
                  </div>
                </div>

                {challenge.imageUrl && (
                  <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                    <img
                      src={challenge.imageUrl}
                      alt={challenge.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-emerald-600">
                  <span>{t.home_challenge_likes} ({challenge.likes})</span>
                  <span className="hover:underline flex items-center gap-1 cursor-pointer" onClick={() => setActiveTab('challenges')}>
                    <span>{isEn ? 'Read Details' : 'طالع التفاصيل الكاملة'}</span>
                    {isEn ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 7. Explanatory Step section */}
      <section className="bg-linear-to-r from-teal-500 to-emerald-600 rounded-3xl text-white p-8 sm:p-12 space-y-8 relative overflow-hidden text-start" id="info_guide">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="text-center max-w-2xl mx-auto space-y-2 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t.home_how_it_works_title}</h2>
          <p className="text-emerald-100 text-sm">{isEn ? 'Transforming global mutual assistance through peer-to-peer transparency' : 'عملية كفالة وتكافل عائلية لا تشوبها شائبة لتعزيز الأثر المباشر في غزة'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          
          <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold">{t.home_step1_title}</h3>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              {t.home_step1_desc}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-lg font-bold">{t.home_step2_title}</h3>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              {t.home_step2_desc}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-lg font-bold">{t.home_step3_title}</h3>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              {t.home_step3_desc}
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
