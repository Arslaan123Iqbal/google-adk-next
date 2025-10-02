# WebSocket Configuration

## Problem
Next.js runs on `localhost:3000` but your FastAPI WebSocket server runs on a different port (typically `localhost:8000`).

## Solution

Create a file named `.env.local` in the `front/` directory with:

```
NEXT_PUBLIC_WS_BASE=localhost:8000
```

Replace `8000` with whatever port your FastAPI server is running on.

## Steps

1. **Start FastAPI server first:**
   ```bash
   cd d:\Projects\adk-voice-agent
   python -m uvicorn app.main:app --reload
   ```
   (Note the port it starts on, usually 8000)

2. **Create `.env.local` in `front/` directory:**
   ```
   NEXT_PUBLIC_WS_BASE=localhost:8000
   ```

3. **Restart Next.js dev server:**
   ```bash
   cd front
   npm run dev
   ```

4. **Open browser** at `http://localhost:3000`

The WebSocket will now connect to `ws://localhost:8000/ws/...` where your FastAPI server is running.
