import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Sentry Tunnel Endpoint
 * Routes Sentry events through your server to bypass ad-blockers
 * This endpoint receives requests from Sentry SDK and forwards them to Sentry servers
 */
export async function POST(request) {
  try {
    // Get the raw body as text (Sentry envelope format)
    const body = await request.text();
    
    // Extract DSN and project ID from envelope header (official Sentry method)
    let sentryHost = 'o4507332139089920.ingest.us.sentry.io';
    let projectId = '4510038552477697';
    
    try {
      const lines = body.split('\n');
      const headerLine = lines[0];
      if (headerLine) {
        const header = JSON.parse(headerLine);
        if (header.dsn) {
          const dsn = new URL(header.dsn);
          sentryHost = dsn.host;
          projectId = dsn.pathname.replace(/^\/+/, '');
        }
      }
    } catch (e) {
      // Use fallback values if parsing fails
    }

    // Construct the Sentry ingest URL
    const sentryIngestUrl = `https://${sentryHost}/api/${projectId}/envelope/`;

    // Forward the request to Sentry
    await fetch(sentryIngestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'User-Agent': request.headers.get('user-agent') || 'Sentry-Tunnel',
      },
      body: body,
    });

    // Always return success to avoid breaking the client
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('Sentry tunnel error:', error);
    // Always return success to avoid breaking the app
    return new NextResponse(null, { status: 200 });
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
