#!/usr/bin/env python3
"""
SunoLegal Backend API Testing Suite
Tests all backend endpoints comprehensively
"""

import requests
import json
import sys
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend env
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://nyayai-schemes.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

# Test configuration
MOCK_AUTH_TOKEN = "Bearer mock_test_user"
TEST_HEADERS = {
    "Authorization": MOCK_AUTH_TOKEN,
    "Content-Type": "application/json"
}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}Testing: {test_name}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

def make_request(method, endpoint, data=None, headers=None, params=None):
    """Make HTTP request with error handling"""
    url = f"{API_BASE}{endpoint}"
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, params=params, timeout=30)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers, params=params, timeout=30)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers, params=params, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return response
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {str(e)}")
        return None

def test_health_check():
    """Test health check endpoint"""
    print_test_header("Health Check")
    
    response = make_request('GET', '/health')
    if not response:
        return False
    
    if response.status_code == 200:
        data = response.json()
        print_success(f"Health check passed - Status: {response.status_code}")
        print_info(f"Service: {data.get('service', 'Unknown')}")
        print_info(f"Mode: {data.get('mode', 'Unknown')}")
        print_info(f"Version: {data.get('version', 'Unknown')}")
        
        # Check if running in MOCK mode
        if data.get('mode') == 'MOCK':
            print_warning("Backend is running in MOCK mode")
        
        return True
    else:
        print_error(f"Health check failed - Status: {response.status_code}")
        return False

def test_lawyers_api():
    """Test lawyers marketplace endpoints"""
    print_test_header("Lawyers API")
    
    success_count = 0
    total_tests = 3
    
    # Test 1: List all lawyers
    print_info("Testing GET /api/lawyers/list")
    response = make_request('GET', '/lawyers/list')
    if response and response.status_code == 200:
        data = response.json()
        if data.get('success') and len(data.get('lawyers', [])) > 0:
            print_success(f"Found {len(data['lawyers'])} lawyers")
            success_count += 1
        else:
            print_error("No lawyers found or invalid response")
    else:
        print_error(f"Failed to list lawyers - Status: {response.status_code if response else 'No response'}")
    
    # Test 2: Get specific lawyer
    print_info("Testing GET /api/lawyers/lawyer_1")
    response = make_request('GET', '/lawyers/lawyer_1')
    if response and response.status_code == 200:
        data = response.json()
        if data.get('success') and data.get('lawyer'):
            lawyer = data['lawyer']
            print_success(f"Retrieved lawyer: {lawyer.get('name', 'Unknown')}")
            print_info(f"Specialization: {lawyer.get('specialization', [])}")
            print_info(f"City: {lawyer.get('city', 'Unknown')}")
            success_count += 1
        else:
            print_error("Invalid lawyer data")
    else:
        print_error(f"Failed to get lawyer - Status: {response.status_code if response else 'No response'}")
    
    # Test 3: Filter by city
    print_info("Testing GET /api/lawyers/list?city=Delhi")
    response = make_request('GET', '/lawyers/list', params={'city': 'Delhi'})
    if response and response.status_code == 200:
        data = response.json()
        if data.get('success'):
            delhi_lawyers = data.get('lawyers', [])
            print_success(f"Found {len(delhi_lawyers)} lawyers in Delhi")
            success_count += 1
        else:
            print_error("Filter by city failed")
    else:
        print_error(f"Failed to filter lawyers - Status: {response.status_code if response else 'No response'}")
    
    return success_count == total_tests

def test_laws_api():
    """Test laws and schemes endpoints"""
    print_test_header("Laws API")
    
    success_count = 0
    total_tests = 3
    
    # Test 1: List all laws
    print_info("Testing GET /api/laws/list")
    response = make_request('GET', '/laws/list')
    if response and response.status_code == 200:
        data = response.json()
        if data.get('success') and len(data.get('laws', [])) > 0:
            print_success(f"Found {len(data['laws'])} laws")
            success_count += 1
        else:
            print_error("No laws found or invalid response")
    else:
        print_error(f"Failed to list laws - Status: {response.status_code if response else 'No response'}")
    
    # Test 2: Get specific law
    print_info("Testing GET /api/laws/law_1")
    response = make_request('GET', '/laws/law_1')
    if response and response.status_code == 200:
        data = response.json()
        if data.get('success') and data.get('law'):
            law = data['law']
            print_success(f"Retrieved law: {law.get('title', 'Unknown')}")
            print_info(f"Category: {law.get('category', 'Unknown')}")
            success_count += 1
        else:
            print_error("Invalid law data")
    else:
        print_error(f"Failed to get law - Status: {response.status_code if response else 'No response'}")
    
    # Test 3: Filter by category
    print_info("Testing GET /api/laws/list?category=Consumer Law")
    response = make_request('GET', '/laws/list', params={'category': 'Consumer Law'})
    if response and response.status_code == 200:
        data = response.json()
        if data.get('success'):
            consumer_laws = data.get('laws', [])
            print_success(f"Found {len(consumer_laws)} Consumer Law entries")
            success_count += 1
        else:
            print_error("Filter by category failed")
    else:
        print_error(f"Failed to filter laws - Status: {response.status_code if response else 'No response'}")
    
    return success_count == total_tests

