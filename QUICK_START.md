# 🚀 Quick Start Guide - ZAPTA AI Assistant

## Complete Setup in 3 Steps

### Step 1: Start the Backend (Python)

```bash
# Navigate to backend
cd d:\Projects\adk-voice-agent\app

# Activate virtual environment
..\venv\Scripts\activate

# Start the server
uvicorn main:app --reload
```

✅ Backend should be running at `http://localhost:8000`

---

### Step 2: Start the Frontend (Next.js)

Open a **NEW terminal**:

```bash
# Navigate to frontend
cd d:\Projects\adk-voice-agent\front

# Install dependencies (first time only)
npm install

# Start Next.js
npm run dev
```

✅ Frontend should be running at `http://localhost:3000`

---

### Step 3: Open Browser & Test

1. Open: **http://localhost:3000**
2. You should see: **"ZAPTA Technologies AI Assistant"**

#### Test Text Chat:
- Type: "What services does ZAPTA offer?"
- Press Send

#### Test Voice Chat:
- Click **"Enable Voice"** button
- Allow microphone permissions
- Say: "Tell me about your projects"
- Listen to the response

#### Test Auto-Redirect:
- Type or say: "I need help"
- Watch as https://zaptatech.com/contact-us opens automatically in 2 seconds!

---

## ✅ Success Checklist

- [ ] Backend running without errors
- [ ] Frontend loads at localhost:3000
- [ ] Can send text messages
- [ ] Agent responds with ZAPTA information
- [ ] Voice button works (microphone permission granted)
- [ ] Voice responses play automatically
- [ ] "I need help" triggers auto-redirect to contact page

---

## 🐛 Common Issues

### Backend Error: "Default value is not supported"
**Fixed!** The tool parameters have been updated.

### Frontend: "Connecting..." forever
- Make sure backend is running at `localhost:8000`
- Check terminal for backend errors

### Voice: "Enable Voice" doesn't work
- Click "Allow" for microphone permissions
- Try refreshing the page
- Check browser console (F12) for errors

### Auto-Redirect: Pop-up blocked
- Allow pop-ups for localhost:3000
- Or click the "Open Contact Page" button manually

---

## 📝 What You Built

### Backend (Python + FastAPI)
- **Location**: `d:\Projects\adk-voice-agent\app`
- **Agent**: ZAPTA Technologies AI Assistant
- **Knowledge Base**: Complete ZAPTA info (services, projects, contact)
- **Features**: Text + Voice chat, Auto-redirect support

### Frontend (Next.js + TypeScript)
- **Location**: `d:\Projects\adk-voice-agent\front`
- **UI**: Modern chat interface with Tailwind CSS
- **Features**: 
  - Real-time WebSocket communication
  - Voice recording & playback
  - Auto-redirect to contact page
  - Responsive design

---

## 🎯 Next Steps

1. **Customize the agent**:
   - Edit `app/jarvis/zapta_knowledge.py` to update company info
   - Modify `app/jarvis/agent.py` to change agent behavior

2. **Customize the UI**:
   - Edit `front/src/app/page.tsx` for layout changes
   - Modify components in `front/src/components/` for styling

3. **Deploy**:
   - Backend: Deploy to a cloud service (AWS, GCP, Azure)
   - Frontend: Deploy to Vercel, Netlify, or any hosting platform
   - Update `NEXT_PUBLIC_BACKEND_URL` to your deployed backend URL

---

## 📚 Documentation

- **Backend README**: `d:\Projects\adk-voice-agent\README.md`
- **Frontend README**: `d:\Projects\adk-voice-agent\front\README-ZAPTA.md`
- **Testing Guide**: `d:\Projects\adk-voice-agent\TESTING_GUIDE.md`

---

## 🆘 Need Help?

1. Check browser console (F12) for frontend errors
2. Check terminal for backend errors
3. Read the detailed READMEs in each directory
4. The agent itself can help - ask it about ZAPTA!

---

**Congratulations! Your ZAPTA AI Assistant is ready! 🎉**
