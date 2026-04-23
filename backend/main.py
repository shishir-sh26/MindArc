from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

app = FastAPI(
    title="Mindarc Medical Backend",
    description="API for the Mindarc Mental Health App",
    version="1.0.0"
)

# Global variables for lazy initialization
_llm_myth = None
_llm_lifestyle = None

def get_llm_myth():
    """Returns the Myth Check LLM instance, initializing it only once."""
    global _llm_myth
    if _llm_myth is None:
        api_key = os.getenv("GOOGLE_API_KEY")
        if api_key:
            print("--- Initializing LLM for Myth Check (gemini-2.5-flash) ---")
            _llm_myth = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash", 
                google_api_key=api_key,
                temperature=0.7
            )
        else:
            print("WARNING: GOOGLE_API_KEY not found.")
    return _llm_myth

def get_llm_lifestyle():
    """Returns the Lifestyle LLM instance, initializing it only once."""
    global _llm_lifestyle
    if _llm_lifestyle is None:
        api_key = os.getenv("GOOGLE_API_KEY_2")
        if api_key:
            print("--- Initializing LLM for Lifestyle (gemini-2.5-flash) ---")
            _llm_lifestyle = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash", 
                google_api_key=api_key,
                temperature=0.7
            )
        else:
            print("WARNING: GOOGLE_API_KEY_2 not found.")
    return _llm_lifestyle

# Enable CORS for the React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserProfile(BaseModel):
    id: str
    name: str
    mood_score: int
    last_check_in: str

class MythRequest(BaseModel):
    myth: str

class LifestyleRequest(BaseModel):
    responses: dict

@app.post("/api/v1/lifestyle-plan")
async def generate_lifestyle_plan(request: LifestyleRequest):
    # Retrieve the LLM instance (initializes once if needed)
    llm = get_llm_lifestyle()
    if not llm:
        return {"plan": "Lifestyle AI service is not configured (missing GOOGLE_API_KEY_2)."}
    
    prompt = ChatPromptTemplate.from_template("""
    You are a professional wellness coach and mental health specialist.
    The user has provided their lifestyle details:
    {responses}
    
    Based on these answers, provide a 'Better Living Summary':
    1. Key Strengths: What are they doing well?
    2. Areas for Improvement: Specific, actionable changes.
    3. Daily Routine Hack: One small habit they can start tomorrow.
    
    Keep it encouraging, medical-grade, and concise.
    """)
    
    chain = prompt | llm
    try:
        response = chain.invoke({"responses": str(request.responses)})
        return {"plan": response.content}
    except Exception as e:
        print(f"ERROR in lifestyle-plan: {str(e)}")
        # Check if it's a quota error to provide a better message
        if "quota" in str(e).lower():
            raise HTTPException(status_code=429, detail="Lifestyle Plan AI quota exceeded for this key. Please try again later or use a different key.")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/myth-check")
async def check_myth(request: MythRequest):
    print(f"Checking myth: {request.myth}")
    # Retrieve the LLM instance (initializes once if needed)
    llm = get_llm_myth()
    if not llm:
        return {"fact": "Myth Check AI service is not configured (missing GOOGLE_API_KEY)."}
    
    prompt = ChatPromptTemplate.from_template("""
    You are a professional medical assistant specialized in mental health (Anxiety & Depression).
    The user is providing a potential 'myth' or 'misconception'.
    Your task is to provide the scientific/medical FACT.
    
    User Myth: {myth}
    
    Response format:
    FACT: [Clear, concise medical fact]
    EXPLANATION: [Brief 1-2 sentence explanation why]
    """)
    
    chain = prompt | llm
    try:
        response = chain.invoke({"myth": request.myth})
        print(f"AI Response: {response.content}")
        return {"fact": response.content}
    except Exception as e:
        print(f"ERROR in check_myth: {str(e)}")
        # Check if it's a quota error to provide a better message
        if "quota" in str(e).lower():
            raise HTTPException(status_code=429, detail="Myth Check AI quota exceeded for this key. Please try again later or use a different key.")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Welcome to Mindarc Medical API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/user/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: str):
    # Dummy data for demonstration
    if user_id == "123":
        return UserProfile(
            id="123",
            name="Jane Doe",
            mood_score=85,
            last_check_in="2026-04-22"
        )
    raise HTTPException(status_code=404, detail="User not found")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
