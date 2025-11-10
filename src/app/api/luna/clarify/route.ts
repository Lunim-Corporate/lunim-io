import { NextRequest, NextResponse } from 'next/server';
import { callLLM, generateClarifyPrompt } from '@/components/Luna/utils/llm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userMessage, privacyMode } = body;

    if (!userMessage) {
      return NextResponse.json(
        { error: 'User message is required' },
        { status: 400 }
      );
    }

    // Generate prompt for LLM
    const messages = generateClarifyPrompt(userMessage);

    // Call LLM (with fallback to mock if no API key)
    const llmResponse = await callLLM(messages, {
      temperature: 0.7,
      maxTokens: 500,
    });

    // Parse JSON response
    let clarifyResponse;
    try {
      // Try to extract JSON from response
      const jsonMatch = llmResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        clarifyResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // Fallback to structured response
      clarifyResponse = {
        understanding: `I understand you're looking for ${userMessage.toLowerCase().includes('website') ? 'website development' : userMessage.toLowerCase().includes('app') ? 'mobile app development' : 'digital solutions'}. Let me ask a few questions to better understand your needs.`,
        questions: [
          "What's your primary goal for this project? (e.g., increase sales, improve user experience, expand reach)",
          "Do you have a specific timeline or budget in mind for this project?"
        ]
      };
    }

    return NextResponse.json({
      success: true,
      data: clarifyResponse,
      privacyMode,
      tokensUsed: llmResponse.tokensUsed,
    });

  } catch (error) {
    console.error('Error in clarify endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
