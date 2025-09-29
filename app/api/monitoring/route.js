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
    
    // Extract Sentry parameters from query string
    const { searchParams } = new URL(request.url);
    let orgId = searchParams.get('o');
    let projectId = searchParams.get('p');
    const region = searchParams.get('r') || 'us';
    
    // If no query params, try to extract from the envelope body or use defaults
    if (!orgId || !projectId) {
      // Try to extract project ID from the envelope body
      try {
        const lines = body.split('\n');
        const headerLine = lines[0];
        if (headerLine) {
          const header = JSON.parse(headerLine);
          if (header.dsn) {
            const dsnMatch = header.dsn.match(/\/(\d+)$/);
            if (dsnMatch) {
              projectId = dsnMatch[1];
              orgId = '4507332139089920'; // Your org ID
              console.log('Sentry tunnel: Extracted project ID from envelope', { orgId, projectId });
            }
          }
        }
      } catch (e) {
        // Fallback to default if parsing fails
      }
      
      // Final fallback to your main project ID
      if (!orgId || !projectId) {
        orgId = '4507332139089920';
        projectId = '4510038552477697';
        console.log('Sentry tunnel: Using default project ID', { orgId, projectId });
      }
    }

    // Construct the Sentry ingest URL
    const sentryIngestUrl = `https://${region}.ingest.sentry.io/api/${projectId}/envelope/`;
    
    console.log('Sentry tunnel: Forwarding request to', sentryIngestUrl);

    // Forward the request to Sentry with proper headers
    const sentryResponse = await fetch(sentryIngestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'User-Agent': request.headers.get('user-agent') || 'Sentry-Tunnel',
      },
      body: body,
    });

    console.log('Sentry tunnel: Response status', sentryResponse.status);

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
