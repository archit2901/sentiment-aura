# 🎤 Sentiment Aura

An AI-powered real-time sentiment analysis application that visualizes emotions through beautiful Perlin noise animations. Speak into your microphone and watch as your words transform into flowing, emotion-driven visual art.

## 🌐 Live Demo

- **Frontend**: [https://sentiment-aura-eight.vercel.app](https://sentiment-aura-eight.vercel.app)
- **Backend API**: [https://sentiment-aura-7z75.onrender.com](https://sentiment-aura-7z75.onrender.com)

## ✨ Features

- 🎙️ **Real-time Speech Transcription** - Instant audio-to-text using Deepgram API
- 🤖 **AI Sentiment Analysis** - Powered by Claude Sonnet 4 for emotion detection
- 🌊 **Perlin Noise Visualization** - Beautiful, organic animations that react to emotions
- 🎨 **Emotion-Specific Behaviors** - Each emotion has unique colors, speeds, and particle movements
- 📊 **Live Sentiment Tracking** - Real-time sentiment score (0-100%) and keyword extraction
- 💬 **Live Transcript Display** - See your words appear in real-time

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **react-p5** - Creative coding for Perlin noise visualization
- **Web Audio API** - Microphone capture and audio processing
- **WebSockets** - Real-time communication with Deepgram
- **Vercel** - Deployment platform

### Backend
- **FastAPI** (Python) - High-performance API framework
- **Anthropic Claude API** - AI-powered sentiment analysis
- **Pydantic** - Data validation
- **Render** - Backend hosting

### External APIs
- **Deepgram** - Real-time speech-to-text transcription
- **Claude Sonnet 4** - Natural language understanding and sentiment analysis

## 🏗️ Architecture
```
┌─────────────┐         WebSocket          ┌──────────────┐
│   Browser   │ ────────────────────────> │   Deepgram   │
│  (React)    │ <──────────────────────── │     API      │
└─────────────┘      Transcription         └──────────────┘
       │
       │ HTTP POST /process_text
       │ (final transcript)
       ▼
┌─────────────┐                            ┌──────────────┐
│   FastAPI   │ ────────────────────────> │   Claude     │
│   Backend   │ <──────────────────────── │     API      │
└─────────────┘    Sentiment Analysis      └──────────────┘
       │
       │ JSON Response
       │ {sentiment, emotion, keywords}
       ▼
┌─────────────┐
│ Perlin Noise│
│ Visualization│
└─────────────┘
```

## 🚀 Local Development Setup

### Prerequisites

- **Node.js** (v16+)
- **Python** (v3.8+)
- **API Keys**:
  - [Deepgram API Key](https://console.deepgram.com/)
  - [Anthropic API Key](https://console.anthropic.com/)

### Backend Setup
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
ANTHROPIC_API_KEY=your_anthropic_key_here
DEEPGRAM_API_KEY=your_deepgram_key_here
EOF

# Start the server
uvicorn main:app --reload --port 8000
```

Backend will run at: `http://localhost:8000`

### Frontend Setup
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_DEEPGRAM_API_KEY=your_deepgram_key_here
EOF

# Start development server
npm start
```

Frontend will run at: `http://localhost:3000`

## 📦 Deployment

### Deploy Backend to Render

1. Push code to GitHub
2. Go to [Render Dashboard](https://render.com/)
3. Create new **Web Service**
4. Connect your repository
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `ANTHROPIC_API_KEY`
   - `DEEPGRAM_API_KEY`

### Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
4. Add environment variables:
   - `REACT_APP_BACKEND_URL`: Your Render backend URL
   - `REACT_APP_DEEPGRAM_API_KEY`: Your Deepgram key
5. Deploy!

## 🎮 Usage

1. **Open the app** in your browser
2. **Click "Start Recording"** button
3. **Allow microphone access** when prompted
4. **Speak clearly** into your microphone
5. **Watch the magic happen**:
   - Your words appear as live transcript
   - Background changes color based on emotion
   - Particle speed reflects sentiment intensity
   - Keywords are extracted and displayed

### Emotion Examples

- 😊 **Happy**: "I'm so happy and grateful today!"
  - Bright yellow/gold particles, medium-fast movement
  
- 🤩 **Excited**: "This is amazing! I'm so excited!"
  - Hot pink/magenta, fast chaotic sparkles
  
- 😢 **Sad**: "I feel sad and lonely"
  - Deep blue, slow drifting particles
  
- 😠 **Angry**: "I'm really frustrated and angry!"
  - Pulsing red background, aggressive movement
  
- 😌 **Calm**: "I feel peaceful and calm"
  - Smooth cyan/aqua, gentle floating

## 📁 Project Structure
```
sentiment-aura/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (not in repo)
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js           # Main component
│   │   ├── AudioCapture.js  # Microphone & Deepgram integration
│   │   └── AuraVisualization.js  # p5.js Perlin noise visualization
│   ├── package.json
│   └── .env.production      # Production environment variables
│
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### `GET /`
Health check endpoint

**Response:**
```json
{
  "message": "Sentiment Aura Backend Running!"
}
```

### `POST /process_text`
Analyze sentiment and extract keywords from text

**Request:**
```json
{
  "text": "I am so happy and excited!"
}
```

**Response:**
```json
{
  "sentiment": 0.9,
  "emotion": "excited",
  "keywords": ["happy", "excited"]
}
```

## 🎨 Visualization Details

The Perlin noise visualization uses organic, flowing particle systems that respond to emotional data:

- **Color Hue**: Determined by emotion type
- **Saturation & Brightness**: Mapped to sentiment score (0-1)
- **Particle Speed**: Higher sentiment = faster movement
- **Noise Scale**: Controls smoothness (calm = very smooth, angry = chaotic)
- **Connections**: Lines between nearby particles create flowing patterns

### Emotion-Specific Parameters

| Emotion | Color | Speed | Behavior |
|---------|-------|-------|----------|
| Happy | Yellow/Gold | Medium-Fast | Sparkles |
| Excited | Pink/Magenta | Very Fast | Chaotic sparkles |
| Sad | Deep Blue | Slow | Heavy drift |
| Angry | Red | Fast | Pulsing, aggressive |
| Calm | Cyan/Aqua | Very Slow | Smooth floating |
| Neutral | Muted Green | Medium | Balanced flow |

## 🐛 Troubleshooting

### Microphone not working
- Ensure you're using HTTPS or localhost
- Check browser permissions for microphone access
- Try a different browser (Chrome recommended)

### CORS errors
- Verify backend CORS settings include your frontend URL
- Check that backend is running and accessible

### Sentiment not updating
- Check browser console for errors
- Verify backend environment variables are set
- Test backend endpoint directly with curl

### Backend spinning down (Render free tier)
- First request after inactivity takes 30-60 seconds
- Subsequent requests are fast

## 📝 License

MIT License - feel free to use this project for learning or personal projects!

## 🙏 Acknowledgments

- **Deepgram** - Real-time speech transcription
- **Anthropic** - Claude AI for sentiment analysis
- **p5.js** - Creative coding framework
- **Memory Machines** - Project inspiration

## 👨‍💻 Author

**Archit Gupta**
- GitHub: [@archit2901](https://github.com/archit2901)
- Project: [sentiment-aura](https://github.com/archit2901/sentiment-aura)

---

⭐ Star this repo if you found it helpful!
