// Laws & Schemes Data Service
// Centralized data layer for MVP - easy to swap with API later

export type LawSchemeType = 'LAW' | 'SCHEME' | 'ARTICLE';

export interface LawScheme {
  id: string;
  type: LawSchemeType;
  title: string;
  category: string;
  tagLabel: string;
  tagColor: string;
  shortSummary: string;
  overviewText: string;
  officialLink: string;
  keywords: string[];
  relatedIds: string[];
  imageUrl?: string;
}

export const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: 'grid' },
  { id: 'land-property', name: 'Land & Property', icon: 'home' },
  { id: 'tenant-housing', name: 'Tenant & Housing', icon: 'business' },
  { id: 'consumer', name: 'Consumer', icon: 'shield-checkmark' },
  { id: 'family', name: 'Family', icon: 'people' },
  { id: 'labour', name: 'Labour', icon: 'briefcase' },
  { id: 'farmer', name: 'Farmer', icon: 'leaf' },
  { id: 'citizen-rights', name: 'Citizen Rights', icon: 'person' },
];

export const LAWS_DATA: LawScheme[] = [
  {
    id: 'tenancy-laws',
    type: 'LAW',
    title: 'Tenancy Laws',
    category: 'tenant-housing',
    tagLabel: 'Housing & Rental',
    tagColor: '#10B981',
    shortSummary: 'Know your rights as a tenant or landlord. Covers rental agreements, fair rent, eviction rules, and deposit refunds...',
    overviewText: `Tenancy laws in India are governed by the Rent Control Acts of various states and the Model Tenancy Act, 2021.

**Key Tenant Rights:**
• Right to a written rental agreement
• Fair rent determination
• Protection from arbitrary eviction
• Refund of security deposit within specified time
• Access to essential services (water, electricity)

**Key Landlord Rights:**
• Right to receive rent on time
• Right to evict for non-payment or misuse
• Right to inspect property with notice
• Right to reasonable rent revision

**Important Points:**
• Security deposit typically limited to 2-3 months rent
• Notice period usually 1-3 months for termination
• Rent increases subject to state regulations
• Both parties should maintain proper documentation

Under the Model Tenancy Act, 2021, a Rent Authority has been established to resolve disputes efficiently.`,
    officialLink: 'https://mohua.gov.in',
    keywords: ['rent', 'tenant', 'landlord', 'housing', 'eviction', 'deposit'],
    relatedIds: ['rera-act', 'consumer-protection', 'land-property-laws'],
  },
  {
    id: 'rera-act',
    type: 'LAW',
    title: 'Real Estate (Regulation & Development) Act, 2016 (RERA)',
    category: 'land-property',
    tagLabel: 'Land & Property',
    tagColor: '#F59E0B',
    shortSummary: 'Protects homebuyers by mandating builder registration, timely project delivery, and full disclosure of project details.',
    overviewText: `RERA was enacted to protect homebuyers and promote transparency in real estate transactions.

**Key Provisions:**
• Mandatory registration of real estate projects
• Developers must deposit 70% of buyer funds in escrow
• Buyers entitled to full project information
• Standardized carpet area definition
• Penalties for delays and defects

**Buyer Rights under RERA:**
• Right to know project details and approvals
• Right to timely possession
• Right to refund with interest for delays
• Right to compensation for structural defects (5 years)
• Right to grievance redressal through RERA Authority

**Filing a RERA Complaint:**
1. Visit your state RERA website
2. Register and file complaint online
3. Pay nominal filing fee
4. Track complaint status online

The Real Estate Regulatory Authority in each state handles disputes and ensures compliance.`,
    officialLink: 'https://rera.gov.in',
    keywords: ['real estate', 'property', 'builder', 'homebuyer', 'construction', 'RERA'],
    relatedIds: ['tenancy-laws', 'land-property-laws', 'consumer-protection'],
  },
  {
    id: 'consumer-protection',
    type: 'LAW',
    title: 'Consumer Protection Act, 2019',
    category: 'consumer',
    tagLabel: 'Consumer Law',
    tagColor: '#3B82F6',
    shortSummary: 'Your rights as a consumer against unfair trade practices, defective goods, and deficient services in India.',
    overviewText: `The Consumer Protection Act, 2019 provides robust protection to consumers against unfair trade practices.

**Six Consumer Rights:**
1. Right to Safety
2. Right to be Informed
3. Right to Choose
4. Right to be Heard
5. Right to Seek Redressal
6. Right to Consumer Education

**Filing a Consumer Complaint:**
• District Commission: Claims up to ₹1 crore
• State Commission: ₹1 crore to ₹10 crore
• National Commission: Above ₹10 crore

**E-filing Portal:**
• File complaints online at edaakhil.nic.in
• No lawyer required for filing
• Complaints must be filed within 2 years

**Key Features:**
• Product liability provisions
• Protection against misleading advertisements
• Penalties for unfair contracts
• Central Consumer Protection Authority established`,
    officialLink: 'https://consumerhelpline.gov.in',
    keywords: ['consumer', 'complaint', 'refund', 'product', 'service', 'rights'],
    relatedIds: ['rera-act', 'rti-act', 'tenancy-laws'],
  },
  {
    id: 'rti-act',
    type: 'LAW',
    title: 'Right to Information Act, 2005',
    category: 'citizen-rights',
    tagLabel: 'Citizen Rights',
    tagColor: '#8B5CF6',
    shortSummary: 'Empowers citizens to seek information from public authorities. Learn how to file RTI applications.',
    overviewText: `The RTI Act empowers every Indian citizen to seek information from public authorities.

**Who Can File RTI:**
• Any Indian citizen
• No need to give reason for seeking information

**How to File RTI:**
1. Write application to Public Information Officer (PIO)
2. State clearly what information you need
3. Pay ₹10 fee (Central Govt.) - varies for states
4. BPL applicants are exempted from fees

**Timeline:**
• Response within 30 days
• 48 hours for life/liberty matters
• First appeal within 30 days of response
• Second appeal to Information Commission

**What You Can Ask:**
• Government documents and records
• Decisions and their reasons
• Reports, papers, samples
• Information in electronic form

**Exemptions:**
• National security matters
• Cabinet papers
• Personal information without public interest`,
    officialLink: 'https://rtionline.gov.in',
    keywords: ['RTI', 'information', 'government', 'citizen', 'transparency', 'public'],
    relatedIds: ['consumer-protection', 'pmay-scheme', 'labour-laws'],
  },
  {
    id: 'land-property-laws',
    type: 'LAW',
    title: 'Land & Property Laws',
    category: 'land-property',
    tagLabel: 'Land & Property',
    tagColor: '#F59E0B',
    shortSummary: 'Understanding property registration, transfer, mutation, and dispute resolution in India.',
    overviewText: `Land and property laws in India are governed by various central and state legislations.

**Key Laws:**
• Transfer of Property Act, 1882
• Registration Act, 1908
• Indian Stamp Act, 1899
• State-specific Land Revenue Codes

**Property Registration:**
• Mandatory for properties above ₹100
• Register within 4 months of execution
• Pay stamp duty (varies by state: 5-7%)
• Registration fee typically 1%

**Land Records:**
• 7/12 Extract (Maharashtra)
• Khasra/Khatauni (North India)
• Patta/Chitta (South India)
• Keep records updated after purchase

**Mutation:**
• Apply to Tehsildar after registration
• Required for property tax name change
• Usually takes 30-60 days

**Dispute Resolution:**
• Civil Courts for title disputes
• Revenue Courts for mutation issues
• Lok Adalat for quick settlement`,
    officialLink: 'https://dolr.gov.in',
    keywords: ['land', 'property', 'registration', 'mutation', 'stamp duty', 'title'],
    relatedIds: ['rera-act', 'tenancy-laws', 'farmer-schemes'],
  },
  {
    id: 'labour-laws',
    type: 'LAW',
    title: 'Labour Laws & Employee Rights',
    category: 'labour',
    tagLabel: 'Labour & Employment',
    tagColor: '#EC4899',
    shortSummary: 'Know your workplace rights - minimum wages, working hours, PF, gratuity, and protection against harassment.',
    overviewText: `Indian labour laws protect workers' rights and regulate employment conditions.

**Key Labour Codes (2020):**
1. Code on Wages
2. Industrial Relations Code
3. Social Security Code
4. Occupational Safety Code

**Employee Rights:**
• Minimum wages as per state notification
• Maximum 48 hours work per week
• Overtime at 2x regular rate
• Weekly off and annual leave
• Protection from sexual harassment

**Provident Fund (PF):**
• Mandatory for establishments with 20+ employees
• Employee contribution: 12% of basic
• Equal employer contribution
• Withdrawable on retirement/resignation

**Gratuity:**
• After 5 years of continuous service
• 15 days salary per year of service
• Maximum ₹20 lakhs

**Filing Complaints:**
• Labour Commissioner's office
• EPFO for PF issues
• Internal Complaints Committee for harassment`,
    officialLink: 'https://labour.gov.in',
    keywords: ['labour', 'employee', 'wages', 'PF', 'gratuity', 'workplace'],
    relatedIds: ['rti-act', 'consumer-protection', 'pmay-scheme'],
  },
  {
    id: 'pmay-scheme',
    type: 'SCHEME',
    title: 'Pradhan Mantri Awas Yojana (PMAY)',
    category: 'tenant-housing',
    tagLabel: 'Housing Scheme',
    tagColor: '#10B981',
    shortSummary: 'Government housing scheme for affordable homes. Get subsidy on home loans for EWS, LIG, and MIG categories.',
    overviewText: `PMAY aims to provide affordable housing to all by 2024 (extended).

**Eligibility:**
• EWS: Annual income up to ₹3 lakhs
• LIG: ₹3-6 lakhs annual income
• MIG-I: ₹6-12 lakhs annual income
• MIG-II: ₹12-18 lakhs annual income

**Subsidy Benefits:**
• EWS/LIG: Up to ₹2.67 lakhs
• MIG-I: Up to ₹2.35 lakhs
• MIG-II: Up to ₹2.30 lakhs

**How to Apply:**
1. Visit PMAY website or CSC center
2. Fill application with Aadhaar
3. Submit income proof documents
4. Bank processes loan with subsidy

**Key Features:**
• Credit-linked subsidy scheme
• Women ownership preferred
• Subsidy directly to bank account
• No prior home ownership allowed

**Documents Required:**
• Aadhaar card
• Income certificate
• Property documents
• Bank statements`,
    officialLink: 'https://pmaymis.gov.in',
    keywords: ['housing', 'subsidy', 'home loan', 'affordable', 'government scheme'],
    relatedIds: ['tenancy-laws', 'rera-act', 'farmer-schemes'],
  },
  {
    id: 'farmer-schemes',
    type: 'SCHEME',
    title: 'Farmer Welfare Schemes',
    category: 'farmer',
    tagLabel: 'Agriculture',
    tagColor: '#22C55E',
    shortSummary: 'PM-KISAN, crop insurance, and other government schemes to support farmers and agricultural activities.',
    overviewText: `Multiple central and state schemes support farmers in India.

**PM-KISAN:**
• ₹6,000 per year in 3 installments
• Direct benefit transfer to bank account
• All landholding farmers eligible
• Register at pmkisan.gov.in

**PM Fasal Bima Yojana:**
• Crop insurance at minimal premium
• Kharif crops: 2% premium
• Rabi crops: 1.5% premium
• Claims settled based on yield data

**Kisan Credit Card:**
• Short-term credit for farming
• Interest subvention benefits
• Easy renewal process
• Insurance coverage included

**Soil Health Card:**
• Free soil testing
• Crop-wise recommendations
• Nutrient management guidance

**Other Benefits:**
• MSP for major crops
• e-NAM for online trading
• Custom hiring centers
• Free electricity in some states`,
    officialLink: 'https://pmkisan.gov.in',
    keywords: ['farmer', 'agriculture', 'PM-KISAN', 'crop insurance', 'subsidy'],
    relatedIds: ['land-property-laws', 'pmay-scheme', 'rti-act'],
  },
  {
    id: 'family-laws',
    type: 'LAW',
    title: 'Family & Marriage Laws',
    category: 'family',
    tagLabel: 'Family Law',
    tagColor: '#F472B6',
    shortSummary: 'Laws governing marriage, divorce, maintenance, custody, and inheritance in India.',
    overviewText: `Family laws in India vary based on religion but share common principles.

**Marriage Laws:**
• Hindu Marriage Act, 1955
• Special Marriage Act, 1954
• Muslim Personal Law
• Indian Christian Marriage Act

**Divorce Provisions:**
• Mutual consent: 6 months cooling period
• Contested: Cruelty, desertion, adultery
• Maintenance during proceedings
• One-time settlement options

**Maintenance Rights:**
• Under Section 125 CrPC (all religions)
• Under personal laws
• Interim maintenance during case
• Children's maintenance until 18/education

**Child Custody:**
• Welfare of child paramount
• Mother preferred for young children
• Visitation rights for non-custodial parent
• Joint custody increasingly common

**Inheritance:**
• Hindu Succession Act (amended 2005)
• Equal rights for daughters
• Will can override succession laws`,
    officialLink: 'https://wcd.nic.in',
    keywords: ['marriage', 'divorce', 'custody', 'maintenance', 'inheritance', 'family'],
    relatedIds: ['consumer-protection', 'rti-act', 'labour-laws'],
  },
  {
    id: 'cyber-laws',
    type: 'LAW',
    title: 'Cyber Laws & Digital Rights',
    category: 'citizen-rights',
    tagLabel: 'Digital & Cyber',
    tagColor: '#8B5CF6',
    shortSummary: 'IT Act provisions, cyber crime reporting, data protection, and digital privacy rights in India.',
    overviewText: `The Information Technology Act, 2000 (amended 2008) governs cyber activities in India.

**Key Cyber Crimes:**
• Identity theft and phishing
• Online fraud and cheating
• Cyberstalking and harassment
• Data theft and hacking
• Spreading obscene content

**Reporting Cyber Crime:**
• National Cyber Crime Portal: cybercrime.gov.in
• Call 1930 for financial fraud
• Local police cyber cell
• Preserve evidence (screenshots, URLs)

**Data Protection:**
• Upcoming Digital Personal Data Protection Act
• Right to access your data
• Right to correction and erasure
• Consent required for data processing

**Social Media Rules:**
• IT Rules 2021 for intermediaries
• Grievance redressal mechanism mandatory
• 24-hour takedown for certain content

**Penalties:**
• Unauthorized access: Up to 3 years + fine
• Data theft: Up to 3 years + ₹5 lakhs
• Identity theft: Up to 3 years + ₹1 lakh`,
    officialLink: 'https://cybercrime.gov.in',
    keywords: ['cyber', 'IT Act', 'hacking', 'fraud', 'data protection', 'privacy'],
    relatedIds: ['rti-act', 'consumer-protection', 'labour-laws'],
  },
];

