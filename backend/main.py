from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI()

# Dynamic CORS to allow all Vercel deployments
@app.middleware("http")
async def cors_middleware(request, call_next):
    origin = request.headers.get("origin")
    response = await call_next(request)

    # Allow localhost and all vercel.app domains
    if origin and (origin.startswith("http://localhost") or origin.endswith(".vercel.app")):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"

    return response

# Keep the standard CORS as fallback
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Anthropic client
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class TextInput(BaseModel):
    text: str

@app.get("/")
def root():
    return {"message": "Sentiment Aura Backend Running!"}

@app.post("/process_text")
async def process_text(data: TextInput):
    try:
        print(f"📥 Received text: {data.text}")

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": f"""Analyze the sentiment of this text and return ONLY a JSON object with this exact format:
{{
    "sentiment": <float between 0 and 1, where 0=very negative, 0.5=neutral, 1=very positive>,
    "emotion": <string: one of "happy", "sad", "angry", "neutral", "excited", "calm">,
    "keywords": <array of 3-5 most important words/topics>
}}

Text to analyze: {data.text}

Return ONLY the JSON, no other text."""
                }
            ]
        )

        result_text = message.content[0].text.strip()
        print(f"🤖 Claude response: {result_text}")

        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()

        result = json.loads(result_text)
        print(f"✅ Parsed result: {result}")
        return result

    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)