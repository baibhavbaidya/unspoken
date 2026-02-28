import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/groq';
import { generationPrompts } from '@/lib/prompts';

// ─── In-Memory Rate Limiter ───────────────────────────────────────────────────
// Stores { count, resetTime } per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 5;          // max requests
const RATE_WINDOW_MS = 60_000; // per 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    // First request or window expired — reset
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) {
    return true;
  }

  entry.count += 1;
  return false;
}

// ─── Content Safety ───────────────────────────────────────────────────────────
const BLOCKED_PATTERNS = [
  // Violence
  /\b(kill|murder|suicide|self.?harm|hurt (myself|yourself|someone))\b/i,
  // Explicit sexual content
  /\b(porn|sex(ual)?|nude|naked|explicit)\b/i,
  // Hate speech
  /\b(hate|racist|racism|slur|n.?word)\b/i,
  // Threats
  /\b(threat|threaten|bomb|weapon|gun|shoot)\b/i,
];

function containsUnsafeContent(text: string): boolean {
  return BLOCKED_PATTERNS.some(pattern => pattern.test(text));
}

function checkContentSafety(messageType: string, qaHistory: any[]): string | null {
  // Check messageType
  if (containsUnsafeContent(messageType)) {
    return 'Message type contains inappropriate content.';
  }

  // Check all answers in qaHistory
  if (qaHistory && qaHistory.length > 0) {
    for (const qa of qaHistory) {
      if (qa.answer && containsUnsafeContent(qa.answer)) {
        return "Your response contains content we're unable to process. Please keep messages respectful and safe.";
      }
    }
  }

  return null; // safe
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute before generating again.' },
        { status: 429 }
      );
    }

    // 2. Parse body
    const { messageType, qaHistory } = await request.json();

    if (!messageType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 3. Content safety check
    const safetyError = checkContentSafety(messageType, qaHistory);
    if (safetyError) {
      return NextResponse.json(
        { error: safetyError },
        { status: 422 }
      );
    }

    console.log('Generating messages for type:', messageType);
    console.log('Q&A history length:', qaHistory?.length || 0);

    // 4. Build context from Q&A history (if any)
    const context =
      qaHistory && qaHistory.length > 0
        ? qaHistory
            .map((qa: any) => `Q: ${qa.question}\nA: ${qa.answer}`)
            .join('\n\n')
        : `The user wants to write a ${messageType} message but didn't provide specific details. Write a heartfelt, general message that feels personal and authentic.`;

    // 5. Generate 3 versions in parallel
    const tones = ['vulnerable', 'direct', 'gentle'] as const;

    const generateVersion = async (tone: typeof tones[number]) => {
      const tonePrompts = generationPrompts[tone];
      const toneInstruction = tonePrompts[messageType] || tonePrompts['other'];

      const prompt = `Based on this context:

${context}

Write a ${messageType} message with a ${tone} tone.

${toneInstruction}

Requirements:
- 150-300 words
- Authentic and personal (use details from conversation if available)
- Start with an appropriate greeting
- End with appropriate closing
- Do NOT use placeholder names - use actual details provided

Write the complete message now:`;

      try {
        const content = await generateAIResponse(
          'You are a compassionate writing assistant helping someone express difficult emotions.',
          prompt,
          []
        );
        return {
          tone,
          title: getToneTitle(tone),
          content: content.trim(),
        };
      } catch (error) {
        console.error(`Error generating ${tone} version:`, error);
        throw error;
      }
    };

    const versions = await Promise.all(tones.map(tone => generateVersion(tone)));

    console.log('Successfully generated all 3 versions');

    return NextResponse.json({ versions });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate messages' },
      { status: 500 }
    );
  }
}

function getToneTitle(tone: string): string {
  const titles: Record<string, string> = {
    vulnerable: 'Open and Emotional',
    direct: 'Clear and Sincere',
    gentle: 'Soft and Thoughtful',
  };
  return titles[tone] || tone;
}