def test_document_generation():
    """Test document generation endpoints"""
    print_test_header("Document Generation")
    
    success_count = 0
    total_tests = 4
    
    # Test data for different document types
    document_tests = [
        {
            "type": "rent_agreement",
            "data": {
                "landlord_name": "Rajesh Kumar Sharma",
                "landlord_address": "123 MG Road, New Delhi - 110001",
                "tenant_name": "Priya Singh",
                "tenant_address": "456 Park Street, Mumbai - 400001",
                "property_address": "Flat 2B, Green Valley Apartments, Sector 15, Gurgaon - 122001",
                "property_type": "Residential",
                "monthly_rent": "25000",
                "rent_in_words": "Twenty Five Thousand",
                "security_deposit": "50000",
                "lease_duration": "11 months",
                "start_date": "2024-02-01",
                "end_date": "2024-12-31",
                "agreement_date": "2024-01-15",
                "city": "Gurgaon"
            }
        },
        {
            "type": "legal_notice",
            "data": {
                "sender_name": "Amit Patel",
                "sender_address": "789 Commercial Street, Bangalore - 560001",
                "recipient_name": "XYZ Electronics Pvt Ltd",
                "recipient_address": "Plot 45, Industrial Area, Pune - 411001",
                "subject": "Legal Notice for Defective Product and Refund",
                "facts": "I purchased a laptop from your store on 15th December 2023 for Rs. 65,000. The product developed serious defects within 10 days of purchase.",
                "grievance": "Despite multiple complaints, no satisfactory resolution has been provided. The product is still under warranty.",
                "demand": "I demand immediate refund of Rs. 65,000 along with compensation for mental harassment.",
                "advocate_name": "Adv. Neha Sharma"
            }
        },
        {
            "type": "affidavit",
            "data": {
                "deponent_name": "Sunita Devi",
                "deponent_age": "35",
                "deponent_occupation": "Government Employee",
                "deponent_address": "House No. 67, Lajpat Nagar, New Delhi - 110024",
                "statements": [
                    "I am a permanent resident of Delhi and have been living at the above address for the past 10 years.",
                    "I am employed as Assistant Manager in Delhi Municipal Corporation since 2015.",
                    "I have never been convicted of any criminal offense.",
                    "All the documents submitted by me are genuine and authentic."
                ],
                "verification_place": "New Delhi",
                "verification_date": "25th January 2024"
            }
        },
        {
            "type": "consumer_complaint",
            "data": {
                "complainant_name": "Rohit Gupta",
                "complainant_parent": "Late Sh. Ram Gupta",
                "complainant_age": "42",
                "complainant_occupation": "Software Engineer",
                "complainant_address": "Flat 301, Tech Park Residency, Whitefield, Bangalore - 560066",
                "complainant_phone": "+91-9876543210",
                "complainant_email": "rohit.gupta@email.com",
                "opposite_party_name": "QuickFix Home Services Pvt Ltd",
                "opposite_party_address": "Office 12, Business Hub, HSR Layout, Bangalore - 560102",
                "transaction_nature": "Home Appliance Repair Service",
                "transaction_date": "10th January 2024",
                "invoice_number": "QF/2024/001234",
                "amount_paid": "8500",
                "payment_mode": "Online Transfer",
                "facts": [
                    "I engaged the opposite party for AC repair service on 10th January 2024.",
                    "They charged Rs. 8,500 for the service and provided 6 months warranty.",
                    "The AC stopped working again within 15 days of the repair.",
                    "Despite multiple complaints, they are refusing to honor the warranty."
                ],
                "grievance": "The opposite party has provided deficient service and is not honoring the warranty commitment, causing financial loss and mental harassment.",
                "reliefs": [
                    "Refund of Rs. 8,500 with 12% interest per annum",
                    "Compensation of Rs. 25,000 for mental agony and harassment",
                    "Cost of litigation Rs. 5,000"
                ],
                "forum_level": "District Consumer Disputes Redressal Forum",
                "forum_city": "Bangalore"
            }
        }
    ]
    
    for doc_test in document_tests:
        doc_type = doc_test["type"]
        print_info(f"Testing document generation: {doc_type}")
        
        payload = {
            "document_type": doc_type,
            "data": doc_test["data"]
        }
        
        response = make_request('POST', '/documents/generate', data=payload, headers=TEST_HEADERS)
        if response and response.status_code == 200:
            # Check if it's a PDF response
            content_type = response.headers.get('content-type', '')
            if 'application/pdf' in content_type:
                print_success(f"Generated {doc_type} PDF successfully")
                print_info(f"PDF size: {len(response.content)} bytes")
                success_count += 1
            else:
                print_error(f"Expected PDF but got: {content_type}")
        else:
            print_error(f"Failed to generate {doc_type} - Status: {response.status_code if response else 'No response'}")
            if response:
                try:
                    error_data = response.json()
                    print_error(f"Error details: {error_data}")
                except:
                    print_error(f"Response text: {response.text[:200]}")
    
    return success_count == total_tests

