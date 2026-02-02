import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def update_rooms():
    print("Updating room types...")
    
    # Update Web Penetration Testing rooms to have web lab type
    await db.rooms.update_one(
        {'id': 'room-2', 'title': 'SQL Injection'},
        {'$set': {
            'lab_type': 'web',
            'web_app_url': 'http://vulnerable-app:8080',
            'has_lab': True
        }}
    )
    print("✓ Updated SQL Injection room to web type")
    
    await db.rooms.update_one(
        {'id': 'room-6', 'title': 'XSS Attacks'},
        {'$set': {
            'lab_type': 'web',
            'web_app_url': 'http://vulnerable-app:8080/xss',
            'has_lab': True
        }}
    )
    print("✓ Updated XSS room to web type")
    
    # Update Linux/Networking rooms to terminal type
    await db.rooms.update_one(
        {'id': 'room-1', 'title': 'Network Basics'},
        {'$set': {
            'lab_type': 'terminal',
            'has_lab': True
        }}
    )
    print("✓ Updated Network Basics to terminal type")
    
    await db.rooms.update_one(
        {'id': 'room-3', 'title': 'Linux Command Line'},
        {'$set': {
            'lab_type': 'terminal',
            'has_lab': True
        }}
    )
    print("✓ Updated Linux Command Line to terminal type")
    
    # Update Python room to code editor type
    await db.rooms.update_one(
        {'id': 'room-5', 'title': 'Python Scripting'},
        {'$set': {
            'lab_type': 'code_editor',
            'code_language': 'python',
            'has_lab': True
        }}
    )
    print("✓ Updated Python Scripting to code editor type")
    
    # Update OSINT room to have no lab (research only)
    await db.rooms.update_one(
        {'id': 'room-4', 'title': 'OSINT Basics'},
        {'$set': {
            'has_lab': False,
            'lab_type': 'none'
        }}
    )
    print("✓ Updated OSINT to theory-only room")
    
    print("\n✅ All room types updated successfully!")

if __name__ == "__main__":
    asyncio.run(update_rooms())
