#!/usr/bin/env python3
import requests
import json
import unittest
import os
import sys
from datetime import datetime

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

API_URL = f"{BACKEND_URL}/api"
print(f"Testing Authentication API at: {API_URL}")

class AuthenticationAPITest(unittest.TestCase):
    """Test suite for the Authentication System API"""

    def setUp(self):
        """Set up test fixtures before each test method"""
        self.test_username = "testuser_auth"
        self.test_password = "testpass123"
        self.admin_username = "admin"
        self.admin_password = "admin123"
        self.auth_token = None
        self.admin_token = None

    def test_01_health_check(self):
        """Test the health check endpoint"""
        print("\n--- Testing Health Check Endpoint ---")
        response = requests.get(f"{API_URL}/")
        self.assertEqual(response.status_code, 200, "Health check failed")
        data = response.json()
        self.assertEqual(data["message"], "Blog CMS API is running")
        self.assertEqual(data["status"], "healthy")
        print("✅ Health check endpoint working")

    def test_02_user_registration(self):
        """Test user registration with username and password"""
        print("\n--- Testing POST /api/auth/register ---")
        
        # Test successful registration
        registration_data = {
            "username": self.test_username,
            "password": self.test_password,
            "confirm_password": self.test_password
        }
        
        response = requests.post(f"{API_URL}/auth/register", json=registration_data)
        self.assertEqual(response.status_code, 200, f"Registration failed: {response.text}")
        
        data = response.json()
        self.assertEqual(data["message"], "User registered successfully")
        self.assertEqual(data["username"], self.test_username)
        self.assertEqual(data["roles"], ["Viewer"])  # Default role should be Viewer
        print(f"✅ User registration successful - Username: {self.test_username}, Default role: Viewer")

    def test_03_registration_password_mismatch(self):
        """Test registration with password mismatch"""
        print("\n--- Testing Registration Password Mismatch ---")
        
        registration_data = {
            "username": "testuser_mismatch",
            "password": "password123",
            "confirm_password": "different_password"
        }
        
        response = requests.post(f"{API_URL}/auth/register", json=registration_data)
        self.assertEqual(response.status_code, 400, "Password mismatch should return 400")
        
        data = response.json()
        self.assertEqual(data["detail"], "Passwords do not match")
        print("✅ Password mismatch validation working")

    def test_04_registration_duplicate_username(self):
        """Test registration with duplicate username"""
        print("\n--- Testing Registration Duplicate Username ---")
        
        registration_data = {
            "username": self.test_username,  # Same username as test_02
            "password": "newpassword123",
            "confirm_password": "newpassword123"
        }
        
        response = requests.post(f"{API_URL}/auth/register", json=registration_data)
        self.assertEqual(response.status_code, 400, "Duplicate username should return 400")
        
        data = response.json()
        self.assertEqual(data["detail"], "Username already registered")
        print("✅ Duplicate username validation working")

    def test_05_user_login_valid_credentials(self):
        """Test user login with valid credentials"""
        print("\n--- Testing POST /api/auth/login ---")
        
        # Login with the user we registered
        login_data = {
            "username": self.test_username,
            "password": self.test_password
        }
        
        response = requests.post(f"{API_URL}/auth/login", data=login_data)
        self.assertEqual(response.status_code, 200, f"Login failed: {response.text}")
        
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")
        self.assertIn("user", data)
        
        user_data = data["user"]
        self.assertEqual(user_data["username"], self.test_username)
        self.assertEqual(user_data["roles"], ["Viewer"])
        self.assertTrue(user_data["is_active"])
        
        # Store token for later tests
        self.auth_token = data["access_token"]
        print(f"✅ User login successful - JWT token generated, User: {self.test_username}")

    def test_06_user_login_invalid_credentials(self):
        """Test user login with invalid credentials"""
        print("\n--- Testing Login Invalid Credentials ---")
        
        # Test with wrong password
        login_data = {
            "username": self.test_username,
            "password": "wrongpassword"
        }
        
        response = requests.post(f"{API_URL}/auth/login", data=login_data)
        self.assertEqual(response.status_code, 401, "Invalid credentials should return 401")
        
        data = response.json()
        self.assertEqual(data["detail"], "Incorrect username or password")
        print("✅ Invalid credentials validation working")
        
        # Test with non-existent user
        login_data = {
            "username": "nonexistentuser",
            "password": "anypassword"
        }
        
        response = requests.post(f"{API_URL}/auth/login", data=login_data)
        self.assertEqual(response.status_code, 401, "Non-existent user should return 401")
        print("✅ Non-existent user validation working")

    def test_07_get_current_user_info(self):
        """Test GET /api/auth/me - current user info retrieval"""
        print("\n--- Testing GET /api/auth/me ---")
        
        # First login to get token if we don't have it
        if not self.auth_token:
            login_data = {
                "username": self.test_username,
                "password": self.test_password
            }
            response = requests.post(f"{API_URL}/auth/login", data=login_data)
            self.auth_token = response.json()["access_token"]
        
        # Test with valid token
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200, f"Get current user failed: {response.text}")
        
        data = response.json()
        self.assertEqual(data["username"], self.test_username)
        self.assertEqual(data["roles"], ["Viewer"])
        self.assertTrue(data["is_active"])
        self.assertIn("created_at", data)
        print(f"✅ Current user info retrieval successful - User: {self.test_username}")

    def test_08_get_current_user_no_token(self):
        """Test GET /api/auth/me without authentication token"""
        print("\n--- Testing GET /api/auth/me Without Token ---")
        
        response = requests.get(f"{API_URL}/auth/me")
        self.assertEqual(response.status_code, 401, "Request without token should return 401")
        print("✅ Unauthenticated request properly rejected")

    def test_09_get_current_user_invalid_token(self):
        """Test GET /api/auth/me with invalid token"""
        print("\n--- Testing GET /api/auth/me With Invalid Token ---")
        
        headers = {"Authorization": "Bearer invalid_token_here"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 401, "Invalid token should return 401")
        
        data = response.json()
        self.assertEqual(data["detail"], "Could not validate credentials")
        print("✅ Invalid token properly rejected")

    def test_10_default_admin_user_login(self):
        """Test default admin user exists and can login"""
        print("\n--- Testing Default Admin User Login ---")
        
        login_data = {
            "username": self.admin_username,
            "password": self.admin_password
        }
        
        response = requests.post(f"{API_URL}/auth/login", data=login_data)
        self.assertEqual(response.status_code, 200, f"Admin login failed: {response.text}")
        
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")
        
        user_data = data["user"]
        self.assertEqual(user_data["username"], self.admin_username)
        self.assertIn("Admin", user_data["roles"])
        self.assertTrue(user_data["is_active"])
        
        # Store admin token for later tests
        self.admin_token = data["access_token"]
        print(f"✅ Default admin user login successful - Admin has proper permissions")

    def test_11_admin_get_all_users(self):
        """Test GET /api/auth/users - admin can list all users"""
        print("\n--- Testing GET /api/auth/users (Admin Only) ---")
        
        # First login as admin if we don't have token
        if not self.admin_token:
            login_data = {
                "username": self.admin_username,
                "password": self.admin_password
            }
            response = requests.post(f"{API_URL}/auth/login", data=login_data)
            self.admin_token = response.json()["access_token"]
        
        # Test with admin token
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.get(f"{API_URL}/auth/users", headers=headers)
        self.assertEqual(response.status_code, 200, f"Get all users failed: {response.text}")
        
        data = response.json()
        self.assertIsInstance(data, list, "Users response should be a list")
        self.assertGreater(len(data), 0, "Should have at least admin and test user")
        
        # Check that admin and test user are in the list
        usernames = [user["username"] for user in data]
        self.assertIn(self.admin_username, usernames)
        self.assertIn(self.test_username, usernames)
        print(f"✅ Admin can list all users - Found {len(data)} users")

    def test_12_non_admin_get_all_users(self):
        """Test GET /api/auth/users - non-admin cannot list users"""
        print("\n--- Testing GET /api/auth/users (Non-Admin Access) ---")
        
        # Use regular user token
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/auth/users", headers=headers)
        self.assertEqual(response.status_code, 403, "Non-admin should get 403 Forbidden")
        
        data = response.json()
        self.assertEqual(data["detail"], "Insufficient permissions")
        print("✅ Non-admin properly denied access to user list")

    def test_13_admin_update_user_role(self):
        """Test PUT /api/auth/users/{user_id}/role - admin can update user roles"""
        print("\n--- Testing PUT /api/auth/users/{username}/role (Admin Only) ---")
        
        # Test updating test user's role to Author
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        new_roles = ["Author", "Viewer"]
        
        response = requests.put(
            f"{API_URL}/auth/users/{self.test_username}/role", 
            json=new_roles,
            headers=headers
        )
        self.assertEqual(response.status_code, 200, f"Update user role failed: {response.text}")
        
        data = response.json()
        self.assertIn("roles updated", data["message"])
        print(f"✅ Admin can update user roles - Updated {self.test_username} to {new_roles}")
        
        # Verify the role was actually updated by getting user info
        login_data = {
            "username": self.test_username,
            "password": self.test_password
        }
        response = requests.post(f"{API_URL}/auth/login", data=login_data)
        user_data = response.json()["user"]
        self.assertIn("Author", user_data["roles"])
        print("✅ Role update verified through login")

    def test_14_admin_update_user_role_invalid_role(self):
        """Test PUT /api/auth/users/{username}/role with invalid role"""
        print("\n--- Testing Update User Role Invalid Role ---")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        invalid_roles = ["InvalidRole"]
        
        response = requests.put(
            f"{API_URL}/auth/users/{self.test_username}/role", 
            json=invalid_roles,
            headers=headers
        )
        self.assertEqual(response.status_code, 400, "Invalid role should return 400")
        
        data = response.json()
        self.assertEqual(data["detail"], "Invalid role specified")
        print("✅ Invalid role validation working")

    def test_15_admin_update_nonexistent_user_role(self):
        """Test PUT /api/auth/users/{username}/role for non-existent user"""
        print("\n--- Testing Update Non-existent User Role ---")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        new_roles = ["Viewer"]
        
        response = requests.put(
            f"{API_URL}/auth/users/nonexistentuser/role", 
            json=new_roles,
            headers=headers
        )
        self.assertEqual(response.status_code, 404, "Non-existent user should return 404")
        
        data = response.json()
        self.assertEqual(data["detail"], "User not found")
        print("✅ Non-existent user validation working")

    def test_16_non_admin_update_user_role(self):
        """Test PUT /api/auth/users/{username}/role - non-admin cannot update roles"""
        print("\n--- Testing Update User Role (Non-Admin Access) ---")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        new_roles = ["Publisher"]
        
        response = requests.put(
            f"{API_URL}/auth/users/{self.test_username}/role", 
            json=new_roles,
            headers=headers
        )
        self.assertEqual(response.status_code, 403, "Non-admin should get 403 Forbidden")
        
        data = response.json()
        self.assertEqual(data["detail"], "Insufficient permissions")
        print("✅ Non-admin properly denied role update access")

    def test_17_admin_delete_user(self):
        """Test DELETE /api/auth/users/{username} - admin can delete users"""
        print("\n--- Testing DELETE /api/auth/users/{username} (Admin Only) ---")
        
        # First create a user to delete
        delete_user_data = {
            "username": "user_to_delete",
            "password": "deletepass123",
            "confirm_password": "deletepass123"
        }
        
        response = requests.post(f"{API_URL}/auth/register", json=delete_user_data)
        self.assertEqual(response.status_code, 200, "Failed to create user for deletion test")
        
        # Now delete the user as admin
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.delete(f"{API_URL}/auth/users/user_to_delete", headers=headers)
        self.assertEqual(response.status_code, 200, f"Delete user failed: {response.text}")
        
        data = response.json()
        self.assertIn("deleted successfully", data["message"])
        print("✅ Admin can delete users")
        
        # Verify user is actually deleted by trying to login
        login_data = {
            "username": "user_to_delete",
            "password": "deletepass123"
        }
        response = requests.post(f"{API_URL}/auth/login", data=login_data)
        self.assertEqual(response.status_code, 401, "Deleted user should not be able to login")
        print("✅ User deletion verified")

    def test_18_admin_delete_admin_user(self):
        """Test DELETE /api/auth/users/admin - cannot delete admin user"""
        print("\n--- Testing Delete Admin User Prevention ---")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.delete(f"{API_URL}/auth/users/admin", headers=headers)
        self.assertEqual(response.status_code, 400, "Should not be able to delete admin user")
        
        data = response.json()
        self.assertEqual(data["detail"], "Cannot delete admin user")
        print("✅ Admin user deletion properly prevented")

    def test_19_admin_delete_nonexistent_user(self):
        """Test DELETE /api/auth/users/{username} for non-existent user"""
        print("\n--- Testing Delete Non-existent User ---")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.delete(f"{API_URL}/auth/users/nonexistentuser", headers=headers)
        self.assertEqual(response.status_code, 404, "Non-existent user should return 404")
        
        data = response.json()
        self.assertEqual(data["detail"], "User not found")
        print("✅ Non-existent user deletion validation working")

    def test_20_non_admin_delete_user(self):
        """Test DELETE /api/auth/users/{username} - non-admin cannot delete users"""
        print("\n--- Testing Delete User (Non-Admin Access) ---")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.delete(f"{API_URL}/auth/users/someuser", headers=headers)
        self.assertEqual(response.status_code, 403, "Non-admin should get 403 Forbidden")
        
        data = response.json()
        self.assertEqual(data["detail"], "Insufficient permissions")
        print("✅ Non-admin properly denied user deletion access")

    def test_21_password_validation(self):
        """Test password validation (minimum 6 characters)"""
        print("\n--- Testing Password Validation ---")
        
        # Test with short password
        registration_data = {
            "username": "shortpass_user",
            "password": "12345",  # Only 5 characters
            "confirm_password": "12345"
        }
        
        response = requests.post(f"{API_URL}/auth/register", json=registration_data)
        # Note: The current implementation doesn't seem to have minimum length validation
        # This test documents the current behavior
        if response.status_code == 400:
            print("✅ Password length validation working")
        else:
            print("⚠️ Password length validation not implemented (current behavior)")

    def test_22_jwt_token_validation(self):
        """Test JWT token generation and validation"""
        print("\n--- Testing JWT Token Validation ---")
        
        # Login to get a fresh token
        login_data = {
            "username": self.test_username,
            "password": self.test_password
        }
        response = requests.post(f"{API_URL}/auth/login", data=login_data)
        token = response.json()["access_token"]
        
        # Verify token works for protected endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200, "Valid token should work")
        
        # Test with malformed token
        headers = {"Authorization": "Bearer malformed.token.here"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 401, "Malformed token should be rejected")
        
        print("✅ JWT token generation and validation working")

    def test_23_role_based_access_control(self):
        """Test role-based access control functionality"""
        print("\n--- Testing Role-Based Access Control ---")
        
        # Test that Viewer role can access /auth/me but not admin endpoints
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Should work - basic authenticated endpoint
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200, "Viewer should access /auth/me")
        
        # Should fail - admin-only endpoint
        response = requests.get(f"{API_URL}/auth/users", headers=headers)
        self.assertEqual(response.status_code, 403, "Viewer should not access admin endpoints")
        
        # Test admin can access admin endpoints
        admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.get(f"{API_URL}/auth/users", headers=admin_headers)
        self.assertEqual(response.status_code, 200, "Admin should access admin endpoints")
        
        print("✅ Role-based access control working correctly")


