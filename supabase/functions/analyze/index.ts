import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalyzeRequest {
  text: string;
  source?: 'text' | 'voice';
}

interface AnalyzeResponse {
  emotion: 'happy' | 'sad' | 'anxious' | 'neutral' | 'angry' | 'calm';
  confidence: number;
  message: string;
  action: string;
  color: string;
  tag: string;
}

const SCHEMA = {
  type: "object",
  properties: {
    emotion: { type: "string", enum: ["happy", "sad", "anxious", "neutral", "angry", "calm"] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    message: { type: "string" },
    action: { type: "string" },
    color: { type: "string", pattern: "^#([A-Fa-f0-9]{6})$" },
    tag: { type: "string" }
  },
  required: ["emotion", "confidence", "message", "action", "color", "tag"]
};

function buildPrompt(text: string): string {
  return `You are an empathetic analyzer. When given a short user text, produce ONLY a JSON object (no explanation, no surrounding text) that matches the following schema exactly:
{
  "emotion": one of ["happy","sad","anxious","neutral","angry","calm"],
  "confidence": a number between 0.0 and 1.0,
  "message": a 1–2 sentence empathetic reply,
  "action": a short practical micro-action (max 10 words),
  "color": a hex color string like "#AABBCC" suitable for UI theme,
  "tag": a short keyword tag
}
Be concise, deterministic, and avoid speculative language. Do not include any extra fields or commentary. If you cannot determine an emotion, return "neutral" with confidence 0.5.

Analyze this text: "${text}"`;
}

function fallbackClassifier(text: string): AnalyzeResponse {
  const lowerText = text.toLowerCase();

  const anxiousKeywords = ["anxious", "nervous", "can't sleep", "stressed", "panic", "worried", "exam", "test", "deadline"];
  const happyKeywords = ["happy", "excited", "got", "offer", "great", "awesome", "celebrate", "love", "amazing"];
  const sadKeywords = ["sad", "depressed", "unhappy", "lost", "cry", "hurt", "lonely", "miss"];
  const angryKeywords = ["angry", "mad", "furious", "upset", "hate", "annoyed"];
  const calmKeywords = ["calm", "peaceful", "relaxed", "content", "serene", "tranquil"];

  if (anxiousKeywords.some(kw => lowerText.includes(kw))) {
    return {
      emotion: 'anxious',
      confidence: 0.65,
      message: "It's normal to feel anxious. Try a short breathing exercise to calm your mind.",
      action: "4-4-6 breathing for 2 minutes",
      color: "#FFB86B",
      tag: "anxiety-relief"
    };
  }

  if (happyKeywords.some(kw => lowerText.includes(kw))) {
    return {
      emotion: 'happy',
      confidence: 0.70,
      message: "That's wonderful! Celebrate this moment and share your joy with others.",
      action: "Write down 3 things you're grateful for",
      color: "#7AD1FF",
      tag: "celebration"
    };
  }

  if (sadKeywords.some(kw => lowerText.includes(kw))) {
    return {
      emotion: 'sad',
      confidence: 0.68,
      message: "It's okay to feel sad. Be gentle with yourself and reach out to someone you trust.",
      action: "Listen to uplifting music for 10 minutes",
      color: "#6C7BFF",
      tag: "sadness-support"
    };
  }

  if (angryKeywords.some(kw => lowerText.includes(kw))) {
    return {
      emotion: 'angry',
      confidence: 0.66,
      message: "Anger is valid. Take a moment to process your feelings before responding.",
      action: "Take a 5-minute walk outside",
      color: "#FF6B6B",
      tag: "anger-management"
    };
  }

  if (calmKeywords.some(kw => lowerText.includes(kw))) {
    return {
      emotion: 'calm',
      confidence: 0.72,
      message: "Great to hear you're feeling calm. Enjoy this peaceful state of mind.",
      action: "Practice mindfulness for 3 minutes",
      color: "#84DCC6",
      tag: "mindfulness"
    };
  }

  return {
    emotion: 'neutral',
    confidence: 0.55,
    message: "Thanks for sharing. Take a moment to reflect on how you're really feeling.",
    action: "Journal for 5 minutes",
    color: "#E6EEF7",
    tag: "reflection"
  };
}

async function callOpenAI(text: string): Promise<AnalyzeResponse> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openaiKey) {
    console.log('No OpenAI key found, using fallback classifier');
    return fallbackClassifier(text);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an empathetic analyzer. Return ONLY valid JSON matching the exact schema provided. No additional text.'
          },
          {
            role: 'user',
            content: buildPrompt(text)
          }
        ],
        temperature: 0.0,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return fallbackClassifier(text);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return fallbackClassifier(text);
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return fallbackClassifier(text);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.emotion || !parsed.confidence || !parsed.message || !parsed.action || !parsed.color || !parsed.tag) {
      return fallbackClassifier(text);
    }

    return parsed as AnalyzeResponse;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return fallbackClassifier(text);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: AnalyzeRequest = await req.json();
    const { text, source = 'text' } = body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return new Response(
        JSON.stringify({ error: "text field is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (text.length > 500) {
      return new Response(
        JSON.stringify({ error: "text too long (max 500 characters)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await callOpenAI(text);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error in analyze function:', error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
