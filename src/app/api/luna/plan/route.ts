import { NextRequest, NextResponse } from 'next/server';
import { callLLM, generatePlanPrompt } from '@/components/Luna/utils/llm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversation, privacyMode } = body;

    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json(
        { error: 'Conversation history is required' },
        { status: 400 }
      );
    }

    // Generate prompt for LLM
    const messages = generatePlanPrompt(conversation);

    // Call LLM (with fallback to mock if no API key)
    const llmResponse = await callLLM(messages, {
      temperature: 0.7,
      maxTokens: 800,
    });

    // Parse JSON response
    let planResponse;
    try {
      // Try to extract JSON from response
      const jsonMatch = llmResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // Fallback to structured response
      planResponse = {
        summary: "Based on our conversation, you're looking to create a modern digital solution that enhances user experience and drives business growth. Lunim Studio specializes in delivering exactly this type of transformative project.",
        keyInsights: [
          "Your project requires a user-centric design approach",
          "Performance and scalability are critical success factors",
          "Integration with existing systems will be essential"
        ],
        nextSteps: [
          {
            title: "Book a Taster Session",
            description: "Schedule a free 30-minute consultation to discuss your project in detail and explore how we can help.",
            action: "calendly"
          },
          {
            title: "Review Our Portfolio",
            description: "Explore similar projects we've delivered to see our approach and capabilities firsthand.",
            action: "portfolio"
          },
          {
            title: "Get a Custom Proposal",
            description: "Receive a detailed proposal tailored to your specific needs, timeline, and budget.",
            action: "proposal"
          }
        ],
        estimatedScope: "2-4 months",
        calendlyPurpose: "Discuss your project requirements and explore collaboration opportunities",
        tags: ["web-development", "ux-design", "custom-solutions"]
      };
    }

    return NextResponse.json({
      success: true,
      data: planResponse,
      privacyMode,
      tokensUsed: llmResponse.tokensUsed,
    });

  } catch (error) {
    console.error('Error in plan endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
