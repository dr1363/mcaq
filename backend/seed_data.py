import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_data():
    print("Seeding database...")
    
    await db.roadmaps.delete_many({})
    await db.rooms.delete_many({})
    await db.coding_challenges.delete_many({})
    
    roadmaps = [
        {
            "id": "roadmap-1",
            "title": "Networking Fundamentals",
            "description": "Master the basics of networking, protocols, and network security",
            "difficulty": "Beginner",
            "icon": "🌐",
            "order": 1,
            "rooms": []
        },
        {
            "id": "roadmap-2",
            "title": "Web Penetration Testing",
            "description": "Learn to find and exploit web application vulnerabilities",
            "difficulty": "Intermediate",
            "icon": "🕷️",
            "order": 2,
            "rooms": []
        },
        {
            "id": "roadmap-3",
            "title": "Linux Fundamentals",
            "description": "Essential Linux skills for security professionals",
            "difficulty": "Beginner",
            "icon": "🐧",
            "order": 3,
            "rooms": []
        },
        {
            "id": "roadmap-4",
            "title": "OSINT",
            "description": "Open-Source Intelligence gathering techniques",
            "difficulty": "Intermediate",
            "icon": "🔍",
            "order": 4,
            "rooms": []
        },
        {
            "id": "roadmap-5",
            "title": "Python for Hacking",
            "description": "Automate security tasks with Python scripting",
            "difficulty": "Advanced",
            "icon": "🐍",
            "order": 5,
            "rooms": []
        }
    ]
    
    rooms = [
        {
            "id": "room-1",
            "title": "Network Basics",
            "description": "Introduction to networking concepts, IP addresses, and protocols",
            "difficulty": "Beginner",
            "category": "Networking",
            "content": """# Network Basics

## Introduction
Understanding networks is the foundation of cybersecurity. In this room, you'll learn about:

- IP addresses and subnets
- TCP/IP protocol stack
- DNS and how it works
- Common network protocols (HTTP, FTP, SSH)

## Tasks
1. What is your machine's IP address?
2. Perform a DNS lookup for google.com
3. Identify the protocol used for secure web browsing

## Commands to try
```bash
ifconfig
nslookup google.com
netstat -an
```

Submit the flag when you complete all tasks!
""",
            "xp_reward": 100,
            "has_lab": True,
            "docker_image": "ubuntu:20.04",
            "roadmap_id": "roadmap-1",
            "flags": ["FLAG{networking_basics_complete}"],
            "tasks": [
                {"title": "Find your IP address", "description": "Use ifconfig or ip addr"},
                {"title": "Lookup DNS", "description": "Use nslookup or dig"},
                {"title": "Check open ports", "description": "Use netstat"}
            ]
        },
        {
            "id": "room-2",
            "title": "SQL Injection",
            "description": "Learn to identify and exploit SQL injection vulnerabilities",
            "difficulty": "Intermediate",
            "category": "Web",
            "content": """# SQL Injection

## What is SQL Injection?
SQL injection is a web security vulnerability that allows attackers to interfere with database queries.

## Common Injection Points
- Login forms
- Search boxes
- URL parameters
- Form fields

## Example
```sql
' OR '1'='1
admin' --
' UNION SELECT NULL--
```

## Your Task
Find the SQL injection vulnerability in the web application and extract sensitive data.

Flag format: FLAG{extracted_data}
""",
            "xp_reward": 150,
            "has_lab": True,
            "docker_image": "ubuntu:20.04",
            "roadmap_id": "roadmap-2",
            "flags": ["FLAG{sql_injection_master}"],
            "tasks": [
                {"title": "Find injection point", "description": "Test input fields"},
                {"title": "Extract database name", "description": "Use UNION-based injection"},
                {"title": "Dump admin credentials", "description": "Query users table"}
            ]
        },
        {
            "id": "room-3",
            "title": "Linux Command Line",
            "description": "Master essential Linux commands for security work",
            "difficulty": "Beginner",
            "category": "Linux",
            "content": """# Linux Command Line

## Essential Commands
Learn these fundamental Linux commands:

### Navigation
- `pwd` - Print working directory
- `ls` - List files
- `cd` - Change directory

### File Operations
- `cat` - View file contents
- `grep` - Search text
- `find` - Find files

### System Info
- `whoami` - Current user
- `uname -a` - System info
- `ps aux` - Running processes

## Challenge
Navigate the filesystem and find the hidden flag file!

Hint: The flag is hidden in /home/user/.secrets/
""",
            "xp_reward": 100,
            "has_lab": True,
            "docker_image": "ubuntu:20.04",
            "roadmap_id": "roadmap-3",
            "flags": ["FLAG{linux_master}"],
            "tasks": [
                {"title": "List files in home directory", "description": "Use ls -la"},
                {"title": "Find hidden files", "description": "Files starting with ."},
                {"title": "Read flag file", "description": "Use cat or less"}
            ]
        },
        {
            "id": "room-4",
            "title": "OSINT Basics",
            "description": "Learn Open-Source Intelligence gathering techniques",
            "difficulty": "Beginner",
            "category": "OSINT",
            "content": """# OSINT Basics

## What is OSINT?
Open-Source Intelligence (OSINT) is gathering information from publicly available sources.

## OSINT Sources
- Social media platforms
- Search engines
- Public databases
- Company websites
- DNS records

## Tools
- Google Dorking
- Shodan
- theHarvester
- Maltego
- WHOIS lookup

## Your Mission
Use OSINT techniques to gather information about the target domain and find the flag.

Target: example-target.com
""",
            "xp_reward": 120,
            "has_lab": False,
            "roadmap_id": "roadmap-4",
            "flags": ["FLAG{osint_investigator}"],
            "tasks": [
                {"title": "WHOIS lookup", "description": "Find domain registration info"},
                {"title": "DNS enumeration", "description": "Find subdomains"},
                {"title": "Social media research", "description": "Find company profiles"}
            ]
        },
        {
            "id": "room-5",
            "title": "Python Scripting",
            "description": "Write Python scripts for security automation",
            "difficulty": "Intermediate",
            "category": "Programming",
            "content": """# Python for Security

## Why Python?
Python is the go-to language for security professionals due to:
- Easy syntax
- Rich libraries
- Quick prototyping
- Great for automation

## Common Security Libraries
```python
import socket      # Network programming
import requests    # HTTP requests
import hashlib     # Cryptography
import subprocess  # System commands
```

## Your Task
Write a Python script that:
1. Performs a port scan
2. Checks for open HTTP services
3. Identifies server versions

Complete the challenge to get the flag!
""",
            "xp_reward": 150,
            "has_lab": True,
            "docker_image": "python:3.11-slim",
            "roadmap_id": "roadmap-5",
            "flags": ["FLAG{python_security_expert}"],
            "tasks": [
                {"title": "Create port scanner", "description": "Use socket module"},
                {"title": "Send HTTP requests", "description": "Use requests library"},
                {"title": "Parse responses", "description": "Extract server info"}
            ]
        },
        {
            "id": "room-6",
            "title": "XSS Attacks",
            "description": "Cross-Site Scripting vulnerabilities and exploitation",
            "difficulty": "Intermediate",
            "category": "Web",
            "content": """# Cross-Site Scripting (XSS)

## What is XSS?
XSS allows attackers to inject malicious scripts into web pages.

## Types of XSS
1. **Reflected XSS** - Immediate response
2. **Stored XSS** - Persistent in database
3. **DOM-based XSS** - Client-side execution

## Example Payloads
```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
```

## Your Mission
Find and exploit the XSS vulnerability to steal the admin cookie.

Flag will be revealed when you successfully execute your payload!
""",
            "xp_reward": 140,
            "has_lab": True,
            "docker_image": "ubuntu:20.04",
            "roadmap_id": "roadmap-2",
            "flags": ["FLAG{xss_expert}"],
            "tasks": [
                {"title": "Find input field", "description": "Test for XSS"},
                {"title": "Craft payload", "description": "Bypass filters"},
                {"title": "Execute script", "description": "Get admin session"}
            ]
        }
    ]
    
    challenges = [
        {
            "id": "challenge-1",
            "title": "Password Cracker",
            "description": "Write a Python script to crack MD5 password hashes",
            "difficulty": "Beginner",
            "language": "python",
            "starter_code": """import hashlib

def crack_password(hash_value, wordlist):
    # Your code here
    pass

# Test
target_hash = "5f4dcc3b5aa765d61d8327deb882cf99"
passwords = ["password", "123456", "admin"]
result = crack_password(target_hash, passwords)
print(f"Cracked: {result}")
""",
            "test_cases": [
                {"input": "5f4dcc3b5aa765d61d8327deb882cf99", "expected": "password"}
            ],
            "xp_reward": 50
        },
        {
            "id": "challenge-2",
            "title": "Port Scanner",
            "description": "Create a basic port scanner using Python",
            "difficulty": "Intermediate",
            "language": "python",
            "starter_code": """import socket

def scan_port(host, port):
    # Your code here
    pass

# Test
open_ports = scan_port("127.0.0.1", range(1, 1000))
print(f"Open ports: {open_ports}")
""",
            "test_cases": [],
            "xp_reward": 100
        },
        {
            "id": "challenge-3",
            "title": "Caesar Cipher",
            "description": "Implement a Caesar cipher decoder",
            "difficulty": "Beginner",
            "language": "python",
            "starter_code": """def caesar_decrypt(text, shift):
    # Your code here
    pass

# Test
encrypted = "KHOOR"
decrypted = caesar_decrypt(encrypted, 3)
print(decrypted)  # Should print HELLO
""",
            "test_cases": [
                {"input": "KHOOR", "expected": "HELLO"}
            ],
            "xp_reward": 50
        }
    ]
    
    await db.roadmaps.insert_many(roadmaps)
    print(f"✓ Inserted {len(roadmaps)} roadmaps")
    
    await db.rooms.insert_many(rooms)
    print(f"✓ Inserted {len(rooms)} rooms")
    
    await db.coding_challenges.insert_many(challenges)
    print(f"✓ Inserted {len(challenges)} coding challenges")
    
    existing_admin = await db.users.find_one({"email": "admin@hacklidolearn.com"})
    if not existing_admin:
        admin_user = {
            "id": "admin-user-1",
            "email": "admin@hacklidolearn.com",
            "username": "admin",
            "hashed_password": hash_password("admin123"),
            "role": "admin",
            "xp": 5000,
            "level": 10,
            "streak": 30,
            "badges": ["Early Adopter", "Admin", "Platform Master"],
            "completed_rooms": ["room-1", "room-2", "room-3"],
            "achievements": ["First Login", "10 Rooms Completed", "30 Day Streak"],
            "created_at": "2025-01-01T00:00:00Z"
        }
        await db.users.insert_one(admin_user)
        print("✓ Created admin user (admin@hacklidolearn.com / admin123)")
    
    demo_user = await db.users.find_one({"email": "demo@hacklidolearn.com"})
    if not demo_user:
        demo_user_doc = {
            "id": "demo-user-1",
            "email": "demo@hacklidolearn.com",
            "username": "demo_hacker",
            "hashed_password": hash_password("demo123"),
            "role": "user",
            "xp": 350,
            "level": 3,
            "streak": 5,
            "badges": ["First Room", "Quick Learner"],
            "completed_rooms": ["room-1"],
            "achievements": ["First Flag", "Network Basics"],
            "created_at": "2025-01-15T00:00:00Z"
        }
        await db.users.insert_one(demo_user_doc)
        print("✓ Created demo user (demo@hacklidolearn.com / demo123)")
    
    print("\n✅ Database seeded successfully!")
    print("\n📝 You can now login with:")
    print("   Admin: admin@hacklidolearn.com / admin123")
    print("   Demo:  demo@hacklidolearn.com / demo123")

if __name__ == "__main__":
    asyncio.run(seed_data())
