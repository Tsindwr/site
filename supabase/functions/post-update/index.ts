// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

interface Section {
  title: string;
  description: string;
}

interface Payload {
  version?: string;
  summary?: string;
  sections?: Section[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders});
  }

  let body: Payload;
  try {
    body = await req.json();
  } catch(_e) {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }

  const version = body.version?.toString().trim();
  const summary = body.summary?.toString().trim();
  const sections = Array.isArray(body.sections) ? body.sections : [];

  if (!version) {
    return new Response("Missing `version` in payload", { status: 400, headers: corsHeaders });
  }

  const webhookUrl = Deno.env.get("DISCOHOOK_UPDATE_URL");
  if (!webhookUrl) {
    return new Response("Webhook URL not configured", { status: 500, headers: corsHeaders });
  }

  // Build embed fields from sections (Discord limits: 25 fields, 256/1024 chars)
  const fields = sections
      .filter((s) => s && s.title && s.description)
      .slice(0, 25)
      .map((s) => ({
        name: String(s.title).slice(0, 256),
        value: String(s.description).slice(0, 1024),
      }));

  const embed: any = {
    title: `Sunder ${version} released`,
    description: summary ? summary.slice(0, 2048) : "",
    color: 0x7cd958, // Green color
    fields,
    timestamp: new Date().toISOString(),
  };

  const payload = {
    content: "", // optional add @role mentions
    embeds: [embed],
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Discord error:", res.status, text);
    return new Response("Discord error", { status: 502, headers: corsHeaders });
  }

  return new Response(
    "OK",
    { headers: corsHeaders, status: 200 },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/post-update' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