def test_chat_api():
    """Test NyayAI chat endpoints"""
    print_test_header("NyayAI Chat API")
    
    success_count = 0
    total_tests = 1
    
    # Test chat with legal question
    print_info("Testing POST /api/chat/nyayai")
    
    chat_payload = {
        "message": "What are my rights as a tenant in India? My landlord is asking me to vacate without proper notice.",
        "session_id": f"test_session_{int(datetime.now().timestamp())}"
    }
    
    response = make_request('POST', '/chat/nyayai', data=chat_payload, headers=TEST_HEADERS)
    if response and response.status_code == 200:
        data = response.json()
        if data.get('success') and data.get('response'):
            print_success("Chat API responded successfully")
            print_info(f"Response length: {len(data['response'])} characters")
            print_info(f"Session ID: {data.get('session_id', 'Not provided')}")
            
            # Check if response contains legal guidance
            response_text = data['response'].lower()
            if any(keyword in response_text for keyword in ['tenant', 'landlord', 'notice', 'rent', 'legal']):
                print_success("Response contains relevant legal information")
            else:
                print_warning("Response may not be contextually relevant")
            
            success_count += 1
        else:
            print_error("Invalid chat response format")
            print_error(f"Response: {data}")
    else:
        print_error(f"Chat API failed - Status: {response.status_code if response else 'No response'}")
        if response:
            try:
                error_data = response.json()
                print_error(f"Error details: {error_data}")
            except:
                print_error(f"Response text: {response.text[:200]}")
    
    return success_count == total_tests

def test_booking_api():
    """Test booking creation endpoints"""
    print_test_header("Booking API")
    
    success_count = 0
    total_tests = 1
    
    # Test booking creation
    print_info("Testing POST /api/bookings/create")
    
    # Calculate future date
    future_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    
    booking_payload = {
        "lawyer_id": "lawyer_1",
        "consultation_type": "chat",
        "date": future_date,
        "time_slot": "10:00 AM",
        "duration": 30
    }
    
    response = make_request('POST', '/bookings/create', data=booking_payload, headers=TEST_HEADERS)
    if response and response.status_code == 200:
        data = response.json()
        if data.get('success') and data.get('booking_id'):
            print_success("Booking created successfully")
            print_info(f"Booking ID: {data.get('booking_id')}")
            print_info(f"Order ID: {data.get('order_id')}")
            print_info(f"Amount: Rs. {data.get('amount')}")
            print_info(f"Razorpay Key: {data.get('razorpay_key')}")
            success_count += 1
        else:
            print_error("Invalid booking response format")
            print_error(f"Response: {data}")
    else:
        print_error(f"Booking creation failed - Status: {response.status_code if response else 'No response'}")
        if response:
            try:
                error_data = response.json()
                print_error(f"Error details: {error_data}")
            except:
                print_error(f"Response text: {response.text[:200]}")
    
    return success_count == total_tests

