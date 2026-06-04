import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSanad } from '../context/SanadContext';
import { BeneficiaryProfile, UrgentNeed, Challenge } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { 
  Heart, MapPin, DollarSign, ExternalLink, Calendar, 
  MessageSquare, User, ShieldCheck, Share2, ArrowLeft,
  Sparkles, CheckCircle2, TrendingUp, HelpCircle
} from 'lucide-react';
import { translations } from '../translations';
import { SolidarityComments } from './SolidarityComments';
import { ImageCarousel } from './ImageCarousel';

export const DynamicProfileView: React.FC = () => {
  const { id, username } = useParams<{ id?: string; username?: string }>();
  const navigate = useNavigate();
  const { 
    beneficiaries, 
    currentNeeds, 
    challenges, 
    setSelectedFamilyId,
    currentBeneficiary,
    addCommentToChallenge,
    deleteCommentFromChallenge,
    addReplyToChallenge,
    deleteReplyFromChallenge,
    language 
  } = useSanad();

  const t = translations[language];
  const isEn = language === 'en';

  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<BeneficiaryProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Load the specific profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        if (id) {
          // 1. First check if it's already in our context's real-time beneficiaries list
          const match = beneficiaries.find(b => b.id === id);
          if (match) {
            setProfile(match);
            setSelectedFamilyId(match.id);
            setLoading(false);
            return;
          }

          // 2. Fallback to direct Firestore read
          const docRef = doc(db, 'beneficiaries', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as BeneficiaryProfile;
            setProfile(data);
            setSelectedFamilyId(data.id);
          } else {
            setErrorMsg(isEn ? 'profile ID not found in database.' : 'معرف الملف الشخصي غير موجود بقاعدة البيانات.');
          }
        } else if (username) {
          // 1. Search in local context
          const match = beneficiaries.find(b => b.username?.toLowerCase() === username.toLowerCase());
          if (match) {
            setProfile(match);
            setSelectedFamilyId(match.id);
            setLoading(false);
            return;
          }

          // 2. Query Firestore live
          const q = query(collection(db, 'beneficiaries'), where('username', '==', username.toLowerCase()));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            const docSnap = querySnap.docs[0];
            const data = docSnap.data() as BeneficiaryProfile;
            setProfile(data);
            setSelectedFamilyId(data.id);
          } else {
            setErrorMsg(isEn ? `Username @${username} not found.` : `اسم المستخدم @${username} غير موجود.`);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setErrorMsg(isEn ? 'Failed to fetch family profile.' : 'فشل في تحميل الملف التعريفي للعائلة.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, username, beneficiaries, setSelectedFamilyId, isEn]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-semibold">
          {isEn ? 'Retrieving resilient family profile live...' : 'جاري جلب ملف العائلة الصامدة مباشرة...'}
        </p>
      </div>
    );
  }

  if (errorMsg || !profile) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-950">
            {isEn ? 'Profile Not Found' : 'الملف الشخصي غير موجود'}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {errorMsg || (isEn ? 'The requested family profile could not be fetched.' : 'يتعذر جلب الملف التعريفي المطلوب للعائلة.')}
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEn ? 'Back to Portal' : 'العودة للمنصة الرئيسة'}</span>
        </button>
      </div>
    );
  }

  // Filter Needs & Stories belonging specifically to this fetched profile!
  const myNeeds = currentNeeds.filter(n => n.beneficiaryId === profile.id);
  const myChallenges = challenges.filter(c => c.beneficiaryId === profile.id);

  const totalDonated = profile.totalDonated || 0;
  const totalSpent = profile.totalSpent || 0;
  const remainingFunds = Math.max(0, totalDonated - totalSpent);

  return (
    <div className="space-y-12 py-8 text-start max-w-6xl mx-auto px-4" id="dynamic_profile_view">
      
      {/* Back & Share Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEn ? 'Back to Explorer' : 'العودة لاستكشاف العائلات'}</span>
        </button>

        <button
          onClick={handleShare}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
            copied 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? (isEn ? 'Link Copied!' : 'تم نسخ الرابط!') : (isEn ? 'Share Profile' : 'مشاركة الملف')}</span>
        </button>
      </div>

      {/* Profile Hero Block */}
      <section className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-50 rounded-full blur-3xl -z-10"></div>
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-start">
          <div className="w-36 h-36 shrink-0 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-sm">
            <img 
              src={profile.profilePicture || 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=300'} 
              alt={profile.name} 
              className="w-full h-full object-cover" 
            />
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-100">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{isEn ? 'Verified Resilient Family' : 'عائلة صامدة موثقة'}</span>
                </span>
                {profile.username && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono font-bold">
                    @{profile.username}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{profile.name || t.home_family_fallback_name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-1 text-xs text-slate-500 font-bold">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{profile.location || t.home_family_fallback_loc}</span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              {profile.description || t.home_family_fallback_desc}
            </p>
          </div>
        </div>
      </section>

      {/* Financial Tracker Panel */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-2xs space-y-2 text-start">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? 'Total Donations Tracked' : 'إجمالي المبالغ والتحويلات'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">${totalDonated}</p>
          <p className="text-[10px] text-slate-400 font-bold">{isEn ? 'Sum of secure donor tracking logs' : 'مجموع إثباتات الدعم المالي الواردة'}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-2xs space-y-2 text-start">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? 'Spent on Essential Items' : 'ما تم صرفه للاستقرار والنجاة'}</span>
            <ExternalLink className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">${totalSpent}</p>
          <p className="text-[10px] text-slate-400 font-bold">{isEn ? 'Food, rents, tents & emergency medicals' : 'للطعام، مأوى النزوح، والاحتياجات الأساسية'}</p>
        </div>

        <div className="bg-teal-50/40 p-6 rounded-3xl border border-teal-100 shadow-2xs space-y-2 text-start">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">{isEn ? 'Available Balance / Buffer' : 'الرصيد الاحتياطي المتوفر'}</span>
            <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-teal-950">${remainingFunds}</p>
          <p className="text-[10px] text-teal-750 font-bold">{isEn ? 'Current cash buffer securing tomorrow' : 'يؤمن احتياجات الأيام والأسابيع القادمة'}</p>
        </div>
      </section>

      {/* Main Split: Left (Needs) & Right (Diary Stories) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Urgent Needs block (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span>{isEn ? 'Urgent Survival Needs' : 'الاحتياجات العاجلة الداعمة لصمودنا'}</span>
            </h2>
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {myNeeds.length} {isEn ? 'Active' : 'نشط'}
            </span>
          </div>

          {myNeeds.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-bold">{isEn ? 'No urgent needs active right now!' : 'لا توجد احتياجات عاجلة نشطة حالياً!'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {myNeeds.map((need) => {
                const percent = Math.min(100, Math.round((need.collectedAmount / need.cost) * 100));
                return (
                  <div key={need.id} className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-2xs flex flex-col sm:flex-row gap-5 p-5 text-start">
                    
                    <div className="w-full sm:w-44 shrink-0 h-44 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative">
                      <ImageCarousel imageUrls={need.imageUrls || [need.imageUrl]} />
                      {need.isUrgent && (
                        <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md tracking-wider uppercase animate-pulse">
                          {isEn ? 'Urgent' : 'هام وعاجل'}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <h3 className="text-base sm:text-lg font-black text-slate-900">{need.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                          {need.description}
                        </p>
                      </div>

                      {/* Progress Bar container */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                          <span>{t.needs_amount_collected}: <strong className="text-emerald-700">${need.collectedAmount}</strong></span>
                          <span>{percent}% ({t.needs_cost_total}: ${need.cost})</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <a
                          href={need.crowdfundingUrl || profile.crowdfundingUrl || 'https://www.gofundme.com'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer"
                        >
                          <span>{isEn ? 'Support / Share Link' : 'ادعم الاحتياج / رابط التبرع'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Stories / Diaries (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <span>{isEn ? 'Daily Diary & Live Stories' : 'التحديثات ويوميات الصمود'}</span>
            </h2>
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {myChallenges.length}
            </span>
          </div>

          {myChallenges.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-bold">
                {isEn ? 'No live updates posted yet!' : 'لم يتم نشر يوميات حتى الآن!'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {myChallenges.map((story) => (
                <div key={story.id} className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-2xs p-5 space-y-4 text-start">
                  
                  <div className="flex items-center gap-3">
                    <img 
                      src={story.beneficiaryAvatar || profile.profilePicture || 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=300'} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover border border-emerald-200"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{story.beneficiaryName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{story.date}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900">{story.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {story.text}
                    </p>
                  </div>

                  {story.imageUrl && (
                    <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 max-h-60">
                      <ImageCarousel imageUrls={story.imageUrls || [story.imageUrl]} />
                    </div>
                  )}

                  {/* Likes / Comments info bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="text-rose-500">❤️</span>
                      <span>{story.likes} {isEn ? 'Likes' : 'أصوات تضامن'}</span>
                    </span>
                    <span>{story.comments?.length || 0} {isEn ? 'Comments' : 'تعليق'}</span>
                  </div>

                  {/* Integration of real-time comments directly in the story nested inside profile view! */}
                  <div className="pt-3 border-t border-slate-50 mt-2">
                    <SolidarityComments 
                      comments={story.comments || []} 
                      onAddComment={(authorName, text) => addCommentToChallenge(story.id, authorName, text, currentBeneficiary ? 'family' : 'visitor', currentBeneficiary?.id)}
                      onDeleteComment={(commentId) => deleteCommentFromChallenge(story.id, commentId)}
                      onAddReply={(commentId, authorName, text) => addReplyToChallenge(story.id, commentId, authorName, text, currentBeneficiary ? 'family' : 'visitor', currentBeneficiary?.id)}
                      onDeleteReply={(commentId, replyId) => deleteReplyFromChallenge(story.id, commentId, replyId)}
                      language={language}
                      currentBeneficiary={currentBeneficiary}
                      postOwnerId={story.beneficiaryId}
                    />
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
