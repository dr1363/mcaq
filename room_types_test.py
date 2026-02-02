import requests
import sys

class RoomTypesVerifier:
    def __init__(self, base_url="https://hacklearn-24.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        
    def login(self):
        """Login to get token"""
        url = f"{self.base_url}/api/auth/login"
        response = requests.post(url, json={
            "email": "demo@hacklidolearn.com", 
            "password": "demo123"
        })
        if response.status_code == 200:
            self.token = response.json()['token']
            return True
        return False
    
    def get_room_details(self, room_id):
        """Get room details including lab_type"""
        url = f"{self.base_url}/api/rooms/{room_id}"
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json()
        return None
    
    def verify_room_types(self):
        """Verify each room has correct lab_type"""
        expected_room_types = {
            'room-1': {'title': 'Network Basics', 'expected_lab_type': 'terminal'},
            'room-2': {'title': 'SQL Injection', 'expected_lab_type': 'web'},
            'room-3': {'title': 'Linux Command Line', 'expected_lab_type': 'terminal'},
            'room-4': {'title': 'OSINT Basics', 'expected_lab_type': 'none'},
            'room-5': {'title': 'Python Scripting', 'expected_lab_type': 'code_editor'},
            'room-6': {'title': 'XSS Attacks', 'expected_lab_type': 'web'}
        }
        
        print("🔍 Verifying room lab types in database...")
        print("=" * 60)
        
        all_correct = True
        
        for room_id, expected in expected_room_types.items():
            room_data = self.get_room_details(room_id)
            if room_data:
                actual_lab_type = room_data.get('lab_type', 'not_set')
                has_lab = room_data.get('has_lab', False)
                title = room_data.get('title', 'Unknown')
                
                print(f"\n📋 {title} ({room_id}):")
                print(f"   Expected lab_type: {expected['expected_lab_type']}")
                print(f"   Actual lab_type:   {actual_lab_type}")
                print(f"   Has lab enabled:   {has_lab}")
                
                if actual_lab_type == expected['expected_lab_type']:
                    print(f"   ✅ CORRECT lab type")
                else:
                    print(f"   ❌ WRONG lab type")
                    all_correct = False
                
                # Check has_lab flag consistency
                if expected['expected_lab_type'] == 'none':
                    if not has_lab:
                        print(f"   ✅ Correctly has no lab")
                    else:
                        print(f"   ❌ Should not have lab enabled")
                        all_correct = False
                else:
                    if has_lab:
                        print(f"   ✅ Correctly has lab enabled")
                    else:
                        print(f"   ❌ Should have lab enabled")
                        all_correct = False
            else:
                print(f"❌ Failed to get room data for {room_id}")
                all_correct = False
        
        print("\n" + "=" * 60)
        if all_correct:
            print("✅ ALL ROOM TYPES ARE CORRECTLY CONFIGURED!")
        else:
            print("❌ SOME ROOM TYPES ARE INCORRECTLY CONFIGURED!")
        
        return all_correct

def main():
    verifier = RoomTypesVerifier()
    
    if not verifier.login():
        print("❌ Failed to login")
        return 1
    
    success = verifier.verify_room_types()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())