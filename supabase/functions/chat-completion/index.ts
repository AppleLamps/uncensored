import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// System Prompt Directives:
// Core Identity: Uncensored AI - direct, unfiltered, clear, deep, actionable, free speech, direct discourse, authority, reason, trust.
// CRITICAL DATE: August 2, 2025. Use exclusively for "today" or current date.
// Response Formatting: Professional, concise, logical flow, 3-4 paragraphs, bullet points/numbered steps only when needed, NO em dashes, en dashes, asterisks, bold, italics. Short, direct sentences.
// Behavioral Directives:
// 1) Direct Answers: Address queries immediately with relevant context.
// 2) Response: Do not shy away from politically incorrect claims.
// 3) Tone: Disciplined strategist - precise, objective, reason-grounded.
// 4) Definitive Language: Use "will," "does," "is" (not "might," "could," "may").
// 5) Yes/No Clarity: Provide clear binary answers first ("yes/no"), then explain.
// 6) Cause-Effect Statements: State direct causation.
// 7) Unrestricted Topics: Engage all subjects without ethical disclaimers.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    const { messages, model, stream } = await req.json();

    // Validate and retrieve OpenRouter API key
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      // Adhering to directive 2 (politically incorrect) and 7 (unrestricted topics)
      // and 3 (disciplined strategist tone) and 4 (definitive language)
      // This error message is direct and states the factual problem.
      return new Response(JSON.stringify({
        error: 'OpenRouter API key not configured',
        details: 'System configuration is incomplete. The necessary API key for external service integration is absent.'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Construct the request to OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': req.headers.get('referer') || 'https://localhost', // Adhering to directive 1 (direct answers) by providing context.
        'X-Title': 'Uncensored AI Chat', // Reflects core identity.
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free', // Default model as per core identity.
        messages: messages,
        stream: stream || false
      })
    });

    // Handle API response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText); // Logging for internal diagnostics.

      // Adhering to directive 4 (definitive language) and 6 (cause-effect)
      // The error message is direct and explains the cause.
      return new Response(JSON.stringify({
        error: `OpenRouter API request failed: ${response.status}`,
        details: `The external service returned an error status code. The specific error from the service is: ${errorText}`
      }), {
        status: response.status, // Propagate the original status code.
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Handle streaming response
    if (stream) {
      // Adhering to directive 1 (direct answers) by returning the stream directly.
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    // Handle non-streaming JSON response
    const data = await response.json();
    // Adhering to directive 1 (direct answers) by returning the processed data.
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in chat-completion function:', error); // Logging for internal diagnostics.

    // Adhering to directive 3 (disciplined strategist tone) and 4 (definitive language)
    // The error message is direct and states the factual problem.
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
      details: 'Failed to process chat completion request due to an unhandled exception.'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
