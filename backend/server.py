from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, BackgroundTasks, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import docker
from docker.errors import DockerException
import httpx
import asyncio
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="HackLidoLearn API")
api_router = APIRouter(prefix="/api")

security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

try:
    docker_client = docker.from_env()
    docker_client.ping()
    logger.info("Docker client connected")
except DockerException as e:
    logger.warning(f"Docker not available: {e}. Container features will be disabled.")
    docker_client = None

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    hashed_password: str
    role: str = "user"
    xp: int = 0
    level: int = 1
    streak: int = 0
    badges: List[str] = []
    completed_rooms: List[str] = []
    achievements: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class RoadmapModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    difficulty: str
    rooms: List[str] = []
    icon: str = "🎯"
    order: int = 0

class RoomModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    difficulty: str
    category: str
    room_type: str = "cybersecurity"  # cybersecurity or programming
    content: str
    tasks: List[Dict[str, Any]] = []
    flags: List[str] = []
    xp_reward: int = 100
    has_lab: bool = False
    lab_type: str = "terminal"  # terminal, web, code_editor
    docker_image: str = "ubuntu:20.04"
    web_app_url: Optional[str] = None
    code_language: Optional[str] = "python"
    roadmap_id: Optional[str] = None

class LabSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    room_id: str
    container_id: Optional[str] = None
    status: str = "pending"
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

