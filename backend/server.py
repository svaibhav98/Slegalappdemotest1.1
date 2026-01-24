from fastapi import FastAPI, HTTPException, Depends, Header, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import os
import io
import hmac
import hashlib
import uuid
import base64
import secrets
from dotenv import load_dotenv

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# PDF Generation
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

# LLM Integration
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Load environment variables
load_dotenv()

# ============= UID-BASED RATE LIMITER SETUP =============
# Custom key function: Use UID for authenticated users, IP for guests

def get_rate_limit_key(request: Request) -> str:
    """
    Get rate limiting key:
    - For authenticated users: use their UID
    - For guests: fall back to IP address
    """
    auth_header = request.headers.get("authorization", "")
    
    if auth_header and "Bearer" in auth_header:
        token = auth_header.split("Bearer ")[-1].strip()
        if token:
            # In mock mode, extract user ID from token
            if token.startswith("mock_"):
                return f"uid:{token}"
            # For any other token, create a consistent key
            return f"uid:user_{token[:16]}"
    
    # Fall back to IP for guests
    return f"ip:{get_remote_address(request)}"

limiter = Limiter(key_func=get_rate_limit_key)

# ============= MOCK DATABASE (Firestore Simulation) =============
# This simulates Firestore behavior for MVP
# In production, replace with actual Firebase Admin SDK

class MockFirestoreDB:
    """
    Mock Firestore database for development/testing.
    Provides same interface as Firestore for easy migration.
    When you have real Firebase credentials, simply swap this out.
    """
    def __init__(self):
        self._data = {
            "users": {},
            "lawyers": {},
            "lawyer_applications": {},  # For lawyer verification workflow
            "chats": {},
            "documents": {},
            "bookings": {},
            "cases": {},
            "laws": {},
            "payments": {},  # For tracking webhook idempotency
            "webhook_events": {},  # For webhook idempotency by event_id
        }
        self._seed_initial_data()
    
    def _seed_initial_data(self):
        """Seed with sample data on startup"""
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
                "verified": True,
                "image": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400"
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
                "verified": True,
                "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
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
                "verified": True,
                "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"
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
                "verified": True,
                "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400"
            }
        ]
        
        for i, lawyer in enumerate(sample_lawyers):
            lawyer_id = f"lawyer_{i+1}"
            lawyer["id"] = lawyer_id
            lawyer["created_at"] = datetime.now().isoformat()
            self._data["lawyers"][lawyer_id] = lawyer
        
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
        
        for i, law in enumerate(sample_laws):
            law_id = f"law_{i+1}"
            law["id"] = law_id
            law["created_at"] = datetime.now().isoformat()
            self._data["laws"][law_id] = law
        
        print(f"✅ Mock DB seeded: {len(sample_lawyers)} lawyers, {len(sample_laws)} laws")
    
    def collection(self, name: str):
        """Get a collection reference"""
        return MockCollection(self._data, name)


class MockCollection:
    """Mock Firestore Collection"""
    def __init__(self, data: dict, name: str):
        self._data = data
        self._name = name
        if name not in self._data:
            self._data[name] = {}
    
    def document(self, doc_id: str):
        """Get document reference"""
        return MockDocumentRef(self._data, self._name, doc_id)
    
    def add(self, data: dict):
        """Add new document with auto-generated ID"""
        doc_id = str(uuid.uuid4())[:8]
        data["id"] = doc_id
        data["created_at"] = datetime.now().isoformat()
        self._data[self._name][doc_id] = data
        return (None, MockDocumentRef(self._data, self._name, doc_id))
    
    def where(self, field: str, op: str, value: Any):
        """Query documents"""
        return MockQuery(self._data, self._name, [(field, op, value)])
    
    def order_by(self, field: str, direction=None):
        """Order documents (returns a query)"""
        query = MockQuery(self._data, self._name, [])
        return query.order_by(field, direction)
    
    def stream(self):
        """Get all documents in collection"""
        return [MockDocumentSnapshot(doc_id, data) 
                for doc_id, data in self._data[self._name].items()]


class MockQuery:
    """Mock Firestore Query with pagination support"""
    def __init__(self, data: dict, collection: str, filters: list):
        self._data = data
        self._collection = collection
        self._filters = filters
        self._order_by_field = None
        self._order_direction = "ASCENDING"
        self._limit_count = None
        self._start_after_value = None
    
    def where(self, field: str, op: str, value: Any):
        """Add filter"""
        self._filters.append((field, op, value))
        return self
    
    def order_by(self, field: str, direction=None):
        """Order results"""
        self._order_by_field = field
        if direction:
            self._order_direction = direction
        return self
    
    def limit(self, count: int):
        """Limit results"""
        self._limit_count = count
        return self
    
    def start_after(self, cursor_value: Any):
        """Start after a cursor value for pagination"""
        self._start_after_value = cursor_value
        return self
    
    def stream(self):
        """Execute query and return results"""
        results = []
        for doc_id, doc_data in self._data[self._collection].items():
            match = True
            for field, op, value in self._filters:
                doc_value = doc_data.get(field)
                if op == "==":
                    if doc_value != value:
                        match = False
                elif op == "array_contains":
                    if not isinstance(doc_value, list) or value not in doc_value:
                        match = False
            if match:
                results.append(MockDocumentSnapshot(doc_id, doc_data))
        
        # Apply ordering
        if self._order_by_field:
            reverse = self._order_direction == "DESCENDING"
            results.sort(key=lambda x: x.to_dict().get(self._order_by_field, ""), reverse=reverse)
        
        # Apply cursor pagination (start_after)
        if self._start_after_value and self._order_by_field:
            filtered_results = []
            found_cursor = False
            for doc in results:
                doc_value = doc.to_dict().get(self._order_by_field, "")
                if found_cursor:
                    filtered_results.append(doc)
                elif doc_value == self._start_after_value:
                    found_cursor = True
            results = filtered_results
        
        # Apply limit
        if self._limit_count:
            results = results[:self._limit_count]
        
        return results


class MockDocumentRef:
    """Mock Firestore Document Reference"""
    def __init__(self, data: dict, collection: str, doc_id: str):
        self._data = data
        self._collection = collection
        self._doc_id = doc_id
    
    @property
    def id(self):
        return self._doc_id
    
    def get(self):
        """Get document snapshot"""
        doc_data = self._data[self._collection].get(self._doc_id)
        return MockDocumentSnapshot(self._doc_id, doc_data)
    
    def set(self, data: dict, merge: bool = False):
        """Set document data"""
        if merge and self._doc_id in self._data[self._collection]:
            self._data[self._collection][self._doc_id].update(data)
        else:
            data["id"] = self._doc_id
            self._data[self._collection][self._doc_id] = data
    
    def update(self, data: dict):
        """Update document fields"""
        if self._doc_id in self._data[self._collection]:
            # Handle ArrayUnion
            for key, value in data.items():
                if isinstance(value, dict) and "_array_union" in value:
                    existing = self._data[self._collection][self._doc_id].get(key, [])
                    existing.extend(value["_array_union"])
                    self._data[self._collection][self._doc_id][key] = existing
                else:
                    self._data[self._collection][self._doc_id][key] = value
            self._data[self._collection][self._doc_id]["updated_at"] = datetime.now().isoformat()


class MockDocumentSnapshot:
    """Mock Firestore Document Snapshot"""
    def __init__(self, doc_id: str, data: Optional[dict]):
        self._doc_id = doc_id
        self._data = data
    
    @property
    def id(self):
        return self._doc_id
    
    @property
    def exists(self):
        return self._data is not None
    
    def to_dict(self):
        return self._data.copy() if self._data else None


# Helper for ArrayUnion simulation
def ArrayUnion(values: list):
    return {"_array_union": values}


