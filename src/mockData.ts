import { BeneficiaryProfile, Challenge, UrgentNeed, HopeMessage } from './types';

// 10 Secure slots pre-configured with premium passwords, initially uninitialized (initialized: false)
export const INITIAL_BENEFICIARIES: BeneficiaryProfile[] = [
  {
    id: 'f_slot_1',
    name: '',
    location: '',
    profilePicture: '',
    description: '',
    totalDonated: 0,
    totalSpent: 0,
    password: 'Sanad-Gaza-812',
    initialized: false,
    crowdfundingUrl: ''
  },
  {
    id: 'f_slot_2',
    name: '',
    location: '',
    profilePicture: '',
    description: '',
    totalDonated: 0,
    totalSpent: 0,
    password: 'Hope-Resilience-340',
    initialized: false,
    crowdfundingUrl: ''
  },
  {
    id: 'f_slot_3',
    name: '',
    location: '',
    profilePicture: '',
    description: '',
    totalDonated: 0,
    totalSpent: 0,
    password: 'Amal-Palestine-591',
    initialized: false,
    crowdfundingUrl: ''
  },
  {
    id: 'f_slot_4',
    name: '',
    location: '',
    profilePicture: '',
    description: '',
    totalDonated: 0,
    totalSpent: 0,
    password: 'Covenant-Care-704',
    initialized: false,
    crowdfundingUrl: ''
  },
  {
    id: 'f_slot_5',
    name: '',
    location: '',
    profilePicture: '',
    description: '',
    totalDonated: 0,
    totalSpent: 0,
    password: 'Olive-Branch-168',
    initialized: false,
    crowdfundingUrl: ''
  },
  {
    id: 'f_slot_6',
    name: '',
    location: '',
    profilePicture: '',
    description: '',
    totalDonated: 0,
    totalSpent: 0,
    password: 'Sturdy-Tents-923',
    initialized: false,
    crowdfundingUrl: ''
  },
  {
    id: 'f_slot_7',
    name: '',
    location: '',
    profilePicture: '',
    description: '',
    totalDonated: 0,
    totalSpent: 0,
    password: 'Solidarity-Gz-415',
    initialized: false,
    crowdfundingUrl: ''
  },
  {
    id: 'f_slot_8',
    name: '',
    location: '',
    profilePicture: '',
    description: '',
    totalDonated: 0,
    totalSpent: 0,
    password: 'Dignity-Life-602',
    initialized: false,
    crowdfundingUrl: ''
  },
  {
    id: 'f_slot_9',
    name: '',
    location: '',
    profilePicture: '',
    description: '',
    totalDonated: 0,
    totalSpent: 0,
    password: 'Faith-Gaza-529',
    initialized: false,
    crowdfundingUrl: ''
  },
  {
    id: 'f_slot_10',
    name: '',
    location: '',
    profilePicture: '',
    description: '',
    totalDonated: 0,
    totalSpent: 0,
    password: 'Peace-Camp-711',
    initialized: false,
    crowdfundingUrl: ''
  }
];

export const INITIAL_URGENT_NEEDS: UrgentNeed[] = [];

export const INITIAL_CHALLENGES: Challenge[] = [];

export const INITIAL_HOPE_MESSAGES: HopeMessage[] = [
  {
    id: 'hm1',
    name: 'سارة اليوسف',
    country: 'جزايرنا الجميلة',
    message: 'قلوبنا معكم يا أهلنا في غزة الطيبين. أنتم نبض هذه الأمة ورمز كرامتها وطهارتها. الله يفرجها عليكم وينصركم نصراً قريباً مؤزراً يا أبطال.',
    date: 'منذ ١٠ دقائق',
    color: '#ecfdf5' // Emerald-50 light
  },
  {
    id: 'hm2',
    name: 'أحمد شاهين',
    country: 'الأردن الأبي',
    message: 'يا عمالقة الصبر والإغاثة، نحن لا ننساكم أبداً من مجهودنا ودعائنا وتبرعاتنا. نسأل الله أن يربط على قلوبكم ويداوي جرحاكم ويتقبل شهداءكم.',
    date: 'منذ ساعة',
    color: '#f0f9ff' // Sky-50 light
  },
  {
    id: 'hm3',
    name: 'سليمان الحربي',
    country: 'المملكة العربية السعودية',
    message: 'أنتم لستم وحدكم، خلفكم ملايين تدعو وتؤيد وتنقل أصوات حكاياتكم للعالم كله. سند غزة هي فكرة للتآخي الدائم والتواصل غير المنقطع.',
    date: 'اليوم صباحاً',
    color: '#fdf2f8' // Pink-50 light
  },
  {
    id: 'hm4',
    name: 'ليلى الدقاق',
    country: 'لبنان',
    message: 'كل الحب والدعم من بيروت الصابرة إلى غزة العزة. الله يحمي أولادكم ويبعث الدفء لخيامكم ويطعم جوعكم. فرج الله آتٍ لا محالة.',
    date: 'أمس',
    color: '#fffbeb' // Amber-50 light
  },
  {
    id: 'hm5',
    name: 'د. طارق خان',
    country: 'بريطانيا (UK)',
    message: 'نرى صمودكم وأرواحكم الجميلة بكل إكبار وإجلال. الإنسانية لم ولن تنساكم أبداً. رسائلكم هنا في لوحة الأمل تلهمنا لنصدح بطلب السلام والعدالة.',
    date: 'قبل يومين',
    color: '#fbfbfe' // Indigo-50 light
  }
];
