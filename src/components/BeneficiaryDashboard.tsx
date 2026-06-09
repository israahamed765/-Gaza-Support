import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSanad } from '../context/SanadContext';
import { KeyRound, User, MapPin, Eye, LogOut, CheckCircle, PlusCircle, AlertCircle, Bookmark, FileText, Camera, Upload, Trash2, Coins, ArrowUpRight, DollarSign, Bell, Heart, Sparkles, MessageCircle, X, PenLine } from 'lucide-react';
import { translations } from '../translations';

// Sub-component for individual Needs with an direct collectedAmount modifier input (user requirement)
interface NeedItemRowProps {
  need: any;
  onDelete: () => void;
  onUpdateAmount: (amount: number) => void;
  isEn: boolean;
  t: any;
}

const NeedItemRow: React.FC<NeedItemRowProps> = ({ need, onDelete, onUpdateAmount, isEn, t }) => {
  const [localAmount, setLocalAmount] = useState<number>(need.collectedAmount || 0);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  useEffect(() => {
    setLocalAmount(need.collectedAmount || 0);
  }, [need.collectedAmount]);

  const handleUpdate = () => {
    onUpdateAmount(localAmount);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-start">
      <div className="flex items-center gap-3 overflow-hidden">
        <img
          src={need.imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600'}
          alt=""
          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
        />
        <div className="overflow-hidden">
          <h5 className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">{need.title}</h5>
          <p className="text-[10px] text-slate-500 mt-1">
            {t.dash_need_cost_label} <span className="font-bold text-slate-700">${need.cost}</span>
          </p>
          <p className="text-[10px] text-emerald-700 font-bold">
            {t.needs_amount_collected}: ${need.collectedAmount}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 sm:items-end justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${need.collectedAmount >= need.cost ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
            {need.collectedAmount >= need.cost ? t.dash_need_completed_badge : t.dash_need_pending_badge}
          </span>
          <button
            onClick={onDelete}
            className="p-1 px-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
            title={t.dash_need_delete_tooltip}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Input box specifically for modifying the actual raised dollars amount to correct double/fake inputs */}
        <div className="flex items-center gap-1.5 pt-1">
          <div className="relative">
            <input
              type="number"
              min="0"
              max={need.cost}
              value={localAmount}
              onChange={(e) => setLocalAmount(Math.max(0, Math.min(need.cost, Number(e.target.value))))}
              className="w-20 px-1.5 py-1 text-xs border border-slate-200 rounded-lg bg-white font-mono font-bold text-slate-800 text-end"
            />
            <span className="absolute left-1.5 inset-y-0 flex items-center text-[10px] text-slate-400 font-mono">$</span>
          </div>
          <button
            onClick={handleUpdate}
            type="button"
            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-extrabold rounded-lg shadow-3xs cursor-pointer active:scale-95 transition"
          >
            {t.edit_collected_amount_btn}
          </button>
        </div>
        {showSuccess && (
          <span className="text-[9px] text-emerald-600 font-extrabold animate-pulse">
            ✓ {t.edit_collected_amount_success}
          </span>
        )}
      </div>
    </div>
  );
};

export const BeneficiaryDashboard: React.FC = () => {
  const {
    currentBeneficiary,
    beneficiaries,
    currentNeeds,
    challenges,
    notifications,
    login,
    logout,
    updateProfile,
    addChallenge,
    updateChallenge,
    deleteChallenge,
    addUrgentNeed,
    deleteUrgentNeed,
    updateNeedCollectedAmount,
    markAllNotificationsAsRead,
    setActiveTab,
    language
  } = useSanad();

  const navigate = useNavigate();
  const location = useLocation();

  const t = translations[language];
  const isEn = language === 'en';

  // Redirect to private ID-based dashboard path if logged in on generic /dashboard
  useEffect(() => {
    if (currentBeneficiary && (location.pathname === '/dashboard' || location.pathname === '/dashboard/')) {
      navigate(`/dashboard/${currentBeneficiary.dashboardSlug || currentBeneficiary.id}`, { replace: true });
    }
  }, [currentBeneficiary, location.pathname, navigate]);

  // Authentication states
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Profile setup states
  const [profileName, setProfileName] = useState<string>('');
  const [profileUsername, setProfileUsername] = useState<string>('');
  const [profileLocation, setProfileLocation] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [profileDesc, setProfileDesc] = useState<string>('');
  const [profileDonated, setProfileDonated] = useState<number>(0);
  const [profileSpent, setProfileSpent] = useState<number>(0);
  const [profileCampUrl, setProfileCampUrl] = useState<string>('');
  const [profileSavedMsg, setProfileSavedMsg] = useState<boolean>(false);
  const [profileIsSaving, setProfileIsSaving] = useState<boolean>(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  // Publish challenge states
  const [chalTitle, setChalTitle] = useState<string>('');
  const [chalText, setChalText] = useState<string>('');
  const [chalImageUrl, setChalImageUrl] = useState<string>('');
  const [chalImageUrls, setChalImageUrls] = useState<string[]>([]);
  const [chalAddedSuccess, setChalAddedSuccess] = useState<boolean>(false);
  const [chalIsSaving, setChalIsSaving] = useState<boolean>(false);
  const [chalSaveError, setChalSaveError] = useState<string | null>(null);

  // Add urgent need states
  const [needTitle, setNeedTitle] = useState<string>('');
  const [needDesc, setNeedDesc] = useState<string>('');
  const [needCost, setNeedCost] = useState<number>(100);
  const [needImageUrl, setNeedImageUrl] = useState<string>('');
  const [needImageUrls, setNeedImageUrls] = useState<string[]>([]);
  const [needCrowdfundUrl, setNeedCrowdfundUrl] = useState<string>('');
  const [needAddedSuccess, setNeedAddedSuccess] = useState<boolean>(false);
  const [needIsSaving, setNeedIsSaving] = useState<boolean>(false);
  const [needSaveError, setNeedSaveError] = useState<string | null>(null);

  // Edit existing challenge state
  const [editingChallenge, setEditingChallenge] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
  const [editIsSaving, setEditIsSaving] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isDragOverEdit, setIsDragOverEdit] = useState<boolean>(false);

  // Drag over state indicators
  const [isDragOverProfile, setIsDragOverProfile] = useState(false);
  const [isDragOverChal, setIsDragOverChal] = useState(false);
  const [isDragOverNeed, setIsDragOverNeed] = useState(false);

  // Tab state within the dashboard itself
  const [dashboardTab, setDashboardTab] = useState<'profile' | 'add_challenge' | 'add_need' | 'my_items' | 'notifications'>('my_items');
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);

  const handleTabChange = (tab: 'profile' | 'add_challenge' | 'add_need' | 'my_items' | 'notifications') => {
    setSelectedNotificationId(null);
    setDashboardTab(tab);
  };

  // Load family details when logged in - only run when the active family ID changes to prevent background database snapshots from erasing unsaved edits
  useEffect(() => {
    if (currentBeneficiary) {
      setProfileName(currentBeneficiary.name || '');
      setProfileUsername(currentBeneficiary.username || '');
      setProfileLocation(currentBeneficiary.location || '');
      setProfilePicture(currentBeneficiary.profilePicture || '');
      setProfileDesc(currentBeneficiary.description || '');
      setProfileDonated(currentBeneficiary.totalDonated || 0);
      setProfileSpent(currentBeneficiary.totalSpent || 0);
      setProfileCampUrl(currentBeneficiary.crowdfundingUrl || '');
    } else {
      setProfileName('');
      setProfileUsername('');
      setProfileLocation('');
      setProfilePicture('');
      setProfileDesc('');
      setProfileDonated(0);
      setProfileSpent(0);
      setProfileCampUrl('');
    }
  }, [currentBeneficiary?.id]);

  // Mark all private notifications as read when entering the notifications tab
  useEffect(() => {
    if (dashboardTab === 'notifications' && currentBeneficiary) {
      markAllNotificationsAsRead();
    }
  }, [dashboardTab, currentBeneficiary?.id]);

  // Trigger login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const success = login(password.trim());
    if (success) {
      setPassword('');
      setAuthError(null);
      setDashboardTab('profile');
    } else {
      setAuthError(isEn ? 'Please submit a valid passcode.' : 'يرجى إدخال رمز مرور صالح.');
    }
  };

  // Helper helper to handle file load, downscale and compress as local Base64 string to respect Firestore 1MB document limits
  const handleImageFileLoad = (file: File, setter: (base64: string) => void) => {
    if (!file.type.startsWith('image/')) {
      alert(isEn ? 'Please choose a valid image file!' : 'يجب اختيار ملف صورة صالح!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Limit maximum width or height to 450px to keep images extremely lightweight and fast to save
        const maxDim = 450;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress as lightweight JPEG with 0.5 quality factor (extremely reliable for Firestore limits)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);
          setter(compressedDataUrl);
        } else {
          setter(event.target?.result as string);
        }
      };
      img.onerror = () => {
        setter(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      console.error("FileReader failed to load image file");
    };
    reader.readAsDataURL(file);
  };

  const handleFileLoad = (file: File, setter: (base64: string) => void) => {
    if (file.type.startsWith('video/')) {
      (async () => {
        try {
          // Asynchronously check duration of the video
          const duration = await new Promise<number>((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
              window.URL.revokeObjectURL(video.src);
              resolve(video.duration);
            };
            video.onerror = () => {
              resolve(0);
            };
            video.src = URL.createObjectURL(file);
          });

          if (duration > 120) {
            alert(isEn
              ? 'The video duration exceeds the 2-minute limit! Please choose a video shorter than 2 minutes.'
              : 'مدة الفيديو تتجاوز دقيقتين! يرجى اختيار فيديو أقصر لتجنب مشاكل الحفظ عبر خوادم الويب.');
            return;
          }
        } catch (e) {
          console.error("Error checking video duration: ", e);
        }

        // Informative guidance on extremely large video sizes (e.g. > 30MB)
        if (file.size > 30 * 1024 * 1024) {
          alert(isEn
            ? 'This video file is very large (over 30MB). Please make sure to use a compressed video file so it saves successfully!'
            : 'حجم الفيديو كبير جداً (متجاوز ٣٠ ميجابايت). لضمان الحفظ الموثق والناجح، يرجى استخدام فيديو مضغوط ومناسب للحجم.');
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setter(event.target.result as string);
          }
        };
        reader.onerror = () => {
          console.error("FileReader failed to load video file");
        };
        reader.readAsDataURL(file);
      })();
    } else if (file.type.startsWith('image/')) {
      handleImageFileLoad(file, setter);
    } else {
      alert(isEn ? 'Please choose a valid image or video file!' : 'يرجى اختيار ملف صورة أو فيديو صالح!');
    }
  };

  // Drag & drop handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    setProfileIsSaving(true);
    setProfileSaveError(null);

    try {
      await updateProfile({
        name: profileName,
        username: profileUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
        location: profileLocation,
        profilePicture: profilePicture || 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=300',
        description: profileDesc,
        totalDonated: Number(profileDonated) || 0,
        totalSpent: Number(profileSpent) || 0,
        crowdfundingUrl: profileCampUrl
      });

      setProfileSavedMsg(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setProfileSavedMsg(false), 5000);
    } catch (err: any) {
      console.error("Save profile failed:", err);
      setProfileSaveError(isEn ? "Failed to save profile. Please fully check your network connections or use a smaller image file." : "فشل في حفظ الملف الشخصي. يرجى مراجعة الاتصال بالشبكة أو استخدام ملف صورة أصغر حجماً.");
    } finally {
      setProfileIsSaving(false);
    }
  };

  // Publish challenge
  const handlePublishChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chalTitle.trim() || !chalText.trim()) return;

    setChalIsSaving(true);
    setChalSaveError(null);

    try {
      await addChallenge(chalTitle, chalText, chalImageUrl || chalImageUrls[0] || '', chalImageUrls);
      setChalTitle('');
      setChalText('');
      setChalImageUrl('');
      setChalImageUrls([]);
      setChalAddedSuccess(true);
      setTimeout(() => setChalAddedSuccess(false), 4500);
    } catch (err: any) {
      console.error("Add challenge failed:", err);
      setChalSaveError(isEn ? "Failed to post update. Please try smaller images or reduce quality." : "لم يتم نشر التحديث بنجاح. يرجى تجربة ملفات صور أصغر لحفظ الملف الشخصي.");
    } finally {
      setChalIsSaving(false);
    }
  };

  // Publish need
  const handlePublishNeedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!needTitle.trim() || !needDesc.trim() || needCost <= 0) return;

    setNeedIsSaving(true);
    setNeedSaveError(null);

    try {
      await addUrgentNeed(
        needTitle,
        needDesc,
        needCost,
        needImageUrl || needImageUrls[0] || '',
        needCrowdfundUrl || profileCampUrl,
        needImageUrls
      );

      setNeedTitle('');
      setNeedDesc('');
      setNeedCost(100);
      setNeedImageUrl('');
      setNeedImageUrls([]);
      setNeedCrowdfundUrl('');
      setNeedAddedSuccess(true);
      setTimeout(() => setNeedAddedSuccess(false), 4500);
    } catch (err: any) {
      console.error("Add need failed:", err);
      setNeedSaveError(isEn ? "Failed to publish need. Check connections or reduce photo sizes." : "فشل في نشر الاحتياج العاجل. تحقق من اتصالك أو قلل حجم الصور.");
    } finally {
      setNeedIsSaving(false);
    }
  };

  // Filter items specifically created by this logged-in beneficiary
  const myNeeds = currentNeeds.filter(n => n.beneficiaryId === currentBeneficiary?.id);
  const myChallenges = challenges.filter(c => c.beneficiaryId === currentBeneficiary?.id);

  // If not logged-in, render Simulated Login Prompt view with accounts listed as actionable options
  if (!currentBeneficiary) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-start px-4 space-y-12 animate-none" id="login_form_container">
        
        {/* Main interactive card for password login */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-lg mx-auto overflow-hidden">
          <div className="p-1 w-full bg-linear-to-r from-emerald-500 to-teal-600"></div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100/80 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-emerald-200/50">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-teal-950">
                {isEn ? 'Families Updates Portal' : 'بوابة العائلات والتحديث المباشر'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                {isEn 
                  ? 'Please enter the secure passcode provided to you by the platform administrator to log in.' 
                  : 'الرجاء إدخال رمز المرور الآمن الممنوح لك من قبل مدير المنصة للدخول إلى حسابك وتحديث بياناتك.'} 
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2 text-start">
                <label className="block text-xs font-bold text-slate-700">
                  {isEn ? 'Family Secret Passcode *' : 'كلمة المرور الخاصة بالعائلة *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isEn ? 'Enter your secure passcode...' : 'أدخل رمز المرور الآمن الخاص بك...'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 focus:bg-white text-slate-950 text-sm outline-hidden text-start font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal transition"
                />
              </div>

              {authError && (
                <div className="bg-red-50 text-red-700 p-3.5 rounded-2xl border border-red-100 text-xs flex items-center gap-2.5 animate-none text-start">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-md shadow-emerald-250 active:scale-[0.99] cursor-pointer"
              >
                {t.mobile_login_button}
              </button>
            </form>
          </div>
        </div>

      </div>
    );
  }

  // Logged-in family view! Render Dashboard Controls
  return (
    <div className="space-y-8 py-8 text-start max-w-6xl mx-auto px-4 animate-none" id="logged_in_dashboard">
      
      {/* Welcome Banner Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-emerald-600 rounded-3xl text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md shadow-emerald-200 text-start">
        <div className="flex items-center gap-4">
          <img
            src={currentBeneficiary.profilePicture || 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=300'}
            alt={currentBeneficiary.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white/60 shadow-md shrink-0"
          />
          <div>
            <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border border-white/5">{t.dash_header_shield}</span>
            <h2 className="text-xl sm:text-2xl font-extrabold mt-1">{t.dash_header_welcome} {currentBeneficiary.name || (isEn ? 'Custom Family Profile' : 'كيان العائلة المخصص')}</h2>
            <p className="text-emerald-50 text-xs mt-1">
              {t.dash_header_location} <span className="font-extrabold">{currentBeneficiary.location || (isEn ? 'Awaiting Area setup' : 'بانتظار تحديد المنطقة')}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
          >
            <span>{t.dash_header_view_public}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="p-3 bg-red-650 hover:bg-red-700 rounded-2xl text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            title={t.logout_tooltip}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Internal Dashboard Tabs buttons */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-start">
        <button
          onClick={() => handleTabChange('my_items')}
          className={`px-4.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
            dashboardTab === 'my_items'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>{t.dash_tab_published} ({myNeeds.length + myChallenges.length})</span>
        </button>
        <button
          onClick={() => handleTabChange('profile')}
          className={`px-4.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
            dashboardTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>{t.dash_tab_profile}</span>
        </button>
        <button
          onClick={() => handleTabChange('add_challenge')}
          className={`px-4.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
            dashboardTab === 'add_challenge'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>{t.dash_tab_add_chal}</span>
        </button>
        <button
          onClick={() => handleTabChange('add_need')}
          className={`px-4.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
            dashboardTab === 'add_need'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>{t.dash_tab_add_need}</span>
        </button>
        <button
          onClick={() => handleTabChange('notifications')}
          className={`px-4.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
            dashboardTab === 'notifications'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Bell className="w-4 h-4 text-emerald-600" />
          <span>{isEn ? 'Family Private Notifications' : 'سجل الإشعارات العائلية الخاصة'}</span>
          {notifications.filter(n => n.beneficiaryId === currentBeneficiary?.id).length > 0 && (
            <span className="bg-emerald-100 text-emerald-850 text-[9px] font-black font-mono rounded-full px-2 py-0.5 animate-pulse border border-emerald-250 shrink-0">
              {notifications.filter(n => n.beneficiaryId === currentBeneficiary?.id).length}
            </span>
          )}
        </button>
      </div>

      {/* Dynamic subpages layouts depending on active dashboard tab */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs">
        
        {/* TAB 1: MY ENTRIES VIEW */}
        {dashboardTab === 'my_items' && (
          <div className="space-y-8 animate-none text-start" id="subview_my_items">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-start">
              <div>
                <h3 className="text-lg font-black text-slate-900">{t.dash_items_heading}</h3>
                <p className="text-xs text-slate-500 mt-1">{t.dash_items_subheading}</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 pr-4 pl-3 py-1.5 rounded-full border border-slate-200 text-xs">
                <span className="font-extrabold text-slate-700">{t.dash_items_total_donated}</span>
                <span className="font-mono text-emerald-600 font-bold">${currentBeneficiary.totalDonated}</span>
              </div>
            </div>

            {/* List needs with direct edit capabilities (combating double-payments) */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <h4 className="text-sm font-extrabold text-teal-950 flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-emerald-500" />
                  <span>{t.dash_active_needs_heading} ({myNeeds.length})</span>
                </h4>
                <p className="text-[10px] text-zinc-500 bg-amber-50 border border-amber-100/50 p-1.5 rounded-lg max-w-md text-start">
                  💡 {t.edit_collected_amount_hint}
                </p>
              </div>
              
              {myNeeds.length === 0 ? (
                <div className="text-xs text-slate-400 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center">{t.dash_needs_empty}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myNeeds.map(need => (
                    <NeedItemRow
                      key={need.id}
                      need={need}
                      onDelete={() => {
                        deleteUrgentNeed(need.id);
                      }}
                      onUpdateAmount={(amt) => {
                        updateNeedCollectedAmount(need.id, amt);
                      }}
                      isEn={isEn}
                      t={t}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* List challenges */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-extrabold text-teal-950 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>{t.dash_chal_heading} ({myChallenges.length})</span>
              </h4>
              
              {myChallenges.length === 0 ? (
                <div className="text-xs text-slate-400 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center">{t.dash_chal_empty}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myChallenges.map(chal => (
                    <div key={chal.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between gap-4 text-start">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {chal.imageUrl && <img src={chal.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100" />}
                        <div className="overflow-hidden">
                          <h5 className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">{chal.title}</h5>
                          <p className="text-[10px] text-slate-400 truncate mt-1">{chal.text}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 rounded-md">
                          {chal.likes} ❤️
                        </span>
                        <button
                          onClick={() => {
                            setEditingChallenge(chal);
                            setEditTitle(chal.title || '');
                            setEditDesc(chal.text || '');
                            setEditImageUrls(chal.imageUrls || (chal.imageUrl ? [chal.imageUrl] : []));
                            setEditError(null);
                          }}
                          className="p-1 px-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-800 rounded-lg transition"
                          title={isEn ? "Edit Post" : "تعديل المنشور"}
                        >
                          <PenLine className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            deleteChallenge(chal.id);
                          }}
                          className="p-1 px-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
                          title={t.dash_chal_delete_tooltip}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: PROFILE SETUP EDITOR */}
        {dashboardTab === 'profile' && (
          <form onSubmit={handleProfileSave} className="space-y-6 animate-none text-start" id="subview_profile">
            <div>
              <h3 className="text-lg font-black text-slate-900">{t.p_edit_title}</h3>
              <p className="text-xs text-slate-500 mt-1">{t.p_edit_sub}</p>
            </div>

            {profileSavedMsg && (
              <div className="bg-emerald-50 border border-emerald-300 text-teal-900 p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm text-start">
                <CheckCircle className="w-5 h-5 text-emerald-800 shrink-0" />
                <span>{t.p_edit_saved_success}</span>
              </div>
            )}

            {profileSaveError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm text-start">
                <AlertCircle className="w-5 h-5 text-red-650 shrink-0" />
                <span>{profileSaveError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">{t.p_label_name}</label>
                <input
                  type="text"
                  required
                  placeholder={t.p_placeholder_name}
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 bg-slate-50 focus:bg-white text-slate-900 text-sm outline-hidden text-start"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">{t.p_label_location}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={t.p_placeholder_location}
                    value={profileLocation}
                    onChange={(e) => setProfileLocation(e.target.value)}
                    className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white text-slate-900 text-sm outline-hidden text-start"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isEn ? 'Unique Username (e.g. for user/ahmad)' : 'اسم المستخدم الفريد (للرابط المباشر)'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none text-xs font-mono">
                    @
                  </span>
                  <input
                    type="text"
                    placeholder={isEn ? 'lowercase, no spaces...' : 'أحرف إنجليزية صغيرة، بدون فراغات...'}
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white text-slate-900 text-sm outline-hidden text-start font-mono"
                  />
                </div>
              </div>

            </div>

            {/* Financial tracking inputs (كم تبرع، كم صرف) */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-205 space-y-4 text-start">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Coins className="w-4 h-4 text-emerald-500" />
                <span>{t.p_stats_title}</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-600">{t.p_label_donated}</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={profileDonated}
                    onChange={(e) => setProfileDonated(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 bg-white font-mono font-bold text-emerald-600 text-start"
                  />
                  <p className="text-[10px] text-slate-450 leading-relaxed">{t.p_desc_donated}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-600">{t.p_label_spent}</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={profileSpent}
                    onChange={(e) => setProfileSpent(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 bg-white font-mono font-bold text-red-650 text-start"
                  />
                  <p className="text-[10px] text-slate-450 leading-relaxed">{t.p_desc_spent}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-600">{t.p_label_remaining}</label>
                  <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono font-bold text-teal-850 text-sm flex items-center justify-between">
                    <span>${profileDonated - profileSpent}</span>
                    <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">{t.p_remaining_badge}</span>
                  </div>
                  <p className="text-[10px] text-slate-450 leading-relaxed">{t.p_desc_remaining}</p>
                </div>

              </div>
            </div>

            {/* Campaign URL Link */}
            <div className="space-y-1.5 text-start">
              <label className="block text-xs font-bold text-slate-700">{t.p_label_camp_url}</label>
              <input
                type="url"
                required
                placeholder="https://www.gofundme.com/f/gaza-family-help"
                value={profileCampUrl}
                onChange={(e) => setProfileCampUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm outline-hidden text-start font-mono"
              />
              <p className="text-[10px] text-slate-405 leading-relaxed">{t.p_desc_camp_url}</p>
            </div>

            {/* Image Selector & Drag-and-drop Area */}
            <div className="space-y-2 text-start">
              <label className="block text-xs font-bold text-slate-700">{t.p_label_image}</label>
              
              <div 
                onDragOver={onDragOver}
                onDragLeave={() => setIsDragOverProfile(false)}
                onDragEnter={() => setIsDragOverProfile(true)}
                onDrop={(e) => {
                  setIsDragOverProfile(false);
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleImageFileLoad(file, setProfilePicture);
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  isDragOverProfile 
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900' 
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
                onClick={() => document.getElementById('profileFileSelector')?.click()}
              >
                <input 
                  type="file" 
                  id="profileFileSelector" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageFileLoad(file, setProfilePicture);
                  }}
                />
                
                {profilePicture ? (
                  <div className="space-y-3 relative group">
                    <img src={profilePicture} alt="معاينة الملف الشخصي" className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100 mx-auto" />
                    <p className="text-xs text-emerald-600 font-bold">{t.p_image_success}</p>
                    <p className="text-[10px] text-slate-400">{t.p_image_helper}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mb-2 text-slate-400 transition" />
                    <p className="text-xs font-bold leading-relaxed">{t.p_image_drag}</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{t.p_image_base64_note}</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-1.5 text-start">
              <label className="block text-xs font-bold text-slate-700">{t.p_label_desc}</label>
              <textarea
                rows={4}
                placeholder={t.p_placeholder_desc}
                value={profileDesc}
                onChange={(e) => setProfileDesc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white text-slate-900 text-sm outline-hidden resize-none leading-relaxed text-start"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileIsSaving}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-7 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                {profileIsSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{isEn ? "Saving..." : "جاري الحفظ..."}</span>
                  </>
                ) : (
                  <span>{t.p_save_btn}</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: PUBLISH A CHALLENGE OR DIARY */}
        {dashboardTab === 'add_challenge' && (
          <form onSubmit={handlePublishChallengeSubmit} className="space-y-6 animate-none text-start" id="subview_add_challenge">
            <div>
              <h3 className="text-lg font-black text-slate-900">{t.chal_add_title}</h3>
              <p className="text-xs text-slate-500 mt-1">{t.chal_add_sub}</p>
            </div>

            {chalAddedSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 text-start">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{t.chal_add_success}</span>
              </div>
            )}

            {chalSaveError && (
              <div className="bg-red-50 border border-red-250 text-red-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 text-start">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{chalSaveError}</span>
              </div>
            )}

            <div className="space-y-4 text-start">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">{t.chal_add_label_title}</label>
                <input
                  type="text"
                  required
                  placeholder={t.chal_add_placeholder_title}
                  value={chalTitle}
                  onChange={(e) => setChalTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white text-slate-900 text-sm outline-hidden text-start"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">{t.chal_add_label_text}</label>
                <textarea
                  rows={5}
                  required
                  placeholder={t.chal_add_placeholder_text}
                  value={chalText}
                  onChange={(e) => setChalText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white text-slate-900 text-sm outline-hidden resize-none leading-relaxed text-start"
                ></textarea>
              </div>

              {/* Drag & drop images/videos for challenges */}
              <div className="space-y-3 text-start">
                <label className="block text-xs font-bold text-slate-700">
                  {isEn ? 'Pictures / Video Documentaries (Allows Multiple) *' : 'الصور المرفقة / مقاطع الفيديو التوثيقية للتصديق (يدعم رفع صور ومقاطع فيديو) *'}
                </label>
                <div 
                  onDragOver={onDragOver}
                  onDragLeave={() => setIsDragOverChal(false)}
                  onDragEnter={() => setIsDragOverChal(true)}
                  onDrop={(e) => {
                    setIsDragOverChal(false);
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const files = Array.from(e.dataTransfer.files) as File[];
                      files.forEach(file => {
                        handleFileLoad(file, (base64) => {
                          setChalImageUrls(prev => [...prev, base64]);
                        });
                      });
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                    isDragOverChal 
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900' 
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                  onClick={() => document.getElementById('chalFileSelector')?.click()}
                >
                  <input 
                    type="file" 
                    id="chalFileSelector" 
                    className="hidden" 
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const files = Array.from(e.target.files) as File[];
                        files.forEach(file => {
                          handleFileLoad(file, (base64) => {
                            setChalImageUrls(prev => [...prev, base64]);
                          });
                        });
                      }
                    }}
                  />
                  
                  <>
                    <Upload className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="text-xs font-bold leading-relaxed">{isEn ? 'Drag & drop multiple images/videos or click to select' : 'اسحب وأفلت عدة صور وصوتيات أو فيديو للتوثيق هنا أو اضغط للاختيار من جهازك'}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{isEn ? 'Images are optimized automatically. Keep videos under 2 minutes.' : 'يتم تحسين الصور تلقائياً. يرجى إبقاء مدة الفيديوهات أقل من دقيقتين لصلاحية النشر.'}</p>
                  </>
                </div>

                {/* Uploaded images display card grid with Delete capability */}
                {chalImageUrls.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-slate-500">
                      {isEn ? `Uploaded Files (${chalImageUrls.length}):` : `الملفات المرفوعة حالياً (${chalImageUrls.length}):`}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                      {chalImageUrls.map((url, idx) => {
                        const isVideo = url && (url.startsWith('data:video/') || url.includes('video/') || url.toLowerCase().match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/));
                        return (
                          <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                            {isVideo ? (
                              <video src={url} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setChalImageUrls(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="absolute top-1.5 right-1.5 bg-red-550 hover:bg-red-600 text-white rounded-full p-1 opacity-95 hover:opacity-100 hover:scale-105 transition active:scale-95 cursor-pointer shadow-xs z-10"
                              title={isEn ? "Remove item" : "إزالة الملف"}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            {isVideo && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                <span className="bg-white/80 rounded-full p-1 shadow-xs">
                                  <svg className="w-3.5 h-3.5 text-slate-800" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={chalIsSaving}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-7 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                {chalIsSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{isEn ? "Posting..." : "جاري النشر..."}</span>
                  </>
                ) : (
                  <span>{t.chal_add_btn}</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: ADD AN URGENT FINANCIAL NEED */}
        {dashboardTab === 'add_need' && (
          <form onSubmit={handlePublishNeedSubmit} className="space-y-6 animate-none text-start" id="subview_add_need">
            <div>
              <h3 className="text-lg font-black text-slate-900">{t.need_add_title}</h3>
              <p className="text-xs text-slate-500 mt-1">{t.need_add_sub}</p>
            </div>

            {needAddedSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 text-start">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{t.need_add_success}</span>
              </div>
            )}

            {needSaveError && (
              <div className="bg-red-50 border border-red-255 text-red-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 text-start">
                <AlertCircle className="w-5 h-5 text-red-650 shrink-0" />
                <span>{needSaveError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">{t.need_add_label_title}</label>
                <input
                  type="text"
                  required
                  placeholder={t.need_add_placeholder_title}
                  value={needTitle}
                  onChange={(e) => setNeedTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white text-slate-900 text-sm outline-hidden text-start"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">{t.need_add_label_cost}</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10000"
                  placeholder="Example: 150"
                  value={needCost}
                  onChange={(e) => setNeedCost(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white text-slate-900 text-sm outline-hidden font-mono font-bold text-start"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">{t.need_add_label_url}</label>
                <input
                  type="url"
                  placeholder="https://www.gofundme.com..."
                  value={needCrowdfundUrl}
                  onChange={(e) => setNeedCrowdfundUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm outline-hidden text-start font-mono"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end text-start">
                <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-100 p-2 py-2.5 rounded-xl block leading-relaxed font-bold">
                  {t.need_add_url_tip}
                </span>
              </div>

            </div>

            {/* Drag & drop images for needs */}
            <div className="space-y-3 text-start">
              <label className="block text-xs font-bold text-slate-700">
                {isEn ? 'Pictures / Documentaries (Allows Multiple) *' : 'الصور المرفقة / التوثيق الميداني للسلعة المحتاجة (يدعم رفع عدة صور) *'}
              </label>
              <div 
                onDragOver={onDragOver}
                onDragLeave={() => setIsDragOverNeed(false)}
                onDragEnter={() => setIsDragOverNeed(true)}
                onDrop={(e) => {
                  setIsDragOverNeed(false);
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const files = Array.from(e.dataTransfer.files) as File[];
                    files.forEach(file => {
                      handleImageFileLoad(file, (base64) => {
                        setNeedImageUrls(prev => [...prev, base64]);
                      });
                    });
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  isDragOverNeed 
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900' 
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
                onClick={() => document.getElementById('needFileSelector')?.click()}
              >
                <input 
                  type="file" 
                  id="needFileSelector" 
                  className="hidden" 
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const files = Array.from(e.target.files) as File[];
                      files.forEach(file => {
                        handleImageFileLoad(file, (base64) => {
                          setNeedImageUrls(prev => [...prev, base64]);
                        });
                      });
                    }
                  }}
                />
                
                <>
                  <Upload className="w-8 h-8 mb-2 text-slate-400" />
                  <p className="text-xs font-bold leading-relaxed">{isEn ? 'Drag & drop multiple images or click to select' : 'اسحب وأفلت عدة صور للتوثيق هنا أو اضغط للاختيار من جهازك'}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{isEn ? 'Images are compressed to ensure optimized lightweight sizes' : 'سيتم ضغط الصور تلقائياً لتسهيل وسرعة الرفع البرمجي'}</p>
                </>
              </div>

              {/* Uploaded images display card grid with Delete capability */}
              {needImageUrls.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black text-slate-500">
                    {isEn ? `Uploaded Files (${needImageUrls.length}):` : `الملفات المرفوعة حالياً (${needImageUrls.length}):`}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                    {needImageUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-white">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNeedImageUrls(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-1.5 right-1.5 bg-red-550 hover:bg-red-650 text-white rounded-full p-1 opacity-90 hover:opacity-100 hover:scale-105 transition active:scale-95 cursor-pointer shadow-xs"
                          title={isEn ? "Remove photo" : "إزالة الصورة"}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-start">
              <label className="block text-xs font-bold text-slate-700">{isEn ? 'Detailed description of the need and utility *' : 'شرح وتفصيل الاحتياج وتأثير سده على تماسك عائلتك *'}</label>
              <textarea
                rows={4}
                required
                placeholder={isEn ? 'Describe items you will purchase, and how they secure shelter, medical health or nutrition...' : 'صف السلع التي ستقوم بشرائها بهذا التمويل، وكيف ستنقذ الأطفال من عواقب هذا النقض...'}
                value={needDesc}
                onChange={(e) => setNeedDesc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white text-slate-900 text-sm outline-hidden resize-none leading-relaxed text-start"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={needIsSaving}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-7 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                {needIsSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{isEn ? "Publishing..." : "جاري النشر..."}</span>
                  </>
                ) : (
                  <span>{t.need_add_btn}</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 5: PRIVATE FAMILY NOTIFICATIONS */}
        {dashboardTab === 'notifications' && (
          selectedNotificationId ? (
            // DEDICATED SEPARATE PAGE FOR A SELECTED NOTIFICATION ("صفحة لحال")
            (() => {
              const notif = notifications.find(n => n.id === selectedNotificationId);
              if (!notif) return null;

              let Icon = Heart;
              let bgClass = 'bg-rose-50 text-rose-600 border-rose-100';
              let typeTitle = isEn ? 'Heartbeat Solidarity' : 'نبضة دعم تضامنية';
              
              if (notif.type === 'donation') {
                Icon = Coins;
                bgClass = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                typeTitle = isEn ? 'Financial Support / Donation' : 'دعم مالي وتبرع كريم';
              } else if (notif.type === 'comment' || notif.type === 'reply') {
                Icon = MessageCircle;
                bgClass = 'bg-sky-50 text-sky-600 border-sky-100';
                typeTitle = isEn ? 'New Response/Comment' : 'تعليق تفاعلي جديد';
              } else if (notif.type === 'hope_message') {
                Icon = Sparkles;
                bgClass = 'bg-amber-50 text-amber-600 border-amber-100';
                typeTitle = isEn ? 'Sincere Message of Hope' : 'رسالة أمل صادقة';
              }

              return (
                <div className="space-y-8 animate-none text-start" id="view_single_notification_detail">
                  {/* Header controls */}
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <button
                      onClick={() => setSelectedNotificationId(null)}
                      className="px-4 py-2 bg-slate-150 text-slate-700 hover:bg-slate-200 transition-all rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200"
                    >
                      <span>{isEn ? '← Back to Alerts Lists' : '← العودة لقائمة الإشعارات'}</span>
                    </button>
                    <span className="text-[10px] sm:text-xs font-extrabold px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-sans tracking-wider uppercase">
                      {typeTitle}
                    </span>
                  </div>

                  {/* Centered Premium Content Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xs relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50/50 rounded-full blur-2xl"></div>
                    
                    {/* Pulsing visual element icon */}
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl border shrink-0 flex items-center justify-center animate-bounce ${bgClass}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">
                          {isEn ? 'ALERT INFOPULSE' : 'تفاصيل نبضة التنبيه المستلمة'}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                          ID: {notif.id}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 font-sans">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                        {language === 'ar' ? notif.titleAr : notif.titleEn}
                      </h2>
                      <div className="bg-white border border-slate-150 rounded-2xl p-4.5 text-xs sm:text-sm text-slate-700 font-bold leading-relaxed shadow-xs">
                        {language === 'ar' ? notif.messageAr : notif.messageEn}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                        <span className="font-extrabold">{isEn ? 'Status:' : 'حالة الإشعار:'}</span>
                        <span className="bg-emerald-50 text-emerald-800 font-black px-2 py-0.5 rounded-md">
                          {isEn ? 'Read & Verified' : 'تم الاطلاع والتثبيت'}
                        </span>
                      </div>
                      <span className="font-mono text-[11px]">
                        {new Date(notif.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                  </div>

                  {/* Context-aware suggestions shortcuts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <button
                      onClick={() => {
                        if (notif.type === 'donation') {
                          handleTabChange('profile');
                        } else if (notif.type === 'comment' || notif.type === 'reply') {
                          setActiveTab('challenges');
                        } else {
                          setActiveTab('home');
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-3.5 px-4 text-xs sm:text-sm font-black shadow-md shadow-emerald-100 transition duration-300 cursor-pointer active:scale-95"
                    >
                      {notif.type === 'donation' && (
                        <>
                          <Coins className="w-4 h-4" />
                          <span>{isEn ? 'View crowdfunding updates' : 'متابعة مسار الصرف ودعم الحملة'}</span>
                        </>
                      )}
                      {(notif.type === 'comment' || notif.type === 'reply') && (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          <span>{isEn ? 'Go to solidarity challenges' : 'الذهاب لساحة التحديات التضامنية للرد'}</span>
                        </>
                      )}
                      {notif.type !== 'donation' && notif.type !== 'comment' && notif.type !== 'reply' && (
                        <>
                          <Heart className="w-4 h-4" />
                          <span>{isEn ? 'Return to public feeds' : 'تصفح ساحة النبض التضامني'}</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setSelectedNotificationId(null)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-3.5 px-4 text-xs sm:text-sm font-extrabold transition duration-300 cursor-pointer active:scale-95 border border-slate-200"
                    >
                      {isEn ? 'Return to previous active list' : 'العودة لقائمة التنبيهات الكلية'}
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="space-y-6 animate-none text-start" id="subview_private_notifications">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {isEn ? 'Private Family Alerts & Logs' : 'سجل التنبيهات والنبضات التضامنية الخاصة'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isEn 
                    ? 'All solidarity support actions, comment notifications, and direct interactions belonging specifically to your family feed.' 
                    : 'جميع التنبيهات، التعليقات الجديدة، علامات الدعم، ونبضات الدعم التضامني الموجهة لصفحتكم الخاصة.'}
                </p>
              </div>

              <div className="divide-y divide-slate-150 bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {notifications.filter(n => n.beneficiaryId === currentBeneficiary?.id).length === 0 ? (
                  <div className="text-center text-slate-400 py-16 text-xs sm:text-sm font-semibold">
                    {isEn ? 'No solidarity alerts recorded yet.' : 'لا توجد تنبيهات تضامنية مسجلة لعائلتكم بعد.'}
                  </div>
                ) : (
                  notifications
                    .filter(n => n.beneficiaryId === currentBeneficiary?.id)
                    .map((notif) => {
                      let Icon = Heart;
                      let bgClass = 'bg-rose-50 text-rose-500 border-rose-100';
                      if (notif.type === 'donation') {
                        Icon = Coins;
                        bgClass = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                      } else if (notif.type === 'comment' || notif.type === 'reply') {
                        Icon = MessageCircle;
                        bgClass = 'bg-sky-50 text-sky-600 border-sky-100';
                      } else if (notif.type === 'hope_message') {
                        Icon = Sparkles;
                        bgClass = 'bg-amber-50 text-amber-600 border-amber-100';
                      }

                      return (
                        <div 
                          key={notif.id} 
                          onClick={() => setSelectedNotificationId(notif.id)}
                          className={`p-4 flex gap-3 text-start transition hover:bg-emerald-50/5 cursor-pointer active:bg-slate-100/50 ${
                            !notif.read ? 'bg-emerald-50/10 font-bold border-r-4 border-emerald-500' : ''
                          }`}
                        >
                          <div className={`p-2 rounded-xl border shrink-0 h-10 w-10 flex items-center justify-center ${bgClass}`}>
                            <Icon className="w-4.5 h-4.5 shrink-0" />
                          </div>
                          <div className="space-y-1 overflow-hidden font-sans flex-1">
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                                {language === 'ar' ? notif.titleAr : notif.titleEn}
                              </h5>
                              <span className="text-[9px] text-slate-400 shrink-0 font-mono">
                                {new Date(notif.timestamp).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-semibold line-clamp-1">
                              {language === 'ar' ? notif.messageAr : notif.messageEn}
                            </p>
                            <span className="text-[10px] text-emerald-650 hover:underline font-bold flex items-center gap-1.5 mt-0.5">
                              {language === 'ar' ? 'عرض تفاصيل النبضة ←' : 'View alert details ←'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )
        )}

      </div>

      {/* EDIT CHALLENGE MODAL OVERLAY */}
      {editingChallenge && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100 text-start animate-none">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {isEn ? 'Edit Update Post' : 'تعديل المنشور التوثيقي'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isEn 
                    ? 'Modify the details or multi-media attachments of your family story.' 
                    : 'تعديل البيانات والملفات المرفقة لقصة الصبر والتوثيق الخاصة بكم.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingChallenge(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable form) */}
            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 font-sans">
              {editError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
                  ⚠️ {editError}
                </div>
              )}

              {/* Edit Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isEn ? 'Post Heading Title *' : 'عنوان المنشور *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.chal_add_placeholder_title}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white text-slate-900 text-sm outline-hidden text-start font-bold"
                />
              </div>

              {/* Edit Text */}
              <div className="space-y-1.5 font-sans">
                <label className="block text-xs font-bold text-slate-700">
                  {isEn ? 'Post Paragraph text details *' : 'المحتوى أو تفاصيل قصة التوثيق *'}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={t.chal_add_placeholder_text}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white text-slate-900 text-sm outline-hidden resize-none leading-relaxed text-start"
                ></textarea>
              </div>

              {/* Edit Media Attachment (Images / Videos) */}
              <div className="space-y-3 text-start font-sans">
                <label className="block text-xs font-bold text-slate-700">
                  {isEn ? 'Pictures / Video Documentaries (Allows Multiple) *' : 'تحديث الصور المرفقة ومقاطع الفيديو التوثيقية (يدعم رفع صور ومقاطع فيديو) *'}
                </label>
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragOverEdit(true); }}
                  onDragLeave={() => setIsDragOverEdit(false)}
                  onDragEnter={() => setIsDragOverEdit(true)}
                  onDrop={(e) => {
                    setIsDragOverEdit(false);
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const files = Array.from(e.dataTransfer.files) as File[];
                      files.forEach(file => {
                        handleFileLoad(file, (base64) => {
                          setEditImageUrls(prev => [...prev, base64]);
                        });
                      });
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                    isDragOverEdit 
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900' 
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                  onClick={() => document.getElementById('editFileSelector')?.click()}
                >
                  <input 
                    type="file" 
                    id="editFileSelector" 
                    className="hidden" 
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const files = Array.from(e.target.files) as File[];
                        files.forEach(file => {
                          handleFileLoad(file, (base64) => {
                            setEditImageUrls(prev => [...prev, base64]);
                          });
                        });
                      }
                    }}
                  />
                  <Upload className="w-8 h-8 mb-2 text-slate-400" />
                  <p className="text-xs font-bold leading-relaxed">{isEn ? 'Drag & drop multiple files or click to add' : 'اسحب وأفلت عدة صور أو مقاطع فيديو للتوثيق هنا أو اضغط للاختيار من جهازك'}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">{isEn ? 'Videos must be under 2 minutes to save securely.' : 'الملفات التوثيقية. يرجى إبقاء مدة الفيديوهات أقل من دقيقتين.'}</p>
                </div>

                {/* Active list display with X to delete */}
                {editImageUrls.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-slate-500">
                      {isEn ? `Selected Attachments (${editImageUrls.length}):` : `الملفات المدرجة حالياً في التعديل (${editImageUrls.length}):`}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                      {editImageUrls.map((url, idx) => {
                        const isVid = url && (url.startsWith('data:video/') || url.includes('video/') || url.toLowerCase().match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/));
                        return (
                          <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                            {isVid ? (
                              <video src={url} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditImageUrls(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="absolute top-1.5 right-1.5 bg-red-550 hover:bg-red-650 text-white rounded-full p-1 opacity-95 hover:opacity-100 hover:scale-105 transition active:scale-95 cursor-pointer shadow-xs z-10"
                              title={isEn ? "Remove item" : "إزالة الملف"}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            {isVid && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                <span className="bg-white/80 rounded-full p-1 shadow-xs">
                                  <svg className="w-3.5 h-3.5 text-slate-800" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setEditingChallenge(null)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-2xl text-xs sm:text-sm font-bold cursor-pointer"
              >
                {isEn ? 'Cancel' : 'إلغاء الأمر'}
              </button>
              <button
                type="button"
                disabled={editIsSaving}
                onClick={async () => {
                  if (!editTitle.trim() || !editDesc.trim()) {
                    setEditError(isEn ? 'Please fill in all required fields!' : 'يرجى ملء جميع الحقول المطلوبة!');
                    return;
                  }
                  setEditIsSaving(true);
                  setEditError(null);
                  try {
                    await updateChallenge(editingChallenge.id, editTitle, editDesc, editImageUrls);
                    setEditingChallenge(null);
                  } catch (err: any) {
                    setEditError(err?.message || (isEn ? 'Failed to update challenge' : 'فشل تحديث المنشور'));
                  } finally {
                    setEditIsSaving(false);
                  }
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white transition rounded-2xl text-xs sm:text-sm font-black disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-100"
              >
                {editIsSaving 
                  ? (isEn ? 'Saving edits...' : 'جاري حفظ التعديل...') 
                  : (isEn ? 'Save Changes' : 'حفظ التعديلات الكلية')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
