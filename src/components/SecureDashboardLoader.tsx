import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSanad } from '../context/SanadContext';
import { BeneficiaryProfile } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { BeneficiaryDashboard } from './BeneficiaryDashboard';
import { KeyRound, ShieldAlert, ArrowLeft, AlertCircle } from 'lucide-react';
import { translations } from '../translations';

export const SecureDashboardLoader: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { 
    currentBeneficiary, 
    beneficiaries, 
    login,
    language 
  } = useSanad();

  const t = translations[language];
  const isEn = language === 'en';

  const [targetProfile, setTargetProfile] = useState<BeneficiaryProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch the target profile to display its name correctly in the auth challenge
  useEffect(() => {
    if (!slug) return;

    const loadTarget = async () => {
      setLoading(true);
      try {
        // Match from local list by its secure dashboardSlug
        const match = beneficiaries.find(b => b.dashboardSlug === slug);
        if (match) {
          setTargetProfile(match);
          setLoading(false);
          return;
        }

        // Direct database lookup by matching the dashboardSlug field
        const q = query(collection(db, 'beneficiaries'), where('dashboardSlug', '==', slug));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          setTargetProfile(querySnap.docs[0].data() as BeneficiaryProfile);
        }
      } catch (err) {
        console.error('Error fetching target profile for dashboard check:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTarget();
  }, [slug, beneficiaries]);

  const handleSecureLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!targetProfile) return;

    // Verify passcode matches target profile's passcode
    if (targetProfile.password.toLowerCase() === password.trim().toLowerCase()) {
      // Perform log in
      login(password.trim());
      setPassword('');
      setAuthError(null);
    } else {
      setAuthError(isEn ? 'Incorrect passcode for this dashboard.' : 'رمز المرور غير صحيح لوحة التحكم هذه.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-semibold">
          {isEn ? 'Verifying dashboard security credentials...' : 'جاري التحقق من أمان وصلاحية لوحة التحكم...'}
        </p>
      </div>
    );
  }

  if (!targetProfile) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-950">
            {isEn ? 'Invalid Dashboard' : 'لوحة تحكم غير صالحة'}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {isEn ? 'The requested family identity does not exist.' : 'معرّف لوحة تحكم العائلة المطلوب غير موجود.'}
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

  // Is authenticated successfully and owns this ID
  const isAuthorized = currentBeneficiary && targetProfile && currentBeneficiary.id === targetProfile.id;

  if (isAuthorized) {
    return <BeneficiaryDashboard />;
  }

  // Auth challenge rendering
  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6 animate-none" id="secure_dashboard_challenge">
      
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isEn ? 'Back to Portal' : 'العودة للمنصة الرئيسة'}</span>
      </button>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden text-start">
        <div className="p-1 w-full bg-linear-to-r from-red-500 to-amber-500"></div>
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-950">
              {isEn ? 'Secure Authentication' : 'تحقق أمني مطلوب'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {isEn 
                ? `The following dashboard is private & restricted. Please enter the passcode for: ` 
                : `لوحة التحكم هذه خاصة ومحمية. الرجاء إدخال رمز المرور السري الخاص بـ: `}
              <strong className="text-slate-800 block mt-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 font-extrabold">
                {targetProfile.name || (isEn ? 'Registered Family Profile' : 'العائلة المسجلة بالمنصة')}
              </strong>
            </p>
          </div>

          <form onSubmit={handleSecureLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {isEn ? 'Passcode *' : 'رمز المرور *'}
              </label>
              <input
                type="text"
                required
                placeholder={isEn ? 'Enter passcode to unlock...' : 'أدخل رمز المرور لفتح لوحة التحكم...'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 focus:bg-white text-slate-950 text-sm outline-hidden text-start font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal transition"
              />
            </div>

            {authError && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-2xl border border-red-100 text-xs flex items-center gap-2 text-start">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-md cursor-pointer active:scale-[0.99]"
            >
              {isEn ? 'Unlock Dashboard' : 'صرح بالفتح'}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
};
