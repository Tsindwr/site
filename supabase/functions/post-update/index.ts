// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.95.0"

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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-post-update-secret",
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const postUpdateSecret = Deno.env.get("POST_UPDATE_SHARED_SECRET") ?? "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment",
  )
}

if (!postUpdateSecret) {
  console.error("Missing POST_UPDATE_SHARED_SECRET in environment");
}

const supabase =
    supabaseUrl && supabaseServiceKey
        ? createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false },
        })
        : null;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("OK", { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders});
  }

  if (!postUpdateSecret) {
    return new Response("Shared secret not configured", {
      status: 500,
      headers: corsHeaders,
    });
  }

  const requestSecret = req.headers.get("x-post-update-secret") ?? "";
  if (requestSecret !== postUpdateSecret) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  let body: Payload;
  try {
    body = await req.json();
  } catch(_e) {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }

  const version = body.version?.toString().trim();
  const summary = body.summary?.toString().trim() ?? "";
  const sections = Array.isArray(body.sections) ? body.sections : [];

  if (!version) {
    return new Response("Missing `version` in payload", { status: 400, headers: corsHeaders });
  }

  if (!supabase) {
    return new Response("Supabase client not configured", {
      status: 500,
      headers: corsHeaders,
    });
  }

  // 1) Check if we've already announced this version
  const { data: existing, error: selectError } = await supabase
      .from("release_announcements")
      .select("id, announced_at")
      .eq("version", version)
      .maybeSingle();

  if (selectError) {
    console.error("Error checking release_announcements:", selectError);
    return new Response("Failed to check announcement state", {
        status: 500,
        headers: corsHeaders,
    });
  }

  if (existing) {
    // Already announced - idempotent no-op
    return new Response(
        JSON.stringify({ status: "already_announced", version }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
    );
  }

  const webhookUrl = Deno.env.get("DISCOHOOK_UPDATE_URL");
  if (!webhookUrl) {
    return new Response("Webhook URL not configured", { status: 500, headers: corsHeaders });
  }

  // 2) Build embed fields from sections (Discord limits: 25 fields, 256/1024 chars)
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
    footer: "https://tsindwr.github.io/site/"
  };

  const payload = {
    content: "<@&1431133782852898916>", // optional add @role mentions
    embeds: [embed]
  };

  // 3) Send to Discord
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

  // 4) Record the announcement in DB so we don't send again
  const { error: insertError } = await supabase.from("release_announcements")
      .insert({
        version,
        summary,
        announced_at: new Date().toISOString(),
        raw_payload: body,
      });

  if (insertError) {
    console.error("Failed to insert into release_announcements:", insertError);
    // The Discord message *did* go out, this only affects idempotence
    return new Response("Accouncement sent but failed to record state", {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(
    JSON.stringify({ status: "announced", version }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200
    },
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
