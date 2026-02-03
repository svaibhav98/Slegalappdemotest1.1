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
- ✅ Category filtering with swipe gesture
- ✅ Type filtering (Law/Scheme/Portal)
- ✅ Law cards with title, preview, type badge, category chip
- ✅ Detail page with structured sections
- ✅ Official government links
- ✅ Bookmark/save functionality
- ✅ Disclaimer on every detail page

## What's Been Implemented

### 2024-02-03 - UI Cleanup Fixes (Latest)

#### Fix A: Law Detail Back Navigation ✅
- Back button now uses simple `router.back()` 
- Properly returns to previous screen (Laws list, Home, Saved Items, etc.)
- No forced redirect to specific screen - follows normal stack behavior

#### Fix B: Cases Screen - Removed Dot-Dot-Dot Row ✅
- Removed swipe indicator dots row below "My Cases" summary card
- Kept "Swipe" hint text in top-right of summary card header
- Tabs (All/Ongoing/Upcoming/Closed) remain clickable
- Swipe gesture still works across all 4 tabs

#### Fix C: Legal Documents - Removed Dot-Dot-Dot Row ✅  
- Removed swipe indicator dots row below tab bar
- Tab bar (Create New/My Documents/Saved Items) remains
- Tabs are clickable and swipe gesture still works
- Clean layout without extra rows

### 2024-02-03 - Earlier Bug Fixes

#### Fix 1: Laws Screen Swipe Gesture ✅
- Central/State tabs are now click-only (NOT swipeable)
- Category filters support horizontal swipe to change category
- "Swipe for categories" hint text added below results count
- PanResponder implementation with refs to avoid stale closures

#### Fix 2: Cases Screen - Added "All" Tab ✅
- Single "My Cases" summary card with All/Ongoing/Upcoming/Closed tabs
- Added "All" tab (previously missing)
- "Swipe" hint text in summary card header
- Swipe gesture works across all 4 tabs

#### Fix 3: Law Detail Page Scroll-to-Top ✅
- ScrollViewRef added with `scrollTo({y: 0})` on id change
- Related cards navigation scrolls to top automatically

### 2024-02-02 - Initial Implementation

#### Laws & Schemes Data Structure
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
- Central/State tabs with visual indicators (click-only)
- State selector modal for Maharashtra, Delhi, UP, Karnataka
- Search bar with clear functionality
- Advanced filters panel (type filtering)
- Category chips with counts + swipe gesture
- Results count display with swipe hint
- Law cards with icons, badges, preview
- Bookmark functionality
- Detail page with collapsible sections
- Related items with scroll-to-top navigation

### File Structure
```
/app/frontend/services/
├── lawsData.ts           # Central laws (30 items) + types + categories
├── stateLawsData.ts      # Maharashtra laws (20 items)
├── stateLawsData2.ts     # Delhi + UP laws (40 items)
├── stateLawsKarnataka.ts # Karnataka laws (20 items)
├── lawsDataExport.ts     # Combined exports + helper functions
├── casesData.ts          # Cases mock data

/app/frontend/app/(tabs)/
├── laws.tsx              # Laws list screen with category swipe
├── cases.tsx             # Cases screen with summary card tabs
├── law-detail/[id].tsx   # Detail screen with back nav fix

/app/frontend/app/
├── law-detail/[id].tsx   # Alternate detail screen (also fixed)
```

## Prioritized Backlog

### P0 (Must Have) - COMPLETED ✅
- [x] Central tab with 30 laws/schemes
- [x] State tab with 4 states x 20 cards each
- [x] Category filtering with swipe
- [x] Search functionality
- [x] Detail page with structured sections
- [x] Official links
- [x] Bug fixes (swipe, duplicate UI, back navigation)

### P1 (Should Have)
- [ ] Recently viewed laws
- [ ] Related laws based on user history
- [ ] Share law/scheme on WhatsApp/social
- [ ] PDF download of law summary
- [ ] Consolidate duplicate law-detail folders

### P2 (Nice to Have)
- [ ] AI-powered legal query assistant integration
- [ ] Regional language support (Hindi, Marathi, Kannada, Telugu)
- [ ] Audio read-aloud of content
- [ ] Offline access to saved laws
- [ ] Push notifications for scheme deadlines

## Next Tasks
1. Consolidate duplicate `law-detail` folder structure (refactoring)
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
- PanResponder for swipe gestures
- All law/scheme data is MOCKED locally in TypeScript files
