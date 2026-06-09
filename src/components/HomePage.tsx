import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSanad } from '../context/SanadContext';
import { translations } from '../translations';
import { 
  Heart, MapPin, TrendingUp, DollarSign, Sparkles, 
  User, ExternalLink, Calendar, CheckCircle, ShieldCheck, 
  ArrowUpRight, HelpCircle, ArrowRight 
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { beneficiaries, currentNeeds, language, setSelectedFamilyId } = useSanad();
  const navigate = useNavigate();
  const isEn = language === 'en';
  const t = translations[language];

  // Filter only initialized family profiles to show publicly
  const activeFamilies = beneficiaries.filter(b => b.initialized);

  // Compute platform-wide statistics dynamically based on real Firestore/Context state
  const totalRaised = beneficiaries.reduce((sum, b) => sum + (b.totalDonated || 0), 0);
  const totalSpent = beneficiaries.reduce((sum, b) => sum + (b.totalSpent || 0), 0);
  const remainingFunds = Math.max(0, totalRaised - totalSpent);
  
  // Active uncompleted needs count
  const activeNeedsCount = currentNeeds.filter(n => n.collectedAmount < n.cost).length;

  const handleSelectFamily = (familyId: string, slug?: string) => {
    setSelectedFamilyId(familyId);
    navigate(`/profile/${familyId}`);
  };

  return (
    <div className="space-y-12 py-4 text-start animate-fade-in" id="public_homepage">
      
      {/* 1. Hero Landing Block */}
      <section className="relative bg-white rounded-3xl border border-slate-150 p-6 sm:p-10 lg:p-12 shadow-xs overflow-hidden" id="hero_section">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-teal-200/10 rounded-full blur-3xl -z-10 translate-y-1/3"></div>
        
        <div className="max-w-4xl space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-black rounded-full border border-emerald-100">
            <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
            <span>{t.home_badge}</span>
          </span>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
            {t.home_title}
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            {t.home_desc}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <a 
              href="#families_directory"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black shadow-md shadow-emerald-100 transition whitespace-nowrap cursor-pointer select-none"
            >
              {isEn ? 'Explore Our Families' : 'استعراض قصص وعائلات غزة'} ⟵
            </a>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-black transition whitespace-nowrap cursor-pointer select-none border border-slate-200/80 flex items-center gap-2"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>{t.mobile_login_button}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Platform Overall Live Statistics Ledger */}
      <section className="space-y-4" id="stats_dashboard">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h2 className="text-base sm:text-lg font-black text-slate-900">{t.home_stats_heading}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Stat 1: Total Contribution */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {isEn ? 'Total Verified Aid Raised' : 'إجمالي الدعم والتبرعات الموثقة'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">${totalRaised}</span>
              <span className="text-xs text-emerald-700 font-bold">USD</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">{isEn ? 'Total contributions tracked' : 'مجموع التحويلات المسجلة بقاعدة البيانات حياً'}</p>
          </div>

          {/* Stat 2: Total Spent */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {isEn ? 'Total Spent on Survival' : 'إجمالي ما صُرِف لحفظ الحياة'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">${totalSpent}</span>
              <span className="text-xs text-teal-700 font-bold">USD</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">{isEn ? 'Purchased food, water, tents & medicine' : 'أموال تم تحويلها لشراء مستلزمات العيش الأساسية'}</p>
          </div>

          {/* Stat 3: Available Reserve */}
          <div className="p-5 rounded-2xl border shadow-3xs space-y-1.5 bg-emerald-50/40 border-emerald-100">
            <span className="text-[10px] font-bold text-teal-850 uppercase tracking-wider block">
              {isEn ? 'Available Reserves / Balance' : 'رصيد الأمان المتوفر للعوائل'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-950">${remainingFunds}</span>
              <span className="text-xs text-emerald-800 font-bold">USD</span>
            </div>
            <p className="text-[10px] text-emerald-800 leading-relaxed">{isEn ? 'Buffer protecting families tomorrow' : 'السيولة المتوقع وجودها لضمان البقاء بكرامة'}</p>
          </div>

          {/* Stat 4: Active Needs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {isEn ? 'Families Actively Reporting' : 'العائلات التي تقود صياغة قصتها'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{activeFamilies.length}</span>
              <span className="text-xs text-slate-500 font-bold">{isEn ? 'Families' : 'عائلات صامدة'}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {isEn ? `${activeNeedsCount} urgent needs waiting support` : `هناك ${activeNeedsCount} طرد احتياج نشط وبانتظار الدعم حالياً`}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Families Directory Showcase Grid */}
      <section className="space-y-6 pt-4 scrolls-mt-24" id="families_directory">
        <div className="space-y-1.5 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 text-[10px] bg-emerald-100 text-emerald-800 rounded-md font-bold">
              {isEn ? 'Showcase Registry' : 'مستودع الأمل والصمود'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {isEn ? 'Our Resilient Families' : 'العائلات المغتربة والنازحة بقطاع غزة'}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {isEn ? 'Read documented stories of courage, track their live financial logs, and connect without middlemen' : 'اطلع على تفاصيل الأثر للأسر الصامدة، دقق رصيدهم المالي، وقدم الدعم مباشرة لحملاتهم الرسمية'}
          </p>
        </div>

        {activeFamilies.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 max-w-lg mx-auto">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-bold">
              {isEn ? 'No families profiles initialized yet in the database.' : 'لا توجد عائلات مسجلة ونشطة في قاعدة البيانات حالياً.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeFamilies.map((family) => {
              const fRaised = family.totalDonated || 0;
              const fSpent = family.totalSpent || 0;
              const fRemaining = Math.max(0, fRaised - fSpent);
              
              // Get active needs for this family
              const familyNeeds = currentNeeds.filter(n => n.beneficiaryId === family.id && n.collectedAmount < n.cost);

              return (
                <div 
                  key={family.id}
                  className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-xs flex flex-col justify-between group h-full hover:border-emerald-250 transition-all duration-300"
                >
                  <div className="space-y-5">
                    {/* Top Image Cover */}
                    <div className="relative h-56 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                      <img 
                        src={family.profilePicture || 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=600'} 
                        alt={family.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white text-start">
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 mb-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{family.location}</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black">{family.name}</h3>
                      </div>
                      
                      <span className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1 border border-emerald-400 shadow-sm">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{isEn ? 'Verified Profile' : 'توثيق رسمي'}</span>
                      </span>
                    </div>

                    {/* Description Narrative */}
                    <div className="px-5 sm:px-6 space-y-4">
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 text-start">
                        {family.description || t.home_family_fallback_desc}
                      </p>

                      {/* Small Active Need Teaser */}
                      {familyNeeds.length > 0 ? (
                        <div className="bg-amber-50/40 p-3.5 rounded-2xl border border-amber-100 text-start space-y-1.5">
                          <span className="inline-block text-[9px] font-black tracking-wider uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                            {isEn ? 'Active Urgent Needs' : 'احتياج نشط متاح'}
                          </span>
                          <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">{familyNeeds[0].title}</h4>
                          <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                            <span>{isEn ? 'Cost:' : 'التكلفة:'} ${familyNeeds[0].cost}</span>
                            <span>{isEn ? 'Remaining:' : 'المتبقي:'} ${familyNeeds[0].cost - familyNeeds[0].collectedAmount}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-50/20 p-3 rounded-2xl border border-emerald-100 text-start flex items-center gap-2 text-emerald-800 text-xs font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>{isEn ? 'All core needs secured for safely now!' : 'كل الاحتياجات الأساسية مؤمنة ومغطاة لليوم!'}</span>
                        </div>
                      )}

                      {/* Client Financial Ledger Counter */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/50 text-center">
                        <div className="space-y-1">
                          <span className="text-[9px] font-extrabold text-slate-400 block uppercase">{isEn ? 'Collected' : 'كم تبرع'}</span>
                          <span className="text-xs sm:text-sm font-black text-slate-850 block">${fRaised}</span>
                        </div>
                        <div className="space-y-1 border-x border-slate-200/80">
                          <span className="text-[9px] font-extrabold text-slate-400 block uppercase">{isEn ? 'Spent' : 'كم صرف'}</span>
                          <span className="text-xs sm:text-sm font-black text-slate-850 block">${fSpent}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-extrabold text-emerald-800 block uppercase">{isEn ? 'Balance' : 'كم باقي'}</span>
                          <span className="text-xs sm:text-sm font-black text-emerald-700 block">${fRemaining}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Actions wrapper */}
                  <div className="p-5 sm:p-6 pt-0 mt-5">
                    <button 
                      onClick={() => handleSelectFamily(family.id, family.username)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 group-hover:bg-emerald-600 hover:!bg-emerald-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-3xs"
                    >
                      <span>{isEn ? 'Read Story & Support Now' : 'شاهد ملف العائلة وساعد الآن'}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. "How transparency works" step guide */}
      <section className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 space-y-6" id="transparency_guide">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Heart className="w-8 h-8 text-emerald-500 mx-auto" />
          <h2 className="text-xl sm:text-2xl font-black text-teal-950">{t.home_how_it_works_title}</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {isEn 
              ? 'Sanad Gaza is a tech platform built on truth. We do not touch your transactions; we build direct pathways.' 
              : 'نهدف لربط المجتمع الصامد مباشرة دون أي وساطة مالية مبنية على الصدق والتوثيق والشفافية المعتمدة.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-150 space-y-2 text-start">
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md inline-block">01</span>
            <h3 className="text-sm sm:text-base font-black text-slate-900">{t.home_step1_title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t.home_step1_desc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-150 space-y-2 text-start">
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md inline-block">02</span>
            <h3 className="text-sm sm:text-base font-black text-slate-900">{t.home_step2_title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t.home_step2_desc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-150 space-y-2 text-start">
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md inline-block">03</span>
            <h3 className="text-sm sm:text-base font-black text-slate-900">{t.home_step3_title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t.home_step3_desc}</p>
          </div>
        </div>
      </section>

      {/* 5. Direct Call to Action for families entrance */}
      <section className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="space-y-2 text-start max-w-2xl">
          <h3 className="text-lg sm:text-xl font-black text-white hover:text-emerald-400 transition-colors">
            {isEn ? 'Are you one of our resilient families?' : 'هل أنت من عائلات غزة الصامدة المعتمدة؟'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {isEn 
              ? 'Login with your secret family passcode to edit your direct balance tracking ledger, formulate urgent survival packages, and publish daily camp stories.' 
              : 'استخدم كلمة المرور السرية المخصصة لعائلتكم لتعديل رصيد التبرعات والمصروفات، نشر الكساء والدواء، وكتابة تدوينات المخيم الحية.'}
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer whitespace-nowrap active:scale-95 transition-all text-center flex items-center gap-1.5"
        >
          <span>{isEn ? 'Families Secure Entrance' : 'بوابة تسجيل دخول العائلات'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

    </div>
  );
};