// Service functions
export const getLawsSchemes = (category?: string, searchQuery?: string): LawScheme[] => {
  let results = [...LAWS_DATA];
  
  // Filter by category
  if (category && category !== 'all') {
    results = results.filter(item => item.category === category);
  }
  
  // Filter by search query
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    results = results.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.shortSummary.toLowerCase().includes(query) ||
      item.keywords.some(k => k.toLowerCase().includes(query)) ||
      item.tagLabel.toLowerCase().includes(query)
    );
  }
  
  return results;
};

export const getLawSchemeById = (id: string): LawScheme | undefined => {
  return LAWS_DATA.find(item => item.id === id);
};

export const getRelatedLawsSchemes = (item: LawScheme, limit: number = 4): LawScheme[] => {
  const related: LawScheme[] = [];
  
  // First: Get items from relatedIds
  item.relatedIds.forEach(relatedId => {
    const relatedItem = LAWS_DATA.find(i => i.id === relatedId && i.id !== item.id);
    if (relatedItem && !related.find(r => r.id === relatedItem.id)) {
      related.push(relatedItem);
    }
  });
  
  // Second: Get items from same category
  if (related.length < limit) {
    const sameCategory = LAWS_DATA.filter(
      i => i.category === item.category && i.id !== item.id && !related.find(r => r.id === i.id)
    );
    related.push(...sameCategory.slice(0, limit - related.length));
  }
  
  // Third: Get items with matching keywords
  if (related.length < limit) {
    const matchingKeywords = LAWS_DATA.filter(i => {
      if (i.id === item.id || related.find(r => r.id === i.id)) return false;
      return i.keywords.some(k => item.keywords.includes(k));
    });
    related.push(...matchingKeywords.slice(0, limit - related.length));
  }
  
  // Fourth: Fill with any remaining items
  if (related.length < limit) {
    const remaining = LAWS_DATA.filter(
      i => i.id !== item.id && !related.find(r => r.id === i.id)
    );
    related.push(...remaining.slice(0, limit - related.length));
  }
  
  return related.slice(0, limit);
};
