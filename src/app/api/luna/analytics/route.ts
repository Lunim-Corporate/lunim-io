import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionMetrics } = body;

    if (!sessionMetrics) {
      return NextResponse.json(
        { error: 'Session metrics are required' },
        { status: 400 }
      );
    }

    // Only process if not confidential
    if (sessionMetrics.privacyMode === 'confidential') {
      return NextResponse.json({ success: true, stored: false });
    }

    // Log analytics data (in production, save to database/analytics service)
    console.log('[Luna Analytics]', {
      sessionId: sessionMetrics.sessionId,
      completionRate: sessionMetrics.completionRate,
      messagesExchanged: sessionMetrics.messagesExchanged,
      planGenerated: sessionMetrics.planGenerated,
      duration: sessionMetrics.endTime ? sessionMetrics.endTime - sessionMetrics.startTime : 0,
    });

    // In production, you would:
    // 1. Save to database (Supabase, PostgreSQL, MongoDB, etc.)
    // 2. Send to analytics service (Mixpanel, Amplitude, etc.)
    // 3. Integrate with CRM for lead tracking
    
    // Example: Save to database
    // await supabase.from('luna_sessions').insert({
    //   session_id: sessionMetrics.sessionId,
    //   privacy_mode: sessionMetrics.privacyMode,
    //   interaction_mode: sessionMetrics.interactionMode,
    //   messages_exchanged: sessionMetrics.messagesExchanged,
    //   clarify_questions_asked: sessionMetrics.clarifyQuestionsAsked,
    //   plan_generated: sessionMetrics.planGenerated,
    //   pdf_downloaded: sessionMetrics.pdfDownloaded,
    //   summary_read: sessionMetrics.summaryRead,
    //   completion_rate: sessionMetrics.completionRate,
    //   user_demographics: sessionMetrics.userDemographics,
    //   events: events,
    //   created_at: new Date(sessionMetrics.startTime).toISOString(),
    //   ended_at: sessionMetrics.endTime ? new Date(sessionMetrics.endTime).toISOString() : null,
    // });

    return NextResponse.json({
      success: true,
      stored: true,
      sessionId: sessionMetrics.sessionId,
    });

  } catch (error) {
    console.error('Error in analytics endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
