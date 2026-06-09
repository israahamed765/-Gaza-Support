import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BeneficiaryProfile, Challenge, UrgentNeed, HopeMessage, ActiveTab, Comment, Reply, SanadNotification } from '../types';
import { INITIAL_BENEFICIARIES, INITIAL_CHALLENGES, INITIAL_URGENT_NEEDS, INITIAL_HOPE_MESSAGES } from '../mockData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  onSnapshot
} from 'firebase/firestore';

interface SanadContextType {
  beneficiaries: BeneficiaryProfile[];
  currentNeeds: UrgentNeed[];
  challenges: Challenge[];
  hopeMessages: HopeMessage[];
  notifications: SanadNotification[];
  currentBeneficiary: BeneficiaryProfile | null; // Logged in family
  selectedFamilyId: string; // The family ID currently displayed on the platform
  setSelectedFamilyId: (id: string) => void;
  selectedFamily: BeneficiaryProfile | null; // Global selected or logged-in family
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  login: (password: string) => boolean;
  logout: () => void;
  updateProfile: (profile: Partial<BeneficiaryProfile>) => void;
  addChallenge: (title: string, text: string, imageUrl: string, imageUrls?: string[]) => void;
  updateChallenge: (id: string, title: string, text: string, imageUrls: string[]) => Promise<void>;
  deleteChallenge: (id: string) => void;
  addUrgentNeed: (title: string, description: string, cost: number, imageUrl: string, crowdfundingUrl: string, imageUrls?: string[]) => void;
  deleteUrgentNeed: (id: string) => void;
  supportNeed: (needId: string, amount: number) => void;
  likeChallenge: (challengeId: string) => void;
  addHopeMessage: (name: string, country: string, message: string) => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  updateNeedCollectedAmount: (needId: string, amount: number) => void;
  addCommentToChallenge: (challengeId: string, authorName: string, text: string, role?: 'visitor' | 'family' | 'admin', authorId?: string) => Promise<void>;
  deleteCommentFromChallenge: (challengeId: string, commentId: string) => Promise<void>;
  addReplyToChallenge: (challengeId: string, commentId: string, authorName: string, text: string, role?: 'visitor' | 'family' | 'admin', authorId?: string) => Promise<void>;
  deleteReplyFromChallenge: (challengeId: string, commentId: string, replyId: string) => Promise<void>;
  addCommentToNeed: (needId: string, authorName: string, text: string, role?: 'visitor' | 'family' | 'admin', authorId?: string) => Promise<void>;
  deleteCommentFromNeed: (needId: string, commentId: string) => Promise<void>;
  addReplyToNeed: (needId: string, commentId: string, authorName: string, text: string, role?: 'visitor' | 'family' | 'admin', authorId?: string) => Promise<void>;
  deleteReplyFromNeed: (needId: string, commentId: string, replyId: string) => Promise<void>;
  createNotification: (type: SanadNotification['type'], titleAr: string, titleEn: string, msgAr: string, msgEn: string, beneficiaryId?: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  stats: {
    totalDonationsTracked: number;
    totalActiveNeeds: number;
    totalSupportedFamilies: number;
  };
}

const SanadContext = createContext<SanadContextType | undefined>(undefined);

// Helper function to seed initial data in Firestore if empty
const seedDatabaseIfNeeded = async () => {
  try {
    const benSnap = await getDocs(collection(db, 'beneficiaries'));
    const seededIds: string[] = [];
    let hasOldMock = false;

    benSnap.forEach((docSnap) => {
      seededIds.push(docSnap.id);
      if (docSnap.id === 'f1') {
        hasOldMock = true;
      }
    });

    if (hasOldMock) {
      try {
        await deleteDoc(doc(db, 'beneficiaries', 'f1'));
        console.log("Successfully deleted old default mock family f1");
      } catch (err) {
        console.error("Failed to delete 'f1':", err);
      }
    }

    // Always seed the 20 slot accounts if they are not yet populated in the database
    for (const b of INITIAL_BENEFICIARIES) {
      const matchDoc = benSnap.docs.find(docSnap => docSnap.id === b.id);
      if (!matchDoc) {
        await setDoc(doc(db, 'beneficiaries', b.id), b);
      } else {
        const data = matchDoc.data() as BeneficiaryProfile;
        if (!data.dashboardSlug) {
          await updateDoc(doc(db, 'beneficiaries', b.id), { dashboardSlug: b.dashboardSlug });
        }
      }
    }

    const needsSnap = await getDocs(collection(db, 'currentNeeds'));
    if (needsSnap.empty) {
      for (const n of INITIAL_URGENT_NEEDS) {
        await setDoc(doc(db, 'currentNeeds', n.id), n);
      }
    }

    const chalSnap = await getDocs(collection(db, 'challenges'));
    if (chalSnap.empty) {
      for (const c of INITIAL_CHALLENGES) {
        await setDoc(doc(db, 'challenges', c.id), c);
      }
    }

    const hopeSnap = await getDocs(collection(db, 'hopeMessages'));
    if (hopeSnap.empty) {
      for (const hm of INITIAL_HOPE_MESSAGES) {
        await setDoc(doc(db, 'hopeMessages', hm.id), hm);
      }
    }
  } catch (error) {
    console.error("Firestore seeding failed:", error);
  }
};

export const SanadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTabState] = useState<ActiveTab>('home');
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryProfile[]>([]);
  const [currentNeeds, setCurrentNeeds] = useState<UrgentNeed[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [hopeMessages, setHopeMessages] = useState<HopeMessage[]>([]);
  const [notifications, setNotifications] = useState<SanadNotification[]>([]);
  const [currentBeneficiary, setCurrentBeneficiary] = useState<BeneficiaryProfile | null>(() => {
    const localCB = localStorage.getItem('sanad_current_beneficiary');
    if (localCB) {
      try {
        return JSON.parse(localCB) as BeneficiaryProfile;
      } catch (e) {
        console.error("Error parsing current beneficiary on init:", e);
      }
    }
    return null;
  });
  const [selectedFamilyId, setSelectedFamilyIdState] = useState<string>('f_slot_1');
  const [totalDonationsTracked, setTotalDonationsTracked] = useState(0);
  const [language, setLanguageState] = useState<'ar' | 'en'>('ar');

  const setLanguage = (lang: 'ar' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('sanad_language', lang);
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  };

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (tab === 'home') {
      navigate('/');
    } else {
      navigate('/' + tab);
    }
  };

  // Synchronize URL route developments back to Tab visual states
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/profile') || path.startsWith('/user')) {
      setActiveTabState('home');
    } else if (path === '/needs' || path.startsWith('/needs')) {
      setActiveTabState('needs');
    } else if (path === '/challenges' || path.startsWith('/challenges')) {
      setActiveTabState('challenges');
    } else if (path === '/hope' || path.startsWith('/hope')) {
      setActiveTabState('hope');
    } else if (path === '/dashboard' || path.startsWith('/dashboard')) {
      setActiveTabState('dashboard');
    }
  }, [location.pathname]);

  const setSelectedFamilyId = (id: string) => {
    setSelectedFamilyIdState(id);
    localStorage.setItem('sanad_selected_family_id', id);
  };

  // Set real-time Firestore listeners
  useEffect(() => {
    // Seed initial data first
    seedDatabaseIfNeeded();

    // 1. Listen to beneficiaries
    const unsubBen = onSnapshot(collection(db, 'beneficiaries'), (snap) => {
      const list: BeneficiaryProfile[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as BeneficiaryProfile);
      });
      setBeneficiaries(list);

      // Sync real-time updates for active logged-in session, if any, safely
      const localCB = localStorage.getItem('sanad_current_beneficiary');
      if (localCB) {
        try {
          const parsed = JSON.parse(localCB);
          const match = list.find(b => b.id === parsed.id);
          if (match) {
            // Only update active state if database contains different fields
            if (JSON.stringify(match) !== JSON.stringify(parsed)) {
              // AVOID OVERWRITING local updates mid-save or when database version is stale/cached/uninitialized
              const isDatabaseStale = (parsed.initialized && !match.initialized) 
                || (parsed.name && !match.name) 
                || (parsed.username && !match.username) 
                || (parsed.profilePicture && !match.profilePicture);

              if (isDatabaseStale) {
                console.log("Ignoring stale database snapshot to prevent resetting locally updated profile fields.");
              } else {
                setCurrentBeneficiary(match);
                localStorage.setItem('sanad_current_beneficiary', JSON.stringify(match));
              }
            }
          }
        } catch (e) {
          console.error("Error syncing login profile match from database:", e);
        }
      }
    }, (err) => {
      console.warn("Firestore snapshot connection issue: 'beneficiaries'. Serving from local cache: ", err);
    });

    // 2. Listen to needs
    const unsubNeeds = onSnapshot(collection(db, 'currentNeeds'), (snap) => {
      const list: UrgentNeed[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as UrgentNeed);
      });
      setCurrentNeeds(list);
    }, (err) => {
      console.warn("Firestore snapshot connection issue: 'currentNeeds'. Serving from local cache: ", err);
    });

    // 3. Listen to challenges
    const unsubChallenges = onSnapshot(collection(db, 'challenges'), (snap) => {
      const list: Challenge[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as Challenge);
      });
      // Sort newest challenges first using ID (temporal timestamp)
      list.sort((a, b) => b.id.localeCompare(a.id));
      setChallenges(list);
    }, (err) => {
      console.warn("Firestore snapshot connection issue: 'challenges'. Serving from local cache: ", err);
    });

    // 4. Listen to hope messages
    const unsubHope = onSnapshot(collection(db, 'hopeMessages'), (snap) => {
      const list: HopeMessage[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as HopeMessage);
      });
      // Sort newest hope messages first
      list.sort((a, b) => b.id.localeCompare(a.id));
      setHopeMessages(list);
    }, (err) => {
      console.warn("Firestore snapshot connection issue: 'hopeMessages'. Serving from local cache: ", err);
    });

    // 5. Listen to notifications
    const unsubNotifications = onSnapshot(collection(db, 'notifications'), (snap) => {
      const list: SanadNotification[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as SanadNotification);
      });
      // Sort newest first
      list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      setNotifications(list);
    }, (err) => {
      console.warn("Firestore snapshot connection issue: 'notifications'. Serving from local cache: ", err);
    });

    // Restore UI variables (language, selectedFamilyId, tracked donations)
    const localLanguage = localStorage.getItem('sanad_language') as 'ar' | 'en' | null;
    if (localLanguage === 'en') {
      setLanguageState('en');
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    } else {
      setLanguageState('ar');
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    }

    const localSelectedFamilyId = localStorage.getItem('sanad_selected_family_id');
    if (localSelectedFamilyId) {
      setSelectedFamilyIdState(localSelectedFamilyId);
    }

    const localDonations = localStorage.getItem('sanad_donations_tracked');
    if (localDonations) {
      setTotalDonationsTracked(Number(localDonations));
    }

    return () => {
      unsubBen();
      unsubNeeds();
      unsubChallenges();
      unsubHope();
      unsubNotifications();
    };
  }, []);

  // Sync to Storage helper
  const syncToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Auth/Login with restricted pre-authorized codes ONLY
  const login = (password: string): boolean => {
    const trimmedInput = password.trim();
    if (!trimmedInput) return false;

    const foundProfile = beneficiaries.find(
      b => b.password.toLowerCase() === trimmedInput.toLowerCase()
    );

    if (!foundProfile) {
      return false; // Access denied: code not found in seed slots
    }

    setCurrentBeneficiary(foundProfile);
    setSelectedFamilyId(foundProfile.id);
    syncToStorage('sanad_current_beneficiary', foundProfile);
    return true;
  };

  const logout = () => {
    setCurrentBeneficiary(null);
    localStorage.removeItem('sanad_current_beneficiary');
  };

  // Edit/Update Profile and propagate change to child documents in Firestore
  const updateProfile = async (profileUpdate: Partial<BeneficiaryProfile>) => {
    if (!currentBeneficiary) return;

    const updatedProfile = { 
      ...currentBeneficiary, 
      ...profileUpdate, 
      initialized: true // Activate slot officially upon configuration
    } as BeneficiaryProfile;
    setCurrentBeneficiary(updatedProfile);
    syncToStorage('sanad_current_beneficiary', updatedProfile);

    try {
      // 1. Save to beneficiaries collection
      await setDoc(doc(db, 'beneficiaries', updatedProfile.id), updatedProfile);

      // 2. Proactive batch update of associated urgent needs
      for (const n of currentNeeds) {
        if (n.beneficiaryId === updatedProfile.id) {
          const updatedN = {
            ...n,
            beneficiaryName: updatedProfile.name || n.beneficiaryName,
            beneficiaryLocation: updatedProfile.location || n.beneficiaryLocation,
          };
          await setDoc(doc(db, 'currentNeeds', n.id), updatedN);
        }
      }

      // 3. Proactive batch update of associated daily updates
      for (const c of challenges) {
        if (c.beneficiaryId === updatedProfile.id) {
          const updatedC = {
            ...c,
            beneficiaryName: updatedProfile.name || c.beneficiaryName,
            beneficiaryAvatar: updatedProfile.profilePicture || c.beneficiaryAvatar,
          };
          await setDoc(doc(db, 'challenges', c.id), updatedC);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `beneficiaries/${updatedProfile.id}`);
    }
  };

  // Add challenge survival update
  const addChallenge = async (title: string, text: string, imageUrl: string, imageUrls?: string[]) => {
    if (!currentBeneficiary) return;

    const defaultImages = [
      'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600'
    ];

    const finalImg = imageUrl.trim() || defaultImages[Math.floor(Math.random() * defaultImages.length)];
    const newId = 'c_' + Date.now();

    const newChallenge: Challenge = {
      id: newId,
      beneficiaryId: currentBeneficiary.id,
      beneficiaryName: currentBeneficiary.name,
      beneficiaryAvatar: currentBeneficiary.profilePicture,
      date: 'الآن',
      title,
      text,
      imageUrl: finalImg,
      imageUrls: imageUrls && imageUrls.length > 0 ? imageUrls : [finalImg],
      likes: 0
    };

    try {
      await setDoc(doc(db, 'challenges', newId), newChallenge);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `challenges/${newId}`);
    }
  };

  // Delete challenge
  const deleteChallenge = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'challenges', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `challenges/${id}`);
    }
  };

  // Update existing challenge
  const updateChallenge = async (id: string, title: string, text: string, imageUrls: string[]) => {
    try {
      const challengeRef = doc(db, 'challenges', id);
      const challengeSnap = await getDoc(challengeRef);
      if (challengeSnap.exists()) {
        const updateData: Partial<Challenge> = {
          title,
          text,
          imageUrls: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=600'],
          imageUrl: imageUrls[0] || 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=600',
        };
        await updateDoc(challengeRef, updateData);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `challenges/${id}`);
    }
  };

  // Add Urgent Need item
  const addUrgentNeed = async (title: string, description: string, cost: number, imageUrl: string, crowdfundingUrl: string, imageUrls?: string[]) => {
    if (!currentBeneficiary) return;

    const defaultNeedsImages = [
      'https://images.unsplash.com/photo-1594498653385-d527256341a6?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600'
    ];

    const finalImg = imageUrl.trim() || defaultNeedsImages[Math.floor(Math.random() * defaultNeedsImages.length)];
    const finalCampUrl = crowdfundingUrl.trim() || currentBeneficiary.crowdfundingUrl || 'https://www.gofundme.com';
    const newId = 'n_' + Date.now();

    const newNeed: UrgentNeed = {
      id: newId,
      beneficiaryId: currentBeneficiary.id,
      beneficiaryName: currentBeneficiary.name,
      beneficiaryLocation: currentBeneficiary.location,
      title,
      description,
      cost: Number(cost) || 100,
      imageUrl: finalImg,
      imageUrls: imageUrls && imageUrls.length > 0 ? imageUrls : [finalImg],
      crowdfundingUrl: finalCampUrl,
      collectedAmount: 0,
      isUrgent: true
    };

    try {
      await setDoc(doc(db, 'currentNeeds', newId), newNeed);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `currentNeeds/${newId}`);
    }
  };

  // Delete Urgent Need
  const deleteUrgentNeed = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'currentNeeds', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `currentNeeds/${id}`);
    }
  };

  // Create a real-time solidarity system notification in Firestore
  const createNotification = async (
    type: SanadNotification['type'],
    titleAr: string,
    titleEn: string,
    msgAr: string,
    msgEn: string,
    beneficiaryId?: string
  ) => {
    const newId = 'notif_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newNotif: SanadNotification = {
      id: newId,
      type,
      titleAr,
      titleEn,
      messageAr: msgAr,
      messageEn: msgEn,
      timestamp: new Date().toISOString(),
      read: false,
      beneficiaryId
    };
    try {
      await setDoc(doc(db, 'notifications', newId), newNotif);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `notifications/${newId}`);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      for (const n of notifications) {
        if (!n.read) {
          await updateDoc(doc(db, 'notifications', n.id), { read: true });
        }
      }
    } catch (err) {
      console.error("Failed marking notifications read:", err);
    }
  };

  // Support Need (donation action)
  const supportNeed = async (needId: string, amount: number) => {
    const need = currentNeeds.find(n => n.id === needId);
    if (!need) return;

    const nextAmt = Math.min(need.cost, need.collectedAmount + amount);
    const actualDonation = nextAmt - need.collectedAmount;

    try {
      if (actualDonation > 0) {
        const newDonationTotal = totalDonationsTracked + actualDonation;
        setTotalDonationsTracked(newDonationTotal);
        localStorage.setItem('sanad_donations_tracked', String(newDonationTotal));

        // Update totalDonated in family document
        const familyRef = doc(db, 'beneficiaries', need.beneficiaryId);
        const familySnap = await getDoc(familyRef);
        if (familySnap.exists()) {
          const familyObj = familySnap.data() as BeneficiaryProfile;
          const nextDonated = (familyObj.totalDonated || 0) + actualDonation;
          await updateDoc(familyRef, { totalDonated: nextDonated });
        }

        // Raise notification
        await createNotification(
          'donation',
          'تبرع جديد ملموس! ✨',
          'New Solidarity Support! ✨',
          `تم تقديم مساهمة تضامنية بقيمة $${actualDonation} لصالح الاحتياج "${need.title}" المقدم من عائلة ${need.beneficiaryName}.`,
          `A solidarity donation contribution of $${actualDonation} has been made toward urgent need "${need.title}" for family of ${need.beneficiaryName}.`,
          need.beneficiaryId
        );
      }

      await updateDoc(doc(db, 'currentNeeds', needId), { collectedAmount: nextAmt });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `currentNeeds/${needId}`);
    }
  };

  // Upvote/Like challenge survival diary entry
  const likeChallenge = async (challengeId: string) => {
    const item = challenges.find(c => c.id === challengeId);
    if (!item) return;

    try {
      const nextLikes = (item.likes || 0) + 1;
      await updateDoc(doc(db, 'challenges', challengeId), { likes: nextLikes });

      // Raise notification
      await createNotification(
        'like',
        'علامة مؤازرة وإعجاب! ❤️',
        'Solidarity salute received! ❤️',
        `تلقّى تحديث العائلة "${item.title}" من عائلة ${item.beneficiaryName} نقرة إعجاب مؤازرة جديدة.`,
        `The survivor diary "${item.title}" from family of ${item.beneficiaryName} has received a supporting like salute.`,
        item.beneficiaryId
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `challenges/${challengeId}`);
    }
  };

  // Add Wall of Hope messages
  const addHopeMessage = async (name: string, country: string, message: string) => {
    const stickyColors = [
      '#ecfdf5', // Emerald
      '#f0f9ff', // Sky
      '#fdf2f8', // Pink
      '#fffbeb', // Amber
      '#faf5ff', // Purple
      '#f0fdf4'  // Green
    ];

    const newId = 'hm_' + Date.now();
    const finalName = name.trim() || 'فاعل خير مجهول';
    const finalCountry = country.trim() || 'العالم';
    const newMessage: HopeMessage = {
      id: newId,
      name: finalName,
      country: finalCountry,
      message,
      date: 'الآن',
      color: stickyColors[Math.floor(Math.random() * stickyColors.length)]
    };

    try {
      await setDoc(doc(db, 'hopeMessages', newId), newMessage);

      // Raise notification
      await createNotification(
        'hope_message',
        'رسالة تضامن جديدة على حائط الأمل 💌',
        'New Letter of Hope Posted 💌',
        `أغدق ${finalName} من ${finalCountry} بكلمات أمل ومؤازرة: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"`,
        `${finalName} from ${finalCountry} posted a warm support letter: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `hopeMessages/${newId}`);
    }
  };

  // ADD CHALLENGE COMMENTS/REPLIES LOGIC
  const addCommentToChallenge = async (
    challengeId: string,
    authorName: string,
    text: string,
    role: 'visitor' | 'family' | 'admin' = 'visitor',
    authorId?: string
  ) => {
    const item = challenges.find(c => c.id === challengeId);
    if (!item) return;

    const newComment: Comment = {
      id: 'comm_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      authorName: authorName.trim() || (role === 'family' ? 'العائلة المستفيدة' : 'فاعل خير متضامن'),
      authorRole: role,
      authorId,
      text: text.trim(),
      createdAt: new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { hour12: true }),
      replies: []
    };

    const nextComments = [...(item.comments || []), newComment];
    try {
      await updateDoc(doc(db, 'challenges', challengeId), { comments: nextComments });
      await createNotification(
        'comment',
        'تعليق جديد على تحديث البقاء! 💬',
        'New Diary Comment! 💬',
        `أبدى ${newComment.authorName} تعليقاً على منشور "${item.title}": "${text.slice(0, 45)}..."`,
        `${newComment.authorName} commented on diary update "${item.title}": "${text.slice(0, 45)}..."`,
        item.beneficiaryId
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `challenges/${challengeId}`);
    }
  };

  const deleteCommentFromChallenge = async (challengeId: string, commentId: string) => {
    const item = challenges.find(c => c.id === challengeId);
    if (!item) return;

    const nextComments = (item.comments || []).filter(c => c.id !== commentId);
    try {
      await updateDoc(doc(db, 'challenges', challengeId), { comments: nextComments });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `challenges/${challengeId}`);
    }
  };

  const addReplyToChallenge = async (
    challengeId: string,
    commentId: string,
    authorName: string,
    text: string,
    role: 'visitor' | 'family' | 'admin' = 'visitor',
    authorId?: string
  ) => {
    const item = challenges.find(c => c.id === challengeId);
    if (!item) return;

    const newReply: Reply = {
      id: 'rep_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      authorName: authorName.trim() || (role === 'family' ? 'العائلة المستفيدة' : 'متضامن كريم'),
      authorRole: role,
      authorId,
      text: text.trim(),
      createdAt: new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { hour12: true })
    };

    const nextComments = (item.comments || []).map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReply]
        };
      }
      return c;
    });

    try {
      await updateDoc(doc(db, 'challenges', challengeId), { comments: nextComments });
      await createNotification(
        'reply',
        'رد متضامن جديد على التعليقات! 💬',
        'New comment reply! 💬',
        `عقّب ${newReply.authorName} راداً: "${text.slice(0, 45)}..."`,
        `${newReply.authorName} replied to a comment: "${text.slice(0, 45)}..."`,
        item.beneficiaryId
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `challenges/${challengeId}`);
    }
  };

  const deleteReplyFromChallenge = async (challengeId: string, commentId: string, replyId: string) => {
    const item = challenges.find(c => c.id === challengeId);
    if (!item) return;

    const nextComments = (item.comments || []).map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: (c.replies || []).filter(r => r.id !== replyId)
        };
      }
      return c;
    });

    try {
      await updateDoc(doc(db, 'challenges', challengeId), { comments: nextComments });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `challenges/${challengeId}`);
    }
  };

  // ADD URGENT NEEDS COMMENTS/REPLIES LOGIC
  const addCommentToNeed = async (
    needId: string,
    authorName: string,
    text: string,
    role: 'visitor' | 'family' | 'admin' = 'visitor',
    authorId?: string
  ) => {
    const item = currentNeeds.find(n => n.id === needId);
    if (!item) return;

    const newComment: Comment = {
      id: 'comm_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      authorName: authorName.trim() || (role === 'family' ? 'العائلة المستفيدة' : 'فاعل خير متضامن'),
      authorRole: role,
      authorId,
      text: text.trim(),
      createdAt: new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { hour12: true }),
      replies: []
    };

    const nextComments = [...(item.comments || []), newComment];
    try {
      await updateDoc(doc(db, 'currentNeeds', needId), { comments: nextComments });
      await createNotification(
        'comment',
        'تعليق جديد على بند الاحتياج! 💬',
        'New Urgent Need Comment! 💬',
        `أبدى ${newComment.authorName} تضامنه مع عائلة ${item.beneficiaryName} معلقاً: "${text.slice(0, 45)}..."`,
        `${newComment.authorName} commented on urgent need of ${item.beneficiaryName}: "${text.slice(0, 45)}..."`,
        item.beneficiaryId
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `currentNeeds/${needId}`);
    }
  };

  const deleteCommentFromNeed = async (needId: string, commentId: string) => {
    const item = currentNeeds.find(n => n.id === needId);
    if (!item) return;

    const nextComments = (item.comments || []).filter(c => c.id !== commentId);
    try {
      await updateDoc(doc(db, 'currentNeeds', needId), { comments: nextComments });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `currentNeeds/${needId}`);
    }
  };

  const addReplyToNeed = async (
    needId: string,
    commentId: string,
    authorName: string,
    text: string,
    role: 'visitor' | 'family' | 'admin' = 'visitor',
    authorId?: string
  ) => {
    const item = currentNeeds.find(n => n.id === needId);
    if (!item) return;

    const newReply: Reply = {
      id: 'rep_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      authorName: authorName.trim() || (role === 'family' ? 'العائلة المستفيدة' : 'متضامن كريم'),
      authorRole: role,
      authorId,
      text: text.trim(),
      createdAt: new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { hour12: true })
    };

    const nextComments = (item.comments || []).map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReply]
        };
      }
      return c;
    });

    try {
      await updateDoc(doc(db, 'currentNeeds', needId), { comments: nextComments });
      await createNotification(
        'reply',
        'رد متضامن جديد على بند احتياج! 💬',
        'New action reply on urgent need! 💬',
        `عقّب ${newReply.authorName} راداً: "${text.slice(0, 45)}..."`,
        `${newReply.authorName} replied on need comment text: "${text.slice(0, 45)}..."`,
        item.beneficiaryId
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `currentNeeds/${needId}`);
    }
  };

  const deleteReplyFromNeed = async (needId: string, commentId: string, replyId: string) => {
    const item = currentNeeds.find(n => n.id === needId);
    if (!item) return;

    const nextComments = (item.comments || []).map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: (c.replies || []).filter(r => r.id !== replyId)
        };
      }
      return c;
    });

    try {
      await updateDoc(doc(db, 'currentNeeds', needId), { comments: nextComments });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `currentNeeds/${needId}`);
    }
  };

  // Directly update a need's collected amount from management panel
  const updateNeedCollectedAmount = async (needId: string, amount: number) => {
    const need = currentNeeds.find(n => n.id === needId);
    if (!need) return;

    const nextAmt = Math.max(0, Math.min(need.cost, amount));
    try {
      await updateDoc(doc(db, 'currentNeeds', needId), { collectedAmount: nextAmt });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `currentNeeds/${needId}`);
    }
  };

  const initializedBeneficiaries = beneficiaries.filter(b => b.initialized);
  const selectedFamily = beneficiaries.find(b => b.id === selectedFamilyId)
    || currentBeneficiary
    || beneficiaries.find(b => b.id === 'f_slot_1')
    || null;
  const familyNeeds = currentNeeds.filter(n => n.beneficiaryId === (selectedFamily?.id || ''));
  const familyActiveNeedsCount = familyNeeds.filter(n => n.collectedAmount < n.cost).length;

  const stats = {
    totalDonationsTracked: (selectedFamily && typeof selectedFamily.totalDonated === 'number') ? selectedFamily.totalDonated : totalDonationsTracked,
    totalActiveNeeds: familyActiveNeedsCount,
    totalSupportedFamilies: 1 // Single sturdy family view
  };

  return (
    <SanadContext.Provider
      value={{
        beneficiaries,
        currentNeeds,
        challenges,
        hopeMessages,
        notifications,
        currentBeneficiary,
        selectedFamilyId,
        setSelectedFamilyId,
        selectedFamily,
        activeTab,
        setActiveTab,
        login,
        logout,
        updateProfile,
        addChallenge,
        updateChallenge,
        deleteChallenge,
        addUrgentNeed,
        deleteUrgentNeed,
        supportNeed,
        likeChallenge,
        addHopeMessage,
        language,
        setLanguage,
        updateNeedCollectedAmount,
        addCommentToChallenge,
        deleteCommentFromChallenge,
        addReplyToChallenge,
        deleteReplyFromChallenge,
        addCommentToNeed,
        deleteCommentFromNeed,
        addReplyToNeed,
        deleteReplyFromNeed,
        createNotification,
        markAllNotificationsAsRead,
        stats
      }}
    >
      {children}
    </SanadContext.Provider>
  );
};

export const useSanad = () => {
  const context = useContext(SanadContext);
  if (context === undefined) {
    throw new Error('useSanad must be used within a SanadProvider');
  }
  return context;
};

