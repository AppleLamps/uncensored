import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, width, height, steps } = await req.json()

    // Get the GETIMG API key from environment variables
    const getimgApiKey = Deno.env.get('GETIMG_API_KEY')
    if (!getimgApiKey) {
      throw new Error('GETIMG API key not configured')
    }

    // Validate required parameters
    if (!prompt) {
      throw new Error('Prompt is required for image generation')
    }

    // Make request to GetImg API
    const response = await fetch('https://api.getimg.ai/v1/flux-schnell/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getimgApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        width: width || 1024,
        height: height || 1024,
        steps: steps || 4
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GetImg API error:', response.status, errorText)
      
      let errorMessage = 'Image generation failed'
      if (response.status === 401) {
        errorMessage = 'Invalid API key or authentication failed'
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later'
      } else if (response.status === 400) {
        errorMessage = 'Invalid request parameters'
      }
      
      throw new Error(errorMessage)
    }

    const imageData = await response.json()
    
    // The GetImg API returns base64 image data
    // Convert it to a data URL for frontend consumption
    const imageBase64 = imageData.image
    const imageUrl = `data:image/jpeg;base64,${imageBase64}`

    return new Response(
      JSON.stringify({ 
        imageUrl: imageUrl,
        prompt: prompt,
        width: width || 1024,
        height: height || 1024
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error in generate-image function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to generate image'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})