def test_cases_api():
    """Test case tracking endpoints"""
    print_test_header("Cases API")
    
    success_count = 0
    total_tests = 2
    
    # Test 1: Create a case
    print_info("Testing POST /api/cases/create")
    
    case_payload = {
        "title": "Property Dispute - Unauthorized Construction",
        "description": "Neighbor has constructed unauthorized structure affecting my property. Seeking legal remedy through civil court.",
        "court": "District Court, Gurgaon",
        "case_number": "",  # Will be assigned by court
        "hearing_date": "",  # To be scheduled
        "status": "active"
    }
    
    response = make_request('POST', '/cases/create', data=case_payload, headers=TEST_HEADERS)
    created_case_id = None
    
    if response and response.status_code == 200:
        data = response.json()
        if data.get('success') and data.get('case_id'):
            created_case_id = data['case_id']
            print_success(f"Case created successfully - ID: {created_case_id}")
            success_count += 1
        else:
            print_error("Invalid case creation response")
            print_error(f"Response: {data}")
    else:
        print_error(f"Case creation failed - Status: {response.status_code if response else 'No response'}")
        if response:
            try:
                error_data = response.json()
                print_error(f"Error details: {error_data}")
            except:
                print_error(f"Response text: {response.text[:200]}")
    
    # Test 2: List cases
    print_info("Testing GET /api/cases/list")
    
    response = make_request('GET', '/cases/list', headers=TEST_HEADERS)
    if response and response.status_code == 200:
        data = response.json()
        if data.get('success') and isinstance(data.get('cases'), list):
            cases = data['cases']
            print_success(f"Retrieved {len(cases)} cases")
            
            # Check if our created case is in the list
            if created_case_id and any(case.get('id') == created_case_id for case in cases):
                print_success("Created case found in list")
            
            success_count += 1
        else:
            print_error("Invalid cases list response")
            print_error(f"Response: {data}")
    else:
        print_error(f"Cases list failed - Status: {response.status_code if response else 'No response'}")
        if response:
            try:
                error_data = response.json()
                print_error(f"Error details: {error_data}")
            except:
                print_error(f"Response text: {response.text[:200]}")
    
    return success_count == total_tests

def test_user_profile_api():
    """Test user profile endpoints"""
    print_test_header("User Profile API")
    
    success_count = 0
    total_tests = 2
    
    # Test 1: Create/Update profile
    print_info("Testing POST /api/users/profile")
    
    profile_payload = {
        "name": "Arjun Mehta",
        "phone": "+91-9876543210",
        "email": "arjun.mehta@email.com",
        "city": "Mumbai",
        "state": "Maharashtra",
        "language": "en",
        "role": "user"
    }
    
    response = make_request('POST', '/users/profile', data=profile_payload, headers=TEST_HEADERS)
    if response and response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print_success("Profile created/updated successfully")
            print_info(f"User ID: {data.get('user_id')}")
            success_count += 1
        else:
            print_error("Profile creation failed")
            print_error(f"Response: {data}")
    else:
        print_error(f"Profile creation failed - Status: {response.status_code if response else 'No response'}")
    
    # Test 2: Get profile
    print_info("Testing GET /api/users/profile")
    
    response = make_request('GET', '/users/profile', headers=TEST_HEADERS)
    if response and response.status_code == 200:
        data = response.json()
        if data.get('success') and data.get('profile'):
            profile = data['profile']
            print_success(f"Retrieved profile for: {profile.get('name', 'Unknown')}")
            print_info(f"City: {profile.get('city', 'Unknown')}")
            success_count += 1
        else:
            print_error("Profile retrieval failed or no profile found")
            print_error(f"Response: {data}")
    else:
        print_error(f"Profile retrieval failed - Status: {response.status_code if response else 'No response'}")
    
    return success_count == total_tests

def run_all_tests():
    """Run all backend tests"""
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("=" * 80)
    print("           SUNOLEGAL BACKEND API TESTING SUITE")
    print("=" * 80)
    print(f"{Colors.ENDC}")
    
    print_info(f"Backend URL: {BACKEND_URL}")
    print_info(f"API Base: {API_BASE}")
    print_info(f"Auth Token: {MOCK_AUTH_TOKEN}")
    
    # Track test results
    test_results = {}
    
    # Run all tests
    test_results['Health Check'] = test_health_check()
    test_results['Lawyers API'] = test_lawyers_api()
    test_results['Laws API'] = test_laws_api()
    test_results['Document Generation'] = test_document_generation()
    test_results['Chat API'] = test_chat_api()
    test_results['Booking API'] = test_booking_api()
    test_results['Cases API'] = test_cases_api()
    test_results['User Profile API'] = test_user_profile_api()
    
    # Print summary
    print_test_header("TEST SUMMARY")
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results.items():
        if result:
            print_success(f"{test_name}: PASSED")
            passed += 1
        else:
            print_error(f"{test_name}: FAILED")
            failed += 1
    
    print(f"\n{Colors.BOLD}OVERALL RESULTS:{Colors.ENDC}")
    print(f"{Colors.GREEN}✅ Passed: {passed}{Colors.ENDC}")
    print(f"{Colors.RED}❌ Failed: {failed}{Colors.ENDC}")
    print(f"{Colors.BLUE}📊 Total: {passed + failed}{Colors.ENDC}")
    
    if failed == 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! Backend is working correctly.{Colors.ENDC}")
        return True
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}⚠️  {failed} test(s) failed. Please check the issues above.{Colors.ENDC}")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)