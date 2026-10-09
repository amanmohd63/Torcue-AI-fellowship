from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from agent import chat_with_agent, get_dashboard_metrics

app = FastAPI(title="Order Assistant API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]]

class ChatResponse(BaseModel):
    reply: str

@app.get("/")
def read_root():
    return {"message": "Order Assistant API is running."}

@app.get("/api/dashboard")
def read_dashboard_metrics():
    return get_dashboard_metrics()

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty.")
    
    # Simple validation to ensure 'role' and 'content' exists
    for msg in request.messages:
        if "role" not in msg or "content" not in msg:
            raise HTTPException(status_code=400, detail="Each message must have 'role' and 'content'.")
            
    reply_text = await chat_with_agent(request.messages)
    return ChatResponse(reply=reply_text)
