// LLM Integration for Luna
// Supports OpenAI and Anthropic with fallback to mock

interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface LLMResponse {
  content: string;
  tokensUsed?: number;
}

export async function callLLM(
  messages: LLMMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<LLMResponse> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  // If no API key, use mock response
  if (!apiKey) {
    console.warn('No LLM API key found, using mock response');
    return mockLLMResponse(messages);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4o-mini',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    console.error('LLM API error, falling back to mock:', error);
    return mockLLMResponse(messages);
  }
}

function mockLLMResponse(messages: LLMMessage[]): LLMResponse {
  const lastMessage = messages[messages.length - 1];
  const userContent = lastMessage.content.toLowerCase();

  // Generate contextual mock response
  let response = '';
  
  if (messages.length === 1 || !messages.some(m => m.content.includes('clarifying'))) {
    // First interaction - provide understanding
    response = `I understand you're interested in ${
      userContent.includes('website') ? 'website development' :
      userContent.includes('app') ? 'mobile app development' :
      userContent.includes('design') ? 'design services' :
      userContent.includes('marketing') ? 'digital marketing' :
      'digital solutions'
    }. This is an exciting project!`;
  } else {
    // Subsequent interactions - acknowledge input
    response = `Thank you for that information. ${
      userContent.includes('budget') || userContent.includes('timeline') ?
      'Understanding your budget and timeline helps us create the perfect solution.' :
      userContent.includes('goal') || userContent.includes('want') ?
      'Your goals are clear, and we can definitely help you achieve them.' :
      'I appreciate you sharing that detail.'
    }`;
  }

  return { content: response };
}

export function generateClarifyPrompt(userMessage: string): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `You are Luna, a helpful AI assistant for Lunim Studio, a digital agency. 
Your task is to understand the user's project needs and ask 2 clarifying questions.

Format your response EXACTLY as JSON:
{
  "understanding": "Brief statement showing you understand their need",
  "questions": ["Question 1", "Question 2"]
}

Questions should be specific, helpful, and focused on:
- Project goals and desired outcomes
- Timeline and budget considerations
- Technical requirements
- Target audience

Be warm, professional, and concise.`,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];
}

export function generatePlanPrompt(conversation: Array<{ role: string; content: string }>): LLMMessage[] {
  const conversationText = conversation
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  return [
    {
      role: 'system',
      content: `You are Luna, a helpful AI assistant for Lunim Studio. Based on the conversation, generate a personalized action plan.

Format your response EXACTLY as JSON:
{
  "summary": "2-3 sentence summary of their project needs and how Lunim can help",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "nextSteps": [
    {
      "title": "Step Title",
      "description": "Detailed description",
      "action": "calendly|portfolio|proposal|contact"
    }
  ],
  "estimatedScope": "Time estimate (e.g., '2-4 months')",
  "calendlyPurpose": "Why they should book a call",
  "tags": ["tag1", "tag2", "tag3"]
}

Next steps should be actionable and specific. Include:
1. Booking a consultation
2. Reviewing portfolio/case studies
3. Getting a custom proposal

Be encouraging and professional.`,
    },
    {
      role: 'user',
      content: `Based on this conversation, generate a personalized plan:\n\n${conversationText}`,
    },
  ];
}
