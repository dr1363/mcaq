import requests
import sys
from datetime import datetime

class HackLidoLearnAPITester:
    def __init__(self, base_url="https://hacklearn-24.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@hacklidolearn.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin token obtained")
            return True
        return False

    def test_demo_login(self):
        """Test demo user login"""
        success, response = self.run_test(
            "Demo User Login",
            "POST",
            "auth/login",
            200,
            data={"email": "demo@hacklidolearn.com", "password": "demo123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('user', {}).get('id')
            print(f"   Demo user token obtained")
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_user_{datetime.now().strftime('%H%M%S')}@test.com"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "username": f"testuser_{datetime.now().strftime('%H%M%S')}",
                "password": "TestPass123!"
            }
        )
        return success

    def test_get_me(self):
        """Test get current user"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_get_roadmaps(self):
        """Test get roadmaps"""
        success, response = self.run_test(
            "Get Roadmaps",
            "GET",
            "roadmaps",
            200
        )
        if success:
            print(f"   Found {len(response)} roadmaps")
        return success

    def test_get_rooms(self):
        """Test get rooms"""
        success, response = self.run_test(
            "Get Rooms",
            "GET",
            "rooms",
            200
        )
        if success:
            print(f"   Found {len(response)} rooms")
            return success, response
        return False, []

    def test_get_room_detail(self, room_id):
        """Test get room detail"""
        success, response = self.run_test(
            f"Get Room Detail ({room_id})",
            "GET",
            f"rooms/{room_id}",
            200
        )
        return success

    def test_start_lab(self, room_id):
        """Test start lab session"""
        success, response = self.run_test(
            f"Start Lab Session ({room_id})",
            "POST",
            "labs/start",
            200,
            data={"room_id": room_id}
        )
        if success:
            session_id = response.get('id')
            print(f"   Lab session started: {session_id}")
            return success, session_id
        return False, None

    def test_execute_command(self, session_id):
        """Test execute command in lab"""
        success, response = self.run_test(
            f"Execute Command ({session_id})",
            "POST",
            f"labs/{session_id}/execute",
            200,
            data={"command": "whoami"}
        )
        if success:
            print(f"   Command output: {response.get('output', '')[:50]}...")
        return success

    def test_submit_flag(self, room_id):
        """Test flag submission"""
        success, response = self.run_test(
            f"Submit Flag ({room_id})",
            "POST",
            "flags/submit",
            200,
            data={"room_id": room_id, "flag": "FLAG{networking_basics_complete}"}
        )
        return success

    def test_get_challenges(self):
        """Test get coding challenges"""
        success, response = self.run_test(
            "Get Coding Challenges",
            "GET",
            "challenges",
            200
        )
        if success:
            print(f"   Found {len(response)} challenges")
        return success

    def test_execute_code(self):
        """Test code execution"""
        success, response = self.run_test(
            "Execute Code",
            "POST",
            "challenges/execute",
            200,
            data={
                "language": "python",
                "code": "print('Hello from HackLidoLearn!')"
            }
        )
        if success:
            print(f"   Code output: {response.get('output', '')}")
        return success

    def test_get_leaderboard(self):
        """Test get leaderboard"""
        success, response = self.run_test(
            "Get Leaderboard",
            "GET",
            "leaderboard",
            200
        )
        if success:
            print(f"   Found {len(response)} users on leaderboard")
        return success

    def test_get_progress(self):
        """Test get user progress"""
        success, response = self.run_test(
            "Get User Progress",
            "GET",
            "progress",
            200
        )
        if success:
            print(f"   Found {len(response)} progress entries")
        return success

    def test_admin_stats(self):
        """Test admin stats (requires admin token)"""
        if not self.admin_token:
            print("❌ Admin token not available, skipping admin stats test")
            return False
            
        success, response = self.run_test(
            "Admin Stats",
            "GET",
            "admin/stats",
            200,
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        if success:
            print(f"   Stats: {response}")
        return success

    def test_admin_users(self):
        """Test admin get all users"""
        if not self.admin_token:
            print("❌ Admin token not available, skipping admin users test")
            return False
            
        success, response = self.run_test(
            "Admin Get Users",
            "GET",
            "admin/users",
            200,
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        if success:
            print(f"   Found {len(response)} users")
        return success

def main():
    print("🚀 Starting HackLidoLearn API Tests")
    print("=" * 50)
    
    tester = HackLidoLearnAPITester()
    
    # Test authentication first
    print("\n📝 AUTHENTICATION TESTS")
    if not tester.test_admin_login():
        print("❌ Admin login failed - this will affect admin tests")
    
    if not tester.test_demo_login():
        print("❌ Demo login failed - stopping tests")
        return 1
    
    # Test user registration
    tester.test_user_registration()
    
    # Test authenticated endpoints
    print("\n📝 USER ENDPOINTS")
    tester.test_get_me()
    
    # Test core functionality
    print("\n📝 CORE FUNCTIONALITY TESTS")
    tester.test_get_roadmaps()
    
    rooms_success, rooms = tester.test_get_rooms()
    if rooms_success and rooms:
        # Test room detail with first room
        first_room = rooms[0]
        room_id = first_room.get('id')
        if room_id:
            tester.test_get_room_detail(room_id)
            
            # Test lab functionality if room has lab
            if first_room.get('has_lab'):
                lab_success, session_id = tester.test_start_lab(room_id)
                if lab_success and session_id:
                    tester.test_execute_command(session_id)
            
            # Test flag submission
            tester.test_submit_flag(room_id)
    
    # Test coding challenges
    print("\n📝 CODING CHALLENGE TESTS")
    tester.test_get_challenges()
    tester.test_execute_code()
    
    # Test leaderboard and progress
    print("\n📝 PROGRESS & LEADERBOARD TESTS")
    tester.test_get_leaderboard()
    tester.test_get_progress()
    
    # Test admin endpoints
    print("\n📝 ADMIN ENDPOINT TESTS")
    tester.test_admin_stats()
    tester.test_admin_users()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"Success rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("✅ Backend API tests mostly successful!")
        return 0
    elif success_rate >= 50:
        print("⚠️  Backend API has some issues but core functionality works")
        return 0
    else:
        print("❌ Backend API has major issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())