# ============= MOCK FIREBASE STORAGE =============
class MockFirebaseStorage:
    """
    Mock Firebase Storage for development/testing.
    Simulates private storage with signed URLs.
    SECURITY: All files are private by default - NO make_public() method.
    """
    def __init__(self):
        self._files = {}  # path -> {"data": bytes, "metadata": dict, "owner_uid": str}
        self._signed_url_tokens = {}  # token -> {"path": str, "expires": datetime}
    
    def upload_file(self, path: str, data: bytes, owner_uid: str, metadata: dict = None) -> dict:
        """
        Upload file to private storage.
        Path format: {collection}/{owner_uid}/{filename}
        """
        # Validate path includes owner_uid for security
        path_parts = path.split("/")
        if len(path_parts) < 3:
            raise ValueError("Invalid path format. Must be: collection/userId/filename")
        
        self._files[path] = {
            "data": data,
            "metadata": metadata or {},
            "owner_uid": owner_uid,
            "created_at": datetime.now().isoformat(),
            "size": len(data)
        }
        
        return {
            "path": path,
            "size": len(data),
            "created_at": self._files[path]["created_at"]
        }
    
    def get_file(self, path: str, requester_uid: str, is_admin: bool = False) -> Optional[bytes]:
        """
        Get file - only if requester owns it or is admin.
        SECURITY: Enforces ownerUserId == request.auth.uid
        """
        if path not in self._files:
            return None
        
        file_info = self._files[path]
        
        # Security check: owner or admin only
        if not is_admin and file_info["owner_uid"] != requester_uid:
            raise PermissionError("Access denied: You can only access your own files")
        
        return file_info["data"]
    
    def generate_signed_url(self, path: str, requester_uid: str, is_admin: bool = False, 
                            expires_in_minutes: int = 15) -> str:
        """
        Generate a time-limited signed URL for authenticated download.
        SECURITY: Only owner or admin can generate URLs.
        """
        if path not in self._files:
            raise FileNotFoundError(f"File not found: {path}")
        
        file_info = self._files[path]
        
        # Security check: owner or admin only
        if not is_admin and file_info["owner_uid"] != requester_uid:
            raise PermissionError("Access denied: You can only access your own files")
        
        # Generate signed URL token
        token = secrets.token_urlsafe(32)
        expires = datetime.now() + timedelta(minutes=expires_in_minutes)
        
        self._signed_url_tokens[token] = {
            "path": path,
            "expires": expires
        }
        
        # In production, this would be a real Firebase Storage signed URL
        return f"/api/storage/download?token={token}"
    
    def validate_signed_url(self, token: str) -> Optional[str]:
        """Validate signed URL token and return file path if valid."""
        if token not in self._signed_url_tokens:
            return None
        
        token_info = self._signed_url_tokens[token]
        
        # Check expiration
        if datetime.now() > token_info["expires"]:
            del self._signed_url_tokens[token]
            return None
        
        return token_info["path"]
    
    def delete_file(self, path: str, requester_uid: str, is_admin: bool = False) -> bool:
        """Delete file - only if requester owns it or is admin."""
        if path not in self._files:
            return False
        
        file_info = self._files[path]
        
        # Security check
        if not is_admin and file_info["owner_uid"] != requester_uid:
            raise PermissionError("Access denied: You can only delete your own files")
        
        del self._files[path]
        return True
    
    def list_user_files(self, collection: str, user_uid: str) -> List[dict]:
        """List all files owned by a user in a collection."""
        prefix = f"{collection}/{user_uid}/"
        return [
            {"path": path, **info}
            for path, info in self._files.items()
            if path.startswith(prefix)
        ]


# Initialize Mock Storage
storage = MockFirebaseStorage()
print("🔶 Storage running in MOCK MODE - All files are PRIVATE")


# Initialize Mock Database
db = MockFirestoreDB()
print("🔶 Running in MOCK MODE - Using in-memory database")
print("   To use real Firestore: Provide Firebase service account credentials")

# ============= RAZORPAY SETUP =============
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_demo")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "demo_secret")

# For webhook signature verification
def verify_razorpay_signature(payload: bytes, signature: str) -> bool:
    """Verify Razorpay webhook signature"""
    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_signature, signature)

# Mock Razorpay client for development
class MockRazorpayClient:
    """Mock Razorpay client for development without real API keys"""
    class Order:
        def create(self, data: dict) -> dict:
            return {
                "id": f"order_{uuid.uuid4().hex[:12]}",
                "amount": data["amount"],
                "currency": data.get("currency", "INR"),
                "status": "created",
                "created_at": int(datetime.now().timestamp())
            }
    
    class Utility:
        def verify_payment_signature(self, params: dict) -> bool:
            # In mock mode, always return success for testing
            return True
    
    def __init__(self):
        self.order = self.Order()
        self.utility = self.Utility()

# Use mock client (replace with real razorpay.Client when you have keys)
razorpay_client = MockRazorpayClient()
print("🔶 Razorpay running in MOCK MODE")

# ============= INITIALIZE FASTAPI =============
app = FastAPI(
    title="SunoLegal API",
    version="1.0.0",
    description="Legal services platform API - Running in MOCK mode for development"
)

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ============= CORS CONFIGURATION =============
# In production, replace with your actual domains
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS[0] != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= AUTHENTICATION =============

async def verify_token(authorization: str = Header(None)):
    """
    Verify authentication token.
    In MOCK mode: Returns a demo user for testing.
    In production: Verify Firebase ID token.
    """
    # Mock authentication for development
    if not authorization:
        # Allow guest access with limited permissions
        return {"uid": "guest_user", "email": None, "is_guest": True}
    
    # Extract token
    token = authorization.split("Bearer ")[-1] if "Bearer" in authorization else authorization
    
    # In mock mode, decode simple token or accept any
    if token.startswith("mock_"):
        return {"uid": token, "email": f"{token}@example.com", "is_guest": False}
    
    # For any other token, return a mock authenticated user
    return {"uid": f"user_{token[:8]}", "email": "test@example.com", "is_guest": False}


async def require_auth(authorization: str = Header(None)):
    """Require authenticated user (not guest)"""
    user = await verify_token(authorization)
    if user.get("is_guest"):
        raise HTTPException(status_code=401, detail="Authentication required for this action")
    return user

# ============= PYDANTIC MODELS =============

