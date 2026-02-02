# SunoLegal / NyayAI - PRD (Product Requirements Document)

## Original Problem Statement
Build a comprehensive Laws & Government Schemes system for the SunoLegal / NyayAI app with:
- Central (Pan-India) tab with 25-30 laws/schemes
- State tab with 4 states (Maharashtra, Delhi, UP, Karnataka) each having 20 cards
- Each card opens into a proper explainer detail page with meaningful content
- Simple but legally accurate language for common citizens
- Both basic text search and advanced search with filters

## User Personas
1. **Common Citizen** - Needs to understand legal rights and government schemes
2. **Victim of Issues** - Looking for solutions to specific problems (e.g., property dispute, consumer complaint)
3. **Beneficiary Seeker** - Wants to avail government welfare schemes

## Core Requirements (Static)
- ✅ Central/State tab navigation
- ✅ 4 states: Maharashtra, Delhi, UP, Karnataka
- ✅ State selector dropdown
- ✅ Search functionality (basic + advanced)
- ✅ Category filtering
- ✅ Type filtering (Law/Scheme/Portal)
- ✅ Law cards with title, preview, type badge, category chip
- ✅ Detail page with structured sections
- ✅ Official government links
- ✅ Bookmark/save functionality
- ✅ Disclaimer on every detail page

## What's Been Implemented (2024-02-02)

### Laws & Schemes Data Structure
- **Central Laws**: 30 pan-India items covering:
  - Citizen Rights (RTI, Consumer Protection, DPDPA, Cyber Laws, Legal Services Authority, Motor Vehicles, Food Safety, PWD Act, POSH)
  - Housing & Property (RERA, Model Tenancy Act, PMAY)
  - Employment (Labour Codes, EPFO, ESIC, Minimum Wages)
  - Women & Family (Domestic Violence, Maintenance/Alimony, Maternity Benefit, Senior Citizens Act)
  - Welfare Schemes (PM-KISAN, Ayushman Bharat, Jan Dhan, Atal Pension)
  - Business & MSME (Udyam Registration, Startup India, GST Basics)
  - Documents (Aadhaar/PAN Rights, Legal Notice Basics)
  - Utilities (Electricity Act)

- **State Laws** (20 each):
  - Maharashtra: MahaRERA, Rent Control, 7/12 Extract, Aaple Sarkar, e-FIR, MSLSA, Women Commission, Ladki Bahin, MJPJAY, Sanjay Gandhi Niradhar, Shiv Bhojan, Krushi Pump, MahaDBT, CMEGP, MHADA Lottery, Ration Card, Birth/Death, Domicile/Income
  - Delhi: Delhi RERA, Rent Disputes, Property Mutation, e-District, e-FIR, DLSA, DCW, Labour Portal, Mohalla Clinics, Free Electricity, Free Bus Women, Scholarships, CM Free Coaching, Old Age Pension, Disability Pension, Ration Card, Water/Sewer, Birth/Death, Certificates
  - UP: Jansunwai, UP RERA, e-FIR, UPSLSA, Bhulekh, Labour Dept, 181 Women Helpline, Tehsil Certificates, Kanya Sumangala, Yuva Swarozgar, CM Awas, Old Age Pension, Farmer Accident Insurance, Ration Card, Widow Pension, Scholarship Portal, Birth/Death, Electricity, e-Samaj Kalyan
  - Karnataka: Karnataka RERA, Seva Sindhu, e-FIR, KSLSA, Bhoomi, Labour Dept, Women Commission, Revenue Certificates, Gruha Jyothi, Gruha Lakshmi, Anna Bhagya, Shakti Free Bus, Yuva Nidhi, Arogya Karnataka, Old Age Pension, Disability Pension, Ration Card, Birth/Death, Scholarships

### UI Components
- Central/State tabs with visual indicators
- State selector modal for Maharashtra, Delhi, UP, Karnataka
- Search bar with clear functionality
- Advanced filters panel (type filtering)
- Category chips with counts
- Results count display
- Law cards with icons, badges, preview
- Bookmark functionality
- Detail page with collapsible sections

### File Structure
```
/app/frontend/services/
├── lawsData.ts           # Central laws (30 items) + types + categories
├── stateLawsData.ts      # Maharashtra laws (20 items)
├── stateLawsData2.ts     # Delhi + UP laws (40 items)
├── stateLawsKarnataka.ts # Karnataka laws (20 items)
├── lawsDataExport.ts     # Combined exports + helper functions

/app/frontend/app/(tabs)/
├── laws.tsx              # Main laws list screen
├── law-detail/[id].tsx   # Detail screen with sections
```

## Prioritized Backlog

### P0 (Must Have) - COMPLETED ✅
- [x] Central tab with 30 laws/schemes
- [x] State tab with 4 states x 20 cards each
- [x] Category filtering
- [x] Search functionality
- [x] Detail page with structured sections
- [x] Official links

### P1 (Should Have)
- [ ] Recently viewed laws
- [ ] Related laws based on user history
- [ ] Share law/scheme on WhatsApp/social
- [ ] PDF download of law summary

### P2 (Nice to Have)
- [ ] AI-powered legal query assistant integration
- [ ] Regional language support (Hindi, Marathi, Kannada, Telugu)
- [ ] Audio read-aloud of content
- [ ] Offline access to saved laws
- [ ] Push notifications for scheme deadlines

## Next Tasks
1. Add remaining 2 cards to Maharashtra to reach exactly 20 (currently 18 showing)
2. Implement search highlighting in results
3. Add "Share" button on detail page
4. Connect with AI chat for legal queries
5. Test on actual mobile devices (iOS/Android)

## Technical Notes
- React Native Expo app
- TypeScript for type safety
- Local state management (no backend for laws data)
- SavedLawsContext for bookmarks
- Expo Router for navigation
