export interface BeneficiaryProfile {
  id: string;
  name: string;
  location: string;
  profilePicture: string; // Base64 or standard asset/Unsplash URL
  description: string;
  totalDonated: number;   // كم تبرع
  totalSpent: number;     // كم صرف
  password: string;       // كلمة سر الدخول للمستفيد
  initialized: boolean;   // هل قام المستفيد بإدخال بياناته الحقيقية؟
  crowdfundingUrl?: string; // رابط الحملة الفردية للعائلة
}

export interface Comment {
  id: string;
  authorName: string;
  authorRole: 'family' | 'visitor' | 'admin';
  authorId?: string; // e.g. family id
  text: string;
  createdAt: string; // Date string or text
  replies?: Reply[];
}

export interface Reply {
  id: string;
  authorName: string;
  authorRole: 'family' | 'visitor' | 'admin';
  authorId?: string;
  text: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryAvatar: string;
  date: string;
  title: string;
  text: string;
  imageUrl: string;
  likes: number;
  comments?: Comment[];
}

export interface UrgentNeed {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryLocation: string;
  title: string;
  description: string;
  cost: number;
  imageUrl: string;
  crowdfundingUrl: string;
  collectedAmount: number;
  isUrgent: boolean;
  comments?: Comment[];
}

export interface HopeMessage {
  id: string;
  name: string;
  country: string;
  message: string;
  date: string;
  color: string; // Tailwind hex or class name
}

export interface SanadNotification {
  id: string;
  type: 'donation' | 'like' | 'hope_message' | 'comment' | 'reply' | 'system';
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  timestamp: string; // ISO / display format
  read?: boolean;
  beneficiaryId?: string;
}

export type ActiveTab = 'home' | 'needs' | 'challenges' | 'hope' | 'dashboard';
