from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth, firestore
import razorpay
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Load environment variables
load_dotenv()

# Initialize Firebase Admin (simplified config for MVP)
# For production, use service account JSON file
FIREBASE_ENABLED = False
try:
    # Check if already initialized
    firebase_admin.get_app()
    FIREBASE_ENABLED = True
except ValueError:
    # Try to initialize if credentials are available
    try:
        # For now, use a mock initialization for development
        # In production, replace with actual service account JSON
        # firebase_admin.initialize_app(credentials.Certificate('path/to/serviceAccount.json'))
        
        # For MVP, we'll skip Firebase Admin initialization
        # Auth will be handled on frontend only
        print("⚠️  Firebase Admin not initialized - using mock mode for MVP")
        print("   To enable Firebase: Provide service account JSON and uncomment initialization")
        FIREBASE_ENABLED = False
    except Exception as e:
        print(f"⚠️  Firebase initialization skipped: {e}")
        FIREBASE_ENABLED = False

# Initialize Firestore (only if Firebase is enabled)
db = None
if FIREBASE_ENABLED:
    try:
        db = firestore.client()
        print("✅ Firestore connected successfully")
    except Exception as e:
        print(f"⚠️  Firestore connection failed: {e}")
else:
    print("⚠️  Running in mock mode - Firestore not available")

# In-memory mock database for MVP
mock_db = {
    "users": [],
    "lawyers": [],
    "chats": [],
    "documents": [],
    "bookings": [],
    "cases": [],
    "laws": []
}

