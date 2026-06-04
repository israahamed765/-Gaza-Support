import React, { useState } from 'react';
import { useSanad } from '../context/SanadContext';
import { Heart, MessageCircle, Share2, Sparkles, BookOpen, Clock, PenTool, Trash2 } from 'lucide-react';
import { translations } from '../translations';
import { SolidarityComments } from './SolidarityComments';
import { ImageCarousel } from './ImageCarousel';

export const DailyChallengesPage: React.FC = () => {
  const { 
    challenges, 
    likeChallenge, 
    setActiveTab, 
    selectedFamilyId, 
    selectedFamily,
    beneficiaries, 
    language,
    currentBeneficiary,
    deleteChallenge,
    addCommentToChallenge,
    deleteCommentFromChallenge,
    addReplyToChallenge,
    deleteReplyFromChallenge
  } = useSanad();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const t = translations[language];
  const isEn = language === 'en';

  // Find currently active family details
  const familyName = selectedFamily ? selectedFamily.name : (isEn ? 'Family' : 'العائلة');

  // Filter challenges to focus strictly on the active family!
  const familyChallenges = challenges.filter(c => c.beneficiaryId === (selectedFamily?.id || ''));

  const handleShare = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/#challenge-${id}`);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="space-y-8 py-8 px-4 max-w-4xl mx-auto text-start" id="challenges_page_view">
      
      {/* Page Title & Intro */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-emerald-800 rounded-full text-xs font-bold border border-teal-100">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          <span>{t.chal_badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          {t.chal_title} <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-700">{familyName}</span>
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          {t.chal_desc}
        </p>
      </div>

      {/* Write a story call-to-action prompt */}
      <div className="bg-linear-to-r from-emerald-500/10 via-teal-500/5 to-slate-50 border border-emerald-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6text-start" id="write_story_prompt">
        <div className="flex items-center gap-4 text-start">
          <div className="bg-white p-3 rounded-2xl text-emerald-600 shadow-xs ring-4 ring-emerald-55 shrink-0">
            <PenTool className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              {isEn ? 'Do you have the passcode to edit this profile?' : 'هل تملك كلمة المرور لتحديث هذا الملف؟'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {isEn ? 'Log in under the Families Portal to add stories, logbooks, tarps, and update receipts.' : 'قم بتسجيل الدخول كعائلة مستفيدة لتتمكن من كتابة يوميات جديدة وتحديث المتبرعين بأوضاعكم فورياً.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shrink-0 transition shadow-sm cursor-pointer active:scale-95 whitespace-nowrap"
        >
          {t.mobile_login_button}
        </button>
      </div>

      {/* Main Feed Container */}
      <div className="space-y-8" id="challenges_social_feed">
        {familyChallenges.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 space-y-4">
            <p className="text-slate-400 font-medium">{t.chal_empty}</p>
            <p className="text-xs text-slate-400">
              {isEn ? 'The family can register in the families portal and write their first post!' : 'يمكن للعائلة تسجيل الدخول بلوحة التحكم لكتابة أول منشور لهم!'}
            </p>
          </div>
        ) : (
          familyChallenges.map((challenge) => (
            <article
              key={challenge.id}
              id={`challenge-${challenge.id}`}
              className="bg-white rounded-3xl border border-slate-150 shadow-xs hover:shadow-md transition duration-300 overflow-hidden text-start"
            >
              
              {/* Post Header */}
              <div className="p-5 sm:p-6 flex items-center justify-between text-start">
                <div className="flex items-center gap-3">
                  <img
                    src={challenge.beneficiaryAvatar || 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=300'}
                    alt={challenge.beneficiaryName}
                    className="w-12 h-12 rounded-full object-cover border border-emerald-300 shadow-2xs shrink-0"
                  />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {challenge.beneficiaryName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{challenge.date === 'الآن' ? (isEn ? 'Now' : 'الآن') : challenge.date}</span>
                      <span className="text-slate-200">•</span>
                      <span className="text-emerald-600 font-semibold">{isEn ? 'Verified Logbook' : 'تحديث عائلي موثق'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-teal-600 bg-teal-50 p-2.5 rounded-2xl border border-teal-100">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Story body */}
              <div className="px-5 sm:px-6 pb-5 space-y-3">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-950 leading-snug">
                  {challenge.title}
                </h2>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-justify">
                  {challenge.text}
                </p>
              </div>

              {/* Image attachment */}
              {(challenge.imageUrl || (challenge.imageUrls && challenge.imageUrls.length > 0)) && (
                <div className="relative w-full border-y border-slate-100 overflow-hidden">
                  <ImageCarousel
                    images={challenge.imageUrls}
                    fallbackImage={challenge.imageUrl}
                    alt={challenge.title}
                  />
                </div>
              )}

              {/* Engagement Indicators */}
              <div className="p-4 sm:px-6 bg-slate-50/70 flex flex-wrap items-center justify-between border-t border-slate-105 gap-2">
                
                {/* Heart react buttons */}
                <button
                  onClick={() => likeChallenge(challenge.id)}
                  className="flex items-center gap-2 px-3.5 py-2 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition text-slate-600 active:scale-95 cursor-pointer"
                  title={isEn ? 'Solidarize with post and show love!' : 'تضامن مع المنشور وعبر عن حبك وصبرك'}
                >
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-none" />
                  <span className="text-xs font-bold font-mono text-slate-800">
                    {challenge.likes} {isEn ? 'Solidaries' : 'قلوب تضامنية'}
                  </span>
                </button>

                {/* Sharing and actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare(challenge.id)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-xl transition text-slate-500 active:scale-95 text-xs font-bold shrink-0"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{copiedId === challenge.id ? (isEn ? 'Copied link!' : 'تم نسخ الرابط!') : (isEn ? 'Share link' : 'مشاركة القصة')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('needs')}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-850 rounded-xl hover:bg-emerald-100 transition text-xs font-bold shrink-0 shadow-3xs"
                  >
                    <span>{isEn ? 'Back us' : 'دعم احتياجاتنا'}</span>
                  </button>
                </div>

              </div>

              {/* Real-time comments section */}
              <SolidarityComments
                comments={challenge.comments}
                onAddComment={(authorName, text) => addCommentToChallenge(challenge.id, authorName, text, currentBeneficiary ? 'family' : 'visitor', currentBeneficiary?.id)}
                onDeleteComment={(commentId) => deleteCommentFromChallenge(challenge.id, commentId)}
                onAddReply={(commentId, authorName, text) => addReplyToChallenge(challenge.id, commentId, authorName, text, currentBeneficiary ? 'family' : 'visitor', currentBeneficiary?.id)}
                onDeleteReply={(commentId, replyId) => deleteReplyFromChallenge(challenge.id, commentId, replyId)}
                language={language}
                currentBeneficiary={currentBeneficiary}
                postOwnerId={challenge.beneficiaryId}
              />

            </article>
          ))
        )}
      </div>

    </div>
  );
};
