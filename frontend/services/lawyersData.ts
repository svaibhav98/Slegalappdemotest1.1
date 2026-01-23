// Lawyers Data Service
// Centralized data layer for MVP
// Updated with Indian lawyer images

export interface LawyerPackage {
  id: string;
  type: 'voice' | 'chat' | 'video';
  name: string;
  price: number;
  duration: number; // in minutes
  icon: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface Lawyer {
  id: string;
  name: string;
  title: string;
  image: string;
  category: string;
  practiceArea: string;
  rating: number;
  reviewCount: number;
  experience: number;
  languages: string[];
  about: string;
  isVerified: boolean;
  isAvailable: boolean;
  packages: LawyerPackage[];
  availableSlots: { date: string; slots: TimeSlot[] }[];
}

export interface Booking {
  id: string;
  lawyerId: string;
  lawyerName: string;
  userId: string;
  packageType: 'voice' | 'chat' | 'video';
  packageName: string;
  price: number;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  scheduledDateTime?: string;
  reminderBefore?: number;
  createdAt: string;
  completedAt?: string;
}

export const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'grid' },
  { id: 'family', name: 'Family Law', icon: 'people' },
  { id: 'divorce', name: 'Divorce', icon: 'heart-dislike' },
  { id: 'corporate', name: 'Corporate', icon: 'business' },
  { id: 'criminal', name: 'Criminal', icon: 'shield' },
  { id: 'property', name: 'Property', icon: 'home' },
  { id: 'consumer', name: 'Consumer', icon: 'cart' },
  { id: 'tax', name: 'Tax', icon: 'cash' },
  { id: 'labour', name: 'Labour', icon: 'briefcase' },
];

// Generate time slots for next 7 days
const generateTimeSlots = (): { date: string; slots: TimeSlot[] }[] => {
  const result: { date: string; slots: TimeSlot[] }[] = [];
  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const slots: TimeSlot[] = times.map((time, idx) => ({
      id: `slot-${dateStr}-${idx}`,
      time,
      available: Math.random() > 0.3, // 70% availability
    }));
    
    result.push({ date: dateStr, slots });
  }
  
  return result;
};

// Indian lawyer images from Pexels (free to use)
const INDIAN_LAWYER_IMAGES = {
  female1: 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400',
  female2: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=400',
  female3: 'https://images.pexels.com/photos/4427610/pexels-photo-4427610.jpeg?auto=compress&cs=tinysrgb&w=400',
  female4: 'https://images.pexels.com/photos/4427430/pexels-photo-4427430.jpeg?auto=compress&cs=tinysrgb&w=400',
  female5: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400',
  female6: 'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?auto=compress&cs=tinysrgb&w=400',
  male1: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
  male2: 'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=400',
  male3: 'https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg?auto=compress&cs=tinysrgb&w=400',
  male4: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
  male5: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=400',
  male6: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=400',
};

