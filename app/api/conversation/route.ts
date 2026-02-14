import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/groq';
import { systemPrompts } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageType, conversationHistory, userAnswer } = body;

    if (!messageType) {
      return NextResponse.json(
        { error: 'Missing message type' },
        { status: 400 }
      );
    }

    // Get system prompt for this message type
    const systemPrompt = systemPrompts[messageType] || systemPrompts.other;

    // Get next question from AI
    const aiResponse = await generateAIResponse(
      systemPrompt,
      userAnswer || 'Start the conversation',
      conversationHistory || []
    );

    // Check if conversation is complete
    const isComplete = aiResponse.includes('[CONVERSATION_COMPLETE]');
    const cleanResponse = aiResponse.replace('[CONVERSATION_COMPLETE]', '').trim();

    return NextResponse.json({
      question: cleanResponse,
      isComplete: isComplete,
    });
  } catch (error: any) {
    console.error('Conversation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process conversation' },
      { status: 500 }
    );
  }
}