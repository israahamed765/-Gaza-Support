import React, { useState } from 'react';
import { useSanad } from '../context/SanadContext';
import { UrgentNeed } from '../types';
import { Search, MapPin, DollarSign, ExternalLink, Heart, CheckCircle2, AlertCircle, Coins, ArrowUpRight, MessageCircle } from 'lucide-react';
import { translations } from '../translations';
import { SolidarityComments } from './SolidarityComments';
import { ImageCarousel } from './ImageCarousel';

export const CurrentNeedsPage: React.FC = () => {
  const { 
    currentNeeds, 
    supportNeed, 
    selectedFamilyId, 
    selectedFamily,
    beneficiaries, 
    language,
    currentBeneficiary,
    addCommentToNeed,
    deleteCommentFromNeed,
    addReplyToNeed,
    deleteReplyFromNeed
  } = useSanad();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const t = translations[language];
  const isEn = language === 'en';

  // Selected need state for interactive donation modal
  const [activeDonationNeed, setActiveDonationNeed] = useState<UrgentNeed | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(25);
  const [donorName, setDonorName] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const [expandedNeedId, setExpandedNeedId] = useState<string | null>(null);
  const [expandedDescs, setExpandedDescs] = useState<Record<string, boolean>>({});

  // Active family object
  const familyName = selectedFamily ? selectedFamily.name : (isEn ? 'Family' : 'العائلة');

  // Filter needs specifically for the SELECTED single family
  const familyNeeds = currentNeeds.filter(need => need.beneficiaryId === (selectedFamily?.id || ''));

  // Apply secondary text search if the user wants to search
  const filteredNeeds = familyNeeds.filter(need => {
    const titleMatch = (need.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (need.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || descMatch;
  });

  const handleOpenDonateModal = (need: UrgentNeed) => {
    setActiveDonationNeed(need);
    const remaining = need.cost - need.collectedAmount;
    setDonationAmount(Math.min(remaining, 50) || 10);
    setDonorName('');
  };

  const handleConfirmDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDonationNeed) return;

    // Trigger support need update to simulated database
    supportNeed(activeDonationNeed.id, donationAmount);
    
    // Success Toast
    const thankYouMsg = t.needs_toast_success_desc
      .replace('{amount}', String(donationAmount))
      .replace('{title}', activeDonationNeed.title);
    setShowSuccessToast(thankYouMsg);
    
    // Safely open the family's fundraising campaign link
    const targetUrl = activeDonationNeed.crowdfundingUrl || selectedFamily?.crowdfundingUrl || 'https://www.gofundme.com';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    // Close Modal
    setActiveDonationNeed(null);

    // Clear toast
    setTimeout(() => {
      setShowSuccessToast(null);
    }, 6000);
  };

  return (
    <div className="space-y-8 py-8 text-start px-4 max-w-6xl mx-auto" id="needs_page_view">
      
      {/* Page Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-850 rounded-full text-xs font-bold border border-teal-100">
          <Heart className="w-4.5 h-4.5 fill-emerald-500 text-emerald-500" />
          <span>{t.needs_badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          {t.needs_title} <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-700">{familyName}</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          {t.needs_desc}
        </p>
      </div>

      {/* Success Notification Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-5 left-5 right-5 md:left-auto md:max-w-md bg-emerald-600 border border-emerald-500 text-white p-4.5 rounded-2xl shadow-2xl z-50 flex items-start gap-3 animate-fade-in" id="success_toast">
          <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-100 mt-0.5" />
          <div>
            <p className="font-bold text-sm">{t.needs_toast_success_title}</p>
            <p className="text-xs text-emerald-100 mt-1 leading-relaxed">{showSuccessToast}</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between" id="needs_filters_pane">
        <div className="relative w-full">
          <input
            type="text"
            placeholder={t.needs_search_placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 text-sm outline-hidden text-start"
          />
        </div>
        <div className="text-xs text-slate-400 shrink-0 font-bold whitespace-nowrap">
          {t.needs_count_label.replace('{count}', String(filteredNeeds.length))}
        </div>
      </div>

      {/* Grid of Issues/Needs */}
      {filteredNeeds.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 text-sm">
          {t.needs_empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNeeds.map((need) => {
            const pct = Math.min(100, Math.round((need.collectedAmount / need.cost) * 100));
            const isCompleted = need.collectedAmount >= need.cost;

            return (
              <div
                key={need.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition duration-300 flex flex-col overflow-hidden group text-start"
              >
                {/* Need Image Card */}
                <div className="relative w-full bg-slate-50 shrink-0 overflow-hidden">
                  <ImageCarousel 
                    images={need.imageUrls} 
                    fallbackImage={need.imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600'} 
                    alt={need.title} 
                  />
                  {need.isUrgent && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md z-10">
                      {t.needs_urgent}
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-xs font-semibold z-10">
                    {need.beneficiaryLocation || selectedFamily?.location}
                  </span>
                </div>

                {/* Bottom Body Detail Card */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2 text-start">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                      {need.title}
                    </h3>
                    <p className={`text-xs text-slate-600 leading-relaxed break-words whitespace-pre-wrap ${expandedDescs[need.id] ? '' : 'line-clamp-3'}`}>
                      {need.description}
                    </p>
                    {need.description && need.description.length > 115 && (
                      <button
                        type="button"
                        onClick={() => setExpandedDescs(prev => ({ ...prev, [need.id]: !prev[need.id] }))}
                        className="text-xs text-emerald-650 hover:text-emerald-750 font-bold transition-colors cursor-pointer mt-0.5"
                      >
                        {expandedDescs[need.id] ? (isEn ? 'Show Less' : 'عرض أقل') : (isEn ? 'Read More...' : 'اقرأ المزيد...')}
                      </button>
                    )}
                  </div>

                  {/* Pricing Progress Section */}
                  <div className="space-y-3 pt-2 border-t border-slate-50">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-500">
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

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-col text-start">
                        <span className="text-[10px] text-slate-400 font-bold">{t.needs_amount_collected}</span>
                        <span className="text-xs sm:text-sm font-black text-emerald-600">
                          ${need.collectedAmount} / <span className="text-slate-400 font-normal font-sans text-xs">${need.cost}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Comments Toggle */}
                        <button
                          onClick={() => setExpandedNeedId(expandedNeedId === need.id ? null : need.id)}
                          className={`p-2 rounded-xl border transition cursor-pointer relative active:scale-95 flex items-center gap-1 ${
                            expandedNeedId === need.id
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 text-slate-600'
                          }`}
                          title={isEn ? "Comments" : "التعليقات"}
                        >
                          <MessageCircle className="w-4 h-4" />
                          {(need.comments && need.comments.length > 0) && (
                            <span className="text-[10px] font-bold font-mono bg-emerald-600 text-white px-1 leading-none rounded-full flex items-center justify-center min-w-4 h-4 shadow-3xs">
                              {need.comments.length}
                            </span>
                          )}
                        </button>

                        {isCompleted ? (
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.needs_completed_badge}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenDonateModal(need)}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold px-3 py-2 rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <span>{t.needs_support_btn}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Collapsible comments list bottom drawer */}
                  {expandedNeedId === need.id && (
                    <div className="border-t border-slate-100 pt-3">
                      <SolidarityComments
                        comments={need.comments}
                        onAddComment={(authorName, text) => addCommentToNeed(need.id, authorName, text, currentBeneficiary ? 'family' : 'visitor', currentBeneficiary?.id)}
                        onDeleteComment={(commentId) => deleteCommentFromNeed(need.id, commentId)}
                        onAddReply={(commentId, authorName, text) => addReplyToNeed(need.id, commentId, authorName, text, currentBeneficiary ? 'family' : 'visitor', currentBeneficiary?.id)}
                        onDeleteReply={(commentId, replyId) => deleteReplyFromNeed(need.id, commentId, replyId)}
                        language={language}
                        currentBeneficiary={currentBeneficiary}
                        postOwnerId={need.beneficiaryId}
                      />
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Support Modal Popup */}
      {activeDonationNeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-none" id="donation_modal">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 max-w-md w-full space-y-6 text-start relative shadow-2xl">
            
            <div className="space-y-2">
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded">{t.needs_modal_badge}</span>
              <h3 className="text-lg font-black text-teal-950 mt-1">{activeDonationNeed.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.needs_modal_desc} 
                <span className="text-emerald-400 font-bold font-mono"> ${activeDonationNeed.cost - activeDonationNeed.collectedAmount}</span>.
              </p>
            </div>

            <form onSubmit={handleConfirmDonation} className="space-y-4 text-start">
              
              {/* Select or type amount */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">{t.needs_modal_amount_label}</label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map(amt => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setDonationAmount(Math.min(amt, activeDonationNeed.cost - activeDonationNeed.collectedAmount))}
                      className={`py-2 rounded-xl text-xs font-semibold border transition ${
                        donationAmount === amt 
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <div className="relative mt-2">
                  <input
                    type="number"
                    min="1"
                    max={activeDonationNeed.cost - activeDonationNeed.collectedAmount}
                    required
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(Math.min(Number(e.target.value), activeDonationNeed.cost - activeDonationNeed.collectedAmount))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 text-slate-900 font-mono text-sm font-bold text-start pl-12"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 text-xs font-mono">USD</span>
                </div>
              </div>

              {/* Donor Name input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">{t.needs_modal_name_label}</label>
                <input
                  type="text"
                  placeholder={t.needs_modal_name_placeholder}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 text-slate-900 text-sm outline-hidden text-start"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-[11px] text-slate-500 leading-relaxed text-start">
                💡 <strong>{t.needs_modal_tip_title}</strong> {t.needs_modal_tip_desc} 
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition cursor-pointer"
                >
                  {t.needs_modal_confirmBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDonationNeed(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs sm:text-sm font-semibold transition"
                >
                  {t.needs_modal_cancelBtn}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
