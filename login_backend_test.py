#!/usr/bin/env python3
import requests
import json
import sys
from datetime import datetime

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

API_URL = f"{BACKEND_URL}/api"
print(f"Testing Login API at: {API_URL}")

class LoginAPITest:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, test_func):
        """Run a single test"""
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            success = test_func()
            if success:
                self.tests_passed += 1
                print(f"✅ {name} - PASSED")
            else:
                print(f"❌ {name} - FAILED")
            return success
        except Exception as e:
            print(f"❌ {name} - ERROR: {str(e)}")
            return False

    def test_health_check(self):
        """Test API health check"""
        try:
            response = requests.get(f"{API_URL}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                print(f"   API Status: {data.get('status', 'unknown')}")
                print(f"   Message: {data.get('message', 'No message')}")
                return True
            else:
                print(f"   Health check failed with status: {response.status_code}")
                return False
        except Exception as e:
            print(f"   Health check error: {str(e)}")
            return False

    def test_admin_login_success(self):
        """Test successful admin login"""
        try:
            login_data = {
                "username": "admin",
                "password": "admin123"
            }
            
            response = requests.post(f"{API_URL}/auth/login", data=login_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                if "access_token" not in data:
                    print("   Missing access_token in response")
                    return False
                
                if "token_type" not in data:
                    print("   Missing token_type in response")
                    return False
                
                if "user" not in data:
                    print("   Missing user in response")
                    return False
                
                user = data["user"]
                if user.get("username") != "admin":
                    print(f"   Expected username 'admin', got '{user.get('username')}'")
                    return False
                
                if "Admin" not in user.get("roles", []):
                    print(f"   Expected Admin role, got roles: {user.get('roles')}")
                    return False
                
                print(f"   Login successful for admin user")
                print(f"   Token type: {data['token_type']}")
                print(f"   User roles: {user['roles']}")
                print(f"   User active: {user.get('is_active', 'unknown')}")
                
                return True
            else:
                print(f"   Login failed with status: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error details: {error_data}")
                except:
                    print(f"   Response text: {response.text}")
                return False
                
        except Exception as e:
            print(f"   Admin login error: {str(e)}")
            return False

    def test_admin_login_wrong_password(self):
        """Test admin login with wrong password"""
        try:
            login_data = {
                "username": "admin",
                "password": "wrongpassword"
            }
            
            response = requests.post(f"{API_URL}/auth/login", data=login_data, timeout=10)
            
            if response.status_code == 401:
                print("   Correctly rejected wrong password with 401")
                return True
            else:
                print(f"   Expected 401 for wrong password, got: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"   Wrong password test error: {str(e)}")
            return False

    def test_nonexistent_user_login(self):
        """Test login with non-existent user"""
        try:
            login_data = {
                "username": "nonexistentuser",
                "password": "anypassword"
            }
            
            response = requests.post(f"{API_URL}/auth/login", data=login_data, timeout=10)
            
            if response.status_code == 401:
                print("   Correctly rejected non-existent user with 401")
                return True
            else:
                print(f"   Expected 401 for non-existent user, got: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"   Non-existent user test error: {str(e)}")
            return False

    def test_login_endpoint_structure(self):
        """Test login endpoint accepts form data"""
        try:
            # Test with empty data to see if endpoint exists
            response = requests.post(f"{API_URL}/auth/login", data={}, timeout=10)
            
            # Should return 422 (validation error) or 401, not 404
            if response.status_code in [422, 401]:
                print(f"   Login endpoint exists and accepts form data (status: {response.status_code})")
                return True
            elif response.status_code == 404:
                print("   Login endpoint not found (404)")
                return False
            else:
                print(f"   Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"   Endpoint structure test error: {str(e)}")
            return False

    def test_token_validation(self):
        """Test JWT token validation"""
        try:
            # First login to get a token
            login_data = {
                "username": "admin",
                "password": "admin123"
            }
            
            response = requests.post(f"{API_URL}/auth/login", data=login_data, timeout=10)
            
            if response.status_code != 200:
                print("   Could not login to get token for validation test")
                return False
            
            token = response.json()["access_token"]
            
            # Test token with /auth/me endpoint
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{API_URL}/auth/me", headers=headers, timeout=10)
            
            if response.status_code == 200:
                user_data = response.json()
                if user_data.get("username") == "admin":
                    print("   JWT token validation working correctly")
                    return True
                else:
                    print(f"   Token validation returned wrong user: {user_data.get('username')}")
                    return False
            else:
                print(f"   Token validation failed with status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"   Token validation test error: {str(e)}")
            return False

def main():
    print("=" * 60)
    print("LOGIN FUNCTIONALITY BACKEND TEST")
    print("=" * 60)
    
    tester = LoginAPITest()
    
    # Run all tests
    tests = [
        ("API Health Check", tester.test_health_check),
        ("Login Endpoint Structure", tester.test_login_endpoint_structure),
        ("Admin Login Success", tester.test_admin_login_success),
        ("Admin Login Wrong Password", tester.test_admin_login_wrong_password),
        ("Non-existent User Login", tester.test_nonexistent_user_login),
        ("JWT Token Validation", tester.test_token_validation),
    ]
    
    for test_name, test_func in tests:
        tester.run_test(test_name, test_func)
    
    # Print results
    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("\n🎉 ALL LOGIN BACKEND TESTS PASSED!")
        print("✅ Login API is working correctly")
        print("✅ Admin user exists and can login")
        print("✅ JWT token generation and validation working")
        print("✅ Error handling for invalid credentials working")
        return 0
    else:
        print(f"\n❌ {tester.tests_run - tester.tests_passed} TESTS FAILED")
        print("❌ Login functionality has issues that need to be addressed")
        return 1

if __name__ == "__main__":
    sys.exit(main())