export const LAWYERS_DATA: Lawyer[] = [
  {
    id: 'lawyer-1',
    name: 'Adv. Neha Sharma',
    title: 'Senior Family Lawyer',
    image: INDIAN_LAWYER_IMAGES.female1,
    category: 'family',
    practiceArea: 'Family Law',
    rating: 5.0,
    reviewCount: 230,
    experience: 10,
    languages: ['English', 'Hindi'],
    about: 'I specialize in family and matrimonial disputes including divorce, custody, and domestic violence cases. With 10+ years of experience in Delhi courts, I ensure confidentiality and quick resolutions for my clients.',
    isVerified: true,
    isAvailable: true,
    packages: [
      { id: 'pkg-1-voice', type: 'voice', name: 'Voice Call', price: 300, duration: 15, icon: 'call' },
      { id: 'pkg-1-chat', type: 'chat', name: 'Chat', price: 200, duration: 10, icon: 'chatbubble' },
      { id: 'pkg-1-video', type: 'video', name: 'Video Call', price: 500, duration: 20, icon: 'videocam' },
    ],
    availableSlots: generateTimeSlots(),
  },
  {
    id: 'lawyer-2',
    name: 'Adv. Rahul Verma',
    title: 'Corporate Law Expert',
    image: INDIAN_LAWYER_IMAGES.male1,
    category: 'corporate',
    practiceArea: 'Corporate Law',
    rating: 4.9,
    reviewCount: 185,
    experience: 12,
    languages: ['English', 'Hindi', 'Gujarati'],
    about: 'Expert in corporate law, company formations, mergers & acquisitions, contract drafting, and business compliance. I help startups and established businesses navigate legal complexities with ease.',
    isVerified: true,
    isAvailable: true,
    packages: [
      { id: 'pkg-2-voice', type: 'voice', name: 'Voice Call', price: 400, duration: 15, icon: 'call' },
      { id: 'pkg-2-chat', type: 'chat', name: 'Chat', price: 250, duration: 10, icon: 'chatbubble' },
      { id: 'pkg-2-video', type: 'video', name: 'Video Call', price: 600, duration: 20, icon: 'videocam' },
    ],
    availableSlots: generateTimeSlots(),
  },
  {
    id: 'lawyer-3',
    name: 'Adv. Priya Patel',
    title: 'Divorce Specialist',
    image: INDIAN_LAWYER_IMAGES.female2,
    category: 'divorce',
    practiceArea: 'Divorce & Separation',
    rating: 4.8,
    reviewCount: 156,
    experience: 8,
    languages: ['English', 'Hindi', 'Marathi'],
    about: 'Specialized in divorce proceedings, alimony, child custody, and property settlement. I provide compassionate legal support during difficult times while ensuring your rights are protected.',
    isVerified: true,
    isAvailable: true,
    packages: [
      { id: 'pkg-3-voice', type: 'voice', name: 'Voice Call', price: 350, duration: 15, icon: 'call' },
      { id: 'pkg-3-chat', type: 'chat', name: 'Chat', price: 200, duration: 10, icon: 'chatbubble' },
      { id: 'pkg-3-video', type: 'video', name: 'Video Call', price: 550, duration: 20, icon: 'videocam' },
    ],
    availableSlots: generateTimeSlots(),
  },
  {
    id: 'lawyer-4',
    name: 'Adv. Vikram Singh',
    title: 'Criminal Defense Advocate',
    image: INDIAN_LAWYER_IMAGES.male2,
    category: 'criminal',
    practiceArea: 'Criminal Law',
    rating: 4.9,
    reviewCount: 210,
    experience: 15,
    languages: ['English', 'Hindi', 'Punjabi'],
    about: 'Experienced criminal defense lawyer handling bail applications, FIR quashing, anticipatory bail, and trial representation. I fight for justice with integrity and dedication.',
    isVerified: true,
    isAvailable: false,
    packages: [
      { id: 'pkg-4-voice', type: 'voice', name: 'Voice Call', price: 500, duration: 15, icon: 'call' },
      { id: 'pkg-4-chat', type: 'chat', name: 'Chat', price: 300, duration: 10, icon: 'chatbubble' },
      { id: 'pkg-4-video', type: 'video', name: 'Video Call', price: 700, duration: 20, icon: 'videocam' },
    ],
    availableSlots: generateTimeSlots(),
  },
  {
    id: 'lawyer-5',
    name: 'Adv. Anjali Desai',
    title: 'Property Law Expert',
    image: INDIAN_LAWYER_IMAGES.female3,
    category: 'property',
    practiceArea: 'Property & Real Estate',
    rating: 4.7,
    reviewCount: 142,
    experience: 9,
    languages: ['English', 'Hindi', 'Tamil'],
    about: 'Specializing in property disputes, title verification, RERA matters, property registration, and land acquisition cases. I help clients secure their property rights effectively.',
    isVerified: true,
    isAvailable: true,
    packages: [
      { id: 'pkg-5-voice', type: 'voice', name: 'Voice Call', price: 350, duration: 15, icon: 'call' },
      { id: 'pkg-5-chat', type: 'chat', name: 'Chat', price: 220, duration: 10, icon: 'chatbubble' },
      { id: 'pkg-5-video', type: 'video', name: 'Video Call', price: 550, duration: 20, icon: 'videocam' },
    ],
    availableSlots: generateTimeSlots(),
  },
  {
    id: 'lawyer-6',
    name: 'Adv. Sanjay Kumar',
    title: 'Consumer Rights Advocate',
    image: INDIAN_LAWYER_IMAGES.male3,
    category: 'consumer',
    practiceArea: 'Consumer Law',
    rating: 4.6,
    reviewCount: 98,
    experience: 7,
    languages: ['English', 'Hindi'],
    about: 'Consumer rights champion with expertise in filing consumer complaints, product liability, service deficiency, and unfair trade practices cases. I fight for fair treatment of consumers.',
    isVerified: true,
    isAvailable: true,
    packages: [
      { id: 'pkg-6-voice', type: 'voice', name: 'Voice Call', price: 250, duration: 15, icon: 'call' },
      { id: 'pkg-6-chat', type: 'chat', name: 'Chat', price: 150, duration: 10, icon: 'chatbubble' },
      { id: 'pkg-6-video', type: 'video', name: 'Video Call', price: 400, duration: 20, icon: 'videocam' },
    ],
    availableSlots: generateTimeSlots(),
  },
  {
    id: 'lawyer-7',
    name: 'Adv. Meera Reddy',
    title: 'Tax Law Specialist',
    image: INDIAN_LAWYER_IMAGES.female4,
    category: 'tax',
    practiceArea: 'Tax & GST',
    rating: 4.8,
    reviewCount: 167,
    experience: 11,
    languages: ['English', 'Hindi', 'Telugu'],
    about: 'Expert in income tax matters, GST compliance, tax planning, and representation before tax authorities. I help individuals and businesses optimize their tax strategies legally.',
    isVerified: true,
    isAvailable: true,
    packages: [
      { id: 'pkg-7-voice', type: 'voice', name: 'Voice Call', price: 400, duration: 15, icon: 'call' },
      { id: 'pkg-7-chat', type: 'chat', name: 'Chat', price: 250, duration: 10, icon: 'chatbubble' },
      { id: 'pkg-7-video', type: 'video', name: 'Video Call', price: 600, duration: 20, icon: 'videocam' },
    ],
    availableSlots: generateTimeSlots(),
  },
  {
    id: 'lawyer-8',
    name: 'Adv. Arjun Malhotra',
    title: 'Labour Law Expert',
    image: INDIAN_LAWYER_IMAGES.male4,
    category: 'labour',
    practiceArea: 'Labour & Employment',
    rating: 4.7,
    reviewCount: 134,
    experience: 10,
    languages: ['English', 'Hindi', 'Bengali'],
    about: 'Specialized in employment disputes, wrongful termination, workplace harassment, PF/ESI matters, and industrial relations. I protect employee rights and ensure fair workplace practices.',
    isVerified: true,
    isAvailable: true,
    packages: [
      { id: 'pkg-8-voice', type: 'voice', name: 'Voice Call', price: 300, duration: 15, icon: 'call' },
      { id: 'pkg-8-chat', type: 'chat', name: 'Chat', price: 180, duration: 10, icon: 'chatbubble' },
      { id: 'pkg-8-video', type: 'video', name: 'Video Call', price: 500, duration: 20, icon: 'videocam' },
    ],
    availableSlots: generateTimeSlots(),
  },
  {
    id: 'lawyer-9',
    name: 'Adv. Kavita Iyer',
    title: 'Family & Custody Lawyer',
    image: INDIAN_LAWYER_IMAGES.female5,
    category: 'family',
    practiceArea: 'Family Law',
    rating: 4.9,
    reviewCount: 198,
    experience: 12,
    languages: ['English', 'Hindi', 'Kannada'],
    about: 'Expert in child custody, maintenance, domestic violence, and family property disputes. I provide sensitive and strategic legal support for family matters.',
    isVerified: true,
    isAvailable: true,
    packages: [
      { id: 'pkg-9-voice', type: 'voice', name: 'Voice Call', price: 350, duration: 15, icon: 'call' },
      { id: 'pkg-9-chat', type: 'chat', name: 'Chat', price: 200, duration: 10, icon: 'chatbubble' },
      { id: 'pkg-9-video', type: 'video', name: 'Video Call', price: 550, duration: 20, icon: 'videocam' },
    ],
    availableSlots: generateTimeSlots(),
  },
  {
    id: 'lawyer-10',
    name: 'Adv. Rajesh Gupta',
    title: 'Cyber Law Expert',
    image: INDIAN_LAWYER_IMAGES.male5,
    category: 'corporate',
    practiceArea: 'Cyber & IT Law',
    rating: 4.6,
    reviewCount: 87,
    experience: 6,
    languages: ['English', 'Hindi'],
    about: 'Specialized in cyber crimes, data privacy, IT Act violations, online fraud, and digital evidence. I help victims of cyber crimes get justice in the digital age.',
    isVerified: true,
    isAvailable: true,
    packages: [
      { id: 'pkg-10-voice', type: 'voice', name: 'Voice Call', price: 300, duration: 15, icon: 'call' },
      { id: 'pkg-10-chat', type: 'chat', name: 'Chat', price: 180, duration: 10, icon: 'chatbubble' },
      { id: 'pkg-10-video', type: 'video', name: 'Video Call', price: 500, duration: 20, icon: 'videocam' },
    ],
    availableSlots: generateTimeSlots(),
  },
  {
    id: 'lawyer-11',
    name: 'Adv. Sunita Bajaj',
    title: 'Property Dispute Expert',
    image: INDIAN_LAWYER_IMAGES.female6,
    category: 'property',
    practiceArea: 'Property & Real Estate',
    rating: 4.8,
    reviewCount: 156,
    experience: 14,
    languages: ['English', 'Hindi', 'Rajasthani'],
    about: 'Expert in land disputes, property partition, tenant eviction, mutation, and property documentation. With 14 years of experience, I provide comprehensive property legal services.',
    isVerified: true,
    isAvailable: true,
    packages: [
      { id: 'pkg-11-voice', type: 'voice', name: 'Voice Call', price: 400, duration: 15, icon: 'call' },
      { id: 'pkg-11-chat', type: 'chat', name: 'Chat', price: 250, duration: 10, icon: 'chatbubble' },
      { id: 'pkg-11-video', type: 'video', name: 'Video Call', price: 600, duration: 20, icon: 'videocam' },
    ],
    availableSlots: generateTimeSlots(),
  },
  {
    id: 'lawyer-12',
    name: 'Adv. Karan Shah',
    title: 'Divorce & Alimony Expert',
    image: INDIAN_LAWYER_IMAGES.male6,
    category: 'divorce',
    practiceArea: 'Divorce & Separation',
    rating: 4.7,
    reviewCount: 124,
    experience: 8,
    languages: ['English', 'Hindi', 'Gujarati'],
    about: 'Handling contested and mutual consent divorces, alimony negotiations, and property settlements. I ensure fair outcomes while minimizing emotional stress for clients.',
    isVerified: true,
    isAvailable: false,
    packages: [
      { id: 'pkg-12-voice', type: 'voice', name: 'Voice Call', price: 350, duration: 15, icon: 'call' },
      { id: 'pkg-12-chat', type: 'chat', name: 'Chat', price: 200, duration: 10, icon: 'chatbubble' },
      { id: 'pkg-12-video', type: 'video', name: 'Video Call', price: 550, duration: 20, icon: 'videocam' },
    ],
    availableSlots: generateTimeSlots(),
  },
];

// Bookings storage
let BOOKINGS_DATA: Booking[] = [];

// Service functions
export const getLawyers = (category?: string, searchQuery?: string): Lawyer[] => {
  let results = [...LAWYERS_DATA];
  
  if (category && category !== 'all') {
    results = results.filter(l => l.category === category);
  }
  
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    results = results.filter(l => 
      l.name.toLowerCase().includes(query) ||
      l.practiceArea.toLowerCase().includes(query) ||
      l.category.toLowerCase().includes(query) ||
      l.languages.some(lang => lang.toLowerCase().includes(query))
    );
  }
  
  return results;
};

export const getLawyerById = (id: string): Lawyer | undefined => {
  return LAWYERS_DATA.find(l => l.id === id);
};

export const createBooking = (booking: Omit<Booking, 'id' | 'createdAt'>): Booking => {
  const newBooking: Booking = {
    ...booking,
    id: `booking-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  BOOKINGS_DATA = [newBooking, ...BOOKINGS_DATA];
  return newBooking;
};

export const getBookings = (userId: string = 'user-1'): Booking[] => {
  return BOOKINGS_DATA.filter(b => b.userId === userId);
};

export const updateBookingStatus = (bookingId: string, status: Booking['status']): Booking | undefined => {
  const index = BOOKINGS_DATA.findIndex(b => b.id === bookingId);
  if (index === -1) return undefined;
  
  BOOKINGS_DATA[index] = {
    ...BOOKINGS_DATA[index],
    status,
    ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {}),
  };
  return BOOKINGS_DATA[index];
};