# Initialize Razorpay
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_demo")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "demo_secret")
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Initialize FastAPI
app = FastAPI(title="SunoLegal API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= AUTHENTICATION DEPENDENCY =============

async def verify_firebase_token(authorization: str = Header(None)):
    """Verify Firebase ID token from Authorization header"""
    if not FIREBASE_ENABLED:
        # Mock authentication for development
        return {"uid": "mock_user_123", "email": "test@example.com"}
    
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token provided")
    
    try:
        # Extract token from "Bearer <token>" format
        token = authorization.split("Bearer ")[-1] if "Bearer" in authorization else authorization
        
        # Verify token
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# ============= PYDANTIC MODELS =============

class UserProfile(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    city: str
    state: str
    language: str = "en"
    role: str = "user"  # user, lawyer, admin

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class DocumentData(BaseModel):
    document_type: str  # rent_agreement, legal_notice, affidavit
    data: Dict[str, Any]

class LawyerProfile(BaseModel):
    name: str
    bar_council_id: str
    specialization: List[str]
    languages: List[str]
    city: str
    state: str
    experience: int
    price: int  # per 30 min consultation
    bio: Optional[str] = None

class BookingRequest(BaseModel):
    lawyer_id: str
    consultation_type: str  # chat, call, video
    date: str
    time_slot: str
    duration: int = 30  # minutes

class CaseData(BaseModel):
    title: str
    description: str
    court: Optional[str] = None
    case_number: Optional[str] = None
    hearing_date: Optional[str] = None
    status: str = "active"

# ============= HEALTH CHECK =============

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SunoLegal API",
        "version": "1.0.0",
        "firebase": "connected",
        "timestamp": datetime.now().isoformat()
    }

# ============= USER PROFILE ENDPOINTS =============

@app.post("/api/users/profile")
async def create_or_update_profile(
    profile: UserProfile,
    user = Depends(verify_firebase_token)
):
    """Create or update user profile in Firestore"""
    try:
        user_id = user["uid"]
        
        profile_data = profile.dict()
        profile_data["uid"] = user_id
        profile_data["created_at"] = firestore.SERVER_TIMESTAMP
        profile_data["updated_at"] = firestore.SERVER_TIMESTAMP
        
        # Save to Firestore
        db.collection("users").document(user_id).set(profile_data, merge=True)
        
        return {
            "success": True,
            "message": "Profile saved successfully",
            "user_id": user_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/profile")
async def get_profile(user = Depends(verify_firebase_token)):
    """Get user profile from Firestore"""
    try:
        user_id = user["uid"]
        doc = db.collection("users").document(user_id).get()
        
        if doc.exists:
            return {
                "success": True,
                "profile": doc.to_dict()
            }
        else:
            return {
                "success": False,
                "message": "Profile not found"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= NYAYAI CHAT ENDPOINTS =============

LEGAL_SYSTEM_PROMPT = """You are NyayAI, a helpful legal information assistant for India. 

IMPORTANT GUIDELINES:
1. You provide GENERAL LEGAL INFORMATION only, NOT legal advice
2. Always remind users that this is informational and they should consult a licensed lawyer for specific advice
3. Use simple, easy-to-understand language (avoid complex legal jargon)
4. Focus on Indian laws and procedures
5. Be empathetic and supportive - legal issues can be stressful
6. Provide actionable next steps when relevant
7. If asked about a topic outside your knowledge, be honest and suggest consulting a lawyer

KEY AREAS:
- Tenant rights and rent agreements
- Consumer protection
- Family law basics
- Police procedures and FIRs
- RTI (Right to Information)
- Government schemes
- Property disputes
- Employment law

Always end responses with: "For personalized legal advice, please consult a verified lawyer on our platform."
"""

@app.post("/api/chat/nyayai")
async def chat_with_nyayai(
    message: ChatMessage,
    user = Depends(verify_firebase_token)
):
    """Chat with NyayAI legal assistant"""
    try:
        user_id = user["uid"]
        session_id = message.session_id or f"{user_id}_{datetime.now().timestamp()}"
        
        # Initialize LlmChat with OpenAI
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=session_id,
            system_message=LEGAL_SYSTEM_PROMPT
        )
        chat.with_model("openai", "gpt-5.2")
        
        # Send message to AI
        user_message = UserMessage(text=message.message)
        response = await chat.send_message(user_message)
        
        # Save to Firestore
        chat_ref = db.collection("chats").document(session_id)
        chat_data = chat_ref.get()
        
        if chat_data.exists:
            # Append to existing chat
            chat_ref.update({
                "messages": firestore.ArrayUnion([
                    {
                        "role": "user",
                        "content": message.message,
                        "timestamp": datetime.now().isoformat()
                    },
                    {
                        "role": "assistant",
                        "content": response,
                        "timestamp": datetime.now().isoformat()
                    }
                ]),
                "updated_at": firestore.SERVER_TIMESTAMP
            })
        else:
            # Create new chat
            chat_ref.set({
                "user_id": user_id,
                "session_id": session_id,
                "messages": [
                    {
                        "role": "user",
                        "content": message.message,
                        "timestamp": datetime.now().isoformat()
                    },
                    {
                        "role": "assistant",
                        "content": response,
                        "timestamp": datetime.now().isoformat()
                    }
                ],
                "created_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP
            })
        
        return {
            "success": True,
            "response": response,
            "session_id": session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/history/{session_id}")
async def get_chat_history(
    session_id: str,
    user = Depends(verify_firebase_token)
):
    """Get chat history for a session"""
    try:
        user_id = user["uid"]
        
        # Get chat from Firestore
        doc = db.collection("chats").document(session_id).get()
        
        if doc.exists:
            chat_data = doc.to_dict()
            # Verify ownership
            if chat_data.get("user_id") != user_id:
                raise HTTPException(status_code=403, detail="Access denied")
            
            return {
                "success": True,
                "chat": chat_data
            }
        else:
            return {
                "success": False,
                "message": "Chat not found"
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/user-chats")
async def get_user_chats(user = Depends(verify_firebase_token)):
    """Get all chats for logged-in user"""
    try:
        user_id = user["uid"]
        
        # Query Firestore
        chats = db.collection("chats").where("user_id", "==", user_id).order_by("updated_at", direction=firestore.Query.DESCENDING).limit(20).stream()
        
        chat_list = []
        for chat in chats:
            chat_data = chat.to_dict()
            # Get last message for preview
            messages = chat_data.get("messages", [])
            last_message = messages[-1] if messages else None
            
            chat_list.append({
                "session_id": chat_data.get("session_id"),
                "last_message": last_message.get("content") if last_message else None,
                "updated_at": chat_data.get("updated_at"),
                "message_count": len(messages)
            })
        
        return {
            "success": True,
            "chats": chat_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= DOCUMENT GENERATOR ENDPOINTS =============

@app.post("/api/documents/generate")
async def generate_document(
    doc_data: DocumentData,
    user = Depends(verify_firebase_token)
):
    """Generate legal document (simplified for MVP)"""
    try:
        user_id = user["uid"]
        
        # In a real implementation, you would:
        # 1. Use a template engine to fill the document
        # 2. Generate PDF using a library like ReportLab or WeasyPrint
        # 3. Upload to Firebase Storage
        # For MVP, we'll just store the data
        
        document = {
            "user_id": user_id,
            "type": doc_data.document_type,
            "data": doc_data.data,
            "created_at": firestore.SERVER_TIMESTAMP,
            "pdf_url": None  # Would contain Firebase Storage URL in production
        }
        
        # Save to Firestore
        doc_ref = db.collection("documents").add(document)
        
        return {
            "success": True,
            "message": "Document generated successfully",
            "document_id": doc_ref[1].id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/documents/list")
async def list_documents(user = Depends(verify_firebase_token)):
    """List all documents for user"""
    try:
        user_id = user["uid"]
        
        # Query Firestore
        docs = db.collection("documents").where("user_id", "==", user_id).order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        
        doc_list = []
        for doc in docs:
            doc_data = doc.to_dict()
            doc_data["id"] = doc.id
            doc_list.append(doc_data)
        
        return {
            "success": True,
            "documents": doc_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= LAWYER MARKETPLACE ENDPOINTS =============

@app.get("/api/lawyers/list")
async def list_lawyers(
    city: Optional[str] = None,
    specialization: Optional[str] = None,
    language: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None
):
    """List lawyers with optional filters"""
    try:
        if not FIREBASE_ENABLED or not db:
            # Use mock database
            lawyer_list = mock_db["lawyers"].copy()
            
            # Apply filters
            if city:
                lawyer_list = [l for l in lawyer_list if l.get("city") == city]
            if specialization:
                lawyer_list = [l for l in lawyer_list if specialization in l.get("specialization", [])]
            if language:
                lawyer_list = [l for l in lawyer_list if language in l.get("languages", [])]
            if min_price:
                lawyer_list = [l for l in lawyer_list if l.get("price", 0) >= min_price]
            if max_price:
                lawyer_list = [l for l in lawyer_list if l.get("price", 0) <= max_price]
            
            return {
                "success": True,
                "lawyers": lawyer_list,
                "count": len(lawyer_list)
            }
        
        # Start with base query
        query = db.collection("lawyers")
        
        # Apply filters
        if city:
            query = query.where("city", "==", city)
        if specialization:
            query = query.where("specialization", "array_contains", specialization)
        if language:
            query = query.where("languages", "array_contains", language)
        
        # Get results
        lawyers = query.stream()
        
        lawyer_list = []
        for lawyer in lawyers:
            lawyer_data = lawyer.to_dict()
            lawyer_data["id"] = lawyer.id
            
            # Apply price filter (Firestore doesn't support range queries with other filters)
            if min_price and lawyer_data.get("price", 0) < min_price:
                continue
            if max_price and lawyer_data.get("price", 0) > max_price:
                continue
            
            lawyer_list.append(lawyer_data)
        
        return {
            "success": True,
            "lawyers": lawyer_list,
            "count": len(lawyer_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/lawyers/{lawyer_id}")
async def get_lawyer_profile(lawyer_id: str):
    """Get lawyer profile by ID"""
    try:
        doc = db.collection("lawyers").document(lawyer_id).get()
        
        if doc.exists:
            lawyer_data = doc.to_dict()
            lawyer_data["id"] = doc.id
            return {
                "success": True,
                "lawyer": lawyer_data
            }
        else:
            raise HTTPException(status_code=404, detail="Lawyer not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= BOOKING & PAYMENT ENDPOINTS =============

@app.post("/api/bookings/create")
async def create_booking(
    booking: BookingRequest,
    user = Depends(verify_firebase_token)
):
    """Create a booking and Razorpay order"""
    try:
        user_id = user["uid"]
        
        # Get lawyer details for pricing
        lawyer_doc = db.collection("lawyers").document(booking.lawyer_id).get()
        if not lawyer_doc.exists:
            raise HTTPException(status_code=404, detail="Lawyer not found")
        
        lawyer_data = lawyer_doc.to_dict()
        
        # Calculate amount (price per 30 min)
        price_per_30_min = lawyer_data.get("price", 500)
        amount = price_per_30_min * (booking.duration // 30)
        
        # Create Razorpay order
        order_data = {
            "amount": amount * 100,  # Convert to paise
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "user_id": user_id,
                "lawyer_id": booking.lawyer_id,
                "consultation_type": booking.consultation_type
            }
        }
        
        razorpay_order = razorpay_client.order.create(data=order_data)
        
        # Save booking to Firestore
        booking_data = {
            "user_id": user_id,
            "lawyer_id": booking.lawyer_id,
            "consultation_type": booking.consultation_type,
            "date": booking.date,
            "time_slot": booking.time_slot,
            "duration": booking.duration,
            "amount": amount,
            "status": "pending",
            "razorpay_order_id": razorpay_order["id"],
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        booking_ref = db.collection("bookings").add(booking_data)
        
        return {
            "success": True,
            "booking_id": booking_ref[1].id,
            "order_id": razorpay_order["id"],
            "amount": amount,
            "currency": "INR"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/bookings/verify-payment")
async def verify_payment(
    payment_id: str,
    order_id: str,
    signature: str,
    user = Depends(verify_firebase_token)
):
    """Verify Razorpay payment"""
    try:
        # Verify signature
        params_dict = {
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        }
        
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Update booking status
        bookings = db.collection("bookings").where("razorpay_order_id", "==", order_id).stream()
        
        for booking in bookings:
            db.collection("bookings").document(booking.id).update({
                "status": "confirmed",
                "razorpay_payment_id": payment_id,
                "payment_verified_at": firestore.SERVER_TIMESTAMP
            })
        
        return {
            "success": True,
            "message": "Payment verified and booking confirmed"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")

@app.get("/api/bookings/list")
async def list_bookings(user = Depends(verify_firebase_token)):
    """List all bookings for user"""
    try:
        user_id = user["uid"]
        
        bookings = db.collection("bookings").where("user_id", "==", user_id).order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        
        booking_list = []
        for booking in bookings:
            booking_data = booking.to_dict()
            booking_data["id"] = booking.id
            booking_list.append(booking_data)
        
        return {
            "success": True,
            "bookings": booking_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= CASE TRACKING ENDPOINTS =============

@app.post("/api/cases/create")
async def create_case(
    case: CaseData,
    user = Depends(verify_firebase_token)
):
    """Create a new case"""
    try:
        user_id = user["uid"]
        
        case_data = case.dict()
        case_data["user_id"] = user_id
        case_data["notes"] = []
        case_data["documents"] = []
        case_data["created_at"] = firestore.SERVER_TIMESTAMP
        case_data["updated_at"] = firestore.SERVER_TIMESTAMP
        
        case_ref = db.collection("cases").add(case_data)
        
        return {
            "success": True,
            "case_id": case_ref[1].id,
            "message": "Case created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cases/list")
async def list_cases(user = Depends(verify_firebase_token)):
    """List all cases for user"""
    try:
        user_id = user["uid"]
        
        cases = db.collection("cases").where("user_id", "==", user_id).order_by("updated_at", direction=firestore.Query.DESCENDING).stream()
        
        case_list = []
        for case in cases:
            case_data = case.to_dict()
            case_data["id"] = case.id
            case_list.append(case_data)
        
        return {
            "success": True,
            "cases": case_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cases/{case_id}")
async def get_case(
    case_id: str,
    user = Depends(verify_firebase_token)
):
    """Get case details"""
    try:
        user_id = user["uid"]
        
        doc = db.collection("cases").document(case_id).get()
        
        if doc.exists:
            case_data = doc.to_dict()
            # Verify ownership
            if case_data.get("user_id") != user_id:
                raise HTTPException(status_code=403, detail="Access denied")
            
            case_data["id"] = doc.id
            return {
                "success": True,
                "case": case_data
            }
        else:
            raise HTTPException(status_code=404, detail="Case not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/cases/{case_id}/notes")
async def add_case_note(
    case_id: str,
    note: Dict[str, str],
    user = Depends(verify_firebase_token)
):
    """Add note to case"""
    try:
        user_id = user["uid"]
        
        # Verify ownership
        doc = db.collection("cases").document(case_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Case not found")
        
        case_data = doc.to_dict()
        if case_data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Add note
        note_with_timestamp = {
            "content": note.get("content", ""),
            "timestamp": datetime.now().isoformat()
        }
        
        db.collection("cases").document(case_id).update({
            "notes": firestore.ArrayUnion([note_with_timestamp]),
            "updated_at": firestore.SERVER_TIMESTAMP
        })
        
        return {
            "success": True,
            "message": "Note added successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= LAWS & SCHEMES ENDPOINTS =============

@app.get("/api/laws/list")
async def list_laws(
    category: Optional[str] = None,
    state: Optional[str] = None,
    search: Optional[str] = None
):
    """List laws and schemes with filters"""
    try:
        if not FIREBASE_ENABLED or not db:
            # Use mock database
            law_list = mock_db["laws"].copy()
            
            # Apply filters
            if category:
                law_list = [l for l in law_list if l.get("category") == category]
            if state:
                law_list = [l for l in law_list if l.get("state") == state]
            if search:
                law_list = [l for l in law_list if search.lower() in l.get("title", "").lower()]
            
            return {
                "success": True,
                "laws": law_list,
                "count": len(law_list)
            }
        
        query = db.collection("laws")
        
        if category:
            query = query.where("category", "==", category)
        if state:
            query = query.where("state", "==", state)
        
        laws = query.stream()
        
        law_list = []
        for law in laws:
            law_data = law.to_dict()
            law_data["id"] = law.id
            
            # Simple search filter
            if search and search.lower() not in law_data.get("title", "").lower():
                continue
            
            law_list.append(law_data)
        
        return {
            "success": True,
            "laws": law_list,
            "count": len(law_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/laws/{law_id}")
async def get_law(law_id: str):
    """Get law details"""
    try:
        doc = db.collection("laws").document(law_id).get()
        
        if doc.exists:
            law_data = doc.to_dict()
            law_data["id"] = doc.id
            return {
                "success": True,
                "law": law_data
            }
        else:
            raise HTTPException(status_code=404, detail="Law not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= SEED DATA ENDPOINT (FOR DEVELOPMENT) =============

@app.post("/api/seed-data")
async def seed_sample_data():
    """Seed database with sample lawyers and laws (for MVP testing)"""
    try:
        # Sample lawyers
        sample_lawyers = [
            {
                "name": "Adv. Neha Sharma",
                "bar_council_id": "DL/12345/2015",
                "specialization": ["Family Law", "Matrimonial"],
                "languages": ["Hindi", "English"],
                "city": "Delhi",
                "state": "Delhi",
                "experience": 10,
                "price": 500,
                "rating": 4.9,
                "reviews": 210,
                "bio": "Experienced family law attorney specializing in divorce and custody cases.",
                "verified": True
            },
            {
                "name": "Adv. Vinayak Verma",
                "bar_council_id": "DL/23456/2013",
                "specialization": ["Corporate Law", "Contracts"],
                "languages": ["Hindi", "English"],
                "city": "Mumbai",
                "state": "Maharashtra",
                "experience": 12,
                "price": 800,
                "rating": 4.8,
                "reviews": 180,
                "bio": "Corporate law expert with focus on business contracts and compliance.",
                "verified": True
            },
            {
                "name": "Adv. Anil Kapoor",
                "bar_council_id": "MH/34567/2011",
                "specialization": ["Property Law", "Civil Law"],
                "languages": ["Hindi", "English", "Marathi"],
                "city": "Pune",
                "state": "Maharashtra",
                "experience": 15,
                "price": 1000,
                "rating": 4.6,
                "reviews": 95,
                "bio": "Property law specialist with extensive experience in civil litigation.",
                "verified": True
            },
            {
                "name": "Adv. Priya Menon",
                "bar_council_id": "KA/45678/2016",
                "specialization": ["Criminal Law"],
                "languages": ["English", "Hindi", "Kannada"],
                "city": "Bangalore",
                "state": "Karnataka",
                "experience": 8,
                "price": 600,
                "rating": 4.7,
                "reviews": 150,
                "bio": "Criminal defense lawyer committed to protecting client rights.",
                "verified": True
            }
        ]
        
        if FIREBASE_ENABLED and db:
            for lawyer in sample_lawyers:
                db.collection("lawyers").add(lawyer)
        else:
            # Add to mock database
            for lawyer in sample_lawyers:
                lawyer["id"] = f"lawyer_{len(mock_db['lawyers'])}"
                mock_db["lawyers"].append(lawyer)
        
        # Sample laws
        sample_laws = [
            {
                "title": "Consumer Protection Act, 2019",
                "category": "Consumer Law",
                "state": "All India",
                "type": "act",
                "description": "Protects consumer rights against unfair trade practices. Provides for consumer tribunals and e-commerce regulations.",
                "eligibility": "All consumers who purchase goods or services",
                "how_to_apply": "File complaint with District/State/National Consumer Commission",
                "required_docs": ["Purchase receipt", "Written complaint", "ID proof"],
                "key_points": [
                    "Right to safety",
                    "Right to information",
                    "Right to choose",
                    "Right to be heard",
                    "Right to seek redressal"
                ]
            },
            {
                "title": "Right to Information (RTI) Act, 2005",
                "category": "Citizen Rights",
                "state": "All India",
                "type": "act",
                "description": "Empowers citizens to seek information from government bodies, ensuring accountability in public services.",
                "eligibility": "All Indian citizens",
                "how_to_apply": "Submit RTI application to concerned Public Information Officer (PIO)",
                "required_docs": ["RTI application form", "Application fee (₹10)"],
                "key_points": [
                    "Get information within 30 days",
                    "First appeal within 30 days",
                    "Second appeal to Information Commission"
                ]
            },
            {
                "title": "PM Awas Yojana (Housing for All)",
                "category": "Housing",
                "state": "All India",
                "type": "scheme",
                "description": "Government scheme providing affordable housing to urban and rural poor through subsidies and financial assistance.",
                "eligibility": "EWS/LIG families with annual income up to ₹6 lakh (urban)",
                "how_to_apply": "Apply online through PM Awas Yojana portal or visit nearest CSC center",
                "required_docs": ["Aadhaar card", "Income certificate", "Property documents", "Bank account details"],
                "key_points": [
                    "Subsidy up to ₹2.67 lakh",
                    "Interest rate subsidy on home loans",
                    "No ownership of pucca house required"
                ]
            },
            {
                "title": "Tenancy Laws in India",
                "category": "Tenant Rights",
                "state": "All India",
                "type": "info",
                "description": "Rights and responsibilities of tenants under state Rent Control Acts and the Model Tenancy Act, 2021.",
                "eligibility": "All tenants under rental agreements",
                "how_to_apply": "Register rent agreement; approach Rent Control Court for disputes",
                "required_docs": ["Rent agreement", "Rent receipts", "ID proof"],
                "key_points": [
                    "Fair rent assessment",
                    "Protection from unlawful eviction",
                    "Security deposit (max 2-3 months rent)",
                    "Notice period requirements"
                ]
            }
        ]
        
        if FIREBASE_ENABLED and db:
            for law in sample_laws:
                db.collection("laws").add(law)
        else:
            # Add to mock database
            for law in sample_laws:
                law["id"] = f"law_{len(mock_db['laws'])}"
                mock_db["laws"].append(law)
        
        return {
            "success": True,
            "message": f"Added {len(sample_lawyers)} lawyers and {len(sample_laws)} laws to database",
            "mode": "mock" if not FIREBASE_ENABLED else "firebase"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
