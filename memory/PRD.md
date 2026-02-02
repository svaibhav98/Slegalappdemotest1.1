# SunoLegal - Product Requirements Document

## Overview
SunoLegal is an Indian legal-tech mobile application (React Native/Expo) designed to democratize access to legal information and services. The app features an AI-powered legal assistant (NyayAI), lawyer marketplace, document generation, and government scheme information.

## Core Features

### 1. NyayAI - AI Legal Assistant
- Chat interface for legal queries
- Suggested prompts for common legal questions
- Professional legal-AI themed iconography
- Disclaimer showing on first landing per session

### 2. Lawyer Marketplace
- Browse and connect with verified lawyers
- Filter by specialization, language, availability
- Voice/video consultation booking
- "Join as a Lawyer" registration flow

### 3. Document Generator
- Legal document templates (Rent Agreement, NDA, Power of Attorney, etc.)
- Form-based document creation
- Download/share capabilities

### 4. Laws & Schemes
- Indian laws database with search
- Government schemes information
- Save/bookmark functionality

### 5. Case Tracker
- Track ongoing legal cases
- Hearing reminders
- Case document storage

## Technical Architecture

```
/app/
├── backend/              # FastAPI backend (server.py)
│   └── server.py
└── frontend/             # React Native/Expo frontend
    ├── app/              # Expo file-based routing
    │   ├── (tabs)/       # Main bottom navigation screens
    │   │   ├── home.tsx      # Home dashboard
    │   │   ├── cases.tsx     # Case tracker
    │   │   ├── chat.tsx      # NyayAI landing
    │   │   ├── documents.tsx # Document management
    │   │   └── laws.tsx      # Laws & schemes
    │   ├── (settings)/   # Settings screens
    │   └── lawyers.tsx   # Lawyer marketplace
    ├── components/       # Reusable components
    │   ├── icons/LegalIcons.tsx  # Custom SVG icons
    │   └── BottomNavBar.tsx
    ├── contexts/         # React Context providers
    │   ├── AuthContext.tsx
    │   └── SavedLawsContext.tsx
    └── services/         # Mock data services
```

## Recent Updates (February 2026)

### Completed Features (This Session)
1. **Horizontal Swipe Navigation - Legal Documents Screen**
   - Swipe between "Create New", "My Documents", and "Saved Items" tabs
   - PanResponder-based gesture detection (50px threshold)
   - Visual swipe indicator dots synced with active tab
   - Vertical scrolling preserved on all tabs
   - Tap navigation still works

2. **Horizontal Swipe Navigation - Cases Screen**
   - Swipe between "Ongoing", "Upcoming", and "Closed" tabs
   - Tab bar with counts (e.g., "Ongoing (2)")
   - Summary card with case statistics
   - Swipe indicator dots below tab bar

3. **Horizontal Swipe Navigation - Laws & Schemes Screen**
   - Swipe between category filters
   - Horizontal scrollable category chips
   - Swipe hint text "← Swipe to browse categories →"
   - Visual dots indicating current category

4. **Stale Closure Fix**
   - Used useRef to track active tab state for PanResponder
   - Prevents stale state issues in gesture handlers

### Previous Session (January 2025)
1. **NyayAI Landing Screen Optimization**
   - Reduced logo/icon size (72px → 44px)
   - Compact headline and subtext typography
   - Smaller suggested prompt cards with reduced padding
   - Tightened vertical spacing throughout
   - Disclaimer appears only on first landing, disappears after first message

2. **Home Screen Legal Disclaimer**
   - Floating popup for guest users on first visit
   - Auto-dismiss after 3 seconds
   - Close (X) button for instant dismissal
   - Shows once per session (AsyncStorage persistence)

3. **NyayAI Icon Replacement (Global)**
   - New professional legal-AI icon design
   - Scales of justice with neural/AI elements
   - Applied to: bottom navigation, NyayAI screen, floating button, quick access

4. **Notification Bell Feature**
   - Notification modal with 4 dummy items
   - Document Ready, Lawyer Response, Case Update, New Law Alert
   - Unread indicators and timestamps
   - "Mark all as read" action

5. **Lawyer Chat CTA Fix**
   - "Consult Lawyer" → Routes to lawyer marketplace
   - "Draft Document" → Routes to document generator

### Previous Session Completed
- UI spacing fixes across multiple screens
- Professional iconography overhaul
- Save Laws feature with dedicated section
- "Join as a Lawyer" header button
- Settings icon on Documents screen
- Deployment readiness fixes

## Architecture Notes
- **Database**: Firestore-only (MongoDB NOT required)
- **Firebase**: Authentication and Firestore (in-memory mock for development)
- **Razorpay**: Payment processing (mock)
- **Runtime**: Backend runs independently without MongoDB dependency

## Key Files Modified This Session
- `/app/frontend/app/(tabs)/chat.tsx` - NyayAI landing with compact UI
- `/app/frontend/app/(tabs)/home.tsx` - Notification bell feature
- `/app/frontend/app/nyayai-chat.tsx` - CTA link fixes
- `/app/frontend/app/consultation-chat.tsx` - CTA link fixes
- `/app/frontend/components/icons/LegalIcons.tsx` - New NyayAI icon

## Upcoming/Future Tasks
- **P1: Continue UI Polish Pass** - Apply design system to remaining screens
- Enhance NyayAI chat history drawer (rename, delete, pin chats)
- Implement file attachment and voice recording in NyayAI chat
- Implement real Firebase authentication
- Integrate Razorpay payment gateway
- Add actual AI responses (OpenAI/Gemini integration)
- Push notification support
- Real-time lawyer availability
- Document PDF generation
- Multi-language support (Hindi, regional languages)

## Test Credentials
- No login required - use "Continue as Guest" option
