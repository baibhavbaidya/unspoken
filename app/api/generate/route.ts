import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/groq';
import { generationPrompts } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { messageType, qaHistory } = await request.json();

    if (!messageType || !qaHistory || qaHistory.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Generating messages for type:', messageType);
    console.log('Q&A history length:', qaHistory.length);

    // Build context from Q&A history
    const context = qaHistory
      .map((qa: any) => `Q: ${qa.question}\nA: ${qa.answer}`)
      .join('\n\n');

    // Get recipient info if available
    const recipientName = qaHistory.find((qa: any) => 
      qa.question.toLowerCase().includes('who') || 
      qa.question.toLowerCase().includes('name')
    )?.answer || 'them';

    // Generate 3 versions in parallel
    const tones = ['vulnerable', 'direct', 'gentle'] as const;
    
    const generateVersion = async (tone: typeof tones[number]) => {
      const tonePrompts = generationPrompts[tone];
      const toneInstruction = tonePrompts[messageType] || tonePrompts['other'];
      
      const prompt = `Based on this conversation:

${context}

Write a ${messageType} message with a ${tone} tone.

${toneInstruction}

Requirements:
- 150-300 words
- Authentic and personal (use details from conversation)
- Start with an appropriate greeting
- End with appropriate closing
- Do NOT use placeholder names - use actual details provided

Write the complete message now:`;

      try {
        const content = await generateAIResponse('You are a compassionate writing assistant helping someone express difficult emotions.', prompt, []);
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

    // Generate all 3 versions
    const versions = await Promise.all(
      tones.map(tone => generateVersion(tone))
    );

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