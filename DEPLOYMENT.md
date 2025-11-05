# Deploying Clarity Dashboard with AI

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite
5. Click "Deploy"

### Step 3: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

**Required (FREE):**
- `GEMINI_API_KEY` = Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

**Optional (Premium Voice):**
- `ELEVENLABS_API_KEY` = Get from [ElevenLabs](https://elevenlabs.io/)
- `ELEVENLABS_VOICE_ID` = Voice ID from ElevenLabs Voice Lab

### Step 4: Redeploy
After adding environment variables, click "Redeploy" in Vercel

---

## Option 2: Deploy to Netlify

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Build
```bash
npm run build
```

### Step 3: Deploy
```bash
netlify deploy --prod
```

### Step 4: Add Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables:
- Add `GEMINI_API_KEY`
- (Optional) Add `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`

---

## Option 3: Self-Host (Node.js + PM2)

### Requirements
- Node.js 18+
- PM2 for process management

### Step 1: Clone & Install
```bash
git clone YOUR_REPO
cd clarity-dashboard
npm install
```

### Step 2: Create .env File
```bash
cp .env.example .env
# Edit .env and add your API keys
```

### Step 3: Build
```bash
npm run build
```

### Step 4: Serve with PM2
```bash
npm install -g pm2
pm2 start npm --name "clarity-dashboard" -- run preview
pm2 save
pm2 startup
```

---

## Getting API Keys

### Gemini API Key (Required - FREE)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIzaSy...`)
4. Add to your deployment's environment variables

**Free Tier:**
- 15 requests/minute
- 1500 requests/day
- 100% free forever

### ElevenLabs API Key (Optional - Premium Voice)
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up and go to Profile → API Keys
3. Copy your API key
4. Add to environment variables

**Pricing:**
- $0.30 per 1K characters
- ~$5-10/month for normal use

---

## Security Notes

✅ **SECURE:** API keys are stored on the server (environment variables)
✅ **SECURE:** Client never sees or stores API keys
✅ **SECURE:** All AI requests go through your backend (`/api/ai`)

❌ **NEVER:** Commit `.env` file to git
❌ **NEVER:** Put API keys in client-side code
❌ **NEVER:** Share your API keys publicly

---

## Cost Estimate

### FREE Tier (Recommended)
- Voice Input: Browser Speech API (FREE)
- AI Brain: Gemini 1.5 Flash (FREE)
- Voice Output: Browser Speech Synthesis (FREE)
- **Total: $0.00/month**

### Premium Tier
- Voice Input: Browser Speech API (FREE)
- AI Brain: Gemini 1.5 Flash (FREE or ~$0.50/month for heavy use)
- Voice Output: ElevenLabs (~$5-10/month)
- **Total: ~$5-10/month**

---

## Testing Locally

### Step 1: Create .env
```bash
cp .env.example .env
```

### Step 2: Add Your Gemini API Key
Edit `.env` and add your key:
```
GEMINI_API_KEY=AIzaSy...your_key_here
```

### Step 3: Run Dev Server
```bash
npm run dev
```

### Step 4: Test AI
1. Open http://localhost:3000
2. Click the 🤖 AI button (bottom-right)
3. Type or speak: "Create task: Test AI integration"
4. AI should respond and create the task

---

## Troubleshooting

### AI Not Working
1. Check environment variables are set correctly
2. Verify Gemini API key is valid
3. Check browser console for errors
4. Ensure `/api/ai` endpoint is deployed

### Voice Input Not Working
- Enable microphone permissions in browser
- Works in Chrome/Edge (best support)
- May not work in Safari (limited support)

### Premium Voice Not Working
1. Verify `ELEVENLABS_API_KEY` is set
2. Verify `ELEVENLABS_VOICE_ID` is set
3. Check ElevenLabs account has credits
4. Toggle "Enable Premium Voice" in Settings

---

## File Structure

```
clarity-dashboard/
├── api/
│   └── ai.ts              # Serverless function (handles AI requests)
├── services/
│   └── AIService.ts       # Client-side AI service
├── components/
│   └── AIAssistant.tsx    # Floating AI chat interface
├── .env.example           # Example environment variables
└── DEPLOYMENT.md          # This file
```

---

## Next Steps

After deployment:
1. Test the AI assistant
2. Enable premium voice (optional)
3. Share your deployed dashboard!
4. Monitor API usage in Google AI Studio dashboard