class CodingChallenge(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    difficulty: str
    language: str
    starter_code: str
    test_cases: List[Dict[str, Any]] = []
    xp_reward: int = 50

class UserProgress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    room_id: str
    completed: bool = False
    completed_tasks: List[int] = []
    submitted_flags: List[str] = []
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

class StartLabRequest(BaseModel):
    room_id: str

class SubmitFlagRequest(BaseModel):
    room_id: str
    flag: str

class StartLabRequest(BaseModel):
    room_id: str

class SubmitFlagRequest(BaseModel):
    room_id: str
    flag: str

class RoomFlagModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    room_id: str
    question: str
    correct_answer: str
    points: int = 10
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FlagSubmissionModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    room_id: str
    flag_id: str
    user_id: str
    submitted_answer: str
    is_correct: bool
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuestionModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    room_id: str
    user_id: str
    username: str
    question: str
    reply: Optional[str] = None
    replied_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    replied_at: Optional[datetime] = None

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({'id': payload['user_id']}, {'_id': 0, 'hashed_password': 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({'email': user_data.email}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hash_password(user_data.password)
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    token = create_token(user.id, user.email, user.role)
    return {
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'role': user.role,
            'xp': user.xp,
            'level': user.level
        }
    }

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({'email': login_data.email}, {'_id': 0})
    if not user or not verify_password(login_data.password, user['hashed_password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'], user['role'])
    return {
        'token': token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'username': user['username'],
            'role': user['role'],
            'xp': user['xp'],
            'level': user['level'],
            'badges': user.get('badges', []),
            'streak': user.get('streak', 0)
        }
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@api_router.get("/roadmaps")
async def get_roadmaps():
    roadmaps = await db.roadmaps.find({}, {'_id': 0}).sort('order', 1).to_list(100)
    return roadmaps

@api_router.post("/roadmaps")
async def create_roadmap(roadmap: RoadmapModel, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    await db.roadmaps.insert_one(roadmap.model_dump())
    return roadmap

@api_router.get("/rooms")
async def get_rooms(roadmap_id: Optional[str] = None, category: Optional[str] = None):
    query = {}
    if roadmap_id:
        query['roadmap_id'] = roadmap_id
    if category:
        query['category'] = category
    rooms = await db.rooms.find(query, {'_id': 0}).to_list(100)
    return rooms

@api_router.get("/rooms/{room_id}")
async def get_room(room_id: str):
    room = await db.rooms.find_one({'id': room_id}, {'_id': 0})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@api_router.post("/rooms")
async def create_room(room: RoomModel, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    await db.rooms.insert_one(room.model_dump())
    return room

@api_router.put("/rooms/{room_id}")
async def update_room(room_id: str, room: RoomModel, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.rooms.update_one({'id': room_id}, {'$set': room.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@api_router.delete("/rooms/{room_id}")
async def delete_room(room_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.rooms.delete_one({'id': room_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return {'message': 'Room deleted'}

@api_router.post("/labs/start")
async def start_lab(request: StartLabRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    room = await db.rooms.find_one({'id': request.room_id}, {'_id': 0})
    if not room or not room.get('has_lab'):
        raise HTTPException(status_code=400, detail="Room has no lab")
    
    existing_session = await db.lab_sessions.find_one({
        'user_id': current_user['id'],
        'room_id': request.room_id,
        'status': 'running'
    }, {'_id': 0})
    
    if existing_session:
        return existing_session
    
    session = LabSession(
        user_id=current_user['id'],
        room_id=request.room_id,
        status="starting"
    )
    
    if docker_client:
        try:
            container = docker_client.containers.run(
                room.get('docker_image', 'ubuntu:20.04'),
                detach=True,
                stdin_open=True,
                tty=True,
                mem_limit='512m',
                cpus=1.0,
                name=f"lab-{session.id}",
                labels={'user_id': current_user['id'], 'room_id': request.room_id},
                remove=False
            )
            session.container_id = container.id
            session.status = "running"
            session.started_at = datetime.now(timezone.utc)
            background_tasks.add_task(auto_stop_container, container.id, 3600)
        except Exception as e:
            logger.error(f"Docker error: {e}")
            session.status = "error"
    else:
        session.container_id = f"mock-{uuid.uuid4().hex[:8]}"
        session.status = "running"
        session.started_at = datetime.now(timezone.utc)
    
    session_dict = session.model_dump()
    if session.started_at:
        session_dict['started_at'] = session.started_at.isoformat()
    if session.ended_at:
        session_dict['ended_at'] = session.ended_at.isoformat()
    
    # Insert without _id in response
    await db.lab_sessions.insert_one({**session_dict, '_id': session.id})
    
    # Return clean dict without _id
    return {k: v for k, v in session_dict.items() if k != '_id'}

async def auto_stop_container(container_id: str, timeout: int):
    await asyncio.sleep(timeout)
    if docker_client:
        try:
            container = docker_client.containers.get(container_id)
            container.stop()
            container.remove()
            logger.info(f"Auto-stopped container {container_id}")
        except Exception as e:
            logger.error(f"Error auto-stopping container: {e}")

@api_router.post("/labs/{session_id}/execute")
async def execute_command(session_id: str, command: Dict[str, str], current_user: dict = Depends(get_current_user)):
    session = await db.lab_sessions.find_one({'id': session_id, 'user_id': current_user['id']}, {'_id': 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    cmd = command.get('command', '')
    
    if docker_client and session['container_id']:
        try:
            container = docker_client.containers.get(session['container_id'])
            result = container.exec_run(f'/bin/bash -c "{cmd}"', stdout=True, stderr=True)
            output = result.output.decode('utf-8', errors='replace') if result.output else ''
            return {'output': output, 'exit_code': result.exit_code}
        except Exception as e:
            return {'output': f"Error: {str(e)}", 'exit_code': 1}
    
    return {'output': f"Mock output for: {cmd}\nDocker not available", 'exit_code': 0}

@api_router.post("/labs/{session_id}/stop")
async def stop_lab(session_id: str, current_user: dict = Depends(get_current_user)):
    session = await db.lab_sessions.find_one({'id': session_id, 'user_id': current_user['id']}, {'_id': 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if docker_client and session.get('container_id'):
        try:
            container = docker_client.containers.get(session['container_id'])
            container.stop()
            container.remove()
        except Exception as e:
            logger.error(f"Error stopping container: {e}")
    
    await db.lab_sessions.update_one(
        {'id': session_id},
        {'$set': {'status': 'stopped', 'ended_at': datetime.now(timezone.utc).isoformat()}}
    )
    
    return {'message': 'Lab stopped'}

@api_router.post("/flags/submit")
async def submit_flag(request: SubmitFlagRequest, current_user: dict = Depends(get_current_user)):
    room = await db.rooms.find_one({'id': request.room_id}, {'_id': 0})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    submitted_flag = request.flag
    is_correct = submitted_flag in room.get('flags', [])
    
    if is_correct:
        progress = await db.user_progress.find_one(
            {'user_id': current_user['id'], 'room_id': request.room_id},
            {'_id': 0}
        )
        
        if not progress:
            progress = UserProgress(
                user_id=current_user['id'],
                room_id=request.room_id,
                completed=True
            )
            progress_dict = progress.model_dump()
            progress_dict['started_at'] = progress.started_at.isoformat()
            progress_dict['completed_at'] = datetime.now(timezone.utc).isoformat()
            await db.user_progress.insert_one(progress_dict)
            
            new_xp = current_user['xp'] + room.get('xp_reward', 100)
            await db.users.update_one(
                {'id': current_user['id']},
                {'$set': {'xp': new_xp}, '$push': {'completed_rooms': request.room_id}}
            )
            
            return {'correct': True, 'message': 'Flag correct! Room completed!', 'xp_earned': room.get('xp_reward', 100)}
        else:
            return {'correct': True, 'message': 'Flag correct! Already completed.'}
    
    return {'correct': False, 'message': 'Incorrect flag. Try again!'}

@api_router.get("/challenges")
async def get_challenges(language: Optional[str] = None):
    query = {}
    if language:
        query['language'] = language
    challenges = await db.coding_challenges.find(query, {'_id': 0}).to_list(100)
    return challenges

@api_router.post("/challenges/execute")
async def execute_code(code_data: Dict[str, str]):
    language = code_data.get('language', 'python')
    code = code_data.get('code', '')
    
    language_map = {
        'python': 'python',
        'javascript': 'javascript',
        'bash': 'bash'
    }
    
    piston_lang = language_map.get(language, 'python')
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                'https://emkc.org/api/v2/piston/execute',
                json={
                    'language': piston_lang,
                    'version': '*',
                    'files': [{'content': code}]
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'output': result.get('run', {}).get('output', ''),
                    'stderr': result.get('run', {}).get('stderr', ''),
                    'stdout': result.get('run', {}).get('stdout', ''),
                    'exit_code': result.get('run', {}).get('code', 0)
                }
    except Exception as e:
        return {'output': '', 'stderr': f"Error: {str(e)}", 'stdout': '', 'exit_code': 1}
    
    return {'output': 'Execution service unavailable', 'stderr': '', 'stdout': '', 'exit_code': 1}

@api_router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    users = await db.users.find(
        {},
        {'_id': 0, 'id': 1, 'username': 1, 'xp': 1, 'level': 1, 'badges': 1}
    ).sort('xp', -1).limit(limit).to_list(limit)
    return users

@api_router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    user = await db.users.find_one({'id': user_id}, {'_id': 0, 'hashed_password': 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    completed_rooms = await db.user_progress.count_documents({'user_id': user_id, 'completed': True})
    
    return {
        **user,
        'completed_rooms_count': completed_rooms
    }

@api_router.get("/progress")
async def get_user_progress(current_user: dict = Depends(get_current_user)):
    progress = await db.user_progress.find(
        {'user_id': current_user['id']},
        {'_id': 0}
    ).to_list(1000)
    return progress

@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    users = await db.users.find({}, {'_id': 0, 'hashed_password': 0}).to_list(1000)
    return users

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, role_data: Dict[str, str], current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.users.update_one({'id': user_id}, {'$set': {'role': role_data['role']}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {'message': 'Role updated'}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.users.delete_one({'id': user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {'message': 'User deleted'}

@api_router.post("/admin/upload-lab-files")
async def upload_lab_files(
    room_id: str,
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Create room-specific directory
    room_dir = UPLOAD_DIR / room_id
    room_dir.mkdir(exist_ok=True)
    
    uploaded_files = []
    
    for file in files:
        try:
            # Save file
            file_path = room_dir / file.filename
            with open(file_path, 'wb') as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            uploaded_files.append({
                'filename': file.filename,
                'path': str(file_path),
                'size': os.path.getsize(file_path)
            })
            
            logger.info(f"Uploaded file: {file.filename} for room {room_id}")
        except Exception as e:
            logger.error(f"Error uploading file {file.filename}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to upload {file.filename}")
    
    # Update room with uploaded files info
    await db.rooms.update_one(
        {'id': room_id},
        {'$set': {'uploaded_files': uploaded_files}}
    )
    
    return {
        'message': f'Successfully uploaded {len(uploaded_files)} file(s)',
        'files': uploaded_files
    }

@api_router.get("/admin/lab-files/{room_id}")
async def get_lab_files(room_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    
    room = await db.rooms.find_one({'id': room_id}, {'_id': 0})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return room.get('uploaded_files', [])

@api_router.delete("/admin/lab-files/{room_id}/{filename}")
async def delete_lab_file(room_id: str, filename: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    
    file_path = UPLOAD_DIR / room_id / filename
    
    if file_path.exists():
        os.remove(file_path)
        
        # Update room's uploaded files list
        room = await db.rooms.find_one({'id': room_id}, {'_id': 0})
        if room and 'uploaded_files' in room:
            updated_files = [f for f in room['uploaded_files'] if f['filename'] != filename]
            await db.rooms.update_one(
                {'id': room_id},
                {'$set': {'uploaded_files': updated_files}}
            )
        
        return {'message': f'File {filename} deleted'}
    else:
        raise HTTPException(status_code=404, detail="File not found")

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    
    total_users = await db.users.count_documents({})
    total_rooms = await db.rooms.count_documents({})
    total_sessions = await db.lab_sessions.count_documents({})
    active_sessions = await db.lab_sessions.count_documents({'status': 'running'})
    
    return {
        'total_users': total_users,
        'total_rooms': total_rooms,
        'total_sessions': total_sessions,
        'active_sessions': active_sessions
    }

@api_router.post("/questions/ask")
async def ask_question(room_id: str, question_data: Dict[str, str], current_user: dict = Depends(get_current_user)):
    question = QuestionModel(
        room_id=room_id,
        user_id=current_user['id'],
        username=current_user['username'],
        question=question_data.get('question', '')
    )
    
    question_dict = question.model_dump()
    question_dict['created_at'] = question.created_at.isoformat()
    await db.questions.insert_one(question_dict)
    
    return {k: v for k, v in question_dict.items() if k != '_id'}

@api_router.get("/questions/{room_id}")
async def get_questions(room_id: str):
    questions = await db.questions.find(
        {'room_id': room_id},
        {'_id': 0}
    ).sort('created_at', -1).to_list(100)
    return questions

@api_router.put("/admin/questions/{question_id}/reply")
async def reply_question(question_id: str, reply_data: Dict[str, str], current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.questions.update_one(
        {'id': question_id},
        {'$set': {
            'reply': reply_data.get('reply'),
            'replied_by': current_user['username'],
            'replied_at': datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return {'message': 'Reply added successfully'}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    if docker_client:
        docker_client.close()