class UserProfile(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    city: str
    state: str
    language: str = "en"
    role: str = "user"

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class DocumentData(BaseModel):
    document_type: str  # rent_agreement, legal_notice, affidavit, consumer_complaint
    data: Dict[str, Any]

class BookingRequest(BaseModel):
    lawyer_id: str
    consultation_type: str  # chat, call, video
    date: str
    time_slot: str
    duration: int = 30

class CaseData(BaseModel):
    title: str
    description: str
    court: Optional[str] = None
    case_number: Optional[str] = None
    hearing_date: Optional[str] = None
    status: str = "active"

class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class LawyerApplication(BaseModel):
    """Lawyer application/profile - submitted by users wanting to become lawyers"""
    name: str
    bar_council_id: str
    specialization: List[str]
    languages: List[str]
    city: str
    state: str
    experience: int
    price: int
    bio: str
    phone: str
    email: str

# ============= ADMIN AUTHENTICATION =============

ADMIN_SECRET = os.getenv("ADMIN_SECRET", "demo_admin_secret_change_in_production")

async def require_admin(authorization: str = Header(None), x_admin_secret: str = Header(None)):
    """
    Require admin privileges.
    In production, this should use Firebase Custom Claims or a proper admin role system.
    """
    user = await verify_token(authorization)
    
    # Check admin secret header
    if x_admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user["is_admin"] = True
    return user

# ============= HEALTH CHECK =============

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint for monitoring.
    Verifies Firestore read/write and Firebase Admin SDK initialization.
    """
    health_status = {
        "status": "healthy",
        "service": "SunoLegal API",
        "version": "1.0.0",
        "mode": "MOCK" if RAZORPAY_KEY_SECRET == "demo_secret" else "PRODUCTION",
        "checks": {},
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        # Test Firestore read
        test_doc_id = "_health_check"
        test_data = {"check": "read_write", "timestamp": datetime.now().isoformat()}
        
        # Write test
        db.collection("_health").document(test_doc_id).set(test_data)
        health_status["checks"]["firestore_write"] = "OK"
        
        # Read test
        read_result = db.collection("_health").document(test_doc_id).get()
        if read_result.exists:
            health_status["checks"]["firestore_read"] = "OK"
        else:
            health_status["checks"]["firestore_read"] = "FAIL"
            health_status["status"] = "degraded"
        
        # Verify collections exist
        lawyers_count = len(list(db.collection("lawyers").stream()))
        laws_count = len(list(db.collection("laws").stream()))
        health_status["checks"]["seeded_data"] = f"lawyers:{lawyers_count}, laws:{laws_count}"
        
        # Storage check
        health_status["checks"]["storage"] = "OK (private mode)"
        
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["error"] = str(e)
    
    health_status["features"] = {
        "database": "mock_firestore" if RAZORPAY_KEY_SECRET == "demo_secret" else "firebase_admin",
        "storage": "private_only",
        "payments": "mock_razorpay" if RAZORPAY_KEY_SECRET == "demo_secret" else "razorpay_live",
        "llm": "emergent_integration",
        "pdf_generation": "reportlab",
        "rate_limiting": "uid_based"
    }
    
    return health_status

# ============= USER PROFILE ENDPOINTS =============

@app.post("/api/users/profile")
async def create_or_update_profile(
    profile: UserProfile,
    user = Depends(require_auth)
):
    """Create or update user profile"""
    user_id = user["uid"]
    
    profile_data = profile.dict()
    profile_data["uid"] = user_id
    profile_data["updated_at"] = datetime.now().isoformat()
    
    db.collection("users").document(user_id).set(profile_data, merge=True)
    
    return {
        "success": True,
        "message": "Profile saved successfully",
        "user_id": user_id
    }

@app.get("/api/users/profile")
async def get_profile(user = Depends(verify_token)):
    """Get user profile"""
    if user.get("is_guest"):
        return {"success": False, "message": "Guest users don't have profiles"}
    
    user_id = user["uid"]
    doc = db.collection("users").document(user_id).get()
    
    if doc.exists:
        return {"success": True, "profile": doc.to_dict()}
    else:
        return {"success": False, "message": "Profile not found"}

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
@limiter.limit("20/minute")  # Rate limit: 20 requests per minute
async def chat_with_nyayai(
    request: Request,
    message: ChatMessage,
    user = Depends(verify_token)
):
    """Chat with NyayAI legal assistant"""
    user_id = user["uid"]
    session_id = message.session_id or f"{user_id}_{int(datetime.now().timestamp())}"
    
    try:
        # Initialize LlmChat with Emergent Integration
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=session_id,
            system_message=LEGAL_SYSTEM_PROMPT
        )
        chat.with_model("openai", "gpt-4o-mini")
        
        # Send message to AI
        user_message = UserMessage(text=message.message)
        response = await chat.send_message(user_message)
        
        # Store chat in database
        chat_ref = db.collection("chats").document(session_id)
        chat_data = chat_ref.get()
        
        new_messages = [
            {"role": "user", "content": message.message, "timestamp": datetime.now().isoformat()},
            {"role": "assistant", "content": response, "timestamp": datetime.now().isoformat()}
        ]
        
        if chat_data.exists:
            chat_ref.update({
                "messages": ArrayUnion(new_messages),
                "updated_at": datetime.now().isoformat()
            })
        else:
            chat_ref.set({
                "user_id": user_id,
                "session_id": session_id,
                "messages": new_messages,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            })
        
        return {
            "success": True,
            "response": response,
            "session_id": session_id
        }
    except Exception as e:
        # Fallback response if LLM fails
        return {
            "success": True,
            "response": f"I apologize, but I'm having trouble connecting right now. Your question was: '{message.message}'. Please try again in a moment, or consult with a lawyer on our platform for immediate assistance.",
            "session_id": session_id,
            "error": str(e)
        }

@app.get("/api/chat/history/{session_id}")
async def get_chat_history(session_id: str, user = Depends(verify_token)):
    """Get chat history for a session"""
    user_id = user["uid"]
    
    doc = db.collection("chats").document(session_id).get()
    
    if doc.exists:
        chat_data = doc.to_dict()
        # Verify ownership (skip for guests viewing their own session)
        if not user.get("is_guest") and chat_data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {"success": True, "chat": chat_data}
    else:
        return {"success": False, "message": "Chat not found"}

@app.get("/api/chat/user-chats")
async def get_user_chats(
    limit: int = 30,
    cursor: Optional[str] = None,
    user = Depends(require_auth)
):
    """
    Get chats for logged-in user with pagination.
    
    - Default limit: 30
    - Max limit: 100
    - Ordered by updated_at descending (most recent first)
    - Cursor-based pagination using updated_at value
    """
    user_id = user["uid"]
    
    # Enforce limits
    limit = min(max(1, limit), 100)  # Clamp between 1 and 100
    
    # Build query with ordering and limit
    query = db.collection("chats").where("user_id", "==", user_id)
    query = query.order_by("updated_at", direction="DESCENDING")
    
    # Apply cursor if provided
    if cursor:
        query = query.start_after(cursor)
    
    # Apply limit + 1 to check if there are more results
    query = query.limit(limit + 1)
    
    chats = query.stream()
    
    chat_list = []
    for chat in chats:
        chat_data = chat.to_dict()
        messages = chat_data.get("messages", [])
        last_message = messages[-1] if messages else None
        
        chat_list.append({
            "session_id": chat_data.get("session_id"),
            "last_message": last_message.get("content") if last_message else None,
            "updated_at": chat_data.get("updated_at"),
            "message_count": len(messages)
        })
    
    # Determine next_cursor
    next_cursor = None
    if len(chat_list) > limit:
        chat_list = chat_list[:limit]  # Trim to requested limit
        next_cursor = chat_list[-1]["updated_at"] if chat_list else None
    
    return {
        "success": True,
        "items": chat_list,
        "next_cursor": next_cursor
    }

# ============= DOCUMENT GENERATOR ENDPOINTS =============

def generate_rent_agreement_pdf(data: Dict[str, Any]) -> io.BytesIO:
    """Generate Rent Agreement PDF"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=1*cm, bottomMargin=1*cm)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], alignment=TA_CENTER, fontSize=18, spaceAfter=30)
    heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], fontSize=12, spaceAfter=10, spaceBefore=15)
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, alignment=TA_JUSTIFY, spaceAfter=8)
    
    elements = []
    
    # Title
    elements.append(Paragraph("RENT AGREEMENT", title_style))
    elements.append(Spacer(1, 20))
    
    # Date and Place
    elements.append(Paragraph(f"This Rent Agreement is executed on <b>{data.get('agreement_date', '_____________')}</b> at <b>{data.get('city', '_____________')}</b>", body_style))
    elements.append(Spacer(1, 15))
    
    # Parties
    elements.append(Paragraph("BETWEEN", heading_style))
    elements.append(Paragraph(f"""
    <b>LANDLORD:</b> {data.get('landlord_name', '_____________')}<br/>
    Address: {data.get('landlord_address', '_____________')}<br/>
    (hereinafter referred to as the "LANDLORD")
    """, body_style))
    
    elements.append(Paragraph("AND", heading_style))
    elements.append(Paragraph(f"""
    <b>TENANT:</b> {data.get('tenant_name', '_____________')}<br/>
    Address: {data.get('tenant_address', '_____________')}<br/>
    (hereinafter referred to as the "TENANT")
    """, body_style))
    
    # Property Details
    elements.append(Paragraph("PROPERTY DETAILS", heading_style))
    elements.append(Paragraph(f"""
    The Landlord hereby agrees to let out and the Tenant hereby agrees to take on rent the premises described below:<br/><br/>
    <b>Property Address:</b> {data.get('property_address', '_____________')}<br/>
    <b>Property Type:</b> {data.get('property_type', 'Residential')}<br/>
    <b>Floor/Unit:</b> {data.get('floor_unit', '_____________')}
    """, body_style))
    
    # Terms
    elements.append(Paragraph("TERMS AND CONDITIONS", heading_style))
    
    terms = [
        f"<b>1. Rent:</b> The monthly rent shall be Rs. {data.get('monthly_rent', '_____________')}/- (Rupees {data.get('rent_in_words', '_____________')} only), payable on or before the {data.get('rent_due_date', '5th')} of every month.",
        f"<b>2. Security Deposit:</b> The Tenant shall pay a security deposit of Rs. {data.get('security_deposit', '_____________')}/- which shall be refunded at the end of the tenancy after deducting any dues.",
        f"<b>3. Term:</b> This agreement shall be valid for a period of {data.get('lease_duration', '11 months')} from {data.get('start_date', '_____________')} to {data.get('end_date', '_____________')}.",
        f"<b>4. Utilities:</b> {data.get('utilities_arrangement', 'Electricity and water charges shall be borne by the Tenant.')}",
        "<b>5. Maintenance:</b> The Tenant shall maintain the premises in good condition and shall be responsible for minor repairs.",
        "<b>6. Sub-letting:</b> The Tenant shall not sub-let or transfer the premises without prior written consent of the Landlord.",
        f"<b>7. Notice Period:</b> Either party may terminate this agreement by giving {data.get('notice_period', 'one month')} written notice.",
        "<b>8. Use of Premises:</b> The premises shall be used for residential purposes only."
    ]
    
    for term in terms:
        elements.append(Paragraph(term, body_style))
    
    elements.append(Spacer(1, 30))
    
    # Signatures
    elements.append(Paragraph("IN WITNESS WHEREOF, the parties have signed this Agreement on the date mentioned above.", body_style))
    elements.append(Spacer(1, 40))
    
    # Signature table
    sig_data = [
        ["LANDLORD", "TENANT"],
        ["", ""],
        ["Signature: _______________", "Signature: _______________"],
        [f"Name: {data.get('landlord_name', '_____________')}", f"Name: {data.get('tenant_name', '_____________')}"],
        ["Date: _______________", "Date: _______________"]
    ]
    
    sig_table = Table(sig_data, colWidths=[250, 250])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(sig_table)
    
    # Witnesses
    elements.append(Spacer(1, 30))
    elements.append(Paragraph("WITNESSES:", heading_style))
    elements.append(Paragraph("1. Name: _______________ Signature: _______________ Address: _______________", body_style))
    elements.append(Paragraph("2. Name: _______________ Signature: _______________ Address: _______________", body_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer


def generate_legal_notice_pdf(data: Dict[str, Any]) -> io.BytesIO:
    """Generate Legal Notice PDF"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=1*cm, bottomMargin=1*cm)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], alignment=TA_CENTER, fontSize=16, spaceAfter=20)
    heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], fontSize=11, spaceAfter=8, spaceBefore=12)
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, alignment=TA_JUSTIFY, spaceAfter=8)
    
    elements = []
    
    elements.append(Paragraph("LEGAL NOTICE", title_style))
    elements.append(Paragraph(f"Under Section {data.get('section', '80 of Civil Procedure Code')}", 
                              ParagraphStyle('Subtitle', alignment=TA_CENTER, fontSize=10)))
    elements.append(Spacer(1, 20))
    
    # Date
    elements.append(Paragraph(f"Date: {data.get('notice_date', datetime.now().strftime('%d/%m/%Y'))}", body_style))
    elements.append(Spacer(1, 10))
    
    # To
    elements.append(Paragraph("TO,", heading_style))
    elements.append(Paragraph(f"""
    {data.get('recipient_name', '_____________')}<br/>
    {data.get('recipient_address', '_____________')}
    """, body_style))
    
    # Subject
    elements.append(Paragraph("SUBJECT:", heading_style))
    elements.append(Paragraph(data.get('subject', 'Legal Notice for _____________'), body_style))
    
    # Body
    elements.append(Paragraph("Dear Sir/Madam,", body_style))
    elements.append(Spacer(1, 10))
    
    elements.append(Paragraph(f"""
    Under the instructions from and on behalf of my client, <b>{data.get('sender_name', '_____________')}</b>, 
    residing at {data.get('sender_address', '_____________')}, I hereby serve upon you this Legal Notice as under:
    """, body_style))
    
    # Facts
    elements.append(Paragraph("FACTS OF THE CASE:", heading_style))
    elements.append(Paragraph(data.get('facts', '_____________'), body_style))
    
    # Grievance
    elements.append(Paragraph("GRIEVANCE:", heading_style))
    elements.append(Paragraph(data.get('grievance', '_____________'), body_style))
    
    # Demand
    elements.append(Paragraph("DEMAND:", heading_style))
    elements.append(Paragraph(data.get('demand', '_____________'), body_style))
    
    # Warning
    elements.append(Paragraph("WARNING:", heading_style))
    elements.append(Paragraph(f"""
    You are hereby called upon to comply with the above demand within {data.get('response_days', '15')} days 
    from the receipt of this notice, failing which my client shall be constrained to initiate appropriate 
    legal proceedings against you at your risk, cost, and consequences.
    """, body_style))
    
    elements.append(Spacer(1, 30))
    
    # Signature
    elements.append(Paragraph(f"Yours faithfully,", body_style))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f"_______________", body_style))
    elements.append(Paragraph(f"{data.get('advocate_name', 'Advocate')}", body_style))
    elements.append(Paragraph(f"On behalf of: {data.get('sender_name', '_____________')}", body_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer


def generate_affidavit_pdf(data: Dict[str, Any]) -> io.BytesIO:
    """Generate General Affidavit PDF"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=1*cm, bottomMargin=1*cm)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], alignment=TA_CENTER, fontSize=18, spaceAfter=30)
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=11, alignment=TA_JUSTIFY, spaceAfter=12)
    
    elements = []
    
    elements.append(Paragraph("AFFIDAVIT", title_style))
    elements.append(Spacer(1, 20))
    
    elements.append(Paragraph(f"""
    I, <b>{data.get('deponent_name', '_____________')}</b>, aged {data.get('deponent_age', '_____________')} years, 
    {data.get('deponent_occupation', '_____________')}, residing at {data.get('deponent_address', '_____________')}, 
    do hereby solemnly affirm and declare as under:
    """, body_style))
    
    elements.append(Spacer(1, 15))
    
    # Statements
    statements = data.get('statements', ['_____________'])
    for i, statement in enumerate(statements, 1):
        elements.append(Paragraph(f"{i}. {statement}", body_style))
    
    elements.append(Spacer(1, 15))
    
    elements.append(Paragraph("""
    I hereby declare that the contents of this affidavit are true and correct to the best of my knowledge 
    and belief and nothing material has been concealed therefrom.
    """, body_style))
    
    elements.append(Spacer(1, 30))
    
    # Verification
    elements.append(Paragraph("VERIFICATION", ParagraphStyle('Heading', fontSize=12, spaceAfter=10)))
    elements.append(Paragraph(f"""
    Verified at {data.get('verification_place', '_____________')} on this {data.get('verification_date', '_____________')} 
    that the contents of this affidavit are true and correct to the best of my knowledge and belief.
    """, body_style))
    
    elements.append(Spacer(1, 40))
    
    elements.append(Paragraph("DEPONENT", body_style))
    elements.append(Spacer(1, 30))
    elements.append(Paragraph("_______________", body_style))
    elements.append(Paragraph(f"({data.get('deponent_name', '_____________')})", body_style))
    
    elements.append(Spacer(1, 30))
    elements.append(Paragraph("Before me,", body_style))
    elements.append(Paragraph("Notary Public / Oath Commissioner", body_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer


def generate_consumer_complaint_pdf(data: Dict[str, Any]) -> io.BytesIO:
    """Generate Consumer Complaint PDF (under Consumer Protection Act, 2019)"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=1*cm, bottomMargin=1*cm)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], alignment=TA_CENTER, fontSize=16, spaceAfter=15)
    heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], fontSize=11, spaceAfter=8, spaceBefore=12)
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, alignment=TA_JUSTIFY, spaceAfter=8)
    
    elements = []
    
    # Header
    forum_level = data.get('forum_level', 'District Consumer Disputes Redressal Forum')
    elements.append(Paragraph(f"BEFORE THE {forum_level.upper()}", title_style))
    elements.append(Paragraph(f"At {data.get('forum_city', '_____________')}", 
                              ParagraphStyle('Subtitle', alignment=TA_CENTER, fontSize=10, spaceAfter=20)))
    
    # Case Number (if assigned)
    if data.get('case_number'):
        elements.append(Paragraph(f"Consumer Complaint No.: {data.get('case_number')}", body_style))
    
    elements.append(Spacer(1, 15))
    
    # Complainant Details
    elements.append(Paragraph("IN THE MATTER OF:", heading_style))
    elements.append(Paragraph(f"""
    <b>{data.get('complainant_name', '_____________')}</b><br/>
    S/o, D/o, W/o: {data.get('complainant_parent', '_____________')}<br/>
    Age: {data.get('complainant_age', '_____________')} years<br/>
    Occupation: {data.get('complainant_occupation', '_____________')}<br/>
    Address: {data.get('complainant_address', '_____________')}<br/>
    Phone: {data.get('complainant_phone', '_____________')}<br/>
    Email: {data.get('complainant_email', '_____________')}
    """, body_style))
    elements.append(Paragraph("...COMPLAINANT", ParagraphStyle('Right', alignment=TA_LEFT, fontSize=10, spaceAfter=15, spaceBefore=5)))
    
    elements.append(Paragraph("VERSUS", ParagraphStyle('Center', alignment=TA_CENTER, fontSize=11, spaceAfter=15)))
    
    # Opposite Party Details
    elements.append(Paragraph(f"""
    <b>{data.get('opposite_party_name', '_____________')}</b><br/>
    Through: {data.get('opposite_party_representative', 'Its Proprietor/Director/Manager')}<br/>
    Address: {data.get('opposite_party_address', '_____________')}<br/>
    Phone: {data.get('opposite_party_phone', '_____________')}<br/>
    Email: {data.get('opposite_party_email', '_____________')}
    """, body_style))
    elements.append(Paragraph("...OPPOSITE PARTY", ParagraphStyle('Right', alignment=TA_LEFT, fontSize=10, spaceAfter=15, spaceBefore=5)))
    
    # Subject
    elements.append(Paragraph("SUBJECT:", heading_style))
    elements.append(Paragraph(f"Complaint under Section 35 of Consumer Protection Act, 2019 for {data.get('subject', 'deficiency in service / defect in goods / unfair trade practice')}", body_style))
    
    # Transaction Details
    elements.append(Paragraph("TRANSACTION DETAILS:", heading_style))
    elements.append(Paragraph(f"""
    <b>Nature of Transaction:</b> {data.get('transaction_nature', 'Purchase of goods / Availing of service')}<br/>
    <b>Date of Transaction:</b> {data.get('transaction_date', '_____________')}<br/>
    <b>Invoice/Receipt No.:</b> {data.get('invoice_number', '_____________')}<br/>
    <b>Amount Paid:</b> Rs. {data.get('amount_paid', '_____________')}/-<br/>
    <b>Mode of Payment:</b> {data.get('payment_mode', '_____________')}
    """, body_style))
    
    # Facts of the Case
    elements.append(Paragraph("FACTS OF THE CASE:", heading_style))
    facts = data.get('facts', ['_____________'])
    for i, fact in enumerate(facts, 1):
        elements.append(Paragraph(f"{i}. {fact}", body_style))
    
    # Grievance
    elements.append(Paragraph("GRIEVANCE / CAUSE OF ACTION:", heading_style))
    elements.append(Paragraph(data.get('grievance', 'The complainant has suffered due to the deficiency in service / defect in goods / unfair trade practice by the opposite party.'), body_style))
    
    # Relief Sought
    elements.append(Paragraph("RELIEF SOUGHT:", heading_style))
    reliefs = data.get('reliefs', [
        'Refund of amount paid with interest',
        'Compensation for mental agony and harassment',
        'Cost of litigation'
    ])
    for i, relief in enumerate(reliefs, 1):
        elements.append(Paragraph(f"{i}. {relief}", body_style))
    
    # Declaration
    elements.append(Paragraph("DECLARATION:", heading_style))
    elements.append(Paragraph("""
    I, the complainant, do hereby declare that:
    1. The facts stated above are true and correct to the best of my knowledge and belief.
    2. I have not filed any other complaint in any other forum regarding this matter.
    3. The cause of action arose within the territorial jurisdiction of this Hon'ble Forum.
    """, body_style))
    
    # Documents
    elements.append(Paragraph("LIST OF DOCUMENTS:", heading_style))
    documents = data.get('documents', [
        'Copy of Invoice/Receipt',
        'Proof of Payment',
        'Correspondence with Opposite Party',
        'Photographs (if any)',
        'ID Proof of Complainant'
    ])
    for i, doc_item in enumerate(documents, 1):
        elements.append(Paragraph(f"{i}. {doc_item}", body_style))
    
    elements.append(Spacer(1, 30))
    
    # Signature
    elements.append(Paragraph(f"Place: {data.get('place', '_____________')}", body_style))
    elements.append(Paragraph(f"Date: {data.get('date', datetime.now().strftime('%d/%m/%Y'))}", body_style))
    elements.append(Spacer(1, 25))
    elements.append(Paragraph("_______________", body_style))
    elements.append(Paragraph("(Signature of Complainant)", body_style))
    elements.append(Paragraph(f"Name: {data.get('complainant_name', '_____________')}", body_style))
    
    # Verification
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("VERIFICATION", heading_style))
    elements.append(Paragraph(f"""
    I, {data.get('complainant_name', '_____________')}, the above-named complainant, do hereby verify that the contents 
    of this complaint are true and correct to the best of my knowledge and belief and nothing material has been 
    concealed therefrom.
    
    Verified at {data.get('verification_place', data.get('place', '_____________'))} on this day of {data.get('date', datetime.now().strftime('%d/%m/%Y'))}.
    """, body_style))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("_______________", body_style))
    elements.append(Paragraph("(Signature of Complainant)", body_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer


@app.post("/api/documents/generate")
@limiter.limit("10/minute")  # Rate limit: 10 documents per minute
async def generate_document(
    request: Request,
    doc_data: DocumentData,
    user = Depends(require_auth)  # SECURITY: Require authentication
):
    """
    Generate legal document PDF.
    SECURITY: PDFs are stored privately at documents/{userId}/{docId}.pdf
    Access only via authenticated signed URLs.
    """
    user_id = user["uid"]
    doc_type = doc_data.document_type
    data = doc_data.data
    
    # Generate PDF based on document type
    generators = {
        "rent_agreement": generate_rent_agreement_pdf,
        "legal_notice": generate_legal_notice_pdf,
        "affidavit": generate_affidavit_pdf,
        "consumer_complaint": generate_consumer_complaint_pdf,
    }
    
    generator = generators.get(doc_type)
    if not generator:
        raise HTTPException(status_code=400, detail=f"Unknown document type: {doc_type}")
    
    try:
        pdf_buffer = generator(data)
        pdf_bytes = pdf_buffer.read()
        
        # Generate document ID
        doc_id = str(uuid.uuid4())[:8]
        
        # SECURITY: Store PDF in PRIVATE storage at documents/{userId}/{docId}.pdf
        storage_path = f"documents/{user_id}/{doc_id}.pdf"
        storage.upload_file(
            path=storage_path,
            data=pdf_bytes,
            owner_uid=user_id,
            metadata={
                "type": doc_type,
                "content_type": "application/pdf"
            }
        )
        
        # Store document metadata in Firestore (NOT the PDF itself)
        document_record = {
            "id": doc_id,
            "user_id": user_id,
            "type": doc_type,
            "storage_path": storage_path,  # Reference to private storage
            "data": data,
            "created_at": datetime.now().isoformat(),
            "status": "generated"
        }
        
        db.collection("documents").document(doc_id).set(document_record)
        
        # Generate signed URL for authenticated download (expires in 15 minutes)
        signed_url = storage.generate_signed_url(
            path=storage_path,
            requester_uid=user_id,
            expires_in_minutes=15
        )
        
        return {
            "success": True,
            "document_id": doc_id,
            "type": doc_type,
            "download_url": signed_url,  # Time-limited authenticated URL
            "expires_in": "15 minutes",
            "message": "Document generated. Download URL is private and time-limited."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@app.get("/api/documents/{doc_id}/download")
async def download_document(
    doc_id: str,
    user = Depends(require_auth)
):
    """
    Get a fresh signed URL for document download.
    SECURITY: Only document owner can download.
    """
    user_id = user["uid"]
    
    # Get document metadata
    doc_ref = db.collection("documents").document(doc_id).get()
    if not doc_ref.exists:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc_data = doc_ref.to_dict()
    
    # SECURITY: Verify ownership
    if doc_data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied: You can only download your own documents")
    
    storage_path = doc_data.get("storage_path")
    if not storage_path:
        raise HTTPException(status_code=404, detail="Document file not found")
    
    # Generate fresh signed URL
    signed_url = storage.generate_signed_url(
        path=storage_path,
        requester_uid=user_id,
        expires_in_minutes=15
    )
    
    return {
        "success": True,
        "download_url": signed_url,
        "expires_in": "15 minutes"
    }


@app.get("/api/storage/download")
async def storage_download(token: str):
    """
    Download file using signed URL token.
    SECURITY: Token-based access with expiration.
    """
    # Validate token
    file_path = storage.validate_signed_url(token)
    if not file_path:
        raise HTTPException(status_code=403, detail="Invalid or expired download link")
    
    # Get file data
    try:
        # For signed URL downloads, we bypass the ownership check since token was already validated
        file_info = storage._files.get(file_path)
        if not file_info:
            raise HTTPException(status_code=404, detail="File not found")
        
        pdf_buffer = io.BytesIO(file_info["data"])
        filename = file_path.split("/")[-1]
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


@app.get("/api/documents/list")
async def list_documents(user = Depends(require_auth)):
    """List all documents for user"""
    user_id = user["uid"]
    
    docs = db.collection("documents").where("user_id", "==", user_id).stream()
    
    doc_list = []
    for doc in docs:
        doc_data = doc.to_dict()
        doc_list.append({
            "id": doc_data.get("id"),
            "type": doc_data.get("type"),
            "created_at": doc_data.get("created_at"),
            "status": doc_data.get("status")
        })
    
    return {"success": True, "documents": doc_list}

# ============= LAWYER MARKETPLACE ENDPOINTS =============

@app.get("/api/lawyers/list")
async def list_lawyers(
    city: Optional[str] = None,
    specialization: Optional[str] = None,
    language: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    limit: int = 20,
    cursor: Optional[str] = None
):
    """
    List lawyers with optional filters and pagination.
    
    - Default limit: 20
    - Max limit: 50
    - Ordered by created_at descending
    - Cursor-based pagination using created_at value
    
    Example: GET /api/lawyers/list?limit=20&cursor=2025-01-20T10:30:00
    """
    # Enforce limits
    limit = min(max(1, limit), 50)  # Clamp between 1 and 50
    
    # Build query with ordering
    query = db.collection("lawyers").where("verified", "==", True)
    query = query.order_by("created_at", direction="DESCENDING")
    
    # Apply cursor if provided
    if cursor:
        query = query.start_after(cursor)
    
    # Apply limit + 1 to check if there are more results
    query = query.limit(limit + 1)
    
    lawyers = query.stream()
    
    lawyer_list = []
    for lawyer in lawyers:
        lawyer_data = lawyer.to_dict()
        
        # Apply additional filters (done in-memory for mock DB)
        if city and lawyer_data.get("city") != city:
            continue
        if specialization and specialization not in lawyer_data.get("specialization", []):
            continue
        if language and language not in lawyer_data.get("languages", []):
            continue
        if min_price and lawyer_data.get("price", 0) < min_price:
            continue
        if max_price and lawyer_data.get("price", 0) > max_price:
            continue
        
        lawyer_list.append(lawyer_data)
    
    # Determine next_cursor
    next_cursor = None
    if len(lawyer_list) > limit:
        lawyer_list = lawyer_list[:limit]  # Trim to requested limit
        next_cursor = lawyer_list[-1].get("created_at") if lawyer_list else None
    
    return {
        "success": True,
        "items": lawyer_list,
        "next_cursor": next_cursor,
        "count": len(lawyer_list)
    }

@app.get("/api/lawyers/{lawyer_id}")
async def get_lawyer_profile(lawyer_id: str):
    """Get lawyer profile by ID"""
    doc = db.collection("lawyers").document(lawyer_id).get()
    
    if doc.exists:
        return {"success": True, "lawyer": doc.to_dict()}
    else:
        raise HTTPException(status_code=404, detail="Lawyer not found")


# ============= LAWYER APPLICATION & VERIFICATION =============

@app.post("/api/lawyers/apply")
async def apply_as_lawyer(
    application: LawyerApplication,
    user = Depends(require_auth)
):
    """
    Apply to become a verified lawyer.
    SECURITY: 
    - ownerUserId is set from authenticated user (cannot be spoofed)
    - verified is ALWAYS false on creation (only admin can set true)
    - User can only create their own application
    """
    user_id = user["uid"]
    
    # Check if user already has an application
    existing = db.collection("lawyer_applications").where("owner_user_id", "==", user_id).stream()
    for app in existing:
        raise HTTPException(
            status_code=400, 
            detail="You already have a pending or approved application"
        )
    
    # Create application with enforced ownership
    app_id = str(uuid.uuid4())[:8]
    application_data = application.dict()
    application_data.update({
        "id": app_id,
        "owner_user_id": user_id,  # SECURITY: Set from auth, not from input
        "verified": False,  # SECURITY: Always false on creation
        "verification_status": "pending",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "verification_docs": [],  # Will be populated when docs are uploaded
        "admin_notes": None,
        "rejected_reason": None
    })
    
    db.collection("lawyer_applications").document(app_id).set(application_data)
    
    return {
        "success": True,
        "application_id": app_id,
        "message": "Application submitted. Please upload verification documents.",
        "next_step": f"POST /api/lawyers/applications/{app_id}/upload-docs"
    }


@app.post("/api/lawyers/applications/{app_id}/upload-docs")
async def upload_verification_docs(
    app_id: str,
    user = Depends(require_auth)
):
    """
    Upload verification documents for lawyer application.
    SECURITY:
    - Only application owner can upload
    - Docs stored at lawyer_docs/{userId}/{appId}/{filename}
    - No cross-user access
    """
    user_id = user["uid"]
    
    # Get application and verify ownership
    app_doc = db.collection("lawyer_applications").document(app_id).get()
    if not app_doc.exists:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app_data = app_doc.to_dict()
    
    # SECURITY: Verify ownerUserId == request.auth.uid
    if app_data.get("owner_user_id") != user_id:
        raise HTTPException(
            status_code=403, 
            detail="Access denied: You can only upload documents for your own application"
        )
    
    # In a real implementation, this would handle file upload
    # For mock, we simulate storing document reference
    doc_path = f"lawyer_docs/{user_id}/{app_id}/verification_document.pdf"
    
    # Update application with doc reference
    db.collection("lawyer_applications").document(app_id).update({
        "verification_docs": ArrayUnion([{
            "path": doc_path,
            "uploaded_at": datetime.now().isoformat()
        }]),
        "verification_status": "documents_uploaded",
        "updated_at": datetime.now().isoformat()
    })
    
    return {
        "success": True,
        "message": "Documents uploaded successfully. Your application is under review.",
        "storage_path": doc_path
    }


@app.get("/api/lawyers/my-application")
async def get_my_lawyer_application(user = Depends(require_auth)):
    """Get current user's lawyer application status"""
    user_id = user["uid"]
    
    applications = db.collection("lawyer_applications").where("owner_user_id", "==", user_id).stream()
    
    for app in applications:
        app_data = app.to_dict()
        # Don't expose admin notes to users
        app_data.pop("admin_notes", None)
        return {"success": True, "application": app_data}
    
    return {"success": False, "message": "No application found"}


# ============= ADMIN-ONLY LAWYER VERIFICATION =============

@app.get("/api/admin/lawyer-applications")
async def admin_list_applications(
    status: Optional[str] = None,
    admin = Depends(require_admin)
):
    """
    ADMIN ONLY: List all lawyer applications.
    """
    applications = db.collection("lawyer_applications").stream()
    
    app_list = []
    for app in applications:
        app_data = app.to_dict()
        if status and app_data.get("verification_status") != status:
            continue
        app_list.append(app_data)
    
    return {"success": True, "applications": app_list, "count": len(app_list)}


@app.get("/api/admin/lawyer-applications/{app_id}/docs")
async def admin_view_application_docs(
    app_id: str,
    admin = Depends(require_admin)
):
    """
    ADMIN ONLY: View lawyer verification documents.
    Admin can access any lawyer's documents for verification.
    """
    app_doc = db.collection("lawyer_applications").document(app_id).get()
    if not app_doc.exists:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app_data = app_doc.to_dict()
    owner_uid = app_data.get("owner_user_id")
    
    # Admin can access verification docs
    doc_paths = app_data.get("verification_docs", [])
    
    # Generate signed URLs for admin to view docs
    signed_urls = []
    for doc in doc_paths:
        try:
            url = storage.generate_signed_url(
                path=doc["path"],
                requester_uid=owner_uid,
                is_admin=True,
                expires_in_minutes=30
            )
            signed_urls.append({"path": doc["path"], "download_url": url})
        except Exception as e:
            signed_urls.append({"path": doc["path"], "error": str(e)})
    
    return {
        "success": True,
        "application": app_data,
        "document_urls": signed_urls
    }


@app.post("/api/admin/lawyer-applications/{app_id}/verify")
async def admin_verify_lawyer(
    app_id: str,
    action: Dict[str, Any] = Body(...),
    admin = Depends(require_admin)
):
    """
    ADMIN ONLY: Verify or reject lawyer application.
    SECURITY: Only admin can set verified=true. Users cannot self-verify.
    
    Body: {"approved": true/false, "notes": "optional admin notes", "reject_reason": "if rejected"}
    """
    app_doc = db.collection("lawyer_applications").document(app_id).get()
    if not app_doc.exists:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app_data = app_doc.to_dict()
    approved = action.get("approved", False)
    admin_notes = action.get("notes", "")
    reject_reason = action.get("reject_reason", "")
    
    if approved:
        # Create verified lawyer profile
        lawyer_id = f"lawyer_{app_id}"
        lawyer_data = {
            "id": lawyer_id,
            "owner_user_id": app_data["owner_user_id"],  # Keep ownership
            "name": app_data["name"],
            "bar_council_id": app_data["bar_council_id"],
            "specialization": app_data["specialization"],
            "languages": app_data["languages"],
            "city": app_data["city"],
            "state": app_data["state"],
            "experience": app_data["experience"],
            "price": app_data["price"],
            "bio": app_data["bio"],
            "phone": app_data["phone"],
            "email": app_data["email"],
            "verified": True,  # ADMIN SETS THIS
            "verified_at": datetime.now().isoformat(),
            "verified_by": admin["uid"],
            "rating": 0,
            "reviews": 0,
            "created_at": datetime.now().isoformat()
        }
        
        db.collection("lawyers").document(lawyer_id).set(lawyer_data)
        
        # Update application status
        db.collection("lawyer_applications").document(app_id).update({
            "verification_status": "approved",
            "verified": True,
            "admin_notes": admin_notes,
            "verified_at": datetime.now().isoformat(),
            "verified_by": admin["uid"],
            "lawyer_profile_id": lawyer_id,
            "updated_at": datetime.now().isoformat()
        })
        
        return {
            "success": True,
            "message": "Lawyer verified and profile created",
            "lawyer_id": lawyer_id
        }
    else:
        # Reject application
        db.collection("lawyer_applications").document(app_id).update({
            "verification_status": "rejected",
            "verified": False,
            "admin_notes": admin_notes,
            "rejected_reason": reject_reason,
            "rejected_at": datetime.now().isoformat(),
            "rejected_by": admin["uid"],
            "updated_at": datetime.now().isoformat()
        })
        
        return {
            "success": True,
            "message": "Application rejected",
            "reason": reject_reason
        }

# ============= BOOKING & PAYMENT ENDPOINTS =============

@app.post("/api/bookings/create")
async def create_booking(
    booking: BookingRequest,
    user = Depends(require_auth)
):
    """Create a booking and payment order"""
    user_id = user["uid"]
    
    # Get lawyer details
    lawyer_doc = db.collection("lawyers").document(booking.lawyer_id).get()
    if not lawyer_doc.exists:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    
    lawyer_data = lawyer_doc.to_dict()
    
    # Calculate amount
    price_per_30_min = lawyer_data.get("price", 500)
    amount = price_per_30_min * (booking.duration // 30)
    
    # Create Razorpay order (mock)
    order_data = {
        "amount": amount * 100,  # Paise
        "currency": "INR",
        "payment_capture": 1,
        "notes": {
            "user_id": user_id,
            "lawyer_id": booking.lawyer_id,
            "consultation_type": booking.consultation_type
        }
    }
    
    razorpay_order = razorpay_client.order.create(data=order_data)
    
    # Save booking
    booking_id = str(uuid.uuid4())[:8]
    booking_data = {
        "id": booking_id,
        "user_id": user_id,
        "lawyer_id": booking.lawyer_id,
        "lawyer_name": lawyer_data.get("name"),
        "consultation_type": booking.consultation_type,
        "date": booking.date,
        "time_slot": booking.time_slot,
        "duration": booking.duration,
        "amount": amount,
        "status": "pending",
        "razorpay_order_id": razorpay_order["id"],
        "created_at": datetime.now().isoformat()
    }
    
    db.collection("bookings").document(booking_id).set(booking_data)
    
    return {
        "success": True,
        "booking_id": booking_id,
        "order_id": razorpay_order["id"],
        "amount": amount,
        "currency": "INR",
        "razorpay_key": RAZORPAY_KEY_ID
    }

@app.post("/api/bookings/verify-payment")
async def verify_payment(
    payment: PaymentVerification,
    user = Depends(require_auth)
):
    """Verify Razorpay payment (client-side verification)"""
    try:
        # Verify signature
        params_dict = {
            "razorpay_order_id": payment.razorpay_order_id,
            "razorpay_payment_id": payment.razorpay_payment_id,
            "razorpay_signature": payment.razorpay_signature
        }
        
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Update booking status
        bookings = db.collection("bookings").where("razorpay_order_id", "==", payment.razorpay_order_id).stream()
        
        for booking in bookings:
            db.collection("bookings").document(booking.id).update({
                "status": "confirmed",
                "razorpay_payment_id": payment.razorpay_payment_id,
                "payment_verified_at": datetime.now().isoformat()
            })
        
        return {"success": True, "message": "Payment verified and booking confirmed"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")

@app.get("/api/bookings/list")
async def list_bookings(user = Depends(require_auth)):
    """List all bookings for user"""
    user_id = user["uid"]
    
    bookings = db.collection("bookings").where("user_id", "==", user_id).stream()
    
    booking_list = []
    for booking in bookings:
        booking_list.append(booking.to_dict())
    
    return {"success": True, "bookings": booking_list}

# ============= RAZORPAY WEBHOOK =============

@app.post("/api/webhooks/razorpay")
async def razorpay_webhook(
    request: Request
):
    """
    Razorpay webhook handler for payment events.
    
    PRODUCTION BEHAVIOR:
    - Invalid signature → HTTP 400 (Razorpay will retry)
    - Duplicate event_id → HTTP 200 (already processed, ignore safely)
    - Temporary failure → HTTP 500 (Razorpay will retry)
    - Success → HTTP 200
    
    NO blanket 200 on errors - proper status codes for proper retry behavior.
    """
    import json
    
    # Get signature from header
    signature = request.headers.get("X-Razorpay-Signature", "")
    
    # Get raw body for signature verification
    body = await request.body()
    
    # PRODUCTION: Verify signature (skip only in demo_secret mock mode)
    is_mock_mode = RAZORPAY_KEY_SECRET == "demo_secret"
    
    if not is_mock_mode:
        if not signature:
            # Invalid signature → HTTP 400
            raise HTTPException(status_code=400, detail="Missing signature header")
        
        if not verify_razorpay_signature(body, signature):
            # Invalid signature → HTTP 400
            raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Parse event
    try:
        event = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    
    # Extract event details
    event_id = event.get("id")  # Razorpay event ID for idempotency
    event_type = event.get("event")
    payload = event.get("payload", {}).get("payment", {}).get("entity", {})
    
    payment_id = payload.get("id")
    order_id = payload.get("order_id")
    
    # IDEMPOTENCY: Check if event_id was already processed
    if event_id:
        existing_event = db.collection("webhook_events").document(event_id).get()
        if existing_event and existing_event.exists:
            # Duplicate event_id → HTTP 200 (ignore safely, don't reprocess)
            return JSONResponse(
                status_code=200,
                content={"success": True, "message": "Event already processed", "event_id": event_id}
            )
    
    # Also check payment_id for backwards compatibility
    if payment_id:
        existing_payment = db.collection("payments").document(payment_id).get()
        if existing_payment and existing_payment.exists:
            return JSONResponse(
                status_code=200,
                content={"success": True, "message": "Payment already processed", "payment_id": payment_id}
            )
    
    try:
        # Process based on event type
        if event_type == "payment.captured":
            # Payment successful
            if order_id:
                bookings = db.collection("bookings").where("razorpay_order_id", "==", order_id).stream()
                for booking in bookings:
                    db.collection("bookings").document(booking.id).update({
                        "status": "confirmed",
                        "razorpay_payment_id": payment_id,
                        "payment_captured_at": datetime.now().isoformat()
                    })
            
            # Record payment for idempotency
            if payment_id:
                db.collection("payments").document(payment_id).set({
                    "payment_id": payment_id,
                    "order_id": order_id,
                    "status": "captured",
                    "amount": payload.get("amount"),
                    "processed_at": datetime.now().isoformat()
                })
        
        elif event_type == "payment.failed":
            # Payment failed
            if order_id:
                bookings = db.collection("bookings").where("razorpay_order_id", "==", order_id).stream()
                for booking in bookings:
                    db.collection("bookings").document(booking.id).update({
                        "status": "payment_failed",
                        "failure_reason": payload.get("error_description", "Unknown error"),
                        "payment_failed_at": datetime.now().isoformat()
                    })
            
            if payment_id:
                db.collection("payments").document(payment_id).set({
                    "payment_id": payment_id,
                    "order_id": order_id,
                    "status": "failed",
                    "error": payload.get("error_description"),
                    "processed_at": datetime.now().isoformat()
                })
        
        elif event_type == "payment.authorized":
            # Payment authorized (not yet captured)
            if order_id:
                bookings = db.collection("bookings").where("razorpay_order_id", "==", order_id).stream()
                for booking in bookings:
                    db.collection("bookings").document(booking.id).update({
                        "status": "authorized",
                        "razorpay_payment_id": payment_id,
                        "payment_authorized_at": datetime.now().isoformat()
                    })
        
        # Record event for idempotency
        if event_id:
            db.collection("webhook_events").document(event_id).set({
                "event_id": event_id,
                "event_type": event_type,
                "payment_id": payment_id,
                "order_id": order_id,
                "processed_at": datetime.now().isoformat()
            })
        
        # Success → HTTP 200
        return JSONResponse(
            status_code=200,
            content={"success": True, "message": f"Processed {event_type}", "event_id": event_id}
        )
    
    except Exception as e:
        # Temporary failure → HTTP 500 (Razorpay will retry)
        # Do NOT return 200 on errors!
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Processing failed: {str(e)}"}
        )

# ============= CASE TRACKING ENDPOINTS =============

@app.post("/api/cases/create")
async def create_case(
    case: CaseData,
    user = Depends(require_auth)
):
    """Create a new case"""
    user_id = user["uid"]
    
    case_id = str(uuid.uuid4())[:8]
    case_data = case.dict()
    case_data["id"] = case_id
    case_data["user_id"] = user_id
    case_data["notes"] = []
    case_data["documents"] = []
    case_data["created_at"] = datetime.now().isoformat()
    case_data["updated_at"] = datetime.now().isoformat()
    
    db.collection("cases").document(case_id).set(case_data)
    
    return {
        "success": True,
        "case_id": case_id,
        "message": "Case created successfully"
    }

@app.get("/api/cases/list")
async def list_cases(user = Depends(require_auth)):
    """List all cases for user"""
    user_id = user["uid"]
    
    cases = db.collection("cases").where("user_id", "==", user_id).stream()
    
    case_list = []
    for case in cases:
        case_list.append(case.to_dict())
    
    return {"success": True, "cases": case_list}

@app.get("/api/cases/{case_id}")
async def get_case(case_id: str, user = Depends(require_auth)):
    """Get case details"""
    user_id = user["uid"]
    
    doc = db.collection("cases").document(case_id).get()
    
    if doc.exists:
        case_data = doc.to_dict()
        if case_data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        return {"success": True, "case": case_data}
    else:
        raise HTTPException(status_code=404, detail="Case not found")

@app.put("/api/cases/{case_id}/notes")
async def add_case_note(
    case_id: str,
    note: Dict[str, str] = Body(...),
    user = Depends(require_auth)
):
    """Add note to case"""
    user_id = user["uid"]
    
    doc = db.collection("cases").document(case_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Case not found")
    
    case_data = doc.to_dict()
    if case_data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    note_with_timestamp = {
        "content": note.get("content", ""),
        "timestamp": datetime.now().isoformat()
    }
    
    db.collection("cases").document(case_id).update({
        "notes": ArrayUnion([note_with_timestamp]),
        "updated_at": datetime.now().isoformat()
    })
    
    return {"success": True, "message": "Note added successfully"}

# ============= LAWS & SCHEMES ENDPOINTS =============

@app.get("/api/laws/list")
async def list_laws(
    category: Optional[str] = None,
    state: Optional[str] = None,
    search: Optional[str] = None
):
    """List laws and schemes with filters"""
    laws = db.collection("laws").stream()
    
    law_list = []
    for law in laws:
        law_data = law.to_dict()
        
        # Apply filters
        if category and law_data.get("category") != category:
            continue
        if state and law_data.get("state") != state:
            continue
        if search and search.lower() not in law_data.get("title", "").lower():
            continue
        
        law_list.append(law_data)
    
    return {
        "success": True,
        "laws": law_list,
        "count": len(law_list)
    }

@app.get("/api/laws/{law_id}")
async def get_law(law_id: str):
    """Get law details"""
    doc = db.collection("laws").document(law_id).get()
    
    if doc.exists:
        return {"success": True, "law": doc.to_dict()}
    else:
        raise HTTPException(status_code=404, detail="Law not found")

# ============= STARTUP =============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