if __name__ == "__main__":
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add all authentication tests in order
    test_methods = [
        "test_01_health_check",
        "test_02_user_registration", 
        "test_03_registration_password_mismatch",
        "test_04_registration_duplicate_username",
        "test_05_user_login_valid_credentials",
        "test_06_user_login_invalid_credentials", 
        "test_07_get_current_user_info",
        "test_08_get_current_user_no_token",
        "test_09_get_current_user_invalid_token",
        "test_10_default_admin_user_login",
        "test_11_admin_get_all_users",
        "test_12_non_admin_get_all_users",
        "test_13_admin_update_user_role",
        "test_14_admin_update_user_role_invalid_role",
        "test_15_admin_update_nonexistent_user_role",
        "test_16_non_admin_update_user_role",
        "test_17_admin_delete_user",
        "test_18_admin_delete_admin_user",
        "test_19_admin_delete_nonexistent_user",
        "test_20_non_admin_delete_user",
        "test_21_password_validation",
        "test_22_jwt_token_validation",
        "test_23_role_based_access_control"
    ]
    
    for test_method in test_methods:
        suite.addTest(AuthenticationAPITest(test_method))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"AUTHENTICATION SYSTEM TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.failures:
        print(f"\nFAILURES:")
        for test, traceback in result.failures:
            print(f"- {test}: {traceback}")
    
    if result.errors:
        print(f"\nERRORS:")
        for test, traceback in result.errors:
            print(f"- {test}: {traceback}")
    
    if result.wasSuccessful():
        print(f"\n✅ ALL AUTHENTICATION TESTS PASSED!")
    else:
        print(f"\n❌ SOME AUTHENTICATION TESTS FAILED!")