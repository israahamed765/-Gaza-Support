import React, { useState } from 'react';
import { useSanad } from '../context/SanadContext';
import { Smile, Sparkles, Send, Globe, MessageSquareDiff, Heart, Quote } from 'lucide-react';
import { translations } from '../translations';

export const WallOfHopePage: React.FC = () => {
  const { hopeMessages, addHopeMessage, language } = useSanad();
  const [donorName, setDonorName] = useState<string>('');
  const [donorCountry, setDonorCountry] = useState<string>('');
  const [donorMessage, setDonorMessage] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);

  const t = translations[language];
  const isEn = language === 'en';
  
  // Quick pre-selected suggestions to inspire donors in both languages
  const rapidInspirationsAr = [
    { country: 'فلسطين', text: 'الله يحميكم ويصبّر قلوبكم الطاهرة، النصر والفرج قريب بإذن الله وكل حر في العالم معكم.' },
    { country: 'الجزائر', text: 'من جزاير الأحرار إلى غزة الأبية: قلوبنا وبيوتنا وأموالنا fداء لصمودكم الأسطوري الشريف.' },
    { country: 'مصر', text: 'يا أبطال الإنسانية، نعلم عظم تضحياتكم ونصلي من أجل سلامتكم وسكينة أطفالكم كل يوم وبكل صلاة.' },
    { country: 'العراق', text: 'أنتم تدرّسون الكون معاني الكرامة والصبر. ثبتكم الله وشفى جرحاكم وتقبل شهدائكم.' },
  ];

  const rapidInspirationsEn = [
    { country: 'Palestine', text: 'May God protect you and grant peace to your pure hearts. The world stands with your beautiful resilience!' },
    { country: 'Algeria', text: 'From free Algeria to beloved Gaza: our hearts, homes, and prayers are dedicated to your dignified survival.' },
    { country: 'Egypt', text: 'Heroes of humanity, we look up to your endless patience. We pray for your children\'s safety in every prayer.' },
    { country: 'Ireland', text: 'You teach the universe what honor and dignity look like. May peace and justice be yours.' },
  ];

  const rapidInspirations = isEn ? rapidInspirationsEn : rapidInspirationsAr;

  const handleApplyInspiration = (item: { country: string, text: string }) => {
    setDonorCountry(item.country);
    setDonorMessage(item.text);
    if (!donorName) {
      setDonorName(isEn ? 'Silent Supporter' : 'محب متضامن');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorMessage.trim()) return;

    addHopeMessage(
      donorName.trim() || t.hope_anonymous,
      donorCountry.trim() || t.hope_world,
      donorMessage.trim()
    );

    // Reset fields
    setDonorName('');
    setDonorCountry('');
    setDonorMessage('');
    setShowForm(false); // Auto close form on successful submission
  };

  return (
    <div className="space-y-12 py-8 animate-none text-start" id="hope_wall_view">
      
      {/* Title & Introduction block */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-emerald-800 rounded-full text-xs font-bold border border-teal-100">
          <Smile className="w-4.5 h-4.5 text-emerald-500" />
          <span>{t.hope_badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          {t.hope_title}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          {t.hope_desc}
        </p>

        {/* CTA Button to write message - only shown when form is closed */}
        {!showForm && (
          <div className="pt-2">
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white text-sm sm:text-base rounded-full shadow-lg shadow-emerald-600/20 active:scale-98 transition-all flex items-center gap-2.5 mx-auto cursor-pointer duration-200"
            >
              <MessageSquareDiff className="w-5 h-5 animate-pulse" />
              <span>{isEn ? 'Write a Solidarity Message Now ✍️' : 'اكتب رسالة مؤازرة وأمل الآن للنفوس الصابرة ✍️'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid: Message Submission Form AND Wall Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form panel Left Side Column - Animated visibility */}
        {showForm && (
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-emerald-100 shadow-lg shadow-emerald-500/5 space-y-6 shrink-0" id="message_form_card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <MessageSquareDiff className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{t.hope_form_title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1 px-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>✕</span>
                <span>{isEn ? 'Hide' : 'إغلاق'}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-start">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">{t.hope_label_name}</label>
                <input
                  type="text"
                  placeholder={t.hope_placeholder_name}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white text-slate-900 outline-hidden text-xs sm:text-sm text-start"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">{t.hope_label_country}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder={t.hope_placeholder_country}
                    value={donorCountry}
                    onChange={(e) => setDonorCountry(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white text-slate-900 outline-hidden text-xs sm:text-sm text-start"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">{t.hope_label_msg}</label>
                <textarea
                  rows={4}
                  required
                  maxLength={400}
                  placeholder={t.hope_placeholder_msg}
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white text-slate-900 outline-hidden text-xs sm:text-sm text-start leading-relaxed resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 font-bold text-white text-xs sm:text-sm transition duration-150 flex items-center justify-center gap-2 shadow-md shadow-emerald-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{t.hope_form_btn}</span>
              </button>
            </form>

            {/* Rapid inspiration helper list inside form sidebar */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-start">
              <h4 className="text-xs font-bold text-slate-500">
                {isEn ? '💡 Fast click to apply solidarity letters suggestions:' : '📌 حدد رسالة جاهزة للتطبيق الفوري حياً على الاستمارة:'}
              </h4>
              <div className="space-y-2">
                {rapidInspirations.map((item, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleApplyInspiration(item)}
                    className="w-full text-start p-2 text-xs text-slate-600 hover:text-emerald-750 bg-slate-50 hover:bg-emerald-50 rounded-lg border border-slate-100 transition whitespace-normal cursor-pointer hover:border-emerald-250 leading-relaxed block"
                    title={item.text}
                  >
                    📌 <strong>{item.country}:</strong> "{item.text}"
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Dynamic Sticky Notes Grid Right/Full Side */}
        <div className={`${showForm ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6`} id="wall_sticky_canvas_column">
          
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 font-medium bg-slate-50 p-3 h-12 rounded-xl border border-slate-100 text-start">
            <span>{isEn ? 'Solidarity Wall - Publicly visible' : 'لوحة الحائط - مرئية للعائلات والمجتمعات كافّة'}</span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>{t.hope_messages_grid_title} ({hopeMessages.length})</span>
            </span>
          </div>

          {/* Interactive display container */}
          <div className={`grid grid-cols-1 ${showForm ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-6`} id="sticky_notes_grid">
            {hopeMessages.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-dashed text-sm">
                {isEn ? 'No messages posted yet. Be the first one!' : 'لا توجد رسائل على الحائط بعد. كن أول من يكتب وينشر!'}
              </div>
            ) : (
              hopeMessages.map((msg, index) => {
                // Generate a slightly random tilt for sticky-note organic physical look
                const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-0', 'rotate-1', '-rotate-1'];
                const tiltClass = rotations[index % rotations.length];
                
                return (
                  <div
                    key={msg.id}
                    className={`p-6 rounded-2xl shadow-xs transition duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-md flex flex-col justify-between ${tiltClass} border border-slate-200/50 text-start`}
                    style={{
                      backgroundColor: msg.color || '#fffbeb',
                    }}
                    id={`hope-note-${msg.id}`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start text-slate-400">
                        <Quote className="w-8 h-8 opacity-20 text-slate-900" />
                        <span className="text-[10px] bg-white/60 text-slate-600 px-2 rounded-md font-medium">
                          {msg.date === 'الآن' ? (isEn ? 'Now' : 'الآن') : msg.date}
                        </span>
                      </div>
                      
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed font-sans text-start whitespace-pre-line text-justify">
                        {msg.message}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-900/10 flex items-center justify-between text-start">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">{msg.name === 'فاعل خير مجهول' ? t.hope_anonymous : msg.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                          <span>📍 {msg.country === 'العالم' ? t.hope_world : msg.country}</span>
                        </p>
                      </div>
                      <div className="bg-white/40 p-1 rounded-full text-rose-500 flex items-center justify-center">
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
