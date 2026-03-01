# 🌊 Unspoken

**AI-powered emotional wellness app that helps people articulate difficult feelings and have the conversations they've been avoiding.**

🔗 **Live Demo:** [unspoken-bb.vercel.app](https://unspoken-bb.vercel.app)

---

## What is it?

Unspoken helps you say what you've been struggling to say — whether it's an apology, a confession, setting a boundary, or expressing love. You answer a few guided questions, and the AI crafts your message in 3 different tones for you to choose from.

---

## How it works

**1. Choose what you need to say**
Apologize, express love, share gratitude, set a boundary, make a confession, or something else.

**2. AI Interview**
Answer 5–6 thoughtful questions about your situation — who it's for, what happened, what you hope for.

**3. Get 3 versions**
The AI generates your message in 3 tones: Vulnerable, Direct, and Gentle.

**4. Edit & refine**
Pick your version, customize it, and use the AI suggestions sidebar to polish it further.

**5. Deliver your way**
Copy to clipboard, save as draft, share directly via WhatsApp/Email/SMS, or release it anonymously to the community.

---

## Message in a Bottle 🌊

A unique anonymous community board where users can release their messages for others to find. Think of it as a mini Twitter for unspoken emotions — categorized, anonymous, and supportive.

**Categories:** Unsent Apologies · Hidden Love · Unspoken Gratitude · Setting Boundaries · Grief & Loss · Breaking Free

**Reactions:** ❤️ Heart · 🤗 Hug · 🕊️ Peace · 💪 Strength

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Auth & Database | Firebase Authentication + Firestore |
| AI | Groq API (Llama 3.3 70B) |
| Deployment | Vercel |

---

## Features

- 🤖 AI-guided interview to understand your situation
- ✍️ 3 message versions in different emotional tones
- 🌊 Anonymous community bottle board
- 📊 Personal dashboard to track messages and reactions
- 📱 Fully mobile responsive
- 🔒 Anonymous sharing — identity fully protected
- ⚡ Rate limiting on AI endpoints to prevent abuse
- 🛡️ Content safety filtering

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/baibhavbaidya/unspoken.git
cd unspoken

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Firebase and Groq API keys

# Run locally
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
GROQ_API_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## Project Structure

```
unspoken/
├── app/
│   ├── api/              # API routes (generate, conversation)
│   ├── auth/             # Login & signup pages
│   ├── bottles/          # Community bottle board
│   ├── create/           # Message creation flow
│   └── dashboard/        # User dashboard
├── components/           # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Firebase, Groq, auth context
└── types/                # TypeScript types
```

---

## Vision

> *"Make the unspoken, spoken."*

Everyone deserves to express their feelings clearly and confidently. Unspoken uses AI to bridge the gap between what you feel and what